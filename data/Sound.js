class SoundData {
    static data = new Object();
}

SoundData.data['test'] = {
    src: 'test.mp3',   // file extension
    category: 'music', // audio type for volume control sliders (music, sounds, system)
    volume: 1.0        // initial volume adjustment to baseline
};

SoundData.data['ui-move'] = {
    src: 'ui-move.wav',
    category: 'sounds',
    volume: 1.0
};

SoundData.data['ui-select'] = {
    src: 'ui-select.wav',
    category: 'sounds',
    volume: 1.0
};

SoundData.data['ui-cancel'] = {
    src: 'ui-cancel.wav',
    category: 'sounds',
    volume: 1.0
};