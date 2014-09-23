function rect(x,y,w,h) {
    return {"x":x,"y":y,"w":w,"h":h,"hit":function(mx,my) { return mx>=x && my>=y && mx<x+w && my<y+h; }};
}

function draw_text(ctx, text, x, y, font, color) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function draw_rect(ctx, rect, color, border, shadow) {

}

function create_grid(x, y) {

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
    
    newbutton.mouse_down = function() {
        return fn();
    };
    
    newbutton.draw = function(ctx) {
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.lineWidth = 2;
        ctx.strokeRect(newbutton.rect.x, newbutton.rect.y, newbutton.rect.w, newbutton.rect.h);
        ctx.fillStyle = newbutton.color;
        ctx.fillRect(newbutton.rect.x, newbutton.rect.y, newbutton.rect.w, newbutton.rect.h);
        draw_text(ctx, newbutton.text, x, y, newbutton.font, "rgb(255,255,255)");
    };
    
    return newbutton;
}

function create_menu(ctx, party) {
    var newmenu = {};
    newmenu.selunit = 0;
    newmenu.buttons = [];
    
    newmenu.buttons.push(create_button(ctx, "Buy Unit", 100, 400, function() {
        party.unit.push(create_unit(party.side));
        return 1;
    }));

    newmenu.buttons.push(create_button(ctx, "To battle!", 500, 400, function() {
        //return function(mode) {
            mode = create_battle(party, 64, 48);
        //};
        return 1;
    }));
    
    newmenu.buttons.push(create_button(ctx, "Upgrade PWR", 240, 400, function() {
        if (newmenu.selunit)
            newmenu.selunit.pwr += 1;
        return 1;
    }));
    
    newmenu.loop = function() {
    
    };
    
    newmenu.mouse_move = function(mx, my) {
    
    };
    
    newmenu.mouse_down = function(mx, my) {
        var fn;
        newmenu.buttons.forEach(function(b) {
            if (b.rect.hit(mx, my))
                fn = b.mouse_down();
        });
        console.log(fn);
        if (fn) return fn;
        
        newmenu.index = Math.floor((my-32) / 24);
        newmenu.selunit = party.unit[newmenu.index];
    };
    
    newmenu.draw = function(ctx) {
        ctx.fillStyle = "rgb(55,55,155)";
        ctx.fillRect(0,0,640,480);
        
        draw_text(ctx, "Name", 0, 0, "24px Arial", "rgb(255,255,255)");
        draw_text(ctx, "HP", 120, 0, "24px Arial", "rgb(255,255,255)");
        draw_text(ctx, "PWR", 240, 0, "24px Arial", "rgb(255,255,255)");
        draw_text(ctx, "DEF", 320, 0, "24px Arial", "rgb(255,255,255)");
        draw_text(ctx, "AGL", 400, 0, "24px Arial", "rgb(255,255,255)");
        draw_text(ctx, "RANGE", 480, 0, "24px Arial", "rgb(255,255,255)");
        
        var x;
        party.unit.forEach(function(u, i) {
            x = 0;
            draw_text(ctx, u.id, x, i*24 + 32, "24px Arial", "rgb(255,255,255)");
            x = 120;
            draw_text(ctx, u.hp + "/" + u.maxhp, x, i*24+32, "24px Arial", "rgb(255,255,255)");
            x = 240;
            draw_text(ctx, u.pwr, x, i*24+32, "24px Arial", "rgb(255,255,255)");
            x = 320;
            draw_text(ctx, u.def, x, i*24+32, "24px Arial", "rgb(255,255,255)");
            x = 400;
            draw_text(ctx, u.agl, x, i*24+32, "24px Arial", "rgb(255,255,255)");
            x = 480;
            draw_text(ctx, u.range, x, i*24+32, "24px Arial", "rgb(255,255,255)");
        });
        
        if (newmenu.selunit) {
            ctx.fillStyle = "rgba(255,255,0,0.5)";
            ctx.fillRect(0, newmenu.index * 24 + 32, 640, 24);
        }
        
        newmenu.buttons.forEach(function(b) {
            b.draw(ctx);
        });
    };
    
    return newmenu;
}

