class Area {
    constructor(id, layout, meta) {

        // ----------------------
        // General
        // ----------------------------

        this.id = id;
        this.asset = new Asset(this.id, 'areas', meta.configuration);
        this.animations = meta.animations;

        // ----------------------
        // Locations
        // ----------------------------

        this.locations = layout.map((row, y) => row.map((tiles, x) => new Location(x, y, this.tw, this.td, this.th, tiles, this.animations)));

        this.sorted = new Object();
        this.sorted.method = 'X';
        this.sorted['X'] = [].concat(...this.locations).sort((a, b) => (a.x - b.x) ? a.x - b.x : a.y - b.y);
        this.sorted['Y'] = [].concat(...this.locations).sort((a, b) => (a.y - b.y) ? a.y - b.y : a.x - b.x);

        Events.listen('sort', method => this.sorted.method = method, true);

        // ----------------------
        // Panning Boundaries
        // ----------------------------

        this.boundaries = new Object();
        this.boundaries.x1 = 0;
        this.boundaries.x2 = 0;
        this.boundaries.y1 = 0;
        this.boundaries.y2 = 0;

        this.sorted[this.sorted.method].forEach(location => {
            this.boundaries.x1 = Math.min(this.boundaries.x1, location.posX);
            this.boundaries.x2 = Math.max(this.boundaries.x2, location.posX);
            this.boundaries.y2 = Math.max(this.boundaries.y2, location.posY - this.td);
        });

        // ----------------------
        // Map Outline
        // ----------------------------

        this.outline = document.createElement('canvas').getContext('2d');
        this.outline.canvas.width = this.boundaries.x2 - this.boundaries.x1 + 64;
        this.outline.canvas.height = this.boundaries.y2 * 2;
    }

    get iw() { return this.asset.iw; }
    get ih() { return this.asset.ih; }
    get sw() { return this.asset.sw; }
    get sh() { return this.asset.sh; }
    get tw() { return 32; }
    get th() { return 8;  }
    get td() { return 16; }

    async load() {
        await this.asset.load();

        this.getLocations().forEach(location => {
            let ox = 0,
                oy = 0;

            this.outline.filter = 'brightness(0%)';
            for (let z = 0; z < location.tiles.length; z++) {
                const tile = location.tiles[z];
                if (tile.idx === -1)
                    continue;

                ox += tile.ox;
                oy += tile.oy;

                const x  = this.outline.canvas.width / 2 - ((location.y - location.x) * this.tw / 2 + ox),
                      y  = this.td / 2 * (location.x + location.y) - this.th * z + oy,
                      sx = tile.index * this.sw % this.iw,
                      sy = Math.floor(tile.index * this.sw / this.iw) * this.sh;

                this.outline.save();
                this.outline.translate(x, y);
                this.outline.drawImage(this.asset.img, sx, sy, this.tw, this.sh, 0, 0, this.tw, this.sh);
                this.outline.restore();
            }
        });
    }

    getLocation(x, y) {
        return this.locations[y]?.[x] || null;
    }

    getLocations() {
        return this.sorted[this.sorted.method];
    }

    update(delta) {
        this.getLocations().forEach(location => {
            location.update(delta);

            for (let z = 0; z < location.tiles.length; z++) {
                if (!location.tiles[z].isAnimated)
                    continue;

                let instance = location.tiles[z];
                instance.ms += delta;

                while (instance.ms > instance.frames[instance.no].ms) {
                    instance.ms -= instance.frames[instance.no].ms;

                    if (instance.frames[instance.no].next === undefined) {
                        instance.no += (instance.no + 1) % instance.frames.length;
                        continue;
                    }
                    
                    location.tiles[z] = instance = new Tile(this.animations[instance.frames[instance.no].next], instance.ms);
                }
            }
        });
    }

    render(location, ctx) {
        let ox = 0,
            oy = 0;

        for (let z = 0; z < location.tiles.length; z++) {
            const tile = location.tiles[z];
            if (tile.idx === -1)
                continue;

            ox += tile.ox;
            oy += tile.oy;

            const x = -((location.y - location.x) * this.tw / 2 + ox) * ctx.scaling,
                  y = ((location.x + location.y) * this.td / 2 - this.th * z + oy) * ctx.scaling,
                  sx = tile.index * this.sw % this.iw,
                  sy = Math.floor(tile.index * this.sw / this.iw) * this.sh;

            location.drawImage(tile, ctx, this.asset.img, sx, sy, this.tw, this.sh, x, y, this.tw * ctx.scaling, this.sh * ctx.scaling);
        }
    }

    drawOutline(ctx) {
        const sWidth  = this.outline.canvas.width,
              sHeight = this.outline.canvas.height,
              dx      = -sWidth / 2 * ctx.scaling,
              dWidth  = sWidth * ctx.scaling,
              dHeight = sHeight * ctx.scaling,
              offset  = ctx.scaling;
        
        ctx.save();
        ctx.drawImage(this.outline.canvas, 0, 0, sWidth, sHeight, dx + offset, 0,       dWidth, dHeight);
        ctx.drawImage(this.outline.canvas, 0, 0, sWidth, sHeight, dx - offset, 0,       dWidth, dHeight);
        ctx.drawImage(this.outline.canvas, 0, 0, sWidth, sHeight, dx,          offset,  dWidth, dHeight);
        ctx.drawImage(this.outline.canvas, 0, 0, sWidth, sHeight, dx,          -offset, dWidth, dHeight);
        // to remove background that isn't outline:
        // ctx.globalCompositeOperation = "xor";
        // ctx.drawImage(this.outline.canvas, 0, 0, sWidth, sHeight, dx, 0, dWidth, dHeight);
        ctx.restore();
    }
}