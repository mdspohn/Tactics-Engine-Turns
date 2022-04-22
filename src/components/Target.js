class CombatTarget extends Component {
    constructor() {
        super();

        // Target Unit
        this.target = new Object();
        this.target.elements = new Object();
        this.target.elements.wrapper       = document.getElementById('combat-target');
        this.target.elements.portrait      = this.target.elements.wrapper.querySelector('.portrait');
        this.target.elements.effects       = Array.from(this.target.elements.wrapper.querySelectorAll('.status-effects .effect'));
        this.target.elements.body          = this.target.elements.wrapper.querySelector('.main');
        this.target.elements.name          = this.target.elements.wrapper.querySelector('.classification .name');
        this.target.elements.level         = this.target.elements.wrapper.querySelector('.classification .level');
        this.target.elements.species       = this.target.elements.wrapper.querySelector('.classification .species-name');
        this.target.elements.hp_current    = this.target.elements.wrapper.querySelector('.hp .current');
        this.target.elements.hp_bar        = this.target.elements.wrapper.querySelector('.hp .bar');
        this.target.elements.hp_prediction = this.target.elements.wrapper.querySelector('.hp .prediction');
        this.target.elements.tp_current    = this.target.elements.wrapper.querySelector('.tp .current');
        this.target.elements.tp_bar        = this.target.elements.wrapper.querySelector('.tp .bar');
        this.target.elements.tp_prediction = this.target.elements.wrapper.querySelector('.tp .prediction');

        this.target.animations = new Object();
        this.target.animations['show']  = [ { opacity: 1 }, { duration: 500 } ];
        this.target.animations['hide']  = [ { opacity: 0 }, { duration: 500 } ];
        this.target.animations['slide'] = [ { left: ['0px', '20px'] }, { duration: 500 } ];
    }
}