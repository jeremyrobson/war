var Building = function(team, x, y, type) {
    this.team = team;
    this.color = (team == "player") ? new Color(0,255,255,1.0) : new Color(255,0,100,1.0);
    this.ghostcolor = this.color.edit("alpha", "0.5");
    this.x = x || randint(0,64);
    this.y = y || randint(0,64);
    this.type = type;
    this.width = buildingtypes[type].width;
    this.height = buildingtypes[type].height;
    this.units = buildingtypes[type].units || [];
    this.blocks = [];
    for (var bx=0;bx<this.width;bx++) {
        for (var by=0;by<this.height;by++) {
            this.blocks.push({"x":x+bx, "y":y+by});
        }
    }
    //this.sprite = ["a", "b", "c"][randint(0,3)];
    this.queue = [];
    this.progress = 0;
    this.hp = 0;
};

Building.prototype.loop = function(map) {
    if (this.queue.length > 0) {
        if (this.progress == 100) {
            this.queue.shift().fn.call(this, map);
            this.progress = 0;
        }
        else if (this.progress < 100)
            this.progress++;
    }
};

Building.prototype.push_unit = function(type) {
    this.queue.push({
        "type": type,
        "fn": function(map) {
            map.add_unit(new Unit(this.team, this.x, this.y));
        }
    });
};

Building.prototype.on_select = function() {
    $("#menudiv").empty();
    this.units.forEach(function(type) {
        var button = document.createElement("button");
        $(button).html(type).click(this, function(self) {
            self.data.push_unit(type);
        }).appendTo("#menudiv");
    }, this);
    $("#menudiv").css("visibility","visible");
};

Building.prototype.in_range = function(x1, y1, x2, y2) {
    return x1 >= this.x && y1 >= this.y && x2 < this.x + this.width && y2 < this.y + this.height;
};

Building.prototype.mouse_down = function(tx, ty) {
    if (this.x == tx && this.y == ty)
        return this;
};

Building.prototype.draw = function(ctx, screenx, screeny) {
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "rgba(0,0,0,1.0)";
    ctx.strokeWidth = 2;
    this.blocks.forEach(function(b) {
        var dx = (b.x - screenx) * 16;
        var dy = (b.y - screeny) * 16;
        ctx.fillRect(dx, dy, 16, 16);
        ctx.strokeRect(dx, dy, 16, 16);
    }, this);
    
    if (this.progress > 0) {
        var dx = (this.x - screenx) * 16;
        var dy = (this.y + this.height - screeny) * 16;
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(dx, dy, 100, 8);
        ctx.fillStyle = "rgba(0,255,0,0.75)";
        ctx.fillRect(dx, dy, this.progress, 8);
    }
};

Building.prototype.draw_health = function(ctx, screenx, screeny) {
    var dx = (this.x - screenx) * 16;
    var dy = (this.y - screeny) * 16;
    var ratio = this.hp / 100;
    var c = Math.floor(healthcolors.length * ratio);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(dx-8, dy-8, 32, 6);
    ctx.fillStyle = healthcolors[c];
    ctx.fillRect(dx-8, dy-8, 32 * ratio, 6);
};

Building.prototype.draw_ghost = function(ctx, mx, my, screenx, screeny, tile) {
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeWidth = 2;
    this.blocks.forEach(function(b) {
        var tx = b.x + mx + screenx;
        var ty = b.y + my + screeny;
        if (tile[tx] && tile[tx][ty]) {
            var dx = (b.x + mx) * 16;
            var dy = (b.y + my) * 16;
            ctx.fillStyle = (!tile[tx][ty].occupied) ? this.ghostcolor.toString() : "rgba(255,0,0,0.75)";   
            ctx.fillRect(dx, dy, 16, 16);
            ctx.strokeRect(dx, dy, 16, 16);
        }
    }, this);
};