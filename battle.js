var colors = {
    "grass": "rgb(100,155,100)"
};

function create_battle(party, width, height) {
    var newbattle = {};
    
    newbattle.party = party;
    newbattle.width = width;
    newbattle.height = height;

    newbattle.tile = [];
    for (var x=0;x<width;x++) {
        newbattle.tile[x] = [];
        for (var y=0;y<newbattle.height;y++) {
            newbattle.tile[x][y] = "grass";
        }
    }
    
    newbattle.enemy = create_party("cpu", Math.floor(Math.random() * 2) + party.unit.length);
    
    newbattle.unit = [];
    party.unit.forEach(function(u) {
        newbattle.unit.push(load_unit(newbattle, u));
    });
    newbattle.enemy.unit.forEach(function(u) {
        newbattle.unit.push(load_unit(newbattle, u));
    });
    
    newbattle.proj = [];
    newbattle.disp = [];
    
    newbattle.loop = function() {
        battle_loop(newbattle);
    };
    newbattle.mouse_move = function(mx, my) {
        battle_mouse_move(newbattle, mx, my);
    };
    newbattle.draw = function(ctx) {
        battle_draw(newbattle, ctx);
    };
    
    return newbattle;
}

function battle_loop(self) {
    self.unit.filter(function(u) {
        return u.hp > 0;
    }).forEach(function(u) {
        u.update();
    });
    
    self.proj = self.proj.filter(function(p) {
        return p.life > 0;
    });
    
    self.proj.forEach(function(p) {
        p.update();
    });
    
    self.disp = self.disp.filter(function(d) {
        return d.life > 0;
    });
    
    self.disp.forEach(function(d) {
        d.update();
    });
}

function battle_mouse_move(self, x, y) {
    self.mx = Math.floor(x/10);
    self.my = Math.floor(y/10);
}

function battle_draw(self, ctx) {
    for (var x=0;x<self.width;x++) {
        for (var y=0;y<self.height;y++) {
            ctx.fillStyle = colors[self.tile[x][y]];
            ctx.fillRect(x*10,y*10,10,10);
        }
    }
    
    self.unit.forEach(function(u) {
        ctx.fillStyle = u.color;
        ctx.fillRect(u.x*10,u.y*10,10,10);
    });
    
    self.proj.forEach(function(p) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x*10,p.y*10,5,5);
    });
    
    self.disp.forEach(function(d) {
        ctx.font = d.font;
        ctx.fillStyle = d.color;
        ctx.fillText(d.text, d.x, d.y);
    });
    
    ctx.font = "32px Arial";
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText("Funds: $" + self.party.funds, 32, 32);
}

function dist(a, b) {
    var distance = 0;
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    distance = Math.sqrt(dx*dx + dy*dy);
    return distance;
}

function create_disp(text, x, y, font, color) {
    var newdisp = {};
    newdisp.text = text;
    newdisp.x = x;
    newdisp.y = y;
    newdisp.font = font;
    newdisp.color = color;
    newdisp.life = 100;
    
    newdisp.update = function() {
        newdisp.y -= 1;
        newdisp.life -= 1;
    };
    
    return newdisp;
}

function create_proj(a, b) {
    var newproj = {};
    newproj.x = a.x;
    newproj.y = a.y;
    newproj.pwr = a.pwr;
    newproj.target = b;
    newproj.life = 100;
    
    if (a.ai == "heal" && a.side == b.side) {
        newproj.color = "rgb(0,255,255)";
        newproj.pwr = -newproj.pwr;
    }
    else {
        if (a.side == "user")
            newproj.color = "rgb(255,255,0)";
        else
            newproj.color = "rgb(255,0,255)";
    }
    
    var angle = Math.atan2(b.x-a.x,b.y-a.y);
    newproj.vx = Math.sin(angle);
    newproj.vy = Math.cos(angle);
    newproj.distance = 0;
    
    newproj.update = function() {
        newproj.x += newproj.vx;
        newproj.y += newproj.vy;
        newproj.distance = dist(newproj, newproj.target);
        newproj.life -= 1;
        if (newproj.distance < 1 && newproj.target.hp > 0) {
            newproj.life = 0;
            newproj.target.hp -= newproj.pwr;
            
            if (newproj.target.side != a.side)
                newproj.target.target = a; //turn against attacker
            
            if (newproj.target.hp <= 0)
                newproj.target.die();
        }
    };
    
    return newproj;
}

function load_unit(self, unit) {
    var newunit = clone(unit);
    
    if (unit.side == "user") {
        newunit.colors = ["rgb(0,0,0)", "rgb(0,155,0)", "rgb(0,200,0)", "rgb(0,225,0)", "rgb(0,255,0)"];
        newunit.x = 0 + Math.floor(Math.random()*10);
        newunit.vx = 1;
        newunit.vy = 0;
    }
    else {
        newunit.colors = ["rgb(0,0,0)", "rgb(155,0,0)", "rgb(200,0,0)", "rgb(225,0,0)", "rgb(255,0,0)"];
        newunit.x = self.width - 1 - Math.floor(Math.random()*10);
        newunit.vx = -1;
        newunit.vy = 0;
    }
    
    newunit.color = newunit.colors[Math.floor((newunit.colors.length-1) * newunit.hp/newunit.maxhp)];
    newunit.y = Math.floor(Math.random() * self.height);
    newunit.target = null;
    
    newunit.update = function() {
        newunit.color = newunit.colors[Math.floor((newunit.colors.length-1) * newunit.hp/newunit.maxhp)];
        
        if (newunit.hp < newunit.maxhp*2/3) {
            //newunit.ai = "run";
            /*
            if (self.unit.filter(function(u) {
                return u.side == newunit.side && u.ai == "attack";
            }).length == 0) {
                newunit.ai = "attack";
            };
            */
        }
        
        if (!newunit.target) {
            newunit.target = newunit.get_target();
        }
        else {
            newunit.act();
        }
    
        newunit.move();
        
        newunit.charge += newunit.agl;
    };
    
    newunit.act = function() {
        var distance = dist(newunit, newunit.target);
        var angle = Math.atan2(newunit.target.x-newunit.x,newunit.target.y-newunit.y);
        
        if (newunit.ai == "run") {
            newunit.vx = -Math.sin(angle)/2;
            newunit.vy = -Math.cos(angle)/2;
        }
        else {
            if (distance <= newunit.range) { //stop
                newunit.vx = 0;
                newunit.vy = 0;
            }
            else { //move closer to target
                newunit.vx = Math.sin(angle)/2;
                newunit.vy = Math.cos(angle)/2;
            }
        }
        
        if (newunit.charge >= 100 && distance <= newunit.range)
            newunit.attack();
        
        if (newunit.target.hp <= 0)
            newunit.target = null;
            
        if (newunit.side == newunit.target.side && newunit.target.hp >= newunit.target.maxhp / 2) //healed target to 50%
            newunit.target = null;
    };
    
    newunit.attack = function() {
        self.proj.push(create_proj(newunit, newunit.target));
        newunit.charge = 0;
    };
    
    newunit.move = function() {
        var x = newunit.x + newunit.vx;
        var y = newunit.y + newunit.vy;
        if (x >= 0 && x < self.width-1)
            newunit.x = x;
        if (y >=0 && y < self.height-1)
            newunit.y = y;
    }
    
    newunit.get_target = function() {
        var target = null;
        var best = [];
        if (newunit.ai == "heal") {
            self.unit.filter(function(u) { //create list of injured allies
                return u.id != newunit.id && u.side == newunit.side && u.hp > 0 && u.hp < u.maxhp / 2;
            }).forEach(function(u) {
                var distance = dist(newunit, u);
                best.push({"unit":u, "distance":distance});
            });
        }
        
        if (target == null) {
            self.unit.forEach(function(u) { //create list of enemy targets
                if (newunit.side != u.side && u.hp > 0) {
                    var distance = dist(newunit, u);
                    best.push({"unit":u, "distance":distance});
                }
            });
        }
        
        if (best.length > 0) { //get closest target in list
            best.sort(function(a,b) {
                return a.distance - b.distance;
            });
            target = best[0].unit;
        }
        
        return target;
    };
    
    newunit.die = function() {
        newunit.hp = 0;
        if (newunit.side != "user") {
            self.party.funds += 10;
            self.disp.push(create_disp("$10", newunit.x*10, newunit.y*10, "24px Arial", "rgb(255,255,255)"));
        }
    };
    
    return newunit;
}
