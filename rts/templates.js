var healthcolors = ["rgb(255,0,0)", "rgb(255,255,0)", "rgb(0,255,0)"];

var unittypes = {
    "miner": {
        "sprite": "m",
        "hp": 50,
        "cost": 10
    },
    "grunt": {
        "sprite": "g",
        "hp": 100,
        "cost": 25
    }
};

var buildingtypes = {
    "base": {
        "width": 4,
        "height": 4,
        "units": ["miner"],
        "cost": 0
    },
    "wall": {
        "width": 1,
        "height": 1,
        "cost": 10
    },
    "mine": {
        "width": 2,
        "height": 2,
        "cost": 0
    },
    "farm": {
        "width": 2,
        "height": 3,
        "cost": 25
    },
    "barracks": {
        "width": 3,
        "height": 3,
        "units": ["grunt"],
        "cost": 100
    }
};

var bullettypes = {
    "damage": {
        "power": -1
    },
    "heal": {
        "power": 1
    }
};

var tiletypes = {
    "water": {
        "color": "steelblue"
    },
    "sand": {
        "color": "khaki"
    },
    "mud": {
        "color": "darkgoldenrod"
    },
    "lightgrass": {
        "color": "yellowgreen"
    },
    "mediumgrass": {
        "color": "forestgreen"
    },
    "darkgrass": {
        "color": "darkgreen"
    }
};

var bullettypes = {
    "attack": {
        "mult": -1,
        "color": "rgb(255,0,0)"
    },
    "heal": {
        "mult": 1,
        "color": "rgb(0,255,0)"
    },
    "build": {
        "mult": 1,
        "color": "rgb(0,0,255)"
    },
    "mine": {
        "mult": -1,
        "color": "rgb(255,0,255)"
    },
    "carve": {
        "mult": -1,
        "color": "rgb(0,255,255)"
    }
};