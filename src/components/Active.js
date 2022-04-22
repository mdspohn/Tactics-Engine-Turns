class CombatActive extends Component {
    constructor() {
        super();

        // DOM
        this.wrapper       = document.getElementById('combat-active');
        this.portrait      = this.wrapper.querySelector('.portrait');
        this.effects       = Array.from(this.wrapper.querySelectorAll('.status-effects .effect'));
        this.body          = this.wrapper.querySelector('.main');
        this.name          = this.wrapper.querySelector('.classification .name');
        this.level         = this.wrapper.querySelector('.classification .level');
        this.species       = this.wrapper.querySelector('.classification .species-name');
        this.hp_current    = this.wrapper.querySelector('.hp .current');
        this.hp_bar        = this.wrapper.querySelector('.hp .bar');
        this.hp_prediction = this.wrapper.querySelector('.hp .prediction');
        this.tp_current    = this.wrapper.querySelector('.tp .current');
        this.tp_bar        = this.wrapper.querySelector('.tp .bar');
        this.tp_prediction = this.wrapper.querySelector('.tp .prediction');

        // Animations
        this.animations = new Object();
        this.animations['show']  = [ { opacity: [0, 1] },   { duration: 500 } ];
        this.animations['hide']  = [ { opacity: [1, 0] },   { duration: 500 } ];
        this.animations['slide'] = [ { left: [0, '20px'] }, { duration: 500 } ];

        // State
        this.unit = null;
    }

    async show() {
        this.wrapper.style.display = 'block';

        const animations = new Array();
        animations.push(this.animate(this.wrapper, this.animations['slide']).finished);
        animations.push(this.animate(this.body, this.animations['show']).finished);
        animations.push(this.animate(this.portrait, this.animations['show']).finished);
        animations.push(...this.effects.map((n) => this.animate(n, this.animations['show']).finished));

        return Promise.all(animations);
    }

    async hide() {
        const animations = new Array();
        animations.push(this.animate(this.wrapper, this.animations['slide'], { direction: 'reverse'} ).finished);
        animations.push(this.animate(this.body, this.animations['hide']).finished);
        animations.push(this.animate(this.portrait, this.animations['hide']).finished);
        animations.push(...this.effects.map((n) => this.animate(n, this.animations['hide']).finished));

        await Promise.all(animations);
        this.wrapper.style.display = 'none';
    }

    update(unit) {
        this.unit = unit;

        this.portrait.className = `portrait ${unit.id}`;
        this.name.innerHTML = `${unit.name[0].toUpperCase() + unit.name.slice(1)}<i class="icon ${unit.gender}"></i>`;
        this.level.innerText = unit.level;
        this.species.innerText = unit.species;
        this.hp_current.innerText = unit.hp;
        this.hp_bar.style.width = '100%'; // XXX
        this.tp_current.innerText = unit.tp; // XXX
        this.tp_bar.style.width = `${unit.tp}%`;  // XXX
    }
}