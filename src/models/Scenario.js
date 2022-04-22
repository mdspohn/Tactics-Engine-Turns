class Scenario {
    constructor(id, data) {
        this.id = id;
        this.opts = data.scenario[id];
        this.name = this.opts.name;

        this.area = new Area(this.opts.area.id, this.opts.area.layout, data.area[this.opts.area.id]);
        this.decoration = new Decoration(this.opts.decoration.id, this.opts.decoration.layout, data.decoration[this.opts.decoration.id]);

        this.units = new Array();
        for (let i = 0; i < this.opts.units.length; i++) {
            const opts = this.opts.units[i],
                  name = (opts.name !== undefined) ? opts.name : opts.id, // consider randomized names on data.unit[id]
                  gender = (opts.gender !== undefined) ? opts.gender : ['male', 'female'][Math.round(Math.random())],
                  location = (opts.location !== undefined) ? this.area.getLocation(...opts.location) : null;

            const instance = new Unit(opts.id, name, gender, data.unit[opts.id], opts.orientation, location);
            this.units.push(instance);
        }
    }

    async load() {
        const setup = new Array();
        setup.push(this.area.load());
        setup.push(this.decoration.load());
        setup.push(...this.units.map(unit => unit.load()));
        return Promise.all(setup);
    }
}