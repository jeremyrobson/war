var Bullet = function(shooter, target, type) {
    this.color = shooter.color;
    this.shooter = shooter;
    this.target = target;
    this.type = type;
    this.power = 5;
    //this.visible = true; //bullets hide when they hit and are garbage collected on an interval
    this.life = 100;
    this.destx = target.x;
    this.desty = target.y;
    this.x = shooter.x;
    this.y = shooter.y;
    this.vel = 0.5;
    var angle = Math.atan2(this.y - target.y, this.x - target.x);
    this.vx = -Math.cos(angle);
    this.vy = -Math.sin(angle);
};

Bullet.prototype.hit = function(map) {
    var dx = this.target.x - this.x;
    var dy = this.target.y - this.y;
    var delta = Math.sqrt(dx*dx+dy*dy);
    if (delta < 0.3) {
        this.target.hit(this, map);
        return false;
    }
    if (this.life <= 0) return false;
    return true;
};

Bullet.prototype.move = function(map) {
    this.x += this.vx * this.vel;
    this.y += this.vy * this.vel;
    this.life--;
    return this.hit(map);
};

Bullet.prototype.draw = function(ctx, screenx, screeny) {
    var dx = (this.x - screenx) * 16;
    var dy = (this.y - screeny) * 16 - 8;
    ctx.fillStyle = this.color;
    ctx.fillRect(dx, dy, 8, 8);
};

var Task = function(type, target, fn) {
    this.type = type;
    this.target = target;
    this.fn = fn;
    this.proximity = type == "move" ? 0.5 : 2.0;
};

var Unit = function(team, x, y) {
    this.id = randint(10000, 1000000);
    this.team = team;
    this.color = team.color;
    this.x = x || randint(0,64);
    this.y = y || randint(0,64);
    this.sprite = ["a", "b", "c"][randint(0,3)];
    this.buildings = ["base", "wall"];
    this.tasks = [];
    this.vel = Math.random() * 0.1 + 0.1;
    this.target = null;
    this.hp = randint(0, 100);
    this.range = 5;
    this.proximity = 0.5;
};

Unit.prototype.on_select = function(map) {
    $("#menudiv").empty();
    this.buildings.forEach(function(type) {
        var button = document.createElement("button");
        $(button).html(type).click(this, function(self) {
            map.selconstruct = new Building(self.data.team, 0, 0, type);
        }).appendTo("#menudiv");
    }, this);
    $("#menudiv").css("visibility","visible");
};

Unit.prototype.hit = function(bullet, map) {
    map.add_floattext(bullet.power, this.x, this.y);
};

Unit.prototype.assign_task = function(type, target, fn) {
    this.tasks.push(new Task(type, target, fn));
};

Unit.prototype.find_target = function(map) {
    var target;
    var targetlist = map.units.filter(function(u) {
        return u.id != this.id && u.team.name != this.team.name;
    }, this);
    if (targetlist.length > 0)
        target = targetlist.max(function(a) {
            var dx = a.x - this.x;
            var dy = a.y - this.y;
            var delta = Math.sqrt(dx*dx+dy*dy);
            return -delta; //negative returns min instead of max
        }, this);
    return target;
};

Unit.prototype.loop = function(map) {
    if (this.tasks.length > 0) {
        var task = this.tasks[0];
        var destx = task.target.x;
        var desty = task.target.y;
        
        var dx = this.x - destx;
        var dy = this.y - desty;
        var delta = Math.sqrt(dx*dx + dy*dy); //pythagorean distance
        
        if (delta < task.proximity) { //if unit reached destination
            if (task.fn) task.fn(this, map);
            if (this.team.name == "player")
                this.assign_task("move", {"x": randint(0,64), "y": randint(0,64)}, function(unit, map) {});
            else {
                var target = this.find_target(map);
                if (target) this.assign_task("attack", target, function(unit, map) {
                    map.add_bullet(unit, target, "power");
                });
            }
            this.tasks.shift();
        }
        else {
            var angle = Math.atan2(this.y - desty, this.x - destx);
            this.x += -Math.cos(angle) * this.vel;
            this.y += -Math.sin(angle) * this.vel;
        }
    }
};

Unit.prototype.move = function(map) {

};

Unit.prototype.in_range = function(x1, y1, x2, y2) {
    return this.x >= x1 && this.y >= y1 && this.x <= x2 && this.y <= y2;
};

Unit.prototype.mouse_down = function(tx, ty) {
    if (this.x == tx && this.y == ty)
        return this;
};

Unit.prototype.draw = function(ctx, screenx, screeny) {
    var dx = (this.x - screenx) * 16;
    var dy = (this.y - screeny) * 16 - 8;
    //ctx.fillStyle = "rgba(0,0,0,0.25)";
    //ctx.fillRect(dx, dy+18, 13, 4); //draw shadow
    draw_text(ctx, this.sprite, dx, dy, "bold 20px verdana", this.color);
};

Unit.prototype.draw_health = function(ctx, screenx, screeny) {
    var dx = (this.x - screenx) * 16;
    var dy = (this.y - screeny) * 16;
    var ratio = this.hp / 100;
    var c = Math.floor(healthcolors.length * ratio);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(dx-8, dy-8, 32, 6);
    ctx.fillStyle = healthcolors[c];
    ctx.fillRect(dx-8, dy-8, 32 * ratio, 6);
};