class CameraManager {
    constructor(ctx) {
        this.ctx = ctx;

        this.window = new Object();
        this.window.x = window.innerWidth;
        this.window.y = window.innerHeight;

        this.zoom = 1;

        this.position = new Object();
        this.position.x = 0;
        this.position.y = 0;

        this.target = new Object();
        this.target.x = 0;
        this.target.y = 0;

        this.msRemaining = 0;

        // to preserve pixel-perfect assets, canvas adjustments may accumulate small rounding errors
        this.adjustment = new Object();
        this.adjustment.x = 0;
        this.adjustment.y = 0;

        this.allowEdgePanning = false;
        this.allowWASDPanning = true;
        this.allowDragging = true;

        this.panning = false;
        this.keyPanning = false;
        this.panningMs = 0;
        this.xPanAngle = 0;
        this.yPanAngle = 0;
        this.xPanBounds = { min: 0, max: 0 }
        this.yPanBounds = { min: 0, max: 0 }

        this.dragging = false;
        this.dragStartCamPosX = 0;
        this.dragStartCamPosY = 0;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragCurrentX = 0;
        this.dragCurrentY = 0;

        window.addEventListener('resize', () => this.resizeCanvas(this.ctx));
        window.addEventListener('fullscreenchange', () => this.resizeCanvas(this.ctx));
        
        this.resizeCanvas(this.ctx);
    }

    async initialize() {
        return Promise.resolve();
    }

    get posX()    { return Math.round(this.position.x); }
    get posY()    { return Math.round(this.position.y); }
    get scaling() { return this.ctx.scaling;            }

    setPanningBoundaries(area) {
        if (area === undefined)
            return;
        this.currentArea = area;

        const centerX = Math.floor((this.ctx.canvas.width - (area.boundaries.x2 + area.boundaries.x1) * this.scaling) / 2),
              centerY = Math.floor((this.ctx.canvas.height - area.boundaries.y2 * this.scaling) / 2);

        this.xPanBounds.min = centerX + area.boundaries.x1 - area.tw * 3 * this.scaling;
        this.xPanBounds.max = centerX + area.boundaries.x2 + area.tw * 2 * this.scaling;
        this.yPanBounds.min = centerY - area.boundaries.y2 - (area.td + area.th) * 2 * this.scaling;
        this.yPanBounds.max = centerY + area.boundaries.y2;
    }

    getScreenDistanceTo(location) {
        const tx = -Math.floor((location.posX * this.scaling) - (this.ctx.canvas.width / 2)  + (location.tw * this.scaling / 2)),
              ty = -Math.floor((location.posY * this.scaling) - (this.ctx.canvas.height / 2) + (location.td * this.scaling / 2)),
              x = Math.abs(this.posX - tx),
              y = Math.abs(this.posY - ty);

        return Math.floor(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    }

    toCenter(area, ms = 0, easing = null) {
        const x = Math.floor((this.ctx.canvas.width - (area.boundaries.x2 + area.boundaries.x1) * this.scaling) / 2) - (area.tw * this.scaling / 2),
              y = Math.floor((this.ctx.canvas.height - area.boundaries.y2 * this.scaling) / 2) - (area.td * this.scaling / 2) - (area.th * this.scaling);

        return this.toPosition(x, y, ms, easing);
    }

    toLocation(location, ms = 0, easing = null, opts = null) {
        const x = -Math.floor((location.posX * this.scaling) - (this.ctx.canvas.width / 2)  + (location.tw * this.scaling / 2)) + (opts !== null ? (~~opts.ox * this.scaling) : 0),
              y = -Math.floor((location.posY * this.scaling) - (this.ctx.canvas.height / 2) + (location.td * this.scaling / 2)) + (opts !== null ? (~~opts.oy * this.scaling) : 0);

        return this.toPosition(x, y, ms, easing);
    }

    toOffset(ox, oy, ms = 0, easing = null) {
        return this.toPosition(this.posX + ox, this.posY + oy, ms, easing)
    }

    update(delta) {
        // if (this.allowDragging && this.dragging) {
        //     const targetX = Math.max(Math.min(this.xPanBounds.max, this.dragStartCamPosX + (this.dragCurrentX - this.dragStartX)), this.xPanBounds.min),
        //           targetY = Math.max(Math.min(this.yPanBounds.max, this.dragStartCamPosY + (this.dragCurrentY - this.dragStartY)), this.yPanBounds.min);
        //     this._toPosition(targetX, targetY, 0);
        // } else if (this.allowWASDPanning && (Input.keysDown['a'] || Input.keysDown['d'] || Input.keysDown['w'] || Input.keysDown['s'])) {
        //     Game.camera.xPanAngle = ~~Input.keysDown['d'] - ~~Input.keysDown['a'];
        //     Game.camera.yPanAngle = ~~Input.keysDown['s'] - ~~Input.keysDown['w'];
        //     const targetX = Math.max(Math.min(this.xPanBounds.max, this.target.x - (this.xPanAngle * 15)), this.xPanBounds.min),
        //           targetY = Math.max(Math.min(this.yPanBounds.max, this.target.y - (this.yPanAngle * 15)), this.yPanBounds.min);
        //     this._toPosition(targetX, targetY, delta);
        // } else if (this.allowEdgePanning && this.panning) {
        //     const targetX = Math.max(Math.min(this.xPanBounds.max, this.target.x - (this.xPanAngle * 15)), this.xPanBounds.min),
        //           targetY = Math.max(Math.min(this.yPanBounds.max, this.target.y - (this.yPanAngle * 15)), this.yPanBounds.min);
        //     this._toPosition(targetX, targetY, delta);
        // }

        if (this.isProcessingCameraMovement) {
            this.msRemaining = Math.max(this.msRemaining - delta, 0);
            const changes = this.calculateCameraOffsets(delta);
            
            this.position.x += changes.x;
            this.position.y += changes.y;

            if (this.position.x == this.target.x && this.position.y == this.target.y)
                Events.dispatch('camera-movement-complete');
        }
    }

    toPosition(x, y, ms = 0, easing = 'ease-out') {
        this.target.x = x;
        this.target.y = y;

        if (ms === 0) {
            this.position.x = x;
            this.position.y = y;
            return Promise.resolve();
        }
        
        this.msRemaining = ms;
        this.easing = easing;
        this.isProcessingCameraMovement = true;

        const cameraMovementComplete = (resolve) => {
            Events.listen('camera-movement-complete', () => {
                this.isProcessingCameraMovement = false;
                resolve();
            });
        };

        return new Promise(cameraMovementComplete);
    }

    resizeCanvas(ctx) {
        if (this.isProcessingResize)
            return this.isPendingResize = true;

        this.isProcessingResize = true;

        // remember old canvas dimensions for position adjustment later
        const oW = ctx.canvas.width,
              oH = ctx.canvas.height;

        // set new window dimensions
        this.window.x = window.innerWidth;
        ctx.canvas.width = Math.ceil(this.window.x / this.zoom);
        ctx.canvas.style.width = (ctx.canvas.width * this.zoom) + 'px';

        this.window.y = window.innerHeight;
        ctx.canvas.height = Math.ceil(this.window.y / this.zoom);
        ctx.canvas.style.height = (ctx.canvas.height * this.zoom) + 'px';

        // update camera position after canvas size change
        const wChange = ((ctx.canvas.width  - oW) / 2) - this.adjustment.x,
              hChange = ((ctx.canvas.height - oH) / 2) - this.adjustment.y;

        this.adjustment.x = Math.round(wChange) - wChange;
        this.adjustment.y = Math.round(hChange) - hChange;

        this.position.x = this.target.x = (this.position.x + Math.round(wChange));
        this.position.y = this.target.y = (this.position.y + Math.round(hChange));

        // process any pending changes that came through during calculation
        this.isProcessingResize = false;
        ctx.imageSmoothingEnabled = false;

        this.setPanningBoundaries();

        if (!this.isPendingResize)
            return false;

        this.isPendingResize = false;
        this.resizeCanvas(ctx);
    }

    calculateCameraOffsets(ms) {
        let p = Math.min(ms / this.msRemaining, 1);

        if (this.easing != 'linear')
            p *= (this.easing == 'ease-out') ? (2 - p) : (p * 10);

        const partialX = p * (this.target.x - this.position.x),
              partialY = p * (this.target.y - this.position.y);

        let deltaX = 0,
            deltaY = 0;
                
        if (this.target.x - this.position.x > 0) {
            deltaX = Math.min(this.target.x, this.position.x + partialX) - this.position.x;
        } else if (this.target.x - this.position.x < 0) {
            deltaX = Math.max(this.target.x, this.position.x + partialX) - this.position.x;
        }

        if (this.target.y - this.position.y > 0) {
            deltaY = Math.min(this.target.y, this.position.y + partialY) - this.position.y;
        } else if (this.target.y - this.position.y < 0) {
            deltaY = Math.max(this.target.y, this.position.y + partialY) - this.position.y;
        }

        return { x: deltaX, y: deltaY };
    } 
    
    onMouseMove(event) {
        if (this.dragging) {
            this.dragCurrentX = event.x;
            this.dragCurrentY = event.y;
        } else if (event.x < 30 || event.x > (this.window.x - 30) || event.y < 20 || event.y > (this.window.y - 20)) {
            this.panning = true;
            this.xPanAngle = ((event.x - (this.window.x / 2)) / this.window.x) * 2; // gives -1 to 1
            this.yPanAngle = ((event.y - (this.window.y / 2)) / this.window.y) * 2;
        } else {
            this.panning = false;
            this.panningMs = 0;
            this.xPanAngle = 0;
            this.yPanAngle = 0;
        }
    }

    onMouseOut(event) {
        this.panning = false;
    }

    onMouseDown(event) {
        if (event.target == this.ctx.canvas && event.button == 1) {
            this.dragging = true;
            this.dragStartCamPosX = this.target.x;
            this.dragStartCamPosY = this.target.y;
            this.dragStartX = this.dragCurrentX = event.x;
            this.dragStartY = this.dragCurrentY = event.y;
        }
    }

    onMouseUp(event) {
        if (event.button <= 1) {
            this.dragging = false;
        }
    }
}