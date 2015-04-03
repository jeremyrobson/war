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

var Tile = function(type, x, y) {
    this.type = type;
    this.color = tiletypes[type].color;
    this.x = x;
    this.y = y;
    this.occupied = null;
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
    
    //watch out for out of bounds
    var x1 = -radius; 
    if (x1 + tx < 0) x1 = 0;
    var x2 = x1 + radius * 2;
    var y1 = -radius;
    if (y1 + ty < 0) y1 = 0;
    var y2 = y1 + radius * 2;
    
    var flist = [];
    for (var x=x1; x<=x2; x++) {
        for (var y=y1; y<=y2; y++)
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
    this.screenx = 0;
    this.screeny = 0;
    
    this.tile = [];
    for (var x=0; x<width; x++) {
        this.tile[x] = [];
        for (var y=0; y<height; y++) {
            this.tile[x][y] = new Tile(["water", "sand", "mud", "lightgrass", "mediumgrass", "darkgrass", "lightgrass", "mediumgrass", "darkgrass"][randint(0,9)], x, y);
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

Map.prototype.loop = function(mx, my) {
    var tx = Math.floor(mx/16);
    var ty = Math.floor(my/16);
    
    if (tx < 2 && this.screenx > 0) this.screenx--;
    if (tx >= 38 && this.screenx < this.width - 40) this.screenx++;
    if (ty < 2 && this.screeny > 0) this.screeny--;
    if (ty >= 28 && this.screeny < this.height - 30) this.screeny++;
    
    this.selunits.forEach(function(u) {
        u.move();
    });
};

Map.prototype.mouse_down = function(mx, my, button) {
    var tx = Math.floor(mx/16) + this.screenx;
    var ty = Math.floor(my/16) + this.screeny;
    
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

Map.prototype.draw = function(ctx) {
  
    for (var x=0; x<40; x++) {
        for (var y=0; y<30; y++) {
            var tx = this.screenx + x;
            var ty = this.screeny + y;
            this.tile[tx][ty].draw(ctx, x, y, 16, 16);
        }
    }
  
    this.formation.forEach(function(f) {
        var dx = (f.x - this.screenx) * 16;
        var dy = (f.y - this.screeny) * 16;
        ctx.fillStyle = "rgb(200, 50, 150)";
        ctx.fillRect(dx, dy, 16, 16);
    }, this);
  
    this.selunits.forEach(function(u) {
        var dx = (u.x - this.screenx) * 16;
        var dy = (u.y - this.screeny) * 16;
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth = 2;
        ctx.strokeRect(dx, dy, 16, 16);
        u.draw_heath(ctx, this.screenx, this.screeny);
    }, this);
  
    //draw selector
    if (this.x1 != this.x2) {
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x1,this.y1,this.x2-this.x1,this.y2-this.y1);
    }
  
    this.units.forEach(function(u) {
        u.draw(ctx, this.screenx, this.screeny);
    }, this);
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
