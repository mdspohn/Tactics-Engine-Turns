class StateManager {
    constructor() {
        this.states = new Set();
        this.current = null;
    }

    add(state, isDefault = false) {
        this.states.add(state);
        if (isDefault)
            this.current = state;
    }

    set(state) {
        if (!this.states.has(state))
            return new Error('Uknown state: ', state);
        this.current = state;
    }

    is(state) {
        return this.current === state;
    }

    in(...states) {
        return states.includes(this.current);
    }
}