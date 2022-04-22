class TitleController {
    static id = 'TITLE';
    static instance = null;

    constructor() {
        if (TitleController.instance !== null)
            return TitleController.instance;

        TitleController.instance = this;
    }

    async initialize() {
        return Promise.resolve();
    }

    async load() {
        return Promise.resolve();
    }
    
    update(step) {

    }

    render(delta) {

    }
}