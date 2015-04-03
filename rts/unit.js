var healthcolors = ["rgb(255,0,0)", "rgb(255,255,0)", "rgb(0,255,0)"];

var Unit = function(team, x, y) {
    this.team = team;
    this.color = (team == "player") ? "rgb(0,255,255)" : "rgb(255,0,100)";
    this.x = x || randint(0,64);
    this.y = y || randint(0,64);
    this.sprite = ["a", "b", "c"][randint(0,3)];
    this.moving = false;
    this.destx = 0;
    this.desty = 0;
    this.vx = 0;
    this.vy = 0;
    this.vel = Math.random() + 0.1;
    this.hp = randint(0, 100);
};

Unit.prototype.move = function() {
    if (this.moving) {
        var angle = Math.atan2(this.y - this.desty, this.x - this.destx);
        this.vx = -Math.cos(angle);
        this.vy = -Math.sin(angle);
        this.x += this.vx * this.vel;
        this.y += this.vy * this.vel;
        
        if (Math.abs(this.x - this.destx) < 0.5 && Math.abs(this.y - this.desty) < 0.5) {
            this.x = this.destx;
            this.y = this.desty;
            this.moving = false;
        }
    }
};

Unit.prototype.set_dest = function(tx, ty) {
    this.destx = tx;
    this.desty = ty;
};

Unit.prototype.in_range = function(x1, y1, x2, y2) {
    console.log(x1, y1, x2, y2);
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

Unit.prototype.draw_heath = function(ctx, screenx, screeny) {
    var dx = (this.x - screenx) * 16;
    var dy = (this.y - screeny) * 16;
    var ratio = this.hp / 100;
    var c = Math.floor(healthcolors.length * ratio);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(dx-8, dy-8, 32, 6);
    ctx.fillStyle = healthcolors[c];
    ctx.fillRect(dx-8, dy-8, 32 * ratio, 6);
};
