var game;

function clone(obj) {
    var newobj;
    if (null == obj || "object" != typeof obj) return obj;
    if (obj instanceof Array) {
        newobj = [];
        for (var i=0;i<obj.length;i++)
            newobj[i] = clone(obj[i]);
        return newobj;
    }
    else if (obj instanceof Object) {
        newobj = {};
        for (var key in obj)
            newobj[key] = clone(obj[key]);
        return newobj;
    }
    throw new Error("cloning error.");
}

function create_unit(side) {
    var newunit = {};
    newunit.id = Math.floor(Math.random() * 100000);
    newunit.ai = "heal";
    newunit.side = side;
    newunit.range = Math.floor(Math.random() * 50) + 5;
    newunit.charge = Math.floor(Math.random() * 100);
    newunit.maxhp = Math.floor(Math.random() * 30) + 70;
    newunit.hp = newunit.maxhp;
    newunit.pwr = Math.floor(Math.random()*5) + 1;
    newunit.def = Math.floor(Math.random()*3) + 1;
    newunit.agl = Math.floor(Math.random()*10) + 1;
    return newunit;
}

function create_party(side, count) {
    var newparty = {};
    newparty.funds = 50;
    newparty.side = side;
    newparty.unit = [];
    for (var i=0;i<count;i++) {
        newparty.unit[i] = create_unit(side);
    }
    
    newparty.get_average = function(stat) {
        var sum=0;
        newparty.unit.forEach(function(u) {
            sum+=u[stat];
        });
        return Math.floor(sum / newparty.unit.length) + 1;
    };
    
    return newparty;
}

function create_game(canvas, context) {
    var newgame = {};
    newgame.party = create_party("user", 3);
    newgame.mode = create_menu(context, newgame.party);
    
    canvas.onmousemove = function(e) {
        newgame.mode.mouse_move(e.offsetX, e.offsetY);
    };
    canvas.onmousedown = function(e) {
        var result = newgame.mode.mouse_down(e.offsetX, e.offsetY);
        if (typeof result == "function")
            result(newgame);
    };    
    
    newgame.loop = function() {
        game.mode.loop();
        newgame.draw();
    };

    newgame.draw = function() {
        game.mode.draw(context);
    };
    
    newgame.interval = window.setInterval(newgame.loop, 1000/60);
    return newgame;
}

window.onload = function() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.textBaseline = "top";
    
    game = create_game(canvas, context);
    
    game.party = create_party("user", 3);
    game.mode = create_menu(context, game.party);
};
