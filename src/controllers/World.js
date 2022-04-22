class WorldController {
    constructor() {
        this.controllers = new Object();
        this.controllers["map"] = new MapState();

        this.state = null;

        // Event Listeners
        Events.listen('world-state-change', (data) => {
            this.state = this.controllers[data.state];
            this.state.wake({ delay: data.delay } );
        }, true);
    }

    // -------------------
    // Asset Prep and Loading
    // --------------------------

    async prepare(opts, data) {
        await this.controllers["map"].prepare(data, data.profile);
    }

    async do(delay = Promise.resolve()) {
        this.state = this.controllers['map'];

        this.state.wake({ delay });
    }

    // --------------------------
    // Game Initialization
    // --------------------------------

    async initialize() {
        return Promise.all([ ...Object.values(this.controllers).map(state => state.initialize()) ])
    }

    // -------------------
    // Rendering
    // --------------------------

    update(delta) {
        this.state.update(delta);
    }

    render(ctx, camera) {
        this.state.render(ctx, camera);
    }

    // -------------------
    // Keyboard Input
    // --------------------------

    onInput(command) {
        if (this.state !== null)
            this.state.onInput(command);
    }
}