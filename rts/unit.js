var Bullet = function(shooter, target, x, y, type) {
    this.shooter = shooter;
    this.target = target;
    this.x = x;
    this.y = y;
    this.type = type;
    this.visible = true; //bullets hide when they hit and are garbage collected on an interval
};

Bullet.prototype.move = function() {
    var angle = Math.atan2(this.y - this.desty, this.x - this.destx);
    this.vx = -Math.cos(angle);
    this.vy = -Math.sin(angle);
    this.x += this.vx * this.vel;
    this.y += this.vy * this.vel;
};

var Unit = function(team, x, y) {
    this.id = randint(10000, 1000000);
    this.team = team;
    this.color = (team == "player") ? "rgb(0,255,255)" : "rgb(255,0,100)";
    this.x = x || randint(0,64);
    this.y = y || randint(0,64);
    this.sprite = ["a", "b", "c"][randint(0,3)];
    this.task = 0;
    this.destx = 0;
    this.desty = 0;
    this.vx = 0;
    this.vy = 0;
    this.vel = Math.random() * 0.5 + 0.1;
    this.target = null;
    this.hp = randint(0, 100);
    this.range = 5;
    this.proximity = 0.5;
};

Unit.prototype.set_task = function(task, target) {
    this.task = task;
    this.target = target;
    if (this.target) {
        this.destx = target.x;
        this.desty = target.y;
    }
};

//unoptimized method for finding closest target
Unit.prototype.find_target = function(map) {
    this.target = map.units.filter(function(u) {
        return u.id != this.id && u.team != this.team;
    }, this).sort(function(a, b) {
        var dx = a.x - this.destx;
        var dy = a.y - this.desty;
        var deltaA = Math.sqrt(dx*dx+dy*dy);
        dx = b.x - this.destx;
        dy = b.y - this.desty;
        var deltaB = Math.sqrt(dx*dx+dy*dy);
        return deltaA - deltaB;
    }, this)[0];
    if (this.target) //todo: is this needed?
        this.set_task("attack", this.target);
};

Unit.prototype.loop = function(map) {
    this.move();
    if (!this.task && !this.target) this.find_target(map);
};

Unit.prototype.move = function() {
    if (this.task == "move")
        this.proximity = 0.5;
    else if (this.task == "attack")
        this.proximity = this.range;
    
    //todo: change destx,desty into function that returns targetx,targety
    if (this.target) {
        this.destx = this.target.x;
        this.desty = this.target.y;
    }
    
    if (this.task) {
        var angle = Math.atan2(this.y - this.desty, this.x - this.destx);
        this.vx = -Math.cos(angle);
        this.vy = -Math.sin(angle);
        this.x += this.vx * this.vel;
        this.y += this.vy * this.vel;
        
        var dx = this.x - this.destx;
        var dy = this.y - this.desty;
        var delta = Math.sqrt(dx*dx + dy*dy); //pythagorean distance
        
        if (delta < this.proximity) {
            if (randint(0,10) == 0)
                this.set_task("move", {"x": randint(0,64), "y": randint(0,64)});
            else
                this.set_task(0);
            this.target = null;
        }
    }
};

Unit.prototype.set_dest = function(tx, ty) {
    this.destx = tx;
    this.desty = ty;
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

/*
-all units start off as base class
-they level up their abilities based on tasks they complete
-building units must gain experience building to become faster builders
-fighting units must gain experience fighting to become better fighters
-etc.
*/
