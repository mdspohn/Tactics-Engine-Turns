class DataManager {
    constructor() {
        // Game Data
        this.area = new Object();
        this.decoration = new Object();
        this.scenario = new Object();
        this.unit = new Object();
        this.sound = new Object();

        // Settings Data
        this.settings = new Object();
        this.settings.audio = new Object();
        this.settings.input = new Object();

        // Profile
        this.saves = new Array();
        this.profile = new Object();
    }

    async initialize() {
        // XXX fetch JSON data instead
        this.area = AreaData.data;
        this.decoration = DecorationData.data;
        this.scenario = ScenarioData.data;
        this.unit = UnitData.data;
        this.sound = SoundData.data;
        this.settings = SettingsData.data;
        this.saves = SaveData.data;
        
        return Promise.resolve();
    }

    loadProfile(slot = null) {
        this.profile = this.saves[slot];
    }

    loadSettings(slot = null) {

    }

    async saveProfile(slot = null) {
        // write json to save file as autosave or to specified slot
    }

    async saveSettings(slot = null) {
        // write json to save file as general or to specified slot
    }
}