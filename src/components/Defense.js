class CombatDefense extends Component {
    constructor() {
        super();


        // Defender Prediction
        this.defending = new Object();
        this.defending.elements = new Object();
        this.defending.elements.wrapper  = document.getElementById('combat-defending');
        this.defending.elements.svg      = this.defending.elements.wrapper.querySelector('svg');
        this.defending.elements.damage   = this.defending.elements.wrapper.querySelector('.damage');
        this.defending.elements.accuracy = this.defending.elements.wrapper.querySelector('.accuracy');
        this.defending.elements.icon     = this.defending.elements.wrapper.querySelector('.icon');
        this.defending.elements.text     = this.defending.elements.wrapper.querySelector('.text');

        this.defending.animations = new Object();
        this.defending.animations['show'] = [ { opacity: 1 }, { duration: 250 } ];
        this.defending.animations['hide'] = [ { opacity: 0 }, { duration: 250 } ];
    }
}