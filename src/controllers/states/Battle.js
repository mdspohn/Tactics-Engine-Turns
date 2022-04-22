class BattleState {
    constructor() {
        
        // Interface Components
        this.interface = new Object();
        this.interface.active  = new CombatActive();
        // this.interface.target  = new CombatTarget();
        // this.interface.attack  = new CombatAttack();
        // this.interface.defense = new CombatDefense();
        this.interface.menu    = new CombatMenu();
        this.interface.turns   = new CombatTurns();
        this.interface.panel   = new CombatPanel();
        // this.interface.actions = new CombatActions();
        // this.interface.items   = new CombatItems();

        // State
        this.state = new StateManager();
        this.state.add('none', true);
        this.state.add('map');
        this.state.add('menu');
        this.state.add('move');
        this.state.add('action-menu');
        this.state.add('action');
        this.state.add('item-menu');
        this.state.add('item');
        this.state.add('end-turn');

        // State Data
        this.active  = null; // <Unit>
        this.target  = null; // <Unit>
        this.action  = null; // <Skill>
        this.item    = null; // <Skill>
        this.effects = null; // Array<Effect>
        this.turns   = null; // Array<Unit>
        
        this.range = null;     // WeakMap<Location>
        this.path = null;      // Array<Location>
        this.selection = null; // WeakMap<Location>
        this.pointer = new CombatPointer();
        this.orientation = new CombatOrientation();

        // Scenario Data
        this.scenario = null;   // <Scenario>

        // Event Listeners
        this.interface.menu.wrapper.addEventListener('mouseleave', () => this.onMouseMap());
        this.interface.menu.move.addEventListener('click', () => this.onMove());
        //this.interface.menu.actions.addEventListener('click', () => this.onActionMenu());
        //this.interface.menu.items.addEventListener('click', () => this.onItemMenu());
        this.interface.menu.wait.addEventListener('click', () => this.onEndTurn());
    }

    get area()       { return this.scenario.area }
    get decoration() { return this.scenario.decoration }
    get units()      { return this.scenario.units }

    async onBattleStart() {
        this.units[2].energy = 20;
        this.turns = this.getTurns(this.units);
        this.interface.turns.initialize(this.turns);
        await this.interface.turns.show();
        this.onNextTurn();
    }

    // ----------------------
    // Menu / Map Focus Switching
    // --------------------------

    onMouseMenu() {
        if (!this.state.is('map'))
            return false;
    }
    onMouseMap() {
        if (!this.state.is('menu'))
            return false;
    }

    // ------------------
    // Turns
    // -----------------

    async onNextTurn() {
        this.active = this.getNextTurn(this.turns);
        this.active.energy -= 100;
        this.interface.active.update(this.active);

        this.turns = this.getTurns(this.units);
        await this.interface.turns.next(this.turns);

        const distance = Game.camera.getScreenDistanceTo(this.active.location),
              animations = [ this.interface.active.show(), Game.camera.toLocation(this.active.location, (300 + distance), 'ease-out') ];

        return (this.active.allegiance === 'player') ? this.onPlayerTurn(animations) : this.onComputerTurn(animations);
    }
    
    chronologicalSort(rounds) {
        // expects all rounds to be reached in the same timeframe, orders by effort expending to get there
        rounds.forEach(round => {
            round.effort = (round.unit.speed - (round.energy - 100)) / round.unit.speed;
        });
        
        rounds.sort(function(a, b) {
            if (a.effort === b.effort)
                return a.id < b.id ? -1 : 1;
            return a.effort - b.effort;
        });

        return rounds.map(round => round.unit);
    }

    getNextTurn(turns) {
        return turns[0];
    }

    getTurns(units, count = 5) {
        // advance time until at least one unit is ready to act
        let isReady = units.some(unit => unit.hp > 0 && unit.energy >= 100);

        if (!isReady === true) {
            while (!isReady) {
                units.filter(unit => unit.hp > 0).forEach(unit => {
                    unit.energy += unit.speed;

                    if (unit.energy >= 100)
                        isReady = true;
                });
            }
        }

        // add and sort units that are ready to act (possibly multiple times)
        const queued = new Array();

        units.filter(unit => unit.energy >= 100).forEach(unit => {
            const rounds = Math.floor(unit.energy / 100);

            for (let i = 0; i < rounds; i++) {
                const round = new Object();
                round.speed = unit.speed;
                round.energy = unit.energy - (i * 100);
                round.unit = unit;
                
                queued.push(round);
            }
        });

        const forecast = this.chronologicalSort(queued);

        if (forecast.length >= count)
            return forecast.slice(0, count);

        // predict additional turns into the future
        let time = 0;
        
        while (forecast.length < count) {
            time += 1;

            const simulated = new Array();

            units.filter(unit => unit.hp > 0).forEach(unit => {
                const energy = Math.min(unit.energy % 100, unit.energy) + (unit.speed * time),
                    rounds = Math.floor(energy / 100) - Math.floor((energy - unit.speed) / 100);
                
                for (let i = 0; i < rounds; i++) {
                    if (energy < 100)
                        continue;

                    const round = new Object();
                    round.unit = unit;
                    round.speed = unit.speed;
                    round.energy = (energy % 100) + 100 + (i * 100);

                    simulated.push(Object.assign(new Object(), round));
                }
            });

            forecast.push(...this.chronologicalSort(simulated));
        }

        return forecast.slice(0, count);
    }

    // ------------------
    // Computer Controlled Turns
    // -----------------

    async onComputerTurn(animations) {
        this.state.set('none');

        const sequence = Game.logic.ai.getSequence(this.active, this.units, this.area);
        return Promise.all([ ...animations, sequence ]).then(async () => {
            await new Promise(resolve => setTimeout(() => resolve(), 500));
            // do AI sequence
            return this.onComputerTurnEnd();
        });
    }
    async onComputerMove(location) {}
    async onComputerAction(action) {}
    async onComputerItem(item) {}
    async onComputerEndTurn(orientation) {}
    async onComputerTurnEnd() { return this.interface.active.hide().then(() => this.onNextTurn()) }


    onMenuConfirm(element) {
        element.dispatchEvent(new Event('click'));
    }

    // ------------------
    // Player Turns
    // -----------------

    async onPlayerTurn(animations) {
        this.state.set('menu');
        
        return Promise.all([
            ...animations,
            this.interface.panel.show(),
            this.interface.menu.show()
        ]);
    }
    async onPlayerTurnEnd() {
        this.state.set('none');

        return Promise.all([
            this.interface.menu.hide(),
            this.interface.panel.hide(),
            this.interface.active.hide()
        ]);
    }

    // ----------------
    // Movement
    // -----------------

    onMove() {
        if (!this.state.in('menu', 'move', 'end-turn'))
            return;
        if (!this.state.is('menu')) {
            const state = this.state.current;
            this.onCancel();
            if (state === 'move')
                return;
        }

        // State
        this.state.set('move');
        this.interface.panel.changeText('Choose Destination Tile');

        // UI
        this.range = this.active.getRange(this.area, this.units);
        this.area.getLocations().forEach(location => {
            if (!this.range.has(location) || !this.range.get(location).selectable)
                return;

            location.highlight(true, 'blue', this.active.location);
        });
        this.interface.menu.select(this.interface.menu.move);
        if (this.active.location !== this.pointer.location) {
            if (this.pointer.location !== null)
                this.pointer.location.blink(false);

            this.active.location.blink(true);
            this.pointer.location = this.active.location;
        }
    }
    async onMoveConfirm(target) {
        if (!this.range.has(target) || !this.range.get(target).selectable)
            return;
        
        // State
        this.state.set('none');
        this.area.getLocations().forEach(location => {
            if (!this.range.has(location) || !this.range.get(location).selectable)
                return;

            if (location !== target) {
                location.blink(false);
                location.highlight(false);
            }
        });
        
        this.pointer.fade();
        await target.press();
        await this.active.moveTo(target, this.active.getPathTo(target, this.range));
        target.fade();
        this.state.set('menu');
        this.interface.panel.changeText('Select Command');
        this.interface.menu.cancel();
        this.range = null;
    }
    onMoveCancel() {
        // State
        this.state.set('menu');
        this.interface.panel.changeText('Select Command');

        // UI
        this.interface.menu.cancel();
        this.area.getLocations().forEach(location => {
            if (!this.range.has(location) || !this.range.get(location).selectable)
                return;

            location.fade();
        });
        this.range = null;
        if (this.pointer.location) {
            this.pointer.location.blink(false);
            this.pointer.location = null;
        }

        Promise.resolve();
    }

    // ----------------
    // Actions
    // -----------------

    onActionMenu() {
        if (!this.state.is('menu')) {
            const state = this.state.current;
            this.onCancel();
            if (state === 'action-menu')
                return;
        }

        this.state.set('action-menu');
        this.interface.menu.select(this.interface.menu.actions);
        this.interface.actions.show();
    }
    onActionMenuConfirm(element) {
        element.dispatchEvent(new Event('click'));
    }
    onActionMenuCancel() {
        this.state.set('menu');
        this.interface.menu.cancel();
        this.interface.actions.hide();
    }
    onAction() {
        this.state.set('action');
    }
    onActionConfirm(location) {
        this.state.set('none');
        Promise.resolve(); // animations and all that before returning state to menu
    }
    onActionCancel() {
        this.state.set('action-menu');
    }

    // ----------------
    // Items
    // -----------------

    onItemMenu() {
        if (!this.state.is('menu')) {
            const state = this.state.current;
            this.onCancel();
            if (state === 'item-menu')
                return;
        }

        this.state.set('item-menu');
        this.interface.menu.select(this.interface.menu.items);
    }
    onItemMenuCancel() {
        this.state.set('menu');
        this.interface.menu.cancel();
    }
    onItem() {
        this.state.set('item');
    }
    onItemConfirm(location) {
        this.state.set('none');
        Promise.resolve(); // animations and all that before returning state to menu
    }
    onItemCancel() {
        this.state.set('item-menu');
    }

    // ----------------
    // End Turn
    // -----------------

    onEndTurn() {
        if (this.state.is('none'))
            return;
        if (!this.state.is('menu')) {
            const state = this.state.current;
            this.onCancel();
            if (state === 'end-turn')
                return;
        }
            
        this.state.set('end-turn');
        this.interface.panel.changeText('Choose Direction');
        this.interface.menu.select(this.interface.menu.wait);
        this.orientation.use(this.active);
    }
    onEndTurnConfirm() {
        this.state.set('none');
        this.orientation.confirm();
        this.onPlayerTurnEnd().then(() => this.onNextTurn());
        if (this.pointer.location) {
            this.pointer.location.blink(false);
            this.pointer.location = null;
        }
        this.interface.panel.changeText('Select Command');
    }
    onEndTurnCancel() {
        this.state.set('menu');
        this.interface.panel.changeText('Select Command');
        this.orientation.cancel();
        this.interface.menu.cancel();
    }

    // -------------------
    // Pause
    // -------------------

    onPause() {

    }

    onResume() {

    }

    // ----------------------
    // Input Events
    // -----------------------------

    onMapCursorMove(x = 0, y = 0) {
        if (this.pointer.location === null) {
            const location = this.area.getLocation(this.active.location.x, this.active.location.y);
            location.blink(true);
            this.pointer.location = location;
        } else {
            const location = this.area.getLocation(this.pointer.location.x + x, this.pointer.location.y + y);
            if (location !== null && !location.isUnreachable) {
                this.pointer.location.blink(false);
                location.blink(true);
                this.pointer.location = location;
            }
        }
    }

    onHorizontalInput(direction = 1) {
        switch(this.state.current) {
            case 'move':
                return this.onMapCursorMove(direction);
            case 'end-turn':
                return (direction > 0) ? this.active.setOrientation('east') : this.active.setOrientation('west');
        }
    }
    onVerticalInput(direction = 1) {
        switch(this.state.current) {
            case 'menu':
                return (direction > 0) ? this.interface.menu.next() : this.interface.menu.previous();
            case 'move':
                return this.onMapCursorMove(0, direction);
            case 'action-menu':
                return (direction > 0) ? this.interface.actions.next() : this.interface.actions.previous();
            case 'end-turn':
                return (direction > 0) ? this.active.setOrientation('south') : this.active.setOrientation('north');
        }
    }
    onConfirm() {
        switch(this.state.current) {
            case 'menu':
                return this.onMenuConfirm(this.interface.menu.focused);
            case 'move':
                return this.onMoveConfirm(this.pointer.location);
            case 'action-menu':
                return this.onActionMenuConfirm(this.interface.actions.focused);
            case 'end-turn':
                return this.onEndTurnConfirm();
        }
    }
    onCancel(state = this.state.current) {
        switch(state) {
            case 'menu':
                // revert movement ?
                //this.onMenuCancel();
                break;
            case 'move':
                this.onMoveCancel();
                break;
            case 'action-menu':
                this.onActionMenuCancel();
                break;
            case 'action':
                this.onActionCancel();
                break;
            case 'item-menu':
                this.onItemMenuCancel();
                break;
            case 'item':
                this.onItemCancel();
                break;
            case 'end-turn':
                this.onEndTurnCancel();
                break;
        }
    }

    onInput(command) {
        switch(command) {
            case 'Confirm':
                this.onConfirm();
                break;
            case 'Cancel':
                this.onCancel();
                break;
            case 'Up':
                this.onVerticalInput(-1);
                break;
            case 'Down':
                this.onVerticalInput(1);
                break;
            case 'Left':
                this.onHorizontalInput(-1);
                break;
            case 'Right':
                this.onHorizontalInput(1);
                break;
        }
    }

    onMouseMove(ev) {
        if (this.state.is('none'))
            return;

        if (this.state.is('end-turn')) {
            const orientation = Game.logic.area.getOrientationToCoords(this.active.location, ev.x, ev.y);
            return this.orientation.toOrientation(orientation);
        }

        const location = Game.logic.area.getLocationAtMouse(ev.x, ev.y, this.area, Game.camera, Game.scaling);

        if (location !== this.pointer.location) {
            if (this.pointer.location !== null)
                this.pointer.location.blink(false);

            if (location !== null)
                location.blink(true);

            this.pointer.location = location;
        }
    }

    onClick(ev) {
        const location = Game.logic.area.getLocationAtMouse(ev.x, ev.y, this.area, Game.camera, Game.scaling);

        if (this.state.is('move') && this.range !== null && this.range.has(location)) {
            this.onMoveConfirm(location);
        } else if (this.state.is('end-turn')) {
            this.onConfirm();
        }
    }

    async initialize() {
        return Promise.all([
            this.pointer.load(),
            this.orientation.load()
        ]);
    }

    async use(scenario) {
        this.scenario = scenario;
    }

    async wake(opts) {
        await Game.transitions.undo();
        this.onBattleStart();
    }

    async sleep(opts) {
        // TODO
    }

    update(delta, speed = 1) {
        this.area.update(delta);
        this.decoration.update(delta);
        this.units.forEach(unit => unit.update(delta, speed));
        this.orientation.update(delta);
        this.pointer.update(delta);
    }

    render(ctx) {
        this.area.drawOutline(ctx);
        this.area.getLocations().forEach(location => {
            this.area.render(location, ctx);
            this.decoration.render(location, ctx);
            this.units.filter(n => Object.is(n.location, location)).forEach(unit => unit.render(ctx));
        });
        this.orientation.render(ctx);
        this.pointer.render(ctx, this.units);
    }
}


