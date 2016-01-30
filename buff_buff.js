window.onload = function(){
    canvas = document.getElementById("big");
    canvas.width = window.innerWidth * 0.9;
    canvas.width = 800;
    canvas.height = window.innerHeight * 0.85;
    canvas.height = 600;
    c = canvas.getContext("2d");
    ch2 = Math.floor(canvas.height/2);
    cw2 = Math.floor(canvas.width/2);
    state = 'init';
    transition('');
    run();

    window.addEventListener("keydown", on_keydown, true);
    window.addEventListener("keyup", on_keyup, true);
}


function transition(input) {
    // console.log({'state': state, 'input': input});
    if ('init' === state) {
        if ('' === input) {
            background = new Background();
            board = new Board();
            player = new Player();
            info = new Info();
            powerups = new PowerUps();
            gamestart = new GameStart();
            gameready = new GameReady();
            gameover = new GameOver();
            gamepause = new GamePause();
            state = 'menu';
            universe = [gamestart, background];
        }
    } else if ('menu' === state) {
        if ('enter' === input || 'space' === input) {
            state = 'ready';
            universe = [gameready, player, powerups, board, info, background];
        }
    } else if ('ready' === state) {
        if ('enter' === input || 'space' === input) {
            state = 'playing';
            universe = [player, powerups, board, info, background];
        }
    } else if ('playing' === state) {
        if ('step' === input) {
            if (!player.alive) {
                state = 'game_over';
                universe = [gameover, player, powerups, board, info, background];
            }
        } else if ('esc' === input || 'enter' === input || 'space' === input) {
            state = 'pause';
            prev_universe = universe;
            universe = [gamepause, player, powerups, board, info, background];
        } else if ('left' === input) {
            player.left_pressed = true;
        } else if ('right' === input) {
            player.right_pressed = true;
        } else if ('up' === input) {
            player.up_pressed = true;
        } else if ('down' === input) {
            player.down_pressed = true;
        }
    } else if ('pause' === state) {
        if ('esc' === input) {
            state = 'init';
            transition('');
        } else if ('enter' === input || 'space' === input) {
            state = 'playing';
            universe = prev_universe;
        }
    } else if ('game_over' === state) {
        if ('enter' == input || 'space' == input) {
            state = 'init';
            transition('');
        }
    }

}

key_to_input = {
    37: 'left',
    39: 'right',
    81: 'up',
    87: 'down',
    13: 'enter',
    32: 'space',
    27: 'esc'
};

function on_keydown(e) {
    var key = e.which;
    input = key_to_input[key];
    if (null != input) {
        transition(input);
    } else {
        console.log({'keydown': key});
    }
}

function on_keyup(e) {
    var key = e.which;
    if (37 == key) { // left
        player.left_pressed = false;
    } else if (39 == key) { // right
        player.right_pressed = false;
    } else if (81 == key) { // q
        player.up_pressed = false;
    } else if (87 == key) { // w
        player.down_pressed = false;
    }
}


function run() {
    setInterval(function() {
        for (var i = universe.length-1; i >= 0; i--) {
            object = universe[i];
            if (state === 'playing') {
                object.move();
            }
            object.draw();
        }
        transition('step');
    }, 25);
}

function Player(){
    this.left_pressed = false;
    this.right_pressed = false;
    this.up_pressed = false;
    this.down_pressed = false;
    this.name = "Player";
    this.strokeStyle = "rgba(255,0,0,1.0)";
    this.alive = true;
    this.score = 0;
    this.size = 20;
    this.angle_delta = 0.0;
    this.angle = Math.random() * 2 * Math.PI;
    this.v = 2;
    this.x = (Math.random()-0.5)*(board.w-32);
    this.y = (Math.random()-0.5)*(board.h-32);
    this.angle = 0;
    this.x = 0;
    this.y = 0;
    this.x1 = this.x;
    this.y1 = this.y;
    this.has_hole = false;
    this.has_track = false;
    this.transparent = 0;
    this.rectangular = 0;
    this.draw = function(){
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
            x += this.size*Math.cos(this.angle+1.0*Math.PI);
            y += this.size*Math.sin(this.angle+1.0*Math.PI);
            c.lineTo(x,y);
            c.closePath();
            if (this.has_track) {
                c.fillStyle = "yellow";
                c.fill();
            } else {
                c.strokeStyle = "yellow";
                c.stroke();
            }
        } else {
            c.beginPath();
            c.arc(this.x+cw2, this.y+ch2, this.size, this.angle - 0.5*Math.PI, this.angle + 0.5*Math.PI, false);
            if (this.has_track) {
                c.fillStyle = "yellow";
                c.fill();
            } else {
                c.lineTo(this.x+cw2 + this.size*Math.cos(this.angle-0.5*Math.PI), this.y+ch2+this.size*Math.sin(this.angle-0.5*Math.PI));
                c.strokeStyle = "yellow";
                c.stroke();
            }
        }
    }
    this.move = function(){
        if (!this.alive) {
            return;
        }
        this.has_hole = board.time % 100 >= 80;
        this.has_track = !(this.has_hole || this.transparent > 0);
        var dsize = this.up_pressed ? 1.1 : (this.down_pressed ? 0.9 : 1);
        this.size = this.size * dsize;
        var direction = this.left_pressed ? -1 : (this.right_pressed ? 1 : 0);
        var prev_angle = this.angle;
        if (this.rectangular >= 1) {
            this.angle_delta = Math.PI/2;
        } else {
            this.angle_delta = Math.PI/16;
        }
        var da = direction * this.angle_delta;
        this.angle += da;
        if (Math.abs(da) >= Math.PI/4) {
            this.left_pressed = false;
            this.right_pressed = false;
        }
        var dl = Math.abs(Math.sin(da)) * (this.size+1);
        if (dl < this.v) {
            dl = this.v;
        }
        var dx = Math.cos(this.angle) * dl;
        var dy = Math.sin(this.angle) * dl;
        var x0 = clip(this.x + dx, -board.w/2, board.w/2);
        var y0 = clip(this.y + dy, -board.h/2, board.h/2);
        var hit = this.collision_detection(x0, y0);
        if (this.has_track) {
            if (hit) {
                this.alive = false;
            }
            board.add_line(this.x1, this.y1, this.x, this.y, x0, y0, 2* this.size, this.strokeStyle);
        }
        this.x1 = this.x;
        this.y1 = this.y;
        this.x = x0;
        this.y = y0;
    };
    this.collision_detection = function(new_x,new_y) {
        var dist = this.size;
        var points = [];
        if (this.rectangular >= 1) {
            var sx = new_x;
            var sy = new_y;
            sx += this.size*Math.cos(this.angle-0.5*Math.PI);
            sy += this.size*Math.sin(this.angle-0.5*Math.PI);
            points.push(Math.floor(sx));
            points.push(Math.floor(sy));
            sx += this.size*Math.cos(this.angle-0.0*Math.PI);
            sy += this.size*Math.sin(this.angle-0.0*Math.PI);
            points.push(Math.floor(sx));
            points.push(Math.floor(sy));
            sx += this.size*Math.cos(this.angle+0.5*Math.PI);
            sy += this.size*Math.sin(this.angle+0.5*Math.PI);
            points.push(Math.floor(sx));
            points.push(Math.floor(sy));
            sx += this.size*Math.cos(this.angle+0.5*Math.PI);
            sy += this.size*Math.sin(this.angle+0.5*Math.PI);
            points.push(Math.floor(sx));
            points.push(Math.floor(sy));
            sx += this.size*Math.cos(this.angle+1.0*Math.PI);
            sy += this.size*Math.sin(this.angle+1.0*Math.PI);
        } else {
            for (var t=-1; t<=1; t+=0.2){
                var beta = this.angle + t* Math.PI/2 * 0.8;
                var sx = new_x + Math.cos(beta) * dist;
                var sy = new_y + Math.sin(beta) * dist;
                points.push(Math.floor(sx));
                points.push(Math.floor(sy));
            }
        }
        for (var i=0; i<points.length-1; i+=2) {
            powerups.pick_from(this, points[i], points[i+1]);
        }
        return !board.is_empty_at(points);
    };
}

function Board() {
    this.space_canvas = document.getElementById("board");
    this.w = 600;
    this.h = this.w;
    this.space_canvas.width = this.w;
    this.space_canvas.height = this.h;
    this.time = 0;
    this.space_ctx = this.space_canvas.getContext("2d");
    this.draw = function() {
        var ctx = this.space_ctx;
        var imDat = ctx.getImageData(0,0,this.w,this.h);
        c.putImageData(imDat,-this.w/2+cw2,-this.h/2+ch2);
    };
    this.move = function(){
        this.time += 1;
        this.add_border();
    };
    this.add_border = function() {
        var ctx = this.space_ctx;
        ctx.beginPath();
        ctx.lineWidth="4";
        ctx.strokeStyle="yellow";
        ctx.rect(0, 0, this.w, this.h);
        ctx.stroke();
    };
    this.add_line = function(x1,y1,x2,y2,x3,y3,lineWidth, strokeStyle) {
        var ctx = this.space_ctx;
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.moveTo(x1+this.w/2, y1+this.h/2);
        //ctx.lineTo(x2+this.w/2, y2+this.h/2);
        ctx.quadraticCurveTo(x2+this.w/2,y2+this.h/2,x3+this.w/2,y3+this.h/2);
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    };
    this.clear = function() {
        var ctx = this.space_ctx;
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,this.w,this.h);
    }
    this.is_empty_at = function(points) {
        var x1=board.w; x2=0; y1=board.h; y2=0;
        for (var i=0; i<points.length-1; i+=2) {
            var x = points[i];
            var y = points[i+1];
            var tx = Math.floor(clip(x+this.w/2, 0, this.w));
            var ty = Math.floor(clip(y+this.h/2, 0, this.h));
            x1 = Math.min(x1, tx);
            x2 = Math.max(x2, tx);
            y1 = Math.min(y1, ty);
            y2 = Math.max(y2, ty);
        }
        var ctx = this.space_ctx;
        var w = x2-x1+1;
        var h = y2-y1+1;
        var imDat = ctx.getImageData(x1,y1,w,h);
        hits = [];
        for (var i=0; i<points.length-1; i+=2) {
            var x = points[i];
            var y = points[i+1];
            var tx = Math.floor(clip(x+this.w/2, 0, this.w));
            var ty = Math.floor(clip(y+this.h/2, 0, this.h));
            var j = (tx-x1)+(ty-y1)*w;
            var r = imDat.data[4*j+0];
            var g = imDat.data[4*j+1];
            var b = imDat.data[4*j+2];
            if (r+g+b>0) {
                hits.push([x,y,r,g,b]);
            }
        }
        imDat.data = null;
        if (false && hits.length > 0) {
            for (var i=0; i<hits.length; i++) {
                var x = hits[i][0];
                var y = hits[i][1];
                var tx = Math.floor(clip(x+this.w/2, 0, this.w));
                var ty = Math.floor(clip(y+this.h/2, 0, this.h));
                //ctx.strokeStyle = "rgb(0,255,0)";
                //ctx.rect(tx,ty,0.2,0.2);
                //ctx.stroke();
            }
        }
        return hits.length == 0;
    };
}

function PowerUps() {
    this.available = [];
    this.taken = [];
    this.usage = {};
    this.add = function() {
        var attempts = 10;
        for (i=0; i<attempts; i++) {
            var p;
            var rnd = getRandomInt(7);
            switch(rnd) {
                case 0: p = new PowerUpFaster(); break;
                case 1: p = new PowerUpSlower(); break;
                case 2: p = new PowerUpThicker(); break;
                case 3: p = new PowerUpThinner(); break;
                case 4: p = new PowerUpClear(); break;
                case 5: p = new PowerUpFlight(); break;
                case 6: p = new PowerUpRect(); break;
            }
            p.x = (Math.random()-0.5)*(board.w-2*p.radius);
            p.y = (Math.random()-0.5)*(board.h-2*p.radius);
            var overlap = this.select(p.x, p.y, p.radius);
            if (overlap.length == 0) {
                this.available.push(p);
                return;
            }
        }
    };
    this.select = function(x,y, other_radius) {
        var result = [];
        if (!other_radius) {
            other_radius = 0;
        }
        for (var i=this.available.length-1; i>=0; i--) {
            var p = this.available[i];
            var dx = x - p.x;
            var dy = y - p.y;
            var dist = Math.sqrt(dx*dx+dy*dy) - p.radius - other_radius;
            if (dist <= 0) {
                result.push(p);
            }
        }
        return result;
    };
    this.pick_from = function(pl, x, y) {
        var result = this.select(x,y);
        for (var i=result.length-1; i>=0; i--) {
            var p = result[i];
            this.taken.push(p);
            this.available.splice(this.available.indexOf(p),1);
            p.age = 0;
            p.upgrade(pl);
            this.usage[p] = pl;
        }
    };
    this.draw = function(){
        for (var i=0; i<this.available.length; i++) {
            this.available[i].draw();
        }
    };
    this.move = function(){
        var x = this.available.length;
        if (Math.random() < 1.0/(10. + (x+2)*(x+2))) {
            this.add();
        }
        for (var i=0; i<this.available.length; i++) {
            this.available[i].move();
        }
        for (var i=this.taken.length-1; i>=0; i--) {
            var p = this.taken[i];
            p.move();
            if (p.finished()) {
                var pl = this.usage[p];
                p.release(pl);
                this.taken.splice(i,1);
            }
        }
    };
}

function PowerUpBase() {
    this.img = new Image();
    this.x = 0;
    this.y = 0;
    this.radius = 16;
    this.age = Number.MIN_VALUE;
    this.benevolent = true;
    this.draw = function(){
        c.beginPath();
        c.arc(this.x + cw2,this.y + ch2, this.radius, 0, 2*Math.PI);
        c.fillStyle = this.benevolent ? "green" : "red";
        c.fill();
        var r = 16.0;
        var w = 512/r;
        var h = 346/r;
        c.drawImage(this.img, this.x-w/2+cw2, this.y-h/2+ch2, w, h);
    };
    this.finished = function() {
        var max_age = 500;
        return this.age > max_age;
    };
    this.move = function(){
        this.age += 1;
    };
}

PowerUpThicker.prototype = new PowerUpBase();
PowerUpThicker.prototype.constructor = PowerUpThicker;
function PowerUpThicker() {
    this.img.src = "img/font-awesome/svg/circular56.svg";
    this.benevolent = true;
    this.upgrade = function(pl) {
        pl.size *= 2.0;
    };
    this.release = function(pl) {
        pl.size /= 2.0;
    };
}

PowerUpThinner.prototype = new PowerUpBase();
PowerUpThinner.prototype.constructor = PowerUpSlower;
function PowerUpThinner() {
    this.img.src = "img/font-awesome/svg/adjust4.svg";
    this.benevolent = true;
    this.upgrade = function(pl) {
        pl.size *= 0.5;
    };
    this.release = function(pl) {
        pl.size /= 0.5;
    };
}

PowerUpFaster.prototype = new PowerUpBase();
PowerUpFaster.prototype.constructor = PowerUpFaster;
function PowerUpFaster() {
    this.img.src = "img/font-awesome/svg/lightning14.svg";
    this.benevolent = true;
    this.upgrade = function(pl) {
        pl.v *= 2.0;
    };
    this.release = function(pl) {
        pl.v /= 2.0;
    };
}

PowerUpSlower.prototype = new PowerUpBase();
PowerUpSlower.prototype.constructor = PowerUpSlower;
function PowerUpSlower() {
    this.img.src = "img/font-awesome/svg/bug6.svg";
    this.benevolent = true;
    this.upgrade = function(pl) {
        pl.v *= 0.5;
    };
    this.release = function(pl) {
        pl.v /= 0.5;
    };
}

PowerUpClear.prototype = new PowerUpBase();
PowerUpClear.prototype.constructor = PowerUpClear;
function PowerUpClear() {
    this.img.src = "img/font-awesome/svg/heart75.svg";
    this.benevolent = true;
    this.upgrade = function(pl) {
        board.clear();
    };
    this.release = function(pl) {
    };
}

PowerUpFlight.prototype = new PowerUpBase();
PowerUpFlight.prototype.constructor = PowerUpFlight;
function PowerUpFlight() {
    this.img.src = "img/font-awesome/svg/plane12.svg";
    this.benevolent = true;
    this.upgrade = function(pl) {
        pl.transparent += 1;
    };
    this.release = function(pl) {
        pl.transparent -= 1;
    };
}

PowerUpRect.prototype = new PowerUpBase();
PowerUpRect.prototype.constructor = PowerUpRect;
function PowerUpRect() {
    this.img.src = "img/font-awesome/svg/retweet2.svg";
    this.benevolent = true;
    this.upgrade = function(pl) {
        pl.rectangular += 1;
    };
    this.release = function(pl) {
        pl.rectangular -= 1;
    };
}

function Background() {
    this.draw = function(){
        c.fillStyle = "black";
        c.fillRect(0, 0, canvas.width,canvas.height);
    };
    this.move = function(){};
}


function Info(){
    this.draw = function(){
        c.fillStyle = player.alive ? "white" : "grey";
        c.font = "16px pixelfont";
        c.textAlign = "left";
        c.fillText("Score: " + player.score, cw2+board.w/2+4, 32);
        c.fillText("Time: " + board.time, cw2+board.w/2+4, 64);
    };
    this.move = function(){}
}

function GameOver(){
    this.draw = function(){
        c.textAlign = "center";
        c.fillStyle = "white";
        c.font = "50px pixelfont";
        c.fillText("GAME OVER", cw2, ch2);
        c.font = "30px pixelfont";
        c.fillText("press space to play again", cw2, ch2+130)
    };
    this.move = function(){};
}

function GamePause(){
    this.draw = function(){
        c.textAlign = "center";
        c.fillStyle = "white";
        c.font = "50px pixelfont";
        c.fillText("PAUSE", cw2, ch2);
        c.font = "30px pixelfont";
        c.fillText("press space to continue", cw2, ch2+130)
        c.fillText("press esc to restart", cw2, ch2+160)
    };
    this.move = function(){};
}

function GameReady(){
    this.draw = function(){
        c.textAlign = "center";
        c.fillStyle = "white";
        c.font = "30px pixelfont";
        c.fillText("ready?", cw2, ch2-30)
        c.fillText("press space to start", cw2, ch2)
    };
    this.move = function(){};
}

function GameStart(){
    this.draw = function(){
        c.textAlign = "center";
        c.fillStyle = "white";
        c.font = "100px pixelfont";
        c.fillText("BUFF BUFF", cw2, ch2);
        c.font = "30px pixelfont";
        c.fillText("press space to play", cw2, ch2+130)
    };
    this.move = function(){}
}

function getRandomInt(n) {
    return Math.floor(Math.random() * n);
}

function clip(x, min, max) {
    return Math.max(min, Math.min(max-1,x));
}
