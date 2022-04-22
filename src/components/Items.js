class CombatItems extends Component {
    constructor() {
        super();
        
        // TODO: this is just a copy/paste of actions menu UI component

        // DOM
        this.wrapper     = document.getElementById('combat-actions');
        this.buttons     = Array.from(this.wrapper.querySelectorAll('.menu-item'));
        this.description = this.wrapper.querySelector('.description');
        this.power       = this.wrapper.querySelector('.power');
        this.type        = this.wrapper.querySelector('.type');
        this.range       = this.wrapper.querySelector('.range');
        this.pattern     = this.wrapper.querySelector('.pattern');

        // Animations
        this.animations = new Object();
        this.animations['show'] = [ { opacity: 1 }, { duration: 250 } ];
        this.animations['hide'] = [ { opacity: 0 }, { duration: 250 } ];

        // State
    }

    async show() {
        this.wrapper.style.display = 'block';
        return this.animate(this.wrapper, this.animations['show']).finished;
    }

    async hide() {
        await this.animate(this.wrapper, this.animation['hide']).finished;
        this.wrapper.style.display = 'none';
    }
}