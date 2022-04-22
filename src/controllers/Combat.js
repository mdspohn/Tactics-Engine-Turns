class CombatController {
    constructor() {
        this.controllers = new Object();
        this.controllers["cinematic"] = new CinematicState();
        this.controllers["setup"]     = new SetupState();
        this.controllers["battle"]    = new BattleState();

        this.state = null;

        // Loaded Scenario
        this.scenario = null;

        // Event Listeners
        Events.listen('combat-state-change', (data) => {
            this.swap(data.state, data.opts);
        }, true);
    }

    // -------------------
    // Asset Prep and Loading
    // --------------------------

    async use(opts) {
        // XXX Remove Events.listen('sort') from Area.js when swapping maps
        this.scenario = new Scenario(opts.scenario, Game.data);

        return this.scenario.load().then(() => {
            return Promise.all([
                this.controllers["cinematic"].use(this.scenario),
                this.controllers["setup"].use(this.scenario),
                this.controllers["battle"].use(this.scenario)
            ]);
        }).then(() => {
            Game.camera.setPanningBoundaries(this.scenario.area);
            Game.camera.toCenter(this.scenario.area);
    
            this.state = this.controllers['cinematic'];
            this.state.wake();
        });
    }

    async swap(state, opts) {
        return this.state.sleep(opts).then(() => {
            this.state = this.controllers[state];
            this.state.wake(opts);
        });
    }

    // --------------------------
    // Game Initialization
    // --------------------------------

    async initialize() {
        return Promise.all([ ...Object.values(this.controllers).map(controller => controller.initialize()) ])
    }

    // -------------------
    // Rendering
    // --------------------------

    update(delta, speed = 1) {
        this.state.update(delta, speed);
    }

    render(ctx) {
        this.state.render(ctx);
    }

    // -------------------
    // Mouse Input
    // --------------------------

    onMouseMove(event) {
        if (this.state === null)
            return;

        this.state.onMouseMove(event);
    }

    onMouseOut(event) {
        if (this.state === null)
            return;
            
        this.state.onMouseOut(event);
    }

    onMouseWheel(event) {
        if (this.state === null)
            return;
            
        this.state.onMouseWheel(event);
    }

    onClick(event) {
        if (this.state === null)
            return;
            
        this.state.onClick(event);
    }

    onMouseDown(event) {
        if (this.state === null)
            return;
            
        this.state.onMouseDown(event);
    }

    onMouseUp(event) {
        if (this.state === null)
            return;
            
        this.state.onMouseUp(event);
    }

    onRightClick(event) {
        if (this.state === null)
            return;
            
        this.state.onRightClick(event);
    }

    // -------------------
    // Keyboard Input
    // --------------------------

    onInput(command) {
        if (this.state !== null)
            this.state.onInput(command);
    }

    onKeyDown(event) {
        if (this.state === null)
            return;
            
        this.state.onKeyDown(event);
    }

    onKeyUp(event) {
        if (this.state === null)
            return;
            
        this.state.onKeyUp(event);
    }

    // -------------------
    // Controller Input
    // --------------------------

    onControllerInput(event) {
        if (this.state === null)
            return;
            
        this.state.onControllerInput(event);
    }
}