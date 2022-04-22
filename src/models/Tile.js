class Tile {
    constructor(config, ms = 0) {
        this.idx = ~~config.idx;

        // Animation Offsets
        this.aox = ~~config.ox;
        this.aoy = ~~config.oy;

        // Temporary Animation Offsets (i.e. <Location>.shake())
        this.tox = 0;
        this.toy = 0;

        // Animated Frames
        this.isAnimated = config.hasOwnProperty('frames');

        if (this.isAnimated) {
            this.frames = config.frames;
            this.no = 0;
            this.speed = 1;
            this.ms = ms + (~~config.delay * -1);
            this.delta = 0;
        }

        this.isWater       = Boolean(config.water);
        this.isHazard      = Boolean(config.hazard);
        this.isUnreachable = Boolean(config.unreachable);
        this.isSloped      = Boolean(config.sloped);
        this.orientation   = config.orientation || null;
    }

    get index() { return this.isAnimated ? this.frames[this.no].idx : this.idx }
    
    get ox()  { return this.tox + this.aox + ~~this.frames?.[this.no]?.ox }
    get oy()  { return this.toy + this.aoy + ~~this.frames?.[this.no]?.oy }
}