class Asset {
    static cache = new Object();
    
    constructor(id, category, dimensions = {}) {
        const identifier = category + id;
        if (Asset.cache[identifier] !== undefined)
            return Asset.cache[identifier];
        
        this.id = id;
        this.category = category;
        this.sprite = new Object();
        this.sprite.width = dimensions.width;
        this.sprite.height = dimensions.height;

        this.img = null;
        this.src = `./assets/${this.category}/${this.id}.png`;
    }

    get iw() { return this.img.width;     }
    get ih() { return this.img.height;    }
    get sw() { return this.sprite.width;  }
    get sh() { return this.sprite.height; }

    async load() {
        if (this.img !== null)
            return Promise.resolve();

        return new Promise((resolve) => {
            this.img = new Image();
            this.img.onload = resolve;
            this.img.src = this.src;
        });
    }

    async destroy() {
        Asset.cache[this.category + this.id] = undefined;
    }
}

