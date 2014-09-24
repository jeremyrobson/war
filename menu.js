function rect(x,y,w,h) {
    var r = {"x":x,"y":y,"w":w,"h":h};
    r.hit = function(mx,my) {
        return mx>=r.x && my>=r.y && mx<r.x+r.w && my<r.y+r.h;
    };
    return r;
}

function draw_text(ctx, text, x, y, font, color) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function draw_rect(ctx, rect, color, border, shadow) {
    ctx.strokeStyle = "rgb(255,255,255)";
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

function create_grid(ctx, x, y, fn) {
    var grid = {};
    grid.rect = rect(x, y, 0, 24);
    grid.fontsize = 24;
    grid.font = "24px Arial";
    grid.mat = [];
    grid.index = -1;
    grid.fn = fn;
    
    grid.add_row = function(arr) {
        var x = grid.mat.length;
        grid.mat[x] = arr;
        grid.rect.w = (grid.mat[0].length-1) * 100;
        grid.rect.h = grid.mat.length * grid.fontsize;
    };
    
    grid.mouse_down = function(mx, my) {
        grid.index = Math.floor((my-grid.rect.y) / grid.fontsize) - 1;
        grid.fn(grid);
    };
    
    grid.draw = function(ctx) {
        var width = grid.mat.length;
        var height = grid.mat[0].length;
        
        for (var x=0;x<width;x++) {
            for (var y=0;y<height;y++) {
                var text;
                if (typeof grid.mat[x][y] == "function")
                    text = grid.mat[x][y]();
                else
                    text = grid.mat[x][y];
                
                var dx = grid.rect.x + y*100;
                var dy = grid.rect.y + x*grid.fontsize;
                draw_text(ctx, text, dx, dy, grid.font, "rgb(255,255,255)");
            }
        }
        
        if (grid.index >= 0) {
            ctx.fillStyle = "rgba(255,255,0,0.5)";
            var dy = grid.rect.y + (grid.index+1) * grid.fontsize;
            ctx.fillRect(0, dy, 640, 24);
        }
    };
    
    return grid;
}

function create_button(ctx, text, x, y, fn) {
    var newbutton = {};
    newbutton.font = "24px Arial";
    ctx.font = newbutton.font;
    newbutton.rect = rect(x, y, ctx.measureText(text).width, 32);
    newbutton.text = text;
    newbutton.x = x;
    newbutton.y = y;
    newbutton.color = "rgb(55,80,200)";
    newbutton.fn = fn;
    
    newbutton.mouse_down = function(mx, my) {
        return newbutton.fn();
    };
    
    newbutton.draw = function(ctx) {
        draw_rect(ctx, newbutton.rect, newbutton.color);
        draw_text(ctx, newbutton.text, x, y, newbutton.font, "rgb(255,255,255)");
    };
    
    return newbutton;
}

function create_menu(ctx, party) {
    var newmenu = {};
    newmenu.selunit = 0;
    newmenu.children = [];
    
    var fn = function(grid) {
        newmenu.selunit = party.unit[grid.index];
    };
    var grid = create_grid(ctx, 10, 10, fn);
    grid.add_row(["NAME","HP","PWR","DEF","AGL","RANGE"]);
    party.unit.forEach(function(u) {
        grid.add_row([
            function() { return u.id; },
            function() { return u.hp + "/" + u.maxhp; },
            function() { return u.pwr; },
            function() { return u.def; },
            function() { return u.agl; },
            function() { return u.range; }
        ]);
    });
    newmenu.children.push(grid);
    
    newmenu.children.push(create_button(ctx, "Buy Unit", 100, 400, function() {
        var u = create_unit(party.side);
        party.unit.push(u);
        grid.add_row([
            function() { return u.id; },
            function() { return u.hp + "/" + u.maxhp; },
            function() { return u.pwr; },
            function() { return u.def; },
            function() { return u.agl; },
            function() { return u.range; }
        ]);
    }));

    newmenu.children.push(create_button(ctx, "To battle!", 500, 400, function() {
        return function(game) {
            game.mode = create_battle(ctx, party, 64, 48);
        };
    }));
    
    newmenu.children.push(create_button(ctx, "Upgrade PWR", 240, 400, function() {
        if (newmenu.selunit && party.funds >= 10) {
            newmenu.selunit.pwr += 1;
            party.funds -= 10;
        }
    }));
    
    newmenu.loop = function() {
    
    };
    
    newmenu.mouse_move = function(mx, my) {
    
    };
    
    newmenu.mouse_down = function(mx, my) {
        var fn;
        newmenu.children.forEach(function(c) {
            if (c.rect.hit(mx, my))
                fn = c.mouse_down(mx, my);
        });
        
        if (typeof fn == "function")
            return fn;
    };
    
    newmenu.draw = function(ctx) {
        ctx.fillStyle = "rgb(55,55,155)";
        ctx.fillRect(0,0,640,480);
        
        newmenu.children.forEach(function(c) {
            c.draw(ctx);
        });
        
        draw_text(ctx, "Funds: $" + party.funds, 32, 440, "32px Arial", "rgb(255,255,255)");
    };
    
    return newmenu;
}
