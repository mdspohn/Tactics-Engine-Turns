class CombatPanel extends Component {
    constructor() {
        super();

        // DOM
        this.wrapper    = document.getElementById('combat-panel');
        this.suggestion = this.wrapper.querySelector('.suggestion');
        this.controls   = this.wrapper.querySelector('.controls');

        // Animations
        this.animations = new Object();
        this.animations['slide'] = [ { bottom: ['-80px', 0], opacity: 1 }, { duration: 500 } ];
        this.animations['show']  = [ { opacity: 1 }, { duration: 250 } ];
        this.animations['hide']  = [ { opacity: 0 }, { duration: 250 } ];
    }

    async show() {
        this.wrapper.style.display  = 'block';
        return Promise.all([
            this.animate(this.suggestion, this.animations['show']).finished,
            this.animate(this.controls, this.animations['show']).finished,
            this.animate(this.wrapper, this.animations['slide']).finished
        ]);
    }

    async hide() {
        const animations = new Array();
        animations.push(this.animate(this.suggestion, this.animations['hide']).finished);
        animations.push(this.animate(this.controls, this.animations['hide']).finished);
        animations.push(this.animate(this.wrapper, this.animations['slide'], { direction: 'reverse' }).finished);

        await Promise.all(animations);
        this.wrapper.style.display  = 'none';
    }

    changeText(text = 'Select Command') {
        this.suggestion.textContent = text;
    }
}