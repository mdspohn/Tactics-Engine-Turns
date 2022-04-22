class InputManager {
    constructor(canvas) {
        this.canvas = canvas;

        this.keyboard = new Object();
        this.keyboard['enter']      = 'Confirm';
        this.keyboard['escape']     = 'Cancel';
        this.keyboard['tab']        = 'Details';
        this.keyboard['arrowup']    = 'Up';
        this.keyboard['arrowright'] = 'Right';
        this.keyboard['arrowdown']  = 'Down';
        this.keyboard['arrowleft']  = 'Left';
        this.keyboard['w']          = 'Camera Up';
        this.keyboard['d']          = 'Camera Right';
        this.keyboard['s']          = 'Camera Down';
        this.keyboard['a']          = 'Camera Left';

        this.canvas.addEventListener('mousemove', event => Engine.onMouseMove(event));
        this.canvas.addEventListener('click',     event => Engine.onClick(event));
        // canvas.addEventListener('mouseout',  event => Game.onMouseOut(event));
        // canvas.addEventListener('wheel',     event => Game.onMouseWheel(event), { passive: true });
        // canvas.addEventListener('mousedown', event => Game.onMouseDown(event));
        // canvas.addEventListener('mouseup',   event => Game.onMouseUp(event));
        document.addEventListener('keydown', event => {
            if (event.repeat)
                return false;
            const key = event.key.toLowerCase();
            if (this.keyboard[key] !== undefined) {
                Engine.onInput(this.keyboard[key]);
            }
        });
        document.addEventListener('keyup', event => {
            // TODO
        });
        // document.addEventListener('contextmenu', (event) => {
        //     event.preventDefault();
        //     Game.onRightClick(event);
        // });
    }

    async initialize(settings) {
        // XXX: param@settings will contain adjustments for keybindings here
        return Promise.resolve();
    }

    update(step) {
        //return this.actions.splice(0, this.actions.length);
    }
}