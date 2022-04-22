class CombatOrientation {
    constructor() {
        this.asset = new Asset('orientation', 'misc');

        this.offsets = new Map();
        this.offsets.set('north', { x: 0,  y: 0  });
        this.offsets.set('west',  { x: 32, y: 0  });
        this.offsets.set('east',  { x: 0,  y: 16 });
        this.offsets.set('south', { x: 32, y: 16 });

        // <Unit> active unit
        this.unit = null;
        // <String> original orientation (for reverting on cancel)
        this.original = null;
    }

    load() {
        return this.asset.load();
    }

    use(unit = null) {
        this.unit = unit;
        this.originalOrientation = this.unit.orientation;
    }

    confirm() {
        this.unit = null;
        this.originalOrientation = null;
    }

    cancel() {
        this.unit.setOrientation(this.originalOrientation);
        this.unit = null;
        this.originalOrientation = null;
    }

    toOrientation(direction) {
        if (this.unit === null)
            return;

        this.unit.setOrientation(direction);
    }

    update(delta) {
        if (this.unit === null)
            return;
    }

    render(ctx) {
        if (this.unit === null)
            return;
        
        const translateX = (this.unit.location.posX * ctx.scaling) + (ctx.scaling / 2),
              translateY = ((this.unit.location.posY - this.unit.location.oy) * ctx.scaling) - (this.unit.asset.sh * ctx.scaling) + 18 * ctx.scaling,
              offset = this.offsets.get(this.unit.orientation);
        
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        ctx.drawImage(this.asset.img, offset.x, offset.y, 32, 16, translateX, translateY, 32 * ctx.scaling, 16 * ctx.scaling);
        ctx.restore();
    }
}