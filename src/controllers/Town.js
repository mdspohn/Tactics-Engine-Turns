class TownController {
    static id = 'TOWN';
    static instance = null;

    constructor() {
        if (TownController.instance !== null)
            return TownController.instance;

        TownController.instance = this;
    }

    async initialize() {
        return Promise.resolve();
    }
    
    update(step) {

    }

    render(delta) {

    }
}