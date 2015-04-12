var Tile = function(type, x, y) {
    this.type = type;
    this.color = tiletypes[type].color;
    this.x = x;
    this.y = y;
    this.occupied = null;
};

Tile.prototype.draw = function(ctx, x, y, w, h) {
    ctx.fillStyle = this.color.toString();
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
    this.floattexts = [];
    
    this.tile = [];
    for (var x=0; x<width; x++) {
        this.tile[x] = [];
        for (var y=0; y<height; y++) {
            this.tile[x][y] = new Tile(["mediumgrass", "darkgrass"][randint(0,2)], x, y);
        }
    }
    
    this.buildings = [];
    this.selbuilding = null;
    this.selconstruct = null;
    
    //todo: units can't start on buildings, pathfinding, etc.
    this.units = [];
    this.selunits = [];
    this.formation = [];
    
    this.bullets = [];
};

Map.prototype.add_floattext = function(text, x, y) {
    this.floattexts.push(new FloatText(text, x, y));
};

Map.prototype.add_bullet = function(shooter, target, type) {
    this.bullets.push(new Bullet(shooter, target, bullettypes[type]));
};

Map.prototype.add_unit = function(unit) {
    this.units.push(unit);
};

Map.prototype.add_building = function(building) {
    this.buildings.push(building);
    building.blocks.forEach(function(b) {
        var tx = b.x;
        var ty = b.y;
        this.tile[tx][ty].occupied = building;
    }, this);
    if (this.selunits.length > 0) this.move_units(building.x, building.y);
    this.add_floattext("$1000", building.x, building.y);
    return true; //todo: return false if cannot add building
};

Map.prototype.select_building = function(x1, y1, x2, y2) {
    this.selbuilding = this.buildings.filter(function(b) {
        return b.in_range(x1, y1, x2, y2);
    })[0];
    if (this.selbuilding) this.selbuilding.on_select();
};

Map.prototype.select_units = function(x1, y1, x2, y2) {
    $("#menudiv").css("visibility","hidden");
    //todo: only select own units
    this.selunits = this.units.filter(function(u) {
        return u.in_range(x1, y1, x2, y2);
    });
    this.selunits.forEach(function(u) {
        u.on_select(this);
    }, this);
};

Map.prototype.move_units = function(tx, ty) {
    this.formation = create_formation(this.selunits, tx, ty);
    this.selunits.forEach(function(u, i) {
        u.assign_task("move", this.formation[i], function() { console.log("reached destination"); });
    }, this);
};

Map.prototype.assign_task = function(task, target, fn) {
    this.selunits.forEach(function(u) {
        u.assign_task("build", target, fn);
    }, this);
};

Map.prototype.loop = function(mx, my, pressed) {
    //scrolling
    var tx = Math.floor(mx/16);
    var ty = Math.floor(my/16);
    if (tx < 2 && this.screenx > 0) this.screenx--;
    if (tx >= 38 && this.screenx < this.width - 40) this.screenx++;
    if (ty < 2 && this.screeny > 0) this.screeny--;
    if (ty >= 28 && this.screeny < this.height - 30) this.screeny++;
    
    //selector
    if (pressed && !this.selconstruct) {
        this.x2 = mx + this.screenx * 16;
        this.y2 = my + this.screeny * 16;
    }
    
    this.buildings.forEach(function(b) {
        b.loop(this);
    }, this);
    
    this.units.forEach(function(u) {
        u.loop(this);
    }, this);
    
    this.bullets = this.bullets.filter(function(b) {
        return b.move(this);
    }, this);
    
    this.floattexts = this.floattexts.filter(function(ft) {
        return ft.move();
    });
};

Map.prototype.mouse_down = function(mx, my, button) {
    var tx = Math.floor(mx/16) + this.screenx;
    var ty = Math.floor(my/16) + this.screeny;
    var target = {"x":tx, "y":ty};
    
    if (this.selconstruct) {
        var buildingtype = this.selconstruct.type; //capture value before nullified
        this.assign_task("build", target, function(unit, map) {
            var building = new Building(unit.team, tx, ty, buildingtype);
            if (map.add_building(building))
                console.log("success");
            else
                console.log("fail");
        });
    }
    else {
        if (button == 1) { //left click
            this.x1 = mx + this.screenx * 16;
            this.y1 = my + this.screeny * 16;
            this.formation = [];
        }
        if (button == 3) //right click
            this.move_units(tx, ty);
    }
};

Map.prototype.mouse_up = function(mx, my, button) {
    if (button == 1 && !this.selconstruct) {
        var x1 = Math.floor(this.x1 / 16);
        var y1 = Math.floor(this.y1 / 16);
        var x2 = Math.floor(this.x2 / 16);
        var y2 = Math.floor(this.y2 / 16);
        if (x1 > x2) { var temp = x2; x2 = x1; x1 = temp; }
        if (y1 > y2) { var temp = y2; y2 = y1; y1 = temp; }
        this.select_units(x1, y1, x2, y2);
        if (this.selunits.length==0) this.select_building(x1, y1, x2, y2); else this.selbuilding = null;
    }
    this.x1 = 0; this.y1 = 0; this.x2 = 0; this.y2 = 0;
    this.selconstruct = null;
};

/*
Map.prototype.mouse_move = function(mx, my, pressed) {

};
*/

Map.prototype.draw = function(ctx, mx, my) { //todo: move mx, my to loop(mx, my)
    for (var x=0; x<40; x++) {
        for (var y=0; y<30; y++) {
            var tx = this.screenx + x;
            var ty = this.screeny + y;
            this.tile[tx][ty].draw(ctx, x, y, 16, 16);
        }
    }
  
    this.buildings.forEach(function(b) {
        b.draw(ctx, this.screenx, this.screeny);
    }, this);
  
    //draw building selection
    if (this.selbuilding) {
        var dx = (this.selbuilding.x - this.screenx) * 16;
        var dy = (this.selbuilding.y - this.screeny) * 16;
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth = 3;
        ctx.strokeRect(dx, dy, this.selbuilding.width * 16, this.selbuilding.height * 16);
        this.selbuilding.draw_health(ctx, this.screenx, this.screeny);
    }
    
    //draw formation
    this.formation.forEach(function(f) {
        var dx = (f.x - this.screenx) * 16;
        var dy = (f.y - this.screeny) * 16;
        ctx.fillStyle = "rgba(255, 255, 0, 0.75)";
        ctx.fillRect(dx, dy, 16, 16);
    }, this);
  
    //draw unit selection
    this.selunits.forEach(function(u) {
        var dx = (u.x - this.screenx) * 16;
        var dy = (u.y - this.screeny) * 16;
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth = 2;
        ctx.strokeRect(dx, dy, 16, 16);
        u.draw_health(ctx, this.screenx, this.screeny);
    }, this);
  
    //draw selector
    if (this.x1 != this.x2) {
        var x1 = this.x1 - this.screenx * 16;
        var y1 = this.y1 - this.screeny * 16;
        var x2 = this.x2 - this.x1;
        var y2 = this.y2 - this.y1;
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x1, y1, x2, y2);
    }
  
    if (this.selconstruct) {
        var dx = Math.floor(mx / 16);
        var dy = Math.floor(my / 16);
        this.selconstruct.draw_ghost(ctx, dx, dy, this.screenx, this.screeny, this.tile);
    }
  
    this.units.forEach(function(u) {
        u.draw(ctx, this.screenx, this.screeny);
    }, this);
    
    this.bullets.forEach(function(b) {
        b.draw(ctx, this.screenx, this.screeny);
    }, this);
    
    //draw foat texts
    this.floattexts.forEach(function(ft) {
        var dx = (ft.x - this.screenx) * 16;
        var dy = (ft.y - this.screeny) * 16;
        draw_text(ctx, ft.text, dx, dy, ft.font, ft.color, ft.bordercolor);
    }, this);
};