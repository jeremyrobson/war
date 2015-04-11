var FloatText = function(text, x, y, color) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.font = "bold 20px Arial";
    this.color = color || new Color(0, 255, 0, 1.0);
    this.bordercolor = new Color(0, 0, 0, 1.0);
    this.life = 100;
};

FloatText.prototype.move = function() {
    this.life--;
    this.y -= 0.05;
    var alpha = this.life / 100;
    this.color.edit("a", alpha);
    this.bordercolor.edit("a", alpha);
    return this.life > 0;
};

var Game = function() {
    this.pressed = false;
    this.map = new Map(64, 64);
    this.minimap = new MiniMap(this.map);
    
    this.map.add_building(new Building("player", 5, 5, "base"));
    this.map.add_building(new Building("cpu", 45, 45, "base"));
};

Game.prototype.loop = function(mx, my) {
    this.map.loop(mx, my, this.pressed);
};

Game.prototype.menu_click = function(callback) {
    callback(this.map);
};

Game.prototype.mouse_down = function(canvas, mx, my, button) {
    if (canvas.id == "canvas")
        this.map.mouse_down(mx, my, button);
    else if (canvas.id == "minimap")
        this.minimap.mouse_down(mx, my, button, this.map);
};

Game.prototype.mouse_up = function(canvas, mx, my, button) {
    if (canvas.id == "canvas")
        this.map.mouse_up(mx, my, button);
};

Game.prototype.mouse_move = function(canvas, mx, my, which) {
    this.pressed = which == 1;
    //if (canvas.id == "canvas")
        //this.map.mouse_move(mx, my, this.pressed);
};

Game.prototype.draw = function(ctx, mmctx, mx, my) {
    this.map.draw(ctx, mx, my);
    this.minimap.render(mmctx);
};

var MiniMap = function(map) {
    this.map = map;
    this.surface = new Surface(map.width*2, map.height*2);
    
    this.redraw();
};

MiniMap.prototype.mouse_down = function(mx, my, button, map) {
    map.screenx = mx - Math.floor(map.width / 2);
    map.screeny = my - Math.floor(map.height / 2);
    if (map.screenx < 0) map.screenx = 0;
    if (map.screeny < 0) map.screeny = 0;
    if (map.screenx + 40 > map.width) map.screenx = map.width - 40;
    if (map.screeny + 30 > map.height) map.screeny = map.height - 30;
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

MiniMap.prototype.render = function(mmctx) {
    mmctx.drawImage(this.surface.buffercanvas, 0, 0);
    this.map.buildings.forEach(function(b) {
        mmctx.fillStyle = b.color;
        mmctx.fillRect(b.x*2,b.y*2,b.width*2,b.height*2);
    }, this);
    this.map.units.forEach(function(u) {
        mmctx.fillStyle = u.color;
        mmctx.fillRect(u.x*2,u.y*2,2,2);
    }, this);
};