// Central definitions for tile IDs used by map CSV files.
//
// CSV files only store numeric tile IDs. Behavior and sprite-sheet regions
// live here so maps stay simple to author.
const TILE_TYPES = {
    0: {
        name: "empty"
    },

    1: {
        name: "grass",
        height: 0,
        sprite: {
            x: 0,
            y: 0,
            width: 16,
            height: 16
        }
    },

    2: {
        name: "stone",
        height: 1,
        standable: true,
        sprite: {
            x: 16,
            y: 0,
            width: 16,
            height: 16
        }
    },

    3: {
        name: "fence",
        height: 1.4,
        standable: false
    }
};

export default TILE_TYPES;
