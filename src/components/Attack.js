class CombatAttack extends Component {
    constructor() {
        super();

        // Attacker Prediction
        this.attacking = new Object();
        this.attacking.elements = new Object();
        this.attacking.elements.wrapper  = document.getElementById('combat-attacking');
        this.attacking.elements.svg      = this.attacking.elements.wrapper.querySelector('svg');
        this.attacking.elements.damage   = this.attacking.elements.wrapper.querySelector('.damage');
        this.attacking.elements.accuracy = this.attacking.elements.wrapper.querySelector('.accuracy');
        this.attacking.elements.icon     = this.attacking.elements.wrapper.querySelector('.icon');
        this.attacking.elements.text     = this.attacking.elements.wrapper.querySelector('.text');

        this.attacking.animations = new Object();
        this.attacking.animations['show'] = [ { opacity: 1 }, { duration: 250 } ];
        this.attacking.animations['hide'] = [ { opacity: 0 }, { duration: 250 } ];
    }
}