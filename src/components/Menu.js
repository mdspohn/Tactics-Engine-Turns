class CombatMenu extends Component {
    constructor() {
        super();

        // DOM
        this.wrapper = document.getElementById('combat-menu');
        this.buttons = Array.from(this.wrapper.querySelectorAll('.menu-item'));
        this.move    = this.wrapper.querySelector('.move');
        this.actions = this.wrapper.querySelector('.actions');
        this.items   = this.wrapper.querySelector('.items');
        this.wait    = this.wrapper.querySelector('.end-turn');

        // Animations
        this.animations = new Object();
        this.animations['show'] = [ { opacity: 1 }, { duration: 500 } ];
        this.animations['hide'] = [ { opacity: 0 }, { duration: 500 } ];

        // State
        this.focused = null;
        this.selected = null;

        for (const button of this.buttons) {
            button.addEventListener('mouseenter', () => this.focus(button));
        }
    }

    async show() {
        this.wrapper.style.display = 'block';
        this.focused = this.buttons.find(button => !button.classList.contains('disabled'));
        this.focus(this.focused);
        return this.animate(this.wrapper, this.animations['show']).finished;
    }

    async hide() {
        await this.animate(this.wrapper, this.animations['hide']).finished;
        this.wrapper.style.display = 'none';
        if (this.focused !== null) {
            this.focused.classList.remove('focused');
            this.focused = null;
        }

        this.cancel();
    }

    next() {
        const index = this.buttons.findIndex(button => Object.is(button, this.focused)),
              next = (index + 1) % this.buttons.length;

        this.focus(this.buttons[next]);
    }

    previous() {
        const index = this.buttons.findIndex(button => Object.is(button, this.focused)),
              previous = index ? (index - 1) : (this.buttons.length - 1);

        this.focus(this.buttons[previous]);
    }

    focus(element, override = false) {
        if (!override && this.selected !== null)
            return false;
        
        if (this.focused !== null)
            this.focused.classList.remove('focused');

        this.focused = element;
        this.focused.classList.add('focused');
    }

    select(element) {
        if (element.classList.contains('disabled'))
            return false;

        if (this.selected !== null)
            this.selected.classList.remove('selected');
        
        this.focus(element, true);
        this.selected = element;
        this.selected.classList.add('selected');
        this.wrapper.classList.toggle('has-selection', true);

        switch(this.selected) {
            case this.move: return 'move';
            case this.actions: return 'actions-menu';
            case this.items: return 'items-menu';
            case this.wait: return 'end-turn';
        }
    }

    cancel() {
        if (this.selected !== null)
            this.selected.classList.remove('selected');

        this.selected = null;
        this.wrapper.classList.toggle('has-selection', false);
    }

    disable(element) {
        element.classList.toggle('disabled', true);
    }

    enable(element) {
        element.classList.toggle('disabled', false);
    }
}