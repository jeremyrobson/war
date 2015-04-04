var FloatText = function(text, x, y, color) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.font = "bold 20px Arial";
    this.color = color || new Color(0, 255, 0, 1.0);
    this.life = 100;
};

FloatText.prototype.move = function() {
    this.life--;
    this.y -= 0.05;
    var alpha = this.life / 100;
    this.color = this.color.edit("a", alpha);
};

var Game = function(minimapcontext) {
    this.map = new Map(64, 64);
    this.minimap = new MiniMap(this.map, minimapcontext);
    
    this.map.add_building(new Building("player", 5, 5, "townhall"));
};

Game.prototype.loop = function(mx, my, pressed) {
    this.map.loop(mx, my, pressed);
};

Game.prototype.menu_click = function(callback) {
    callback(this.map);
};

Game.prototype.mouse_down = function(mx, my, button) {
    this.map.mouse_down(mx, my, button);
};

Game.prototype.mouse_up = function(mx, my, button) {
    this.map.mouse_up(mx, my, button);
};

Game.prototype.mouse_move = function(mx, my, pressed) {
    this.map.mouse_move(mx, my, pressed);
};

Game.prototype.draw = function(ctx, mx, my) {
    this.map.draw(ctx, mx, my);
    this.minimap.render();
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
    this.map.buildings.forEach(function(b) {
        this.surface.buffercontext.fillStyle = b.color;
        this.surface.buffercontext.fillRect(b.x*2,b.y*2,b.width*2,b.height*2);
    }, this);
    this.map.units.forEach(function(u) {
        this.surface.buffercontext.fillStyle = u.color;
        this.surface.buffercontext.fillRect(u.x*2,u.y*2,2,2);
    }, this);
};
