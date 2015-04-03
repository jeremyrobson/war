var Game = function(minimapcontext) {
    this.map = new Map(64, 64);
    this.minimap = new MiniMap(this.map, minimapcontext);
};

Game.prototype.loop = function() {
    this.map.loop();
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

Game.prototype.draw = function(ctx) {
    this.map.draw(ctx);
    this.minimap.render();
};
