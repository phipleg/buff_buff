window.onload = function(){
    canvas = document.getElementById("big");
    canvas.width = 1024;
    canvas.height = 720;
    c = canvas.getContext("2d");
    ch2 = Math.floor(canvas.height/2);
    cw2 = Math.floor(canvas.width/2);
    state = 'init';
    run();

    window.addEventListener("keydown", function (e) {
        if (32 == e.which) {
          e.preventDefault();
        }
        transition(e.which, true);
    }, true);
    window.addEventListener("keyup", function (e) {
        if (32 == e.which) {
          e.preventDefault();
        }
        transition(e.which, false);
    }, true);
}

function transition(keyCode, keydown) {
    var prevState = state;
    var key = null;
    if (keyCode !== undefined) {
        key = keyboardMap[keyCode];
        if (!keydown) {
            key += '_UP';
        }
    }
    if ('init' === state) {
        background = new Background();
        gameconfig = new GameConfig();
        gamestart = new GameStart();
        info = new Info();
        gameready = new GameReady();
        gameover = new GameOver();
        gamepause = new GamePause();
        players = null;
        state = 'menu';
        universe = [background, gamestart];
    } else if ('menu' === state) {
        if ('SPACE' === key) {
            state = 'pre_config';
        }
    } else if ('pre_config' === state) {
        if (null == key) {
            universe = [background, gameconfig];
            state = 'config';
        }
    } else if ('config' === state) {
        if ('SPACE' === key) {
            if (gameconfig.valid) {
                state = 'pre_ready';
            }
        } else {
            if (null != key && keydown) {
                if (gameconfig.current_player == null) {
                    if (['1', '2', '3', '4', '5', '6', '7', '8'].indexOf(key) != -1) {
                        if ('right' != gameconfig.current_key) {
                            var idx = parseInt(key) -1;
                            if (gameconfig.current_player != idx) {
                                gameconfig.current_player = idx;
                                gameconfig.current_key = 'left';
                            } else {
                                gameconfig.current_player = null;
                                gameconfig.current_key = null;
                            }
                            var cfg = gameconfig.bindings[idx];
                            cfg.type = null;
                            cfg.left = null;
                            cfg.right = null;
                        }
                    } else if ('ESCAPE' === key) {
                        state = 'init';
                    }
                } else {
                    if (null != gameconfig.current_player) {
                        var cfg = gameconfig.bindings[gameconfig.current_player];
                        if ('ESCAPE' === key) {
                                gameconfig.current_player = null;
                                gameconfig.current_key = null;
                        } else if ('left' == gameconfig.current_key && gameconfig.is_key_free(key)) {
                            cfg.left = key;
                            gameconfig.current_key = 'right';
                        } else if ('right' == gameconfig.current_key && gameconfig.is_key_free(key)) {
                            cfg.right = key;
                            gameconfig.current_key = null;
                            gameconfig.current_player = null;
                            cfg.type = 'human';
                        }
                    }
                }
                gameconfig.validate();
            }
        }
    } else if ('pre_ready' === state) {
        if (null == key) {
            board = new Board();
            powerups = new PowerUps();
            players = new PlayerList(players);
            universe = [background, info, board, powerups, players, gameready];
            state = 'ready';
        }
    } else if ('ready' === state) {
        if ('SPACE' === key) {
            universe = [background, info, board, powerups, players];
            state = 'playing';
        } else if ('ESCAPE' == key) {
            state = 'pre_config';
        }
    } else if ('playing' === state) {
        if (1 >= players.count_alive()) {
            if (players.sorted()[0].score >= Math.max(players.goal, players.sorted()[1].score+2)) {
                universe = [background, info, board, powerups, players, gameover];
                state = 'game_over';
            } else {
                state = 'round_over';
            }
        }
        if ('ESCAPE' === key || 'SPACE' === key) {
            prev_universe = universe;
            universe = [background, info, board, powerups, players, gamepause];
            state = 'pause';
        } else {
            for (var i=0; i<gameconfig.bindings.length; i++) {
                var cfg = gameconfig.bindings[i];
                var pl = players.find(cfg.name);
                if (cfg.type === 'human') {
                    if (key === cfg.left) {
                        pl.to_left = true;
                    } else if (key === cfg.left + '_UP') {
                        pl.to_left = false;
                    } else if (key === cfg.right) {
                        pl.to_right = true;
                    } else if (key === cfg.right + '_UP') {
                        pl.to_right = false;
                    }
                }
            }
        }
    } else if ('pause' === state) {
        if ('ESCAPE' === key) {
            state = 'pre_config';
        } else if ('SPACE' === key) {
            universe = prev_universe;
            state = 'playing';
        }
    } else if ('game_over' === state) {
        if ('SPACE' === key || 'ESCAPE' === key) {
            powerups.terminate();
            players.terminate();
            state = 'pre_config';
        }
    } else if ('round_over' === state) {
        if ('ESCAPE' === key) {
            powerups.terminate();
            players.terminate();
            state = 'pre_config';
        } else if ('SPACE' === key) {
            powerups.terminate();
            players.terminate();
            state = 'pre_ready';
        }
    }
    if (prevState != state) {
        console.log([prevState, state]);
    }
}


function run() {
    transition();
    setInterval(function() {
        _.each(universe, function(el) { el.draw(); });
        transition();
        _.each(universe, function(el) { el.move(); });
    }, 25);
}

function Player(name, color, score){
    this.name = name;
    this.color = color;
    this.tail_color = rgba(this.color.r, this.color.g, this.color.b);
    this.score = score;
    this.alive = true;
    this.size = 3;
    this.to_left = false;
    this.to_right = false;
    this.angle = Math.random() * 2 * Math.PI;
    this.v = 2;
    this.x = (Math.random()-0.5)*(board.w-200);
    this.y = (Math.random()-0.5)*(board.h-200);
    this.x1 = this.x;
    this.y1 = this.y;
    this.distance = 0;
    this.last_track_distance = 0;
    this.has_hole = false;
    this.has_track = false;
    this.has_protection = true;
    this.transparent = 0;
    this.rectangular = 0;
    this.flipped = 0;
    this.crash_sound = new Audio("sounds/car_crash.mp3");
    this.draw = function() {
        if (false == this.alive) {
            if (this.hit_time > board.time - 200) {
                var a = 1.0 - (board.time - this.hit_time) / 200.0;
                var col = rgba(this.color.r, this.color.g, this.color.b, a);
                circle(c, this.x + cw2, this.y + ch2, 20, col);
            }
            fillCircle(c, this.x+cw2, this.y+ch2, this.size, 'yellow');
            if (this.collision_points) {
                _.each(this.collision_points, function(p) {
                    circle(c, p.x+cw2, p.y+ch2, 1, 'black');
                });
            }
            return;
        }
        var default_head_color = this.alive && this.flipped > 0 ? "blue" : "yellow";
        this.head_color = this.has_protection ? this.tail_color : default_head_color;
        if (this.rectangular >= 1) {
            c.beginPath();
            var x = this.x + cw2;
            var y = this.y + ch2;
            x += this.size*Math.cos(this.angle-0.5*Math.PI);
            y += this.size*Math.sin(this.angle-0.5*Math.PI);
            c.moveTo(x,y);
            x += this.size*Math.cos(this.angle-0.0*Math.PI);
            y += this.size*Math.sin(this.angle-0.0*Math.PI);
            c.lineTo(x,y);
            x += 2*this.size*Math.cos(this.angle+0.5*Math.PI);
            y += 2*this.size*Math.sin(this.angle+0.5*Math.PI);
            c.lineTo(x,y);
            x += 2*this.size*Math.cos(this.angle+1.0*Math.PI);
            y += 2*this.size*Math.sin(this.angle+1.0*Math.PI);
            c.lineTo(x,y);
            x += 2*this.size*Math.cos(this.angle+1.5*Math.PI);
            y += 2*this.size*Math.sin(this.angle+1.5*Math.PI);
            c.lineTo(x,y);
            c.closePath();
            if (this.transparent == 0) {
                c.fillStyle = this.head_color;
                c.fill();
            } else {
                c.lineWidth = "1";
                c.strokeStyle = this.head_color;
                c.stroke();
            }
        } else {
            if (this.transparent == 0) {
                fillCircle(c, this.x+cw2, this.y+ch2, this.size, this.head_color);
            } else {
                circle(c, this.x+cw2, this.y+ch2, this.size, this.head_color);
            }
        }
    };
    this.acceleration = function() {
        var acc = 0;
        if (this.to_left) {
            acc -= 1;
        }
        if (this.to_right) {
            acc += 1;
        }
        return acc;
    };
    this.move = function(){
        if (!this.alive) {
            return;
        }
        this.has_protection = this.distance < 200;
        var gap_factor = 3 * this.size*10 + 10;
        if (false == this.has_hole) {
            if (this.distance > this.last_track_distance + 10 * this.size) {
                this.has_hole = Math.random() > 0.97;
                if (this.has_hole) {
                    this.last_track_distance = this.distance;
                }
            }
        } else {
            if (this.distance > this.last_track_distance + 4 * this.size) {
                this.has_hole = false;
                this.last_track_distance = this.distance;
            }
        }
        this.has_track = !(this.has_hole || this.transparent > 0);
        var acc = (this.flipped ? -1 : 1) *  this.acceleration();
        var angle_delta;
        var dl = this.v;
        if (this.rectangular >= 1) {
            angle_delta = Math.PI/2;
            if (acc != 0) {
                dl = Math.max(this.v, 2* this.size);
            }
            this.to_left = false;
            this.to_right = false;
        } else {
            angle_delta = Math.PI/48;
        }
        this.distance += dl;
        this.angle += acc * angle_delta;
        var dx = Math.cos(this.angle) * dl;
        var dy = Math.sin(this.angle) * dl;
        var new_pos = board.project(this.x + dx, this.y + dy);
        var x0 = new_pos.x;
        var y0 = new_pos.y;

        var hits = this.collision_detection(x0, y0)
        if (hits.length > 0 && this.has_track && !this.has_protection) {
            this.collision_points = hits;
            this.hit_time = board.time;
            this.alive = false;
            this.crash_sound.play();
        }
        var x2 = this.x1;
        var y2 = this.y1;
        this.x1 = this.x;
        this.y1 = this.y;
        this.x = x0;
        this.y = y0;
        if (this.has_track && !this.has_protection) {
            d01 = dist(this.x, this.y, this.x1, this.y1);
            d12 = dist(this.x1, this.y1, x2, y2);
            if (d01 < 100 && d12 < 100) {
                board.add_line(x2, y2, this.x1, this.y1, this.x, this.y, 2* this.size, this.tail_color);
            } else {
                board.add_line(this.x, this.y, this.x, this.y, this.x, this.y, 2* this.size, this.tail_color);
            }
        }
    };
    this.surface_points = function(new_x, new_y) {
        var points = [];
        var radius = this.size;
        if (this.rectangular >= 1) {
            var sx = new_x;
            var sy = new_y;
            sx += radius*Math.cos(this.angle-0.5*Math.PI);
            sy += radius*Math.sin(this.angle-0.5*Math.PI);
            points.push({x: Math.floor(sx), y:Math.floor(sy)});
            sx += radius*Math.cos(this.angle-0.0*Math.PI);
            sy += radius*Math.sin(this.angle-0.0*Math.PI);
            points.push({x: Math.floor(sx), y:Math.floor(sy)});
            sx += radius*Math.cos(this.angle+0.5*Math.PI);
            sy += radius*Math.sin(this.angle+0.5*Math.PI);
            points.push({x: Math.floor(sx), y:Math.floor(sy)});
            sx += radius*Math.cos(this.angle+0.5*Math.PI);
            sy += radius*Math.sin(this.angle+0.5*Math.PI);
            points.push({x: Math.floor(sx), y:Math.floor(sy)});
            sx += radius*Math.cos(this.angle+1.0*Math.PI);
            sy += radius*Math.sin(this.angle+1.0*Math.PI);
        } else {
            for (var t=-1; t<=1; t+=0.2){
                var beta = this.angle + t* Math.PI/2 * 0.8;
                var sx = new_x + Math.cos(beta) * radius;
                var sy = new_y + Math.sin(beta) * radius;
                points.push({x: Math.floor(sx), y:Math.floor(sy)});
            }
        }
        return points;
    };
    this.collision_detection = function(x,y) {
        var points = this.surface_points(x,y);
        var pl = this;
        _.each(points, function(point) {
            powerups.pick_from(pl, point.x, point.y);
        });
        var min_age = 4 * (this.size+1) * 1.0 / this.v
        var hits = board.get_hits(points, min_age);
        return hits;
    };
    this.terminate = function() {
        this.crash_sound.pause();
    }
}

function PlayerList(prevPlayers) {
    this.list = [];
    var old_list = prevPlayers ? prevPlayers.list : [];
    this.list = [];
    for (var i=0; i<gameconfig.bindings.length; i++) {
        var cfg = gameconfig.bindings[i];
        var old_pl = _.find(old_list, function(pl) { return cfg.name === pl.name; });
        var score = old_pl ? old_pl.score : 0.0;
        if ('human' == cfg.type) {
            var pl = new Player(cfg.name, cfg.color, score);
            this.list.push(pl);
        }
    }
    this.goal = 10 * (this.list.length - 1);
    this.find = function(playerName) {
        return _.find(this.list, function(pl) { return playerName === pl.name; });
    };
    this.sorted = function() {
        var copy = this.list.slice();
        copy.sort(function(pl1, pl2) { return pl2.score - pl1.score; });
        return copy;
    };
    this.count_alive = function() {
        return _.countBy(this.list, function(pl) { return pl.alive ? 'alive': 'dead'; }).alive;
    };
    this.move = function() {
        if (state != 'playing') {
            return;
        }
        _.each(this.list, function(pl) { pl.move(); });
        var all = this.list;
        _.each(this.list, function(pl) {
            if (pl.hit_time == board.time) {
                for (var j=0; j<all.length; j++) {
                    other = all[j];
                    if (other.alive) {
                        other.score += 1;
                    }
                }
            }
        });
    };
    this.eachExcept = function(pl0, collector) {
        _.each(this.list, function(pl) {
            if (pl !== pl0) {
                collector(pl);
            }
        });
    };
    this.draw = function() {
        _.each(this.list, function(pl) { pl.draw(); });
    };
    this.terminate = function() {
        _.each(this.list, function(pl) { pl.terminate(); });
    };
}

function Board() {
    this.w = 700;
    this.h = this.w;
    this.space_canvas = document.getElementById("board");
    this.space_canvas.width = this.w;
    this.space_canvas.height = this.h;
    this.space_ctx = this.space_canvas.getContext("2d");
    this.collision_canvas = document.getElementById("collision");
    this.collision_canvas.width = this.w;
    this.collision_canvas.height = this.h;
    this.collision_ctx = this.collision_canvas.getContext("2d");
    this.border_size = 4;
    this.time = 0;
    this.endless = 0;
    this.nebula = 0;
    this.clear = function() {
        fillRect(this.space_ctx, 0, 0, this.w, this.h, 'black');
        fillRect(this.collision_ctx, 0, 0, this.w, this.h, 'black');
    };
    this.draw = function() {
        c.putImageData(this.space_ctx.getImageData(0,0,this.w,this.h),-this.w/2+cw2,-this.h/2+ch2);
        if (this.nebula >= 1) {
            fillRect(c,
                    cw2 - this.w/2,
                    ch2 - this.w/2,
                    cw2 + this.w/2,
                    ch2 + this.h/2,
                    rgba(0,0,0, 0.9 - Math.pow(0.1, this.nebula)));
        }
        rect(c,
             -this.w/2 + this.border_size/2 + cw2,
             -this.h/2 + this.border_size/2 + ch2,
             this.w - this.border_size,
             this.h - this.border_size,
             this.endless == 0 ? 'yellow' : rgba(0,0,255, 0.5 + 0.5*Math.sin(this.time/10.0)),
             this.border_size);
    };
    this.move = function(){
        if (state == 'playing') {
            this.time += 1;
        }
        rect(this.collision_ctx,
             this.border_size/2,
             this.border_size/2,
             this.w-this.border_size,
             this.h-this.border_size,
             this.endless == 0 ? rgba(0,1,255) : 'black',
             this.border_size);
    };
    this.add_line = function(x1,y1,x2,y2,x3,y3,lineWidth, strokeStyle) {
        var ctx = this.space_ctx;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.moveTo(x1+this.w/2, y1+this.h/2);
        ctx.quadraticCurveTo(x2+this.w/2,y2+this.h/2,x3+this.w/2,y3+this.h/2);
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
        ctx = this.collision_ctx;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.moveTo(x1+this.w/2, y1+this.h/2);
        ctx.quadraticCurveTo(x2+this.w/2,y2+this.h/2,x3+this.w/2,y3+this.h/2);
        var t = Math.floor(board.time / 2);
        var r = Math.floor(t / 256);
        var g = Math.floor(t % 256);
        var b = 255;
        ctx.strokeStyle = rgba(r,g,b);
        ctx.stroke();
    };
    this.add_circle = function(x,y,radius, fillStyle) {
        fillCircle(this.space_ctx, x+this.w/2, y+this.h/2, radius, fillStyle);
        fillCircle(this.collision_ctx, x+this.w/2, y+this.h/2, radius, rgba(0, 1, 255));
    };
    this.get_enclosing_box = function(points) {
        var x1=this.w; x2=0; y1=this.h; y2=0;
        var pl = this;
        _.each(points, function(point) {
            var tx = Math.floor(clip(point.x+pl.w/2, 0, pl.w));
            var ty = Math.floor(clip(point.y+pl.h/2, 0, pl.h));
            x1 = Math.min(x1, tx);
            x2 = Math.max(x2, tx);
            y1 = Math.min(y1, ty);
            y2 = Math.max(y2, ty);
        });
        return {x1: x1, y1: y1, y2: y2, width: x2-x1+1, height: y2-y1+1};
    };
    this.get_hits = function(points, min_age) {
        var box = this.get_enclosing_box(points);
        var imDat = this.collision_ctx.getImageData(box.x1, box.y1, box.width, box.height);
        hits = [];
        var pl = this;
        _.each(points, function(point) {
            var tx = Math.floor(clip(point.x+pl.w/2, 0, pl.w));
            var ty = Math.floor(clip(point.y+pl.h/2, 0, pl.h));
            var j = (tx-box.x1)+(ty-box.y1)*box.width;
            var r = imDat.data[4*j+0];
            var g = imDat.data[4*j+1];
            var b = imDat.data[4*j+2];
            var point_created = 2 * (r*256+g);
            var age = point_created != 0 ? board.time - point_created : 0.0;
            if (age > min_age) {
                hit = {x: point.x, y: point.y, age: age};
                hits.push(hit);
            }
        });
        imDat.data = null;

        return hits;
    };
    this.project = function(x, y) {
        x += this.w/2;
        y += this.h/2;
        if (this.endless >= 1) {
            x = x % this.w;
            if (x < 0) {
                x += this.w;
            }
            y = y % this.h;
            if (y < 0) {
                y += this.h;
            }
        } else {
            x = clip(x, 0, this.w);
            y = clip(y, 0, this.h);
        }
        x -= this.w/2;
        y -= this.h/2;
        return {x:x, y:y};
    };
    this.terminate = function() {
    };
}


function PowerUp(name, opts) {
    this.opts = opts;
    this.img = new Image();
    this.img.src = opts.image;
    this.sound = new Audio(opts.sound ? opts.sound : 'sounds/howl_short.mp3');
    this.owner = null;
    this.radius = 16;
    this.x = (Math.random()-0.5)*(board.w-2*this.radius);
    this.y = (Math.random()-0.5)*(board.h-2*this.radius);
    this.imageWidth = 512/this.radius;
    this.imageHeight = 346/this.radius;
    this.age = 0;
    this.max_age = 0;
    this.kind = 'neutral';
    if (name.startsWith('me_')) {
        this.kind = 'positive';
    } else if (name.startsWith('others_')) {
        this.kind = 'negative';
    }
    var defaultMaxAge = { neutral: 500, positive: 300, negative: 200};
    this.max_age = opts.maxAge ? opts.maxAge : defaultMaxAge[this.kind];
    this.draw = function(){
        if (this.owner) {
            return;
        }
        var alpha = 0.8 + 0.2*Math.sin(board.time/10.0)
        if ('neutral' === this.kind) {
            this.color = rgba(0,0,255, alpha);
        } else if ('positive' === this.kind) {
            this.color = rgba(0,255,0, alpha);
        } else if ('negative' === this.kind) {
            this.color = rgba(255, 0, 0, alpha);
        }
        fillCircle(c, this.x + cw2,this.y + ch2, this.radius, this.color);
        c.drawImage(this.img, this.x-this.imageWidth/2+cw2, this.y-this.imageHeight/2+ch2, this.imageWidth, this.imageHeight);
    };
    this.move = function(){
        if (null != this.owner && this.opts.onActive) {
            this.opts.onActive();
        }
        this.age += 1;
        this.opts.x = this.x;
        this.opts.y = this.y;
        this.finished = this.age > this.max_age;
    };
    this.upgrade = function(pl) {
        this.sound.play();
        this.owner = pl;
        this.age = 0;
        if ('me' == this.opts.scope || 'all' == this.opts.scope) {
            this.opts.onBegin(pl);
        } else if ('others' == this.opts.scope) {
            players.eachExcept(pl, this.opts.onBegin);
        }
    };
    this.release = function() {
        var pl = this.owner;
        if ('me' == this.opts.scope || 'all' == this.opts.scope) {
            this.opts.onEnd(pl);
        } else if ('others' == this.opts.scope) {
            players.eachExcept(pl, this.opts.onEnd);
        }
    };
    this.terminate = function() {
        this.sound.pause();
    }
}

function PowerUpFactory() {
    var providers = {};
    this.register = function(name, provider) {
        var opts = provider();
        var scope = opts.scope || ['me', 'others'];
        _.each(scope, function(subject) {
            var longName = subject + '_' + name;
            console.log(longName);
            providers[longName] = function() {
                var obj = provider();
                obj.scope = subject;
                return obj;
            };
        });
        return this;
    };
    this.getNames = function() {
        return Object.keys(providers);
    };
    this.create = function(name) {
        var obj = providers[name]();
        var p = new PowerUp(name, obj);
        return p;
    };
}


factory = new PowerUpFactory();

factory
.register('thicker', function() {
    return {
        scope: ['others'],
        image: 'img/font-awesome/svg/plus26.svg',
        onBegin: function(pl) { pl.size *= 2.0; },
        onEnd: function(pl) { pl.size /= 2.0; }
    };
})
.register('thinner', function() {
    return {
        scope: ['me'],
        image: 'img/font-awesome/svg/minus20.svg',
        onBegin: function(pl) { pl.size *= 0.5 },
        onEnd: function(pl) { pl.size /= 0.5; }
    };
})
.register('faster', function() {
    return {
        image: 'img/font-awesome/svg/dashboard2.svg',
        onBegin: function(pl) { pl.v *= 2.0 },
        onEnd: function(pl) { pl.v /= 2.0; }
    };
})
.register('slower', function() {
    return {
        image: 'img/font-awesome/svg/bug6.svg',
        onBegin: function(pl) { pl.v *= 0.5 },
        onEnd: function(pl) { pl.v /= 0.5; }
    };
})
.register('invisible', function() {
    return {
        scope: ['me'],
        image: 'img/font-awesome/svg/plane12.svg',
        onBegin: function(pl) { pl.transparent += 1; },
        onEnd: function(pl) { pl.transparent -= 1; }
    };
})
.register('rectangular', function() {
    return {
        image: 'img/font-awesome/svg/retweet2.svg',
        onBegin: function(pl) { pl.rectangular += 1; },
        onEnd: function(pl) { pl.rectangular -= 1; }
    };
})
.register('flipped', function() {
    return {
        scope: ['others'],
        image: 'img/font-awesome/svg/exchange1.svg',
        onBegin: function(pl) { pl.flipped += 1; },
        onEnd: function(pl) { pl.flipped -= 1; }
    };
})
.register('bomb', function() {
    return {
        scope: ['all'],
        image: 'img/font-awesome/svg/time7.svg',
        sound: 'sounds/time_bomb.mp3',
        maxAge: 110,
        onBegin: function(pl) {},
        onEnd: function(pl) {
            board.add_circle(this.x, this.y, 100, 'orange');
            board.add_circle(this.x, this.y, 80, 'red');
        }
    };
})
.register('endless_board', function() {
    return {
        scope: ['all'],
        image: 'img/font-awesome/svg/lightning14.svg',
        sound: 'sounds/forcefield.mp3',
        onBegin: function(pl) { board.endless += 1; },
        onEnd: function(pl) { board.endless -= 1; }
    };
})
.register('lights_off', function() {
    return {
        scope: ['all'],
        image: 'img/font-awesome/svg/light45.svg',
        onBegin: function(pl) { board.nebula += 1; },
        onEnd: function(pl) { board.nebula -= 1; }
    };
})
.register('clean_up', function() {
    return {
        scope: ['all'],
        image: 'img/font-awesome/svg/heart75.svg',
        onBegin: function(pl) { board.clear(); },
        onEnd: function(pl) {}
    };
})
.register('scrap_press', function() {
    return {
        scope: ['all'],
        image: 'img/font-awesome/svg/warning18.svg',
        sound: 'sounds/forcefield_002.mp3',
        onBegin: function(pl) { },
        onActive: function() { board.border_size += 0.1 },
        onEnd: function(pl) {}
    };
});


function PowerUps() {
    this.available = [];
    this.select = function(x,y, other_radius) {
        var result = [];
        if (!other_radius) {
            other_radius = 0;
        }
        _.each(this.available, function(p) {
            if (p.owner === null) {
                var d = dist(x,y,p.x,p.y) - p.radius - other_radius;
                if (d <= 0) {
                    result.push(p);
                }
            }
        });
        return result;
    };
    this.add = function() {
        var attempts = 10;
        for (i=0; i<attempts; i++) {
            var names = factory.getNames();
            var name = names[getRandomInt(names.length)];
            var p = factory.create(name);
            var overlap = this.select(p.x, p.y, p.radius);
            if (overlap.length == 0) {
                this.available.push(p);
                return;
            }
        }
    };
    this.pick_from = function(pl, x, y) {
        _.each(this.select(x,y), function(p) { p.upgrade(pl); });
    };
    this.draw = function(){
        _.each(this.available, function(p) { p.draw(); });
    };
    this.move = function(){
        if (state === 'pause') {
            _.each(this.available, function(p) {
                if (p.sound.played.length > 0) {
                    p.paused = true;
                    p.sound.pause();
                }
            });
        } else if (state === 'playing') {
            _.each(this.available, function(p) {
                if (p.paused) {
                    p.sound.play();
                    p.paused = false;
                }
            });
        }
        if (state != 'playing') {
            return;
        }
        if (Math.random() < 0.01 && this.available.length < 10) {
            this.add();
        }
        _.each(this.available, function(p) { p.move(); });
        for (var i=this.available.length-1; i>=0; i--) {
            var p = this.available[i];
            if (p.owner != null && p.finished) {
                p.release();
                this.available.splice(i,1);
            }
        }
    };
    this.terminate = function() {
        _.each(this.available, function(p) { p.terminate(); });
    }
}


function Background() {
    this.draw = function(){
        fillRect(c, 0, 0, canvas.width, canvas.height, 'black');
    };
    this.move = function(){};
    this.terminate = function(){};
}

function Info(){
    this.draw = function(){
        c.font = "30px pixelfont";
        c.textAlign = "left";
        c.fillStyle = "white";
        c.fillText("Goal " + players.goal, cw2+board.w/2+4, 32);
        c.font = "16px pixelfont";
        var sorted = players.sorted();
        for (var i=0; i<sorted.length; i++) {
            var pl = sorted[i];
            c.fillStyle = pl.tail_color;
            c.fillText(pl.name + " " + pl.score, cw2+board.w/2+4, 64+20*i);
        }
    };
    this.move = function(){};
    this.terminate = function(){};
}

function GameOver(){
    this.draw = function(){
        drawOverlay();
        h2(players.sorted()[0].name + ' wins!');
        h3("press space to play again");
    };
    this.move = function(){};
}

function GamePause(){
    this.draw = function(){
        drawOverlay();
        h2('PAUSE');
        h3('press space to continue\npress esc to restart');
    };
    this.move = function(){};
    this.terminate = function(){};
}

function GameReady(){
    this.draw = function(){
        drawOverlay();
        h2('READY?');
        h3('press space to start');
    };
    this.move = function(){};
    this.terminate = function(){};
}

function GameStart(){
    this.time = 0;
    this.draw = function(){
        for (var i=10; i<canvas.width/10; i++) {
            var x = i*10 + 10*Math.sin(0.1*this.time);
            var y = (this.time  + 0.5*canvas.height*Math.sin(10 * i) - 0.5*canvas.height) % canvas.height;
            var col = rgba(128 + 128*Math.sin(2*(this.time+i)*0.1),
                           128 + 128*Math.sin(3*(this.time+i)*0.1),
                           128+128*Math.sin(5*(this.time+i)*0.1), 0.9);
            fillRect(c, x, 0, 10+1, y, col);
            fillRect(c, x, y, 10+1, 10, 'yellow');
        }
        h1('BUFF BUFF');
        h3('press space to configure players');
        footnote('Sound by freesfx.co.uk');
    };
    this.move = function(){
        this.time += 1;
    };
    this.terminate = function(){};
}

function GameConfig(){
    this.current_player = null;
    this.current_key = null;
    this.valid = false;
    this.bindings = [
        {name: 'Fred', left: null, right: null, color: { r: 255, g: 0, b: 0}, type: null},
        {name: 'Greenly', left: null, right: null,color: { r: 124, g: 252, b: 0}, type: null},
        {name: 'Pinkney', left: null, right: null, color: { r: 255, g: 0, b: 255}, type: null},
        {name: 'Bluebell', left: null, right: null, color: { r: 0, g: 191, b: 155}, type: null},
        {name: 'Willem', left: null, right: null, color: { r: 255, g: 102, b: 0}, type: null},
        {name: 'Greydon', left: null, right: null, color: { r: 119, g: 136, b: 153}, type: null},
        {name: 'Goldy', left: null, right: null, color: { r: 218, g: 165, b: 32}, type: null},
        {name: 'Slate', left: null, right: null, color: { r: 123, g: 104, b: 238}, type: null}
        ];
    this.validate = function() {
        var humans = 0;
        for (var i=0; i< this.bindings.length; i++) {
            cfg = this.bindings[i];
            if (cfg.type == 'human') {
                humans += 1;
            }
        }
        this.valid = humans >= 2;
    };
    this.is_key_free = function(key) {
        for (var i=0; i< this.bindings.length; i++) {
            cfg = this.bindings[i];
            if (cfg.left == key || cfg.right == key) {
                return false;
            }
        }
        return true;
    };
    this.draw = function(){
        c.textAlign = "center";
        c.fillStyle = "white";
        c.font = "30px pixelfont";
        c.fillText("Choose player keys", cw2, 100);
        c.fillStyle = "white";
        c.font = "30px pixelfont";
        c.textAlign = "left";
        c.fillText("Player", cw2-250, ch2-150);
        c.fillText("Left", cw2-40, ch2-150);
        c.fillText("Right", cw2+140, ch2-150);
        c.font = "20px pixelfont";
        for (var i=0; i< this.bindings.length; i++) {
            cfg = this.bindings[i];
            var color = cfg.color;
            if (this.current_player == i) {
                if ('left' === this.current_key) {
                    fillRect(c, cw2-40, ch2-150 + 12+ (i+1)*30, 180, 4, 'white');
                } else if ('right' === this.current_key) {
                    fillRect(c, cw2-40+180, ch2-150 + 12+ (i+1)*30, 180, 4, 'white');
                }
            }
            var active = cfg.type || this.current_player == i;
            var alpha = active ? 1.0 : 0.3;
            c.fillStyle = rgba(color.r, color.g, color.b, alpha);
            c.fillText( (i+1) + " " + cfg.name, cw2-250, ch2-150 + 10 + (i+1)*30);
            c.fillStyle = rgba(color.r, color.g, color.b, active ? 1.0: 0.5);
            c.fillText(cfg.left ? cfg.left : '', cw2-40, ch2-150 + 10 + (i+1)*30);
            c.fillStyle = rgba(color.r, color.g, color.b, active ? 1: 0.5);
            c.fillText(cfg.right ? cfg.right : '', cw2+140, ch2-150 + 10 + (i+1)*30);
        }
        c.textAlign = "center";
        c.fillStyle = "white";
        c.fillText(this.valid ? "press space to play" : 'configure at least 2 players!', cw2, ch2+250)
    };
    this.move = function(){}
    this.terminate = function(){};
}

function h1(text, align, fillStyle) {
    c.textAlign = align || 'center';
    c.fillStyle = fillStyle || 'white';
    c.font = '100px pixelfont';
    c.fillText(text, cw2, ch2-50);
}

function h2(text, align, fillStyle) {
    c.textAlign = align || 'center';
    c.fillStyle = fillStyle || 'white';
    c.font = '50px pixelfont';
    c.fillText(text, cw2, ch2-25);
}

function h3(text, align, fillStyle) {
    c.textAlign = align || 'center';
    c.fillStyle = fillStyle || 'white';
    c.font = '30px pixelfont';
    var lines = text.split('\n');
    for (var i=0; i<lines.length; i++) {
        c.fillText(lines[i], cw2, ch2 + 120 + i*40);
    }
}

function footnote(text, align, fillStyle) {
    c.textAlign = align || 'center';
    c.fillStyle = fillStyle || 'white';
    c.font = '10px pixelfont';
    c.fillText(text, cw2, ch2*2 - 20);
}

function drawOverlay() {
    fillRect(c, 0, 0, canvas.width, canvas.height, rgba(0, 0, 0, 0.5));
}

function getRandomInt(n) {
    return Math.floor(Math.random() * n);
}

function clip(x, min, max) {
    return Math.max(min, Math.min(max-1,x));
}

function dist(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    return Math.sqrt(dx*dx+dy*dy);
}

function rgba(r, g, b, a) {
    if (!a) {
        a = 1.0;
    }
    return "rgba(" + Math.floor(r) + ',' + Math.floor(g) + ',' + Math.floor(b) + ',' + a + ')';
}

function fillCircle(ctx, x, y, radius, fillStyle) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2*Math.PI, false);
    ctx.fillStyle = fillStyle;
    ctx.fill();
}

function circle(ctx, x, y, radius, strokeStyle, lineWidth) {
    if (!lineWidth) {
        lineWidth = 1;
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2*Math.PI, false);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}

function fillRect(ctx, x, y, width, height, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, width, height);
}

function rect(ctx, x, y, width, height, strokeStyle, lineWidth) {
    if (!lineWidth) {
        lineWidth = 1;
    }
    ctx.beginPath();
    ctx.lineWidth=lineWidth;
    ctx.rect(x, y, width, height);
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}
