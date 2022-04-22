class Location {
    constructor(x, y, tw, td, th, tiles, animations) {
        
        // ----------------------
        // Configuration
        // ----------------------------

        this.x = x;
        this.y = y;
        this.tw = tw;
        this.td = td;
        this.th = th;

        // ----------------------
        // Tiles
        // ----------------------------

        this.tiles = [].concat(tiles).map(id => new Tile(animations[id]));

        // ----------------------
        // Filter Effects
        // ----------------------------

        this.isFiltered = false;
        this.effects = new Object();

        this.effects.fade = new Object();
        this.effects.fade.on = false;
        this.effects.fade.ms = 0;

        this.effects.blink = new Object();
        this.effects.blink.on = false;
        this.effects.blink.ms = 0;

        this.effects.flash = new Object();
        this.effects.flash.on = false;
        this.effects.flash.ms = 0;

        this.effects.blue = new Object();
        this.effects.blue.on = false;
        this.effects.blue.ms = 0;

        this.effects.red = new Object();
        this.effects.red.on = false;
        this.effects.red.ms = 0;

        this.effects.yellow = new Object();
        this.effects.yellow.on = false;
        this.effects.yellow.ms = 0;

        // ----------------------
        // Movement Effects
        // ----------------------------

        this.isMoving = false;
        this.movement = new Object();

        this.movement.shake = new Object();
        this.movement.shake.on = false;
        this.movement.shake.ms = 0;

        this.movement.press = new Object();
        this.movement.press.on = false;
        this.movement.press.ms = 0;
    }

    get surface() { return this.tiles[this.tiles.length - 1] }
    get z()       { return this.tiles.length }
    get ox()      { let ox = 0; this.tiles.forEach(tile => ox += tile.ox); return ox }
    get oy()      { let oy = 0; this.tiles.forEach(tile => oy += tile.oy); return oy }

    get posX() { return ((this.x * (this.tw / 2)) - (this.y * (this.tw / 2))) + this.ox; }
    get posY() { return (this.y * (this.td / 2)) + (this.x * (this.td / 2)) + this.oy - ((this.z - 1) * this.th); }

    get orientation()   { return this.surface.orientation }
    get isSloped()      { return this.surface.isSloped }
    get isWater()       { return this.surface.isWater }
    get isHazard()      { return this.surface.isHazard }
    get isUnreachable() { return this.surface.isUnreachable }

    fade() {
        // clears filters while making it look like the tile fades back to normal
        this.effects.fade.on = true;
        this.effects.fade.ms = 0;

        return new Promise(resolve => {
            Events.listen('location-fade-complete', (location, eid) => {
                if (location !== this)
                    return;

                Object.values(this.effects).forEach(effect => effect.on = false);
                Events.remove('location-fade-complete', eid);
                resolve();
            }, true);
        });
    }

    blink(on = true) {
        this.effects.blink.on = on;

        if (!this.effects.blink.on)
            return;
        
        this.effects.blink.ms = 0;
    }

    highlight(on = true, color = 'blue', origin = { x: 0, y: 0 }) {
        const colors = ['blue', 'red', 'yellow'];

        if (!colors.includes(color)) {
            if (!on)
                colors.forEach(c => this.effects[c].on = false);
            
            return;
        }

        colors.forEach(c => this.effects[c].on = false);

        if (!on) {
            this.effects[color].ms = 0;
            return;
        }

        this.effects[color].on = true;
        this.effects[color].ms = (Math.abs(origin.x - this.x) + Math.abs(origin.y - this.y)) * -50;
    }

    flash(count = 1) {
        this.effects.flash.on = true;
        this.effects.flash.count = count;
        this.effects.flash.ms = 0;

        return new Promise(resolve => {
            Events.listen('location-flash-complete', (location, eid) => {
                if (location !== this)
                    return;

                this.movement.flash.on = false;
                Events.remove('location-flash-complete', eid);
                resolve();
            }, true);
        });
    }

    shake(count) {
        this.movement.shake.on = true;
        this.movement.shake.count = count;
        this.movement.shake.ms = 0;

        return new Promise(resolve => {
            Events.listen('location-shake-complete', (location, eid) => {
                if (location !== this)
                    return;

                this.movement.shake.on = false;
                Events.remove('location-shake-complete', eid);
                resolve();
            }, true);
        });
    }
    
    press() {
        this.movement.press.on = true;
        this.movement.press.ms = 0;

        return new Promise(resolve => {
            Events.listen('location-press-complete', (location, eid) => {
                if (location !== this)
                    return;

                this.movement.press.on = false;
                Events.remove('location-press-complete', eid);
                resolve();
            }, true);
        });
    }

    update(delta) {
        this.isFiltered = Object.values(this.effects).some(effect => effect.on);
        if (this.isFiltered)
            Object.values(this.effects).forEach(x => x.on ? x.ms += delta : null);

        this.isMoving = Object.values(this.movement).some(effect => effect.on);
        if (this.isMoving)
            Object.values(this.movement).forEach(x => x.on ? x.ms += delta : null);
    }

    drawImage(tile, ctx, ...config) {
        if (this.isFiltered && tile === this.surface) {
            this.brightness = null;
            this.hue = null;
            this.sepia = null;
            this.contrast = null;
            this.saturate = null;
            this.opacity = null;

            if (this.effects.fade.on) {
                ctx.drawImage(...config);

                const p = Math.min(this.effects.fade.ms, 250) / 250;
                this.opacity = 1 - p;

                if (this.effects.fade.ms >= 250) {
                    Events.dispatch('location-fade-complete', this);
                }
            }

            if (this.effects.blink.on) {
                this.brightness ??= 1;
                this.brightness += 0.2 + (Math.abs(250 - (this.effects.blink.ms % 500)) / 250) * 0.2;
            }
            
            if ([ this.effects.blue, this.effects.yellow, this.effects.red ].some(e => e.on && e.ms >= 0)) {
                this.brightness ??= 1;
                this.sepia = 1;
                this.contrast = 0.5;
                this.saturate = 2;

                let ms = 0;
                if (this.effects.blue.on && this.effects.blue.ms >= 0) {
                    ms = this.effects.blue.ms;
                    this.hue = 165;
                } else if (this.effects.yellow.on && this.effects.yellow.ms >= 0) {
                    ms = this.effects.yellow.ms;
                    this.hue = 20;
                } else if (this.effects.red.on && this.effects.red.ms >= 0) {
                    ms = this.effects.red.ms;
                    this.hue = -45;
                }

                this.brightness += (Math.abs(1000 - ((ms + 250) % 2000)) / 8000) - 0.1 + (-0.4 * (1 - Math.min(ms / 250, 1)));
            }

            let filter = new String();

            if (this.contrast !== null)   filter += `contrast(${ this.contrast })`;
            if (this.sepia !== null)      filter += `sepia(${ this.sepia })`;
            if (this.saturate !== null)   filter += `saturate(${ this.saturate })`;
            if (this.hue !== null)        filter += `hue-rotate(${ this.hue }deg)`;
            if (this.brightness !== null) filter += `brightness(${ this.brightness })`;
            if (this.opacity !== null)    filter += `opacity(${ this.opacity })`;

            ctx.filter = filter;
        }
        
        if (this.isMoving && tile === this.tiles[0]) {
            // movement effects
            if (this.movement.press.on) {
                const p = 1 - Math.abs(125 - this.movement.press.ms) / 125;
                tile.toy = Math.round(p * 2);
                if (this.movement.press.ms >= 250) {
                    tile.toy = 0;
                    Events.dispatch('location-press-complete', this);
                }
            }
        }
        
        ctx.drawImage(...config);
        ctx.filter = 'none';
    }
}