class ScenarioData {
    static data = new Object();
}

ScenarioData.data["ruins"] = {
    "id": "ruins",
    "name": "Forest Ruins",
    "area": {
        "id": "woodlands",
        "layout": [
            [1, 1, 1, 1, 1, 1, 1],
            [1, [24, 24], [23,23], 23, 23, 1, 1],
            [1, 22, 11, 11, 22, 1, 1],
            [1, 22, 11, 11, 22, 1, 1],
            [1, 22, [23, 24], 23, 25, 1, 1],
            [[1,25], 1, -1, -1, -1, [1, 24], 1],
            [1, 1, -1, -1, -1, 1, 1]
        ]
    },
    "decoration": {
        "id": "woodlands",
        "layout": [
            [0, 0, 2, 1, 0, 0, 2],
            [0, 0, 0, 0, 21, 23, 0],
            [0, 0, 14, 13, 22, 24, 0],
            [0, 0, 12, 11, 0, 0, 0],
            [0, 0, 0, 0, 0, 2, 0],
            [0, 2, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ]
    },
    "setup": {
        "max": 2,
        "locations": [ [6, 1], [6, 2],[6, 3], [6, 5], [6, 4],[5, 1], [5, 2],[5, 3], [5, 5], [5, 4] ]
    },
    "units": [
        {
            "id": "slime",
            "name": "Slime",
            "location": [1, 4],
            "orientation": "west"
        },
        {
            "id": "mimic",
            "name": "Harvest Crab",
            "location": [2, 1],
            "orientation": "west"
        },
        {
            "id": "player",
            "name": "Human",
            "gender": "male",
            "location": [4, 3],
            "orientation": "east"
        }
    ]
};

ScenarioData.data["pond"] = {
    "id": "pond",
    "name": "Pond",
    "area": {
        "id": "woodlands",
        "layout": [
            [0, 0, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, [1, 21], 2],
            [4, 4, 3, 3, 3, 5, 2],
            [4, 3, 3, 3, 3, 3, 5, 2],
            [4, 3, 3, 3, 3, 3, 3, 5],
            [4, 3, 3, 3, 3, 3, 3, 5],
            [4, 3, 3, 3, 3, 7, 6, 2],
            [4, 4, 4, 6, 6, 2, 2],
            [0, 0, 4, 4, 4, 4, 0],
        ]
    },
    "decoration": {
        "id": "woodlands",
        "layout": [
            [0, 0, 0, 0, 2, 2, 0],
            [0, 0, 0, 0, 1, 0, 0],
            [0, 0, 14, 13, 13, 1, 0],
            [0, 14, 11, 11, 11, 13, 0, 0],
            [0, 12, 11, 11, 11, 11, 13, 0],
            [0, 12, 11, 11, 11, 11, 11, 0],
            [0, 12, 11, 11, 11, 0, 1, 0],
            [0, 0, 2, 0, 0, 0, 2],
            [0, 0, 0, 0, 0, 0, 0],
        ]
    },
    "setup": {
        "max": 2,
        "locations": [ [6, 1], [6, 2],[6, 3], [6, 5], [6, 4],[5, 1], [5, 2],[5, 3], [5, 5], [5, 4] ]
    },
    "units": [
        {
            "id": "slime",
            "location": [3, 4],
            "orientation": "south"
        },
        {
            "id": "player",
            "name": "Peasant",
            "gender": "male",
            "location": [1, 2],
            "orientation": "east"
        }
    ]
};