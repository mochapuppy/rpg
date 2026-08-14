// Central definitions for tile IDs used by map CSV files.
//
// Map files only need to store numeric IDs. Behavior and other tile metadata
// live here so changing a tile type does not require editing every map.
const TILE_TYPES = {
    0: {
        name: "empty"
    },

    1: {
        name: "grass",
        height: 0
    },

    2: {
        name: "stone",
        height: 1,
        standable: true
    },

    3: {
        name: "fence",
        height: 1.4,
        standable: false
    }
};

export default TILE_TYPES;
