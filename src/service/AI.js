class AILogic {
    static instance = null;

    constructor() {
        if (AILogic.instance !== null)
            return AILogic.instance;

        AILogic.instance = this;
    }

    getSequence(active, units, area) {
        return Promise.resolve();
    }
}