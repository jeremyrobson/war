var Game = function(minimapcontext) {
    this.map = new Map(64, 64);
    this.minimap = new MiniMap(this.map, minimapcontext);
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
