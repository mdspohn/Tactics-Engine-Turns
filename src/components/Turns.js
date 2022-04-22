class CombatTurns extends Component {
    constructor() {
        super();

        // DOM Reference
        this.wrapper = document.getElementById('combat-turns');

        // Animations
        this.animations = new Object();
        this.animations['show']       = [ { opacity: [0, 1] },                      { duration: 500 }                     ];
        this.animations['hide']       = [ { opacity: [1, 0] },                      { duration: 500 }                     ];
        this.animations['unit-slide'] = [ { opacity: [0, 1], left: [ '100%', 0 ] }, { duration: 750, easing: 'ease-out' } ];
        this.animations['wrap-slide'] = [ { right: ['-132px', '20px'] },            { duration: 500, easing: 'ease' }     ];

        // State
        this.turns = null;
        this.elements = null; // XXX: Possible Memory Leak / CPU hang -- switch to redefining element properties instead of create/remove
    }

    initialize(turns) {
        this.turns = turns;
        this.elements = this.turns.map(unit => this.createHTMLElement(unit));
        this.elements.forEach(el => this.wrapper.appendChild(el));
    }

    createHTMLElement(unit) {
        const element = document.createElement('div');
        element.className = unit.id + ' portrait ally focusable';
        element.innerHTML = `<div class="allegiance"></div>
                             <div class="sprite"></div>
                             <div class="resource">
                               <div class="bar"></div>
                               <div class="prediction"></div>
                             </div>`;
        return element;
    }

    async show() {
        this.wrapper.style.display = 'flex';
        const animations = this.elements.map((el, i) => {
            return this.animate(el, this.animations['unit-slide'], { delay: i * 100 }).finished;
        });

        return Promise.all(animations);
    }

    async hide() {
        await Promise.all(this.elements.map(el => this.animate(el, this.animations['hide']).finished));
        this.wrapper.style.display = 'none';
    }

    async next(forecast) {
        const next = this.elements.shift(),
              tail = this.createHTMLElement(forecast.slice(-1)[0]);

        this.turns = forecast;

        this.elements.push(tail);
        this.wrapper.appendChild(tail);

        await Promise.all([
            this.animate(this.wrapper, this.animations['wrap-slide']).finished,
            this.animate(next, this.animations['hide']).finished,
            this.animate(tail, this.animations['show']).finished
        ]);

        next.remove();
    }

    async update(forecast) {
        const index = this.turns.findIndex((unit, i) => unit.uuid !== forecast[i].uuid);

        if (index === -1)
            return Promise.resolve();
         
        const toRemove = this.elements.splice(index),
              toCreate = turns.slice(index).map(unit => this.createHTMLElement(unit));
        
        this.elements.push(...toCreate);
        toRemove.forEach(el => el.remove());

        this.turns = forecast;

        const animations = toCreate.map((el, i) => {
            this.wrapper.appendChild(el);
            return this.animate(el, this.animations['unit-slide'], { delay: i * 100 }).finished;
        });

        return Promise.all(animations);
    }

    addTargets(...targets) {
        this.turns.forEach((unit, i) => {
            if (!targets.includes(unit))
                return false;

            this.elements[i].toggleClass('focused', true);
        });
    }

    removeTargets() {
        this.turns.forEach((unit, i) => this.elements[i].toggleClass('focused', false));
    }
}