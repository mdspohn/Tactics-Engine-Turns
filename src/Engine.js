class Engine {
    static instance = null;
    
    static async log(message) {
        // console.warn(message);
    }

    static onInput(command) {
        if (this.instance.state !== null)
            this.instance.state.onInput(command);
    }

    static onMouseMove(event) {
        if (this.instance.state !== null)
            this.instance.state.onMouseMove(event);
    }

    static onClick(event) {
        if (this.instance.state !== null)
            this.instance.state.onClick(event);
    }

    constructor(canvas) {
        if (Engine.instance !== null)
            return Engine.instance;

        Engine.instance = this;

        // Engine Loop
        this.frame = null;

        // Settings
        this.speed = 1;
        this.scaling = 4;
        
        // Rendering Context
        this.ctx = canvas.getContext('2d');
        this.ctx.speed = 1;
        this.ctx.scaling = 4;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Rendering-related Managers
        this.camera = new CameraManager(this.ctx);
        this.weather = new WeatherManager(this.ctx);
        this.transitions = new TransitionManager(this.ctx);
        this.input = new InputManager(this.ctx.canvas);
        this.data = new DataManager();

        // Logic
        this.logic = new Object();
        this.logic.ai   = new AILogic();
        this.logic.area = new AreaLogic();

        // State Management
        this.controllers = new Object();
        this.controllers['title']  = new TitleController();
        this.controllers['world']  = new WorldController();
        this.controllers['town']   = new TownController();
        this.controllers['combat'] = new CombatController();

        this.state = null;

        // Event Listeners
        Events.listen('state-change', (data) => {
            this.use(data.state, data.opts);
        }, true);
    }

    async initialize() {
        const setup = new Array();
        setup.push(await this.data.initialize());
        setup.push(this.input.initialize(this.data.settings));
        setup.push(...Object.values(this.controllers).map(controller => controller.initialize()));
        await Promise.all(setup);
        
        this.transitions.use('squares');
        this.transitions.do(0);

        // Where to start the engine for testing
        this.data.loadProfile(0);
        await this.use('combat', { scenario: 'ruins' });

        // Production
        // await this.use('title');

        this.ctx.canvas.className = 'initialized';
    }

    // --------------------------
    // State Management
    // --------------------------------

    async use(state, opts) {
        await this.controllers[state].use(opts);
        this.state = this.controllers[state];
    }

    // --------------------------
    // Update / Render Loop
    // --------------------------------

    update(delta) {
        this.input.update(delta);
        this.camera.update(delta);
        this.weather.update(delta);
        this.transitions.update(delta);
        this.state.update(delta, this.ctx.speed);
        
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.translate(this.camera.posX, this.camera.posY);
        this.weather.render(this.ctx, true);
        this.state.render(this.ctx, this.transitions, this.weather);
        this.weather.render(this.ctx);
        this.transitions.render(this.ctx);
        this.ctx.restore();
    }

    // --------------------------
    // Game Loop
    // --------------------------------

    async start() {
        if (this.frame !== null)
            return;
        
        this.last;
        this.current = performance.now();

        const loop = (timestamp) => {
            this.frame = requestAnimationFrame(loop);
    
            this.last = this.current;
            this.current = timestamp;
    
            this.update(Math.min(this.current - this.last, 100));
        }

        this.frame = requestAnimationFrame(loop);
        Engine.log('Engine started.');
    }

    async stop() {
        cancelAnimationFrame(this.frame);
        this.frame = null;
        Engine.log('Engine stopped.');
    }
}