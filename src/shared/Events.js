class Events {
    static uid = 0;
    
    static events = new Object();

    static listen(identifier, callback, persist = false) {
        this.events[identifier] ??= new Object();

        if (typeof callback !== 'function')
            return -1;

        this.events[identifier][this.uid] = { callback, persist };
        return this.uid++;
    }

    static dispatch(identifier, data) {
        Engine.log(identifier);

        if (this.events[identifier] === undefined)
            return;

        Object.entries(this.events[identifier]).forEach(([ id, listener ]) => {
            listener.callback(data, id);
            if (listener.persist)
                return;
            this.remove(identifier, id);
        });
    }

    static remove(identifier, id) {
        if (this.events?.[identifier]?.[id] === undefined)
            return;

        delete this.events[identifier][id];
    }
}