class Decoration {
    constructor(id, layout, meta) {
        this.id = id;
        this.asset = new Asset(this.id, 'decorations', meta.configuration);
        this.animations = meta.animations;

        this.locations = layout.map(row => row.map(col => [].concat(col).map(id => new Tile(this.animations[id]))));
        this.sorted = [].concat(...this.locations);
    }

    get iw() { return this.asset.iw; }
    get ih() { return this.asset.ih; }
    get sw() { return this.asset.sw; }
    get sh() { return this.asset.sh; }
    get tw() { return 32; }
    get th() { return 8;  }
    get td() { return 16; }

    async load() {
        return this.asset.load();
    }
    
    update(delta) {
        for (let i = 0; i < this.sorted.length; i++) {
            const location = this.sorted[i];
            for (let z = 0; z < location.length; z++) {
                if (!location[z].isAnimated)
                    return false;


                let instance = location[z];
                instance.ms += delta;

                while (instance.ms > instance.frames[instance.no].ms) {
                    instance.ms -= instance.frames[instance.no].ms;

                    if (instance.frames[instance.no].next === undefined)
                        return instance.no += (instance.no + 1) % instance.frames.length;
                    
                    location[z] = instance = new Tile(this.animations[instance.frames[instance.no].next], instance.ms);
                }
            }
        }
    }
    
    render(location, ctx, camera) {
        const tiles = this.locations[location.y][location.x];
    
        for (let z = 0; z < tiles.length; z++) {
            if (tiles[z].idx === -1)
                continue;

            const tile = tiles[z],
                  x = (location.posX - this.sw + this.tw + tile.ox) * ctx.scaling,
                  y = (location.posY - this.sh * (z + 1) + this.th + this.td + tile.oy) * ctx.scaling,
                  sx = tile.index * this.sw % this.iw,
                  sy = Math.floor(tile.index * this.sw / this.iw) * this.sh;
      
            ctx.drawImage(this.asset.img, sx, sy, this.sw, this.sh, x, y, this.sw * ctx.scaling, this.sh * ctx.scaling);
        }
    }
}