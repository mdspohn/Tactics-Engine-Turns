class MapState {
    constructor() {

    }

    async initialize() {
        return Promise.resolve();
    }

    async prepare(data) {
        this.data = data;

        console.log(this.data);

        return Promise.resolve();
    }

    async wake({ delay = Promise.resolve() } = opts) {
        await delay;
        Engine.log('Map State');
    }

    async sleep() {
        return Promise.resolve();
    }

    update(delta) {

    }

    render(location, ctx, cam) {

    }
}