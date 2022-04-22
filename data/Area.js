class AreaData {
    static data = new Object();
}

AreaData.data['woodlands'] = {
    "id": "woodlands",
    "configuration": {
        "width": 32,
        "height": 32
    },
    "animations": {
        "-1": {
            "name": "Empty, Unreachable",
            "idx": -1,
            "oy": 8,
            "unreachable": true
        },
        "0": {
            "name": "Empty",
            "idx": -1,
            "hazard": true
        },
        "1": {
            "name": "Grass",
            "idx": 0,
            "oy": 3
        },
        "2": {
            "name": "Dirt",
            "idx": 10
        },
        "3": {
            "name": "Dirt Water",
            "idx": 21,
            "water": true,
            "oy": 7
        },
        "4": {
            "name": "Grass",
            "idx": 0
        },
        "5": {
            "name": "Dirt 2",
            "idx": 15
        },
        "6": {
            "name": "Dirt 3",
            "idx": 16
        },
        "7": {
            "name": "Dirt 4",
            "idx": 17
        },
        "11": {
            "name": "Stone Water",
            "idx": 20,
            "water": true,
            "oy": 7
        },
        "21": {
            "name": "Stone",
            "idx": 30
        },
        "22": {
            "name": "Stone 2",
            "idx": 35
        },
        "23": {
            "name": "Stone 3",
            "idx": 36
        },
        "24": {
            "name": "Stone 4",
            "idx": 37
        },
        "25": {
            "name": "Stone Alt",
            "idx": 38
        }
    }
};