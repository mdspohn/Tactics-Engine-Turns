class CombatPointer {
    constructor() {
        this.ms = 0;

        this.fading = false;
        this.fms = 0;
        this.opacity = 1;

        this.location = null;
        this.asset = new Asset('pointer', 'misc');
    }

    load() {
        return this.asset.load();
    }

    fade() {
        this.fading = true;
        this.fms = 0;
    }

    update(delta) {
        if (this.location === null)
            return;

        if (!this.fading)
            return this.ms = (this.ms + delta) % 1000;

        this.fms += delta;
        if (this.fms >= 500) {
            this.location = null;
            this.fading = false;
        }
        this.opacity = 1 - (this.fms / 500);
    }

    render(ctx, units) {
        if (this.location === null || this.location.isUnreachable)
            return;
        
        const x = this.location.posX * ctx.scaling + (ctx.scaling / 2),
              y = (this.location.posY - this.location.oy) * ctx.scaling,
              height = Math.max(~~units.find(unit => unit.location === this.location)?.asset.sh, 32),
              oy = -(height) * ctx.scaling + ((2 * ctx.scaling) * (Math.abs(500 - this.ms) / 500));
        
        ctx.save();
        if (this.fading)
            ctx.filter = `opacity(${this.opacity})`;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 10;
        ctx.drawImage(this.asset.img, 0, 0, 32, 16, x, y + oy, 32 * ctx.scaling, 16 * ctx.scaling);
        ctx.restore();
    }
}