var tiletypes = {
    "lightgrass": {
        "color": "rgb(25,155,55)"
    },
    "darkgrass": {
        "color": "rgb(25,105,55)"
    }
};

var Tile = function(type, x, y) {
    this.type = type;
    this.color = tiletypes[type].color;
    this.x = x;
    this.y = y;
};

Tile.prototype.draw = function(ctx, x, y, w, h) {
    ctx.fillStyle = this.color;
    ctx.fillRect(x*w, y*h, w, h);
};

function create_formation(units, tx, ty) {
    var radius;
    if (units.length == 1) { radius = 0; }
    else if (units.length < 10) { radius = 1; }
    else { radius = 2; }
    var flist = [];
    for (var x=-radius; x<=radius; x++) {
        for (var y=-radius; y<=radius; y++)
            flist.push({ "x": tx + x, "y": ty + y });
    }
    var formation = [];
    for (var i=0;i<units.length;i++)
        formation.push(flist.pop_random());
    return formation;
}

var Map = function(width, height) {
    this.width = width;
    this.height = height;
    
    this.tile = [];
    for (var x=0; x<width; x++) {
        this.tile[x] = [];
        for (var y=0; y<height; y++) {
            this.tile[x][y] = new Tile(["lightgrass", "darkgrass"][randint(0,2)], x, y);
        }
    }
    
    this.units = [];
    for (var i=0;i<16;i++) {
        this.units.push(new Unit(["player", "cpu"][randint(0,2)]));
    }
    
    this.selunits = [];
    
    this.formation = [];
};

Map.prototype.select_units = function(x1, y1, x2, y2) {
    //todo: only select own units
    this.selunits = this.units.filter(function(u) {
        return u.in_range(x1, y1, x2, y2);
    });
};

Map.prototype.move_units = function(tx, ty) {
    this.formation = create_formation(this.selunits, tx, ty);
    this.selunits.forEach(function(u, i) {
        var dest = this.formation[i];
        u.set_dest(dest.x, dest.y);
        u.moving = true;
    }, this);
};

Map.prototype.loop = function() {
    this.selunits.forEach(function(u) {
        u.move();
    });
};

Map.prototype.mouse_down = function(mx, my, button) {
    var tx = Math.floor(mx/16);
    var ty = Math.floor(my/16);
    
    if (button == 1) {
        this.x1 = mx;
        this.y1 = my;
    }
    if (button == 3)
        this.move_units(tx, ty);
};

Map.prototype.mouse_up = function(mx, my, button) {
    if (button == 1) {
        var x1 = Math.floor(this.x1 / 16);
        var y1 = Math.floor(this.y1 / 16);
        var x2 = Math.floor(this.x2 / 16);
        var y2 = Math.floor(this.y2 / 16);
        if (x1 > x2) { var temp = x2; x2 = x1; x1 = temp; }
        if (y1 > y2) { var temp = y2; y2 = y1; y1 = temp; }
        this.select_units(x1, y1, x2, y2);
    }
    this.x1 = 0; this.y1 = 0; this.x2 = 0; this.y2 = 0;
};

Map.prototype.mouse_move = function(mx, my, pressed) {
    if (pressed) {
        this.x2 = mx;
        this.y2 = my;
    }
};

Map.prototype.draw = function(ctx, screenx, screeny) {
  
    for (var x=0; x<this.width; x++) {
        for (var y=0; y<this.height; y++) {
            this.tile[x][y].draw(ctx, x, y, 16, 16);
        }
    }
  
    this.formation.forEach(function(f) {
        ctx.fillStyle = "rgb(200, 50, 150)";
        ctx.fillRect(f.x * 16, f.y * 16, 16, 16);
    });
  
    this.selunits.forEach(function(u) {
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth = 2;
        ctx.strokeRect(u.x*16,u.y*16,16,16);
    });
  
    //draw selector
    if (this.x1 != this.x2) {
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x1,this.y1,this.x2-this.x1,this.y2-this.y1);
    }
  
    this.units.forEach(function(u) {
        u.draw(ctx);
    });
};

var MiniMap = function(map, target) {
    this.map = map;
    this.surface = new Surface(target, map.width*2, map.height*2);
    
    this.redraw();
};

MiniMap.prototype.redraw = function() {
    this.surface.buffercontext.fillStyle = "rgb(100,100,100)";
    this.surface.buffercontext.fillRect(0,0,this.surface.width,this.surface.height);
    for (var x=0; x<this.map.width; x++) {
        for (var y=0; y<this.map.height; y++) {
            this.map.tile[x][y].draw(this.surface.buffercontext, x, y, 2, 2);
        }
    }
};

MiniMap.prototype.render = function() {
    this.surface.render();
};
