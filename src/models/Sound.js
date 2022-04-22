class Sound {
    static cache = new Object();

    constructor(config, settings) {
        if (Sound.cache[id] !== undefined)
            return Sound.cache[id];

        Sound.cache[id] = this;

        if (config === undefined) {
            Engine.log(`Sound not found in registry. [ID: ${id}]`);
            return this;
        }

        // Meta Data
        this.id = config.id;
        this.volume = config.volume;
        this.category = config.category;

        // Audio File
        this.audio = new Audio();
        this.isLoaded = new Promise((resolve) => this.audio.addEventListener('canplaythrough', () => resolve()));
        this.audio.src = Sound.path + data.category + '/' + data.src;
    }

    async play() {
        await this.isLoaded;
        this.audio.volume = (this.volume * settings.volume[this.category]).toFixed(2);
        this.audio.play();
    }

    async loop() {
        this.audio.loop = true;
        this.play();
    }

    pause() {
        this.audio.pause();
    }

    stop() {
        this.pause();
        this.audio.currentTime = 0;
    }

    destroy() {
        Sound.cache[this.id] = undefined;
    }
}