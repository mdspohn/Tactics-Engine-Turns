class SetupState {
    static indicatorAnimationDuration = 4000;
    static indicatorIntroAnimationDuration = 350;
    static indicatorOpacityBase = 0.3;
    static indicatorOpacityFluctuation = 0.15;
    static focusAnimationDuration = 1000;

    static animations = {
        'FOCUS-INTRO': [
            { opacity: [0, 1], transform: ['scale(1.2)', 'scale(1.0)'] },
            { duration: 500, pseudoElement: '::after', fill: 'none' }
        ],
        'FOCUS-LOOP': [
            { opacity: [1, 1], transform: ['scale(1.0)', 'scale(1.1)'] },
            { duration: 500, pseudoElement: '::after', fill: 'none', iterations: Infinity, direction: 'alternate' }
        ],
        'START-BUTTON-PULSE': [
            { transform: ['scale(1.0)', 'scale(1.1)'] },
            { duration: 1000, iterations: Infinity, direction: 'alternate' }
        ],
        'ROSTER-SHOW':     [ { opacity: 1, right: '0px'   }, { duration: 400 } ],
        'ROSTER-HIDE':     [ { opacity: 0, right: '-40px' }, { duration: 400 } ],
        'REMAINING-SHOW':  [ { opacity: 1, right: '300px' }, { duration: 400 } ],
        'REMAINING-HIDE':  [ { opacity: 0, right: '300px' }, { duration: 400 } ],
        'BUTTONS-SHOW':    [ { opacity: 1, right: '336px' }, { duration: 400 } ],
        'BUTTONS-HIDE':    [ { opacity: 0, right: '336px' }, { duration: 400 } ],
        'SELECTION-SHOW':  [ { opacity: 1, top:   '112px' }, { duration: 200 } ],
        'SELECTION-HIDE':  [ { opacity: 0, top:   '102px' }, { duration: 400 } ],
        'SELECTION-SLEEP': [ { opacity: 0, top:   '112px' }, { duration: 400 } ]
    };

    static animate(element, id, override) {
        const [ keyframes, config ] = SetupState.animations[id];

        return element.animate(keyframes, Object.assign({
            duration: 0,
            fill: 'forwards',
            easing: 'ease-in-out'
        }, config, override));
    }

    // ----------
    // On App Load (called once)
    // ------------------------------

    static async initialize(instance) {
        return Promise.resolve();

        instance.DOM['START'].addEventListener('click', e => instance.onBattleStart(e));
        instance.DOM['LIST'].addEventListener('click', function(e) {
            const element = e.target,
                  index   = instance.elements.indexOf(e.target),
                  unit    = instance.units[index];
            instance.onRosterFocus(element, unit);
        });
        
        return new Promise((resolve) => {
            instance.markers.img = new Image();
            instance.markers.img.onload = resolve;
            instance.markers.img.src = `./assets/misc/setup-indicators.png`;
        });
    }
        
    // ---------------------------
    // On Scenario preload (called for each new scenario before switching to it)
    // ---------------------------

    static async load(instance, data, profile) {
        return Promise.resolve();

        instance.DOM['LIST'].innerHTML = '';
        instance.DOM['UNITS-CURRENT'].textContent = 0;
        instance.DOM['UNITS-TOTAL'].textContent = Math.max(1, ~~data.setup.max);

        for (let i = 0; i < profile.roster.length; i++) {
            const unit     = profile.roster[i],
                  wrap     = document.createElement('div'),
                  portrait = document.createElement('div');

            wrap.className = 'unit';
            portrait.className = 'unit-portrait';
            portrait.style.backgroundImage = 'url("' + unit.asset.img.src + '")';
            portrait.style.backgroundSize = (unit.asset.img.width * 4) + 'px ' + (unit.asset.img.height * 4) + 'px';

            wrap.appendChild(portrait);
            instance.DOM['LIST'].appendChild(wrap);
        }
        
        instance.selected = new Array();
        
        instance.range    = Array.from(data.setup.locations);
        instance.units    = Array.from(profile.roster);
        instance.elements = Array.from(instance.DOM['LIST'].children);

        instance.__elem = null;
        instance.__unit = null;
        instance.__tile = null;

        instance.markers.enabled = false;
        instance.markers.placementMs = 0;
        instance.markers.special = [].concat(instance.range);
        instance.markers.specialMs = 0;
        instance.markers.focusMs = 0;

        return Promise.resolve();
    }

    // ---------------------------
    // Called before this state becomming active
    // ---------------------------

    static async wake(opts) {
        Engine.log('Setup State');
        return Engine.dispatch('combat-state-change', { state: 'battle', opts: {} });

        if (opts.delay)
            await opts.delay;

        instance.DOM['ROSTER'].style.display    = 'block';
        instance.DOM['REMAINING'].style.display = 'block';
        instance.DOM['SELECTION'].style.display = 'block';
        instance.DOM['BUTTONS'].style.display   = 'flex';

        await SetupState.animate(instance.DOM['ROSTER'], 'ROSTER-SHOW').finished;

        instance.onRosterFocus(instance.elements[0], instance.units[0], true);

        await SetupState.animate(instance.DOM['REMAINING'], 'REMAINING-SHOW').finished;
        
        // TODO: the camera panning offsets here will likely vary based on screen resolution
        Game.camera.toLocation(instance.data.setup.panTo, 1000, 'ease-out', { ox: -50, oy: 36 }).then(() => {
            instance.markers.enabled = true;

            SetupState.animate(instance.DOM['BUTTONS'], 'BUTTONS-SHOW');
        });
    }

    // ---------------------------
    // Called before exit to different state
    // ---------------------------

    static async sleep(instance) {
        return Promise.resolve();

        await Promise.all([,
            SetupState.animate(instance.DOM['REMAINING'], 'REMAINING-HIDE' ).finished,
            SetupState.animate(instance.DOM['SELECTION'], 'SELECTION-SLEEP').finished,
            SetupState.animate(instance.DOM['BUTTONS'],   'BUTTONS-HIDE'   ).finished,
        ]);
        
        SetupState.animate(instance.DOM['ROSTER'],    'ROSTER-HIDE'    ).finished.then(() => {
            instance.DOM['ROSTER'].style.display    = 'none';
            instance.DOM['REMAINING'].style.display = 'none';
            instance.DOM['SELECTION'].style.display = 'none';
            instance.DOM['BUTTONS'].style.display   = 'none';
            return Game.camera.toCenter(Game.canvas, instance.data.area, 1000, 'ease-out');
        });
    }

    constructor() {
        return this;

        this.DOM = new Object();
        this.DOM['INTERFACE']     = document.getElementById('interface');
        this.DOM['ROSTER']        = document.getElementById('roster');
        this.DOM['LIST']          = document.getElementById('roster-list');
        this.DOM['REMAINING']     = document.getElementById('roster-remaining');
        this.DOM['UNITS-CURRENT'] = document.getElementById('roster-remaining-current');
        this.DOM['UNITS-TOTAL']   = document.getElementById('roster-remaining-total');
        this.DOM['SELECTION']     = document.getElementById('roster-selection');
        this.DOM['NAME']          = document.getElementById('roster-selection-name');
        this.DOM['PORTRAIT']      = document.getElementById('roster-selection-portrait');
        this.DOM['LEVEL']         = document.getElementById('roster-selection-level-current');
        this.DOM['HP-CURRENT']    = document.getElementById('roster-selection-hp-current');
        this.DOM['HP-TOTAL']      = document.getElementById('roster-selection-hp-total');
        this.DOM['AP-CURRENT']    = document.getElementById('roster-selection-ap-current');
        this.DOM['AP-TOTAL']      = document.getElementById('roster-selection-ap-total');
        this.DOM['AP-BAR']        = document.getElementById('roster-selection-ap-bar');
        this.DOM['ATTACK']        = document.getElementById('roster-selection-stats-attack');
        this.DOM['DEFENSE']       = document.getElementById('roster-selection-stats-defense');
        this.DOM['MOVE']          = document.getElementById('roster-selection-stats-move');
        this.DOM['BUTTONS']       = document.getElementById('roster-actions');
        this.DOM['START']         = document.getElementById('roster-actions-start');
        this.DOM['DETAILS']       = document.getElementById('roster-actions-details');

        this.selected = null;
        this.range    = null;
        this.units    = null;
        this.elements = null;

        this.__elem = null;
        this.__unit = null;
        this.__tile = null;

        this.markers = new Object();
        this.markers.img = null;
        this.markers.enabled = false;
        this.markers.placement = new Array();
        this.markers.placementMs = 0;
        this.markers.special = new Array();
        this.markers.specialMs = 0;
        this.markers.focusMs = 0;
    }

    async initialize() {
        return Promise.resolve();
        //return SetupState.initialize(this);
    }

    async use(opts) {
        return Promise.resolve();
        return SetupState.load(this, data, profile);
    }

    async wake(opts) {
        return Events.dispatch('combat-state-change', { state: 'battle', opts: {} });
        //return SetupState.wake(opts);
    }

    async sleep(opts) {
        return Promise.resolve();
        //return SetupState.sleep(opts);
    }

    onRosterFocus(element, unit, initial = false) {
        if (unit == undefined || unit === this.__unit)
            return;

        if (!initial)
            this.__elem.getAnimations({ subtree: true }).map(animation => animation.cancel());

        this.__tile = null;
        this.__unit = unit;
        this.__elem = element;

        SetupState.animate(this.__elem, 'FOCUS-INTRO').onfinish = () => SetupState.animate(this.__elem, 'FOCUS-LOOP');

        const duration = window.getComputedStyle(this.DOM['SELECTION']).getPropertyValue("opacity") * 200;

        if (this.__unit !== null) {
            this.__unit.enabled = true;
            this.__unit.animations.current.ms = 0;
            Unit.changeOrientation(this.__unit, 'west');
        }

        SetupState.animate(this.DOM['SELECTION'], 'SELECTION-HIDE', { duration }).finished.then(() => {
            this.DOM['PORTRAIT'].style.backgroundImage = 'url("' + this.__unit.asset.img.src + '")';
            this.DOM['PORTRAIT'].style.backgroundSize  = (this.__unit.asset.img.width * 4) + 'px ' + (this.__unit.asset.img.height * 4) + 'px';
            this.DOM['NAME'].textContent       = this.__unit.name || this.__unit.id;
            this.DOM['LEVEL'].textContent      = (String(this.__unit.level).length == 1) ? '0' + this.__unit.level : this.__unit.level;
            this.DOM['HP-CURRENT'].textContent = (String(this.__unit.hp).length == 1)    ? '0' + this.__unit.hp    : this.__unit.hp;
            this.DOM['HP-TOTAL'].textContent   = (String(this.__unit.hp).length == 1)    ? '0' + this.__unit.hp    : this.__unit.hp;
            this.DOM['AP-CURRENT'].textContent = (String(this.__unit.ap).length == 1)    ? '0' + this.__unit.ap    : this.__unit.ap;
            this.DOM['AP-TOTAL'].textContent   = (String(this.__unit.ap).length == 1)    ? '0' + this.__unit.ap    : this.__unit.ap;
            this.DOM['ATTACK'].textContent     = this.__unit.attack;
            this.DOM['DEFENSE'].textContent    = this.__unit.defense;
            this.DOM['MOVE'].textContent       = this.__unit.move;
            Array.from(this.DOM['AP-BAR'].children).forEach((crystal, i) => crystal.classList.toggle('enabled', i < this.__unit.ap));

            SetupState.animate(this.DOM['SELECTION'], 'SELECTION-SHOW', { duration: 200 * (1 + ~~initial ) });
        });
    }

    onRosterConfirm() {
        // --------------------
        // Keyboard / Gamepad Only
        // -------------------------------
    }

    onTileFocus(location) {
        // --------------------
        // Keyboard / Gamepad Only
        // -------------------------------
    }

    onTileConfirm(location) {
        this.__tile = location;

        if (!this.range.includes(location))
            return;

        const maxUnits = this.data.setup.max,
              currentUnits = this.selected.length,
              isUnitNew = !this.selected.some(unit => unit == this.__unit),
              isTileOccupied = this.selected.some(unit => unit.location == location);

        if (isUnitNew && currentUnits >= maxUnits && !isTileOccupied)
            return;

        if (isTileOccupied) {
            if (isUnitNew) {
                const replacedUnitIndex = this.selected.findIndex(unit => unit.location == location),
                      replacedUnit = this.selected.splice(replacedUnitIndex, 1)[0];
                this.selected.push(this.__unit);
                this.__unit.enabled = true;
                this.__elem.classList.toggle('selected', true);
                this.elements[this.units.findIndex(unit => unit == replacedUnit)].classList.toggle('selected', false);
            } else {
                const oldLocation = this.selected.find(unit => unit == this.__unit).location,
                      replacedUnit = this.selected.find(unit => unit.location == location);
                
                if (this.__unit === replacedUnit)
                    return;

                Unit.changeLocation(replacedUnit, oldLocation);
                this.markers.special.push(oldLocation);
            }
        } else {
            if (isUnitNew) {
                this.__unit.animations.current.ms = 0;
                this.__unit.animations.current.no = 0;
                this.selected.push(this.__unit);
                this.__unit.enabled = true;
                this.__elem.classList.toggle('selected', true);
                Unit.changeOrientation(this.__unit, 'west');

                if (currentUnits === 0)
                    this.DOM['START'].classList.toggle('disabled', false);

                if ((currentUnits + 1) === maxUnits)
                    SetupState.animate(this.DOM['START'], 'START-BUTTON-PULSE');

                this.DOM['UNITS-CURRENT'].textContent = currentUnits + 1;
            }
        }

        this.__tile = location;
        this.__unit.enabled = true;
        this.markers.focusMs = 0;
        this.markers.special.push(location);
        this.markers.specialMs = 0;

        Unit.changeLocation(this.__unit, location);
    }

    onOrientationConfirm(event) {

    }

    onBattleStart() {
        if (this.finished === true || this.selected.length < 1)
            return;

        // TODO: some sort of confirmation
        this.finished = true;
        this.markers.enabled = false;
        this.sleep().then(() => {
            this.data.units.push(...this.selected);
            Events.dispatch('combat-state-change', { state: 'BATTLE' });
        });
    }

    onCancel(event) {
        if (this.__unit !== null) {
            const index = this.selected.findIndex(unit => this.__unit == unit);
            this.__unit.enabled = false;
            if (index !== -1) {
                this.DOM['UNITS-CURRENT'].textContent = this.selected.length - 1;
                const removedUnit = this.selected.splice(index, 1)[0];
                this.elements[this.units.findIndex(unit => unit == removedUnit)].classList.toggle('selected', false);
                this.__tile = null;
                
                if (this.selected.length === 0) {
                    this.DOM['START'].classList.toggle('disabled', true);
                } else if ((this.selected.length + 1) === this.data.setup.max) {
                    this.DOM['START'].getAnimations({ subtree: true }).map(animation => animation.cancel());
                }
            }
        }
    }

    // -------------------
    // Rendering
    // --------------------------

    update(delta) {
        Unit.update(this.selected, delta);

        if (this.markers.enabled && this.markers.special.length == 0)
            this.markers.placementMs = (this.markers.placementMs + delta) % SetupState.indicatorAnimationDuration;
        
        if (this.markers.focus !== null)
            this.markers.focusMs = (this.markers.focusMs + delta) % SetupState.focusAnimationDuration;

        if (this.markers.enabled && this.markers.special.length > 0)
            this.markers.specialMs += delta;
    }

    render(location, cam, ctx, scaling) {
        const x = cam.posX + (location.posX * scaling),
              y = cam.posY + (location.posY * scaling);

        ctx.save();
        ctx.translate(x, y);

        if (this.markers.enabled && this.range.includes(location)) {
            let alpha = SetupState.indicatorOpacityBase,
                index = 4;
                alpha += (Math.abs(this.markers.placementMs - (SetupState.indicatorAnimationDuration / 2)) / (SetupState.indicatorAnimationDuration / 2)) * SetupState.indicatorOpacityFluctuation;
            
            if (this.markers.special.includes(location)) {
                index = Math.floor(this.markers.specialMs * 4 / SetupState.indicatorIntroAnimationDuration);

                if (this.markers.specialMs > SetupState.indicatorIntroAnimationDuration) {
                    this.markers.special = new Array();
                    this.markers.specialMs = 0;
                }
            }

            ctx.globalAlpha = alpha;
            ctx.drawImage(this.markers.img, index * 32, 0, 32, 16, 0, 0, 32 * GameManager.scaling, 16 * GameManager.scaling);
            ctx.globalAlpha = 1;
        }


        if (this.markers.enabled && location == this.__tile) {
            const frame = Math.floor((this.markers.focusMs * 4 - 1) / SetupState.focusAnimationDuration), // 0 to 3
                  index = frame === 3 ? 1 : frame;

            ctx.drawImage(this.markers.img, (index * 32), 32, 32, 16, 0, (-1 * GameManager.scaling), (32 * GameManager.scaling), (16 * GameManager.scaling));
        }

        ctx.restore();

        Unit.render(this.selected, location, cam, ctx, scaling);
    }
    
    // -------------------
    // Mouse Input
    // --------------------------

    onMouseMove(event) {
        return;
        if (this.selected.orientation !== null)
            return;
        const location = IsometricMath.getTile(event.x, event.y, this.data.area, Game.camera);
        if (location == null)
            return;

        this.onTileFocus(location);
    }

    onClick(event) {
        const location = IsometricMath.getTile(event.x, event.y, this.data.area, Game.camera);
        if (location == null)
            return;

        this.onTileConfirm(location);
    }

    onRightClick(event, cam) {
        this.onCancel(event);
    }

    // -------------------
    // Keyboard Input
    // --------------------------

    onConfirm(event) {

    }

    onInfo(event) {

    }

    onDirection(event) {

    }

    onPause(event) {

    }

    // -------------------
    // Controller Input
    // --------------------------

    onControllerInput(event) {

    }
}