class Component {
    constructor() {
        // Nothing
    }

    animate(element, [ keys, config ] = animation, override = {}) {
        const opts = Object.assign({
            duration: 0,
            fill: 'forwards',
            easing: 'ease-in-out'
        }, config, override);

        return element.animate(keys, opts);
    }
}