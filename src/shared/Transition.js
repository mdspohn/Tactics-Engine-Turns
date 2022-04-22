class TransitionManager {
    constructor(ctx) {
        this.active = new Object();
        this.active.id = 'squares';
        this.active.ms = new Object();
        this.active.ms.target = 0;
        this.active.ms.current = 0;
        this.active.opts = null;
        this.active.inverse = false;
        this.active.ready = false;

        this.effects = new Object();
        this.effects['fade']     = { setup: (ms) => this.prepareFade(ms, ctx),     render: (ctx) => this.doFade(ctx)     };
        this.effects['curtains'] = { setup: (ms) => this.prepareCurtains(ms, ctx), render: (ctx) => this.doCurtains(ctx) };
        this.effects['squares']  = { setup: (ms) => this.prepareSquares(ms, ctx),  render: (ctx) => this.doSquares(ctx)  };
    }

    async initialize() {
        return Promise.resolve();
    }

    use(id) {
        if (this.effects[id] === undefined)
            Engine.log('Invalid transition ID requested.', id);

        this.active.id = id;
        return this;
    }

    async do(ms = 1000) {
        return this.setup(ms, false);
    }

    async undo(ms = 1000) {
        return this.setup(ms, true);
    }

    async setup(ms, inverse = false) {
        this.active.ms.current = 0;
        this.active.ms.target = ms;
        this.active.inverse = inverse;
        
        await this.effects[this.active.id].setup(ms);

        return new Promise(resolve => {
            this.active.ready = true;
            Events.listen('transition-complete', () => resolve());
        });
    }

    update(delta) {
        if (this.active.ready !== true)
            return false;
        this.active.ms.current = Math.min(this.active.ms.target, this.active.ms.current + delta);
    }

    render(ctx) {
        if (this.active.ready !== true)
            return false;

        this.effects[this.active.id].render(ctx);
        if (this.active.ms.current === this.active.ms.target) {
            this.active.ready = false;
            Events.dispatch('transition-complete');
        }
    }

    async prepareFade(ms, ctx) {
        return Promise.resolve();
    }

    doFade(ctx) {
        const progress = this.active.ms.current / this.active.ms.target,
              adjusted = Math.abs((1 * ~~this.active.inverse) - progress),
              alpha = adjusted * 1.1;

        ctx.globalAlpha = alpha;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.globalAlpha = 1;
    }

    async prepareCurtains(ms, ctx) {
        return Promise.resolve();
    }

    doCurtains(ctx) {
        const progress = this.active.ms.current / this.active.ms.target,
              adjusted = Math.abs((1 * ~~this.active.inverse) - progress),
              easing = Math.min(1, adjusted + (adjusted * .5)),
              width = ctx.canvas.width * (easing * (2 - easing) / 2);
        
        ctx.fillRect(0, 0, width + 1, ctx.canvas.height);
        ctx.fillRect(ctx.canvas.width, 0, -width - 1, ctx.canvas.height);
    }

    async prepareSquares(ms, ctx) {
        const cHeight = ctx.canvas.height,
              cWidth  = ctx.canvas.width,
              inverse = ~~this.active.inverse;
        
        const rows = Math.round(Math.random() * 1) + 4,
              sHeight = Math.floor(cHeight / rows) + Math.ceil(cHeight % rows),
              cols = Math.floor(cWidth / sHeight),
              sWidth = sHeight + Math.ceil((cWidth % sHeight) / cols);

        this.active.opts = new Array();
        this.active.opts.height = sHeight;
        this.active.opts.width = sWidth;

        for (let i = 0; i < rows; i++) {
            const row = new Array();
            for (let j = 0; j < cols; j++) {
                const end = (ms - 300) - Math.abs((1 * ~~inverse) - (1 - ((i + j) / (rows + cols - 2)))) * (ms - 300) + 300,
                      start = Math.max(0, end - 400);
                row.push({ start, end });
            }
            this.active.opts.push(row);
        }
    }

    doSquares(ctx) {
        const squares = this.active.opts,
              ms = Math.abs(this.active.ms.target * ~~this.active.inverse - this.active.ms.current);
        
        for (let i = 0; i < squares.length; i++) {
            for (let j = 0; j < squares[i].length; j++) {
                const instance = squares[i][j];
                if (instance.start >= ms)
                    continue;

                ctx.globalAlpha = Math.min(1, (ms - instance.start) / (instance.end - instance.start));
                ctx.fillRect(j * squares.width - Game.camera.posX, i * squares.height - Game.camera.posY, squares.width, squares.height);
            }
        }
        ctx.globalAlpha = 1;
    }
}