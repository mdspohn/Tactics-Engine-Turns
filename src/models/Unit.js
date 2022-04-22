class Unit {
    static uid = 0;

    constructor(id, name, gender, meta, orientation = 'south', location = null) {

        this.uid = Unit.uid++;

        // ----------------------
        // Configuration
        // ----------------------------

        this.id = id;
        this.name = name;
        this.species = id;
        this.gender = gender;
        this.asset = new Asset(this.id, 'units', meta.configuration);

        this.enabled = true;

        // ----------------------
        // Location
        // ----------------------------

        this.location = location;
        this.orientation = orientation;

        // ----------------------
        // Movement
        // ----------------------------

        this.movement = new Object();
        this.movement.max = 4;
        this.movement.remaining = 4;
        this.movement.history = new Array();

        // ----------------------
        // Animations
        // ----------------------------

        this.animations = new Object();
        this.animations.data = meta.animations;
        this.animations.queue = new Array();
        this.animations.current = this.getAnimation('idle');

        // ----------------------
        // Status
        // ----------------------------

        this.level = 1;
        this.ct = this.energy = 0;
        this.tp = 20 + Math.floor(Math.random() * 70);

        this.stats = new Object();
        this.stats.hp = new Object();
        this.stats.hp.base = this.stats.hp.current = 20;
        this.stats.hp.growth = 2;

        // XXX replace
        this.hp = 50 + Math.floor(Math.random() * 300);
        this.attack = 2;
        this.defense = 1;
        this.jump = 2;
        this.speed = 50 + Math.floor(Math.random() * 10);
        this.allegiance = this.id;
    }

    // ----------------------
    // Load / Initialize
    // ----------------------------

    async load() {
        await this.asset.load();
    }

    // ----------------------
    // General
    // ----------------------------

    canSwim() {
        return false;
    }

    canFly() {
        return false;
    }

    // ----------------------
    // Location / Orientation Setting
    // ----------------------------

    setOrientation(orientation) {
        if (this.orientation === orientation)
            return;
        
        this.orientation = orientation;
        this.animations.current.orientation = orientation;
        this.animations.current.isMirrored = Boolean(this.animations.data[this.animations.current.id][orientation].mirrored);
    }

    setLocation(location) {
        if (this.location === location)
            return;

        this.animations.current.destination = location;
        this.location = location;
        this.x = location.x;
        this.y = location.y;
    }

    // ----------------------
    // Movement
    // ----------------------------

    moveTo(destination, path) {
        const finished = (resolve) => {
            Events.listen('move-complete', (data, eid) => {
                if (data.unit !== this)
                    return;
                
                Events.remove('move-complete', eid);
                resolve();
            }, true);
        };

        this.animate(this.getMovementAnimation(null, destination, path));

        return new Promise(finished);
    }

    getRemainingMovement() {
        return this.movement.remaining;
    }

    getPathTo(location, range) {
        if (!range.has(location))
            return null;

        let path = new Array();

        while (range.get(location) !== undefined && range.get(location).previous instanceof Location) {
            path.unshift(location);
            location = range.get(location).previous;
        }

        return path;
    }

    getRange(area, units, location = this.location, previous = null, steps = this.getRemainingMovement(), range = new WeakMap()) {
        if (range.has(location) && range.get(location).steps >= steps)
            return;

        range.set(location, {
            steps,
            selectable: location !== this.location,
            previous
        });

        if (steps === 0)
            return;

        const next = new Array();
        next.push(area.getLocation(location.x - 1, location.y));
        next.push(area.getLocation(location.x + 1, location.y));
        next.push(area.getLocation(location.x, location.y - 1));
        next.push(area.getLocation(location.x, location.y + 1));

        next.forEach(destination => {
            if (destination === null)
                return;

            const height = destination.z - location.z;

            let valid = (height < 0) ? (this.jump + 1) >= Math.abs(height) : this.jump >= height;
            valid &&= !destination.isUnreachable;
            valid &&= !units.some(unit => unit.location === destination && unit !== this);
            valid &&= !destination.isWater  || this.canSwim() || this.canFly();
            valid &&= !destination.isHazard || this.canFly();

            // TODO hazard leaping
            if (!valid)
                return false;

            this.getRange(area, units, destination, location, steps - 1, range);
        });

        return range;
    }

    // ----------------------
    // Animation
    // ----------------------------

    animate(animations, force = false) {
        animations = Array.isArray(animations) ? animations : [animations];
        this.animations.queue = animations;
        this.animations.current.terminate = force;
    }

    getAnimationData(id, orientation = this.orientation) {
        if (this.animations.data[id] && this.animations.data[id][orientation]) {
            return this.animations.data[id][orientation];
        }

        Engine.log(`Requesting unknown animation: ${this.id} ${id} ${orientation}`);
    }

    getAnimation(id, orientation = this.orientation, previous = null) {
        const data = this.getAnimationData(id, orientation),
              animation = new Object();
        
        animation.id = id;
        animation.ms = ~~previous?.ms;
        animation.no = 0;

        animation.destination = this.location;
        animation.orientation = orientation;
        if (data.random) {
            animation.variation = Math.round(Math.random() * data.frames.length) % data.frames.length;
        } else {
            animation.variation = (previous !== null) ? (previous.variation + 1) % data.frames.length : 0;
        }
        animation.isMirrored = Boolean(data.mirrored);
        animation.x = animation.ox = ~~data.ox;
        animation.y = animation.oy = ~~data.oy;

        if (id !== 'idle') {
            animation.events = new Object();
            animation.events.end = { id: `${id}-complete`, data: { unit: this, animation }};
        }

        return animation;
    }

    getMovementAnimation(id, destination, path) {
        let previous = this.animations.queue[this.animations.queue.length - 1] || this.animations.current;
        
        const animations = new Array();

        this.animations.checkpoint ??= previous;

        path.forEach(location => {
            const animation = new Object();
            animation.ms = 0;
            animation.no = 0;
            animation.destination = location;
            animation.id = id;
            this.addMovementAnimationProperties(animation, previous.destination, animation.destination);

            const data = this.getAnimationData(animation.id, animation.orientation);
            animation.isMirrored = Boolean(data.mirrored);
            if (data.random) {
                animation.variation = Math.round(Math.random() * data.frames.length) % data.frames.length;
            } else {
                animation.variation = (previous !== null) ? (previous.variation + 1) % data.frames.length : 0;
            }
            animation.ox = ~~data.ox;
            animation.oy = ~~data.oy;
            animation.intx = 0;
            animation.inty = 0;
            animation.frames = data.frames[animation.variation];

            // ms multipliers for frames that want it
            animation.multipliers = new Array();
            animation.frames.forEach(frame => {
                let multiplier = 0;
                multiplier += ~~frame.zmult * Math.abs(location.z - previous.destination.z);
                multiplier += ~~frame.xmult * Math.abs(location.x - previous.destination.x);
                multiplier += ~~frame.ymult * Math.abs(location.y - location.y);
                animation.multipliers.push(Math.max(multiplier, 1));
            });

            animation.events = new Object();
            animation.events.end = {
                id: (location === destination) ? 'move-complete' : 'move-step', 
                data: {
                    unit: this,
                    animation,
                    previous: previous.destination
                }
            };

            animations.push(animation);
            previous = animation;
        });

        return animations;
    }

    addMovementAnimationProperties(animation, start, end) {
        const o = Game.logic.area.getOrientation(start, end),
              so = start.orientation,
              eo = end.orientation,
              oso = so ? Game.logic.area.orientations[so].opposite : null,
              oeo = eo ? Game.logic.area.orientations[eo].opposite : null,
              diff = Math.abs(end.x - start.x) + Math.abs(end.y - start.y),
              diff_z = end.z - start.z;
    
        if (Math.abs(diff_z) <= 1 && (so !== null || eo !== null)) {
            animation.sloped |= (so === eo   && ((diff_z < 0 && oso == o) || (diff_z >  0 && so  == o)));
            animation.sloped |= (so === null && ((diff_z > 0 && eo  == o) || (diff_z == 0 && oeo == o)));
            animation.sloped |= (eo === null && ((diff_z < 0 && oso == o) || (diff_z == 0 && so  == o)));
        }

        animation.movement = true;
        animation.orientation = o;

        if (animation.id === null) {
            if (diff > 1 && Math.abs(diff_z) <= 1) {
                animation.id = 'leap';
            } else if (animation.sloped && diff <= 1) {
                animation.id = 'walk';
            } else if (Math.abs(diff_z) > 0) {
                animation.id = (diff_z > 0) ? 'jump-up' : 'jump-down';
            } else if (so !== null && eo !== null) {
                animation.id = (so === eo && ![so, oso].includes(o)) ? 'walk' : (so == o) ? 'jump-down' : 'jump-up';
            } else if (so === null && eo === null) {
                animation.id = 'walk';
            } else {
                animation.id = (so !== null) ? 'jump-up' : 'jump-down';
            }
        }

        const scaling = Game.ctx.scaling;

        const w = (this.location.tw / 2) * scaling,
              d = (this.location.td / 2) * scaling,
              h = (this.location.th / 2) * scaling,
              x = (end.x - start.x),
              y = (end.y - start.y),
              z = (end.z - start.z),
              s = (~~end.isSloped) - (~~start.isSloped);

        const swap = (end.x > start.x || end.y > start.y) && ((z === 0 && s >= 0) || animation.sloped);

        // swap rendering location immediately on animation start
        animation.swap = swap;

        // derived initial and current offset
        animation.ix = animation.cx = ~~swap * ( (y - x) * w + (start.ox - end.ox));
        animation.iy = animation.cy = ~~swap * (-(x + y) * d + (start.oy - end.oy));
        animation.iz = animation.cz = ~~swap * (-(s * h) + (z * (h * 2) * scaling));

        // derived target offset
        animation.tx = ~~!swap * ((x - y) * w - (start.ox - end.ox));
        animation.ty = ~~!swap * ((x + y) * d - (start.oy - end.oy));
        animation.tz = ~~!swap * ((s * h) - (z * this.location.th * scaling));

        // current movement progress
        animation.px = 0;
        animation.py = 0;
        animation.pz = 0;
    }

    nextFrame() {
        const animation = this.animations.current,
              frames    = this.animations.data[animation.id][this.orientation].frames[animation.variation];

        if (frames[animation.no].event !== undefined)
            Events.dispatch(frames[animation.no].event, { unit: this, animation });

        if (animation.movement) {
            animation.px += frames[animation.no].px || 0;
            animation.py += frames[animation.no].py || 0;
            animation.pz += frames[animation.no].pz || 0;
        }

        // make interpolated frame offset the baseline for the next frame
        animation.intx = ~~frames[animation.no].intx;
        animation.inty = ~~frames[animation.no].inty;

        const adjustedMs = (animation.multipliers) ? (frames[animation.no].ms * animation.multipliers[animation.no]) : frames[animation.no].ms;
        animation.ms -= adjustedMs;

        if ((animation.no + 1) >= frames.length)
            return this.nextAnimation();

        animation.no += 1;
        return animation;
    }

    nextAnimation(force = false) {
        // has event to fire before next animation
        if (this.animations.current.events?.end) {
            Events.dispatch(this.animations.current.events.end.id, this.animations.current.events.end.data);
        }

        // need to swap unit location to destination of last animation
        if (this.animations.current.destination !== this.location && !force) {
            this.location = this.animations.current.destination;
        }

        const animation = this.animations.queue.shift() || this.getAnimation('idle', this.orientation, this.animations.current);

        // has event to fire at the start of this new animation
        if (animation.events?.start) {
            Events.dispatch(animation.events.start.id, animation.events.start.data);
        }

        // adjust area render sorting if needed
        if (animation.movement) {
            Events.dispatch('sort', (animation.destination.x !== this.location.x) ? 'Y' : 'X');
            this.location = (animation.swap) ? animation.destination : this.location;
        }

        this.animations.current = Object.assign(animation, { ms: this.animations.current.ms * ~~!force });
        this.orientation = animation.orientation;

        return animation;
    }

    // ----------------------
    // Update / Render Loop
    // ----------------------------
    
    update(delta, speed = 1) {
        if (this.enabled !== true)
            return;

        let animation = this.animations.current;
        const frames = this.animations.data[animation.id][animation.orientation].frames[animation.variation];

        if (animation.terminate)
            animation = this.nextAnimation(true);

        const ms = delta * speed;
        animation.ms += ms;

        while (animation.ms > ((animation.multipliers) ? frames[animation.no].ms * animation.multipliers[animation.no] : frames[animation.no].ms)) {
            const update = this.nextFrame();
            if (animation !== update) {
                animation = update;
                break;
            }
        }

        if (animation.movement === true) {
            const frame = animation.frames[animation.no],
                     p  = animation.ms / (frame.ms * animation.multipliers[animation.no]),
                     d  = this.location.z - animation.destination.z,
                     px = animation.px + (p * (frame.px || 0)),
                     py = animation.py + (p * (frame.py || 0)),
                     pz = animation.pz + (p * (frame.pz || 0));

            // switch to rendering from new destination
            if (pz !== 0 && (animation.destination !== this.location) && !animation.sloped && (pz >= 1 || d > 0)) {
                this.location = animation.destination;
                [animation.ix, animation.tx] = [-animation.tx, -animation.ix];
                [animation.iy, animation.ty] = [-animation.ty, -animation.iy];
                [animation.iz, animation.tz] = [-animation.tz, -animation.iz];
            }

            animation.cy = animation.iy + Math.round(py * (animation.ty - animation.iy));
            animation.cx = animation.ix + Math.round(px * (animation.tx - animation.ix));

            // keep (x, y) ratio when moving at a perfect isometric angle
            if ((px === py) && (Math.abs(animation.ty - animation.iy) * 2) === Math.abs(animation.tx - animation.ix))
                animation.cx = Math.sign(animation.cx) * Math.sign(animation.cy) * animation.cy * 2;

            animation.cx += animation.intx * Game.ctx.scaling + Math.round(p * ((~~frame.intx - animation.intx) * Game.ctx.scaling));
            animation.cy += animation.inty * Game.ctx.scaling + Math.round(p * ((~~frame.inty - animation.inty) * Game.ctx.scaling));
            animation.cz = animation.iz + Math.round(pz * (animation.tz - animation.iz));
        }
    }

    render(ctx) {
        if (this.enabled !== true)
            return;
        
        const animation = this.animations.current,
              frame = this.animations.data[animation.id][animation.orientation].frames[animation.variation][animation.no];

        if (frame.idx === -1)
            return false;

        const x = this.location.posX - ((this.asset.sw - 32) / 2),
              y = this.location.posY - ((this.asset.sh - 16) + (~~this.location.isSloped * (8 / 2))),
              ox = ~~animation.ox + ~~frame.ox,
              oy = ~~animation.oy + ~~frame.oy,
              translateX = ((x + ox) * ctx.scaling) + ~~animation.cx,
              translateY = ((y + oy) * ctx.scaling) + ~~animation.cy + ~~animation.cz;

        if (animation.isMirrored) {
            ctx.save();
            ctx.translate(translateX + (~~animation.isMirrored * this.asset.sw * ctx.scaling), translateY);
    
            if (animation.isMirrored)
                ctx.scale(-1, 1);

            ctx.drawImage(
                this.asset.img,
                frame.idx * this.asset.sw % this.asset.iw,
                Math.floor((frame.idx * this.asset.sw) / this.asset.iw) * this.asset.sh,
                this.asset.sw,
                this.asset.sh,
                0,
                0,
                this.asset.sw * ctx.scaling,
                this.asset.sh * ctx.scaling
            );
            ctx.restore();
        } else {
            ctx.drawImage(
                this.asset.img,
                frame.idx * this.asset.sw % this.asset.iw,
                Math.floor((frame.idx * this.asset.sw) / this.asset.iw) * this.asset.sh,
                this.asset.sw,
                this.asset.sh,
                translateX,
                translateY,
                this.asset.sw * ctx.scaling,
                this.asset.sh * ctx.scaling
            );
        }
    }
}