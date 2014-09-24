var canvas, context, interval;
var mode;

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

function loop() {
    mode.loop();
    draw();
}

function draw() {
    mode.draw(context);
}

function create_unit(side) {
    var newunit = {};
    newunit.id = Math.floor(Math.random() * 100000);
    newunit.ai = "heal";
    newunit.side = side;
    newunit.range = Math.floor(Math.random() * 50) + 5;
    newunit.charge = Math.floor(Math.random() * 100);
    newunit.maxhp = 100;
    newunit.hp = newunit.maxhp;
    newunit.pwr = Math.floor(Math.random()*5) + 1;
    newunit.def = Math.floor(Math.random()*3) + 1;
    newunit.agl = Math.floor(Math.random()*10) + 1;
    return newunit;
}

function create_party(side, count) {
    var newparty = {};
    newparty.funds = 0;
    newparty.side = side;
    newparty.unit = [];
    for (var i=0;i<count;i++) {
        newparty.unit[i] = create_unit(side);
    }
    return newparty;
}

window.onload = function() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.textBaseline = "top";
    
    canvas.onmousemove = function(e) {
        mode.mouse_move(e.offsetX, e.offsetY);
    };
    canvas.onmousedown = function(e) {
        var fn = mode.mouse_down(e.offsetX, e.offsetY);
        //fn(mode);
    };
    
    var party = create_party("user", 3);
    
    mode = create_menu(context, party);
    
    interval = window.setInterval(loop, 1000/60);
};
