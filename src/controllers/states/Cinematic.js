class CinematicState {
    constructor() {

    }

    async initialize() {
        return Promise.resolve();
    }

    async use(data, profile) {
        return Promise.resolve();
    }

    async wake(opts) {
        Events.dispatch('combat-state-change', { state: 'setup', opts: {} });
    }

    async sleep() {
        return Promise.resolve();
    }

    intro() {
    }

    update(delta) {

    }

    render(location, cam, ctx, scaling) {

    }

    renderUI(cam, ctx, scaling) {

    }
}