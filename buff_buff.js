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
}

window.addEventListener("keydown", on_keydown, true);
window.addEventListener("keyup", on_keyup, true);

function transition(input) {
    // console.log({'state': state, 'input': input});
    if ('init' === state) {
        if ('' == input) {
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
    this.color = "red";
    this.alive = true;
    this.score = 0;
    this.size = 2;
    this.angle_delta = 1.0/64;
    this.angle = Math.random() * 2 * Math.PI;
    this.v = 1;
    this.x = (Math.random()-0.5)*(board.w-32);
    this.y = (Math.random()-0.5)*(board.h-32);
    this.prev_x = this.x;
    this.prev_y = this.y;
    this.is_transparent = false;
    this.draw = function(){
        c.beginPath();
        c.arc(this.x+cw2, this.y+ch2, this.size, this.angle - 0.5*Math.PI, this.angle + 0.5*Math.PI, false);
        c.fillStyle = "yellow";
        c.fill();
    }
    this.move = function(){
        if (!this.alive) {
            return;
        }
        var dsize = this.up_pressed ? 1.1 : (this.down_pressed ? 0.9 : 1);
        this.size = this.size * dsize;
        var dangle = this.left_pressed ? -1 : (this.right_pressed ? 1 : 0);
        this.angle += dangle * this.angle_delta * 2.0 * Math.PI;
        var s = dangle != 0 ? this.v * Math.sqrt(this.size) : this.v;
        var vx = Math.cos(this.angle) * s; var vy = Math.sin(this.angle) * s;
        var new_x = this.x + vx;
        var new_y = this.y + vy;
        this.collision_detection(new_x, new_y);
        if (!this.alive) {
            return;
        }
        if (board.time % 100 >= 80 ) {
            this.is_transparent = true;
        } else {
            this.is_transparent = false;
        }
        if (!this.is_transparent) {
            board.add_line(this.prev_x, this.prev_y, this.x, this.y, new_x, new_y, 2* this.size);
        }
        this.prev_x = this.x;
        this.prev_y = this.y;
        this.x = new_x;
        this.y = new_y;
    };
    this.collision_detection = function(new_x,new_y) {
        var dist = this.size+1;
        for (var t=-1; t<=1; t+=1){
            var beta = this.angle + t * Math.PI/2 * 0.8;
            var sx = new_x + Math.cos(beta) * dist;
            var sy = new_y + Math.sin(beta) * dist;
            var hit = !board.is_empty_at(sx, sy);
            if (hit) {
                this.alive = false;
            }
            powerups.pick_from(this, sx, sy);
        }
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
        ctx.beginPath();
        ctx.lineWidth="4";
        ctx.strokeStyle="yellow";
        ctx.rect(0, 0, this.w, this.h);
        ctx.stroke();
        var imDat = ctx.getImageData(0,0,this.w,this.h);
        c.putImageData(imDat,-this.w/2+cw2,-this.h/2+ch2);
    };
    this.move = function(){
        this.time += 1;
    };
    this.add_circle = function(x,y,radius) {
        var c = board.space_ctx;
        c.beginPath();
        c.arc(x+this.w/2, y+this.h/2, radius, 0.0, 2.* Math.PI, false);
        c.fillStyle = "red";
        c.fill();
    };
    this.add_line = function(x1,y1,x2,y2,x3,y3,lineWidth) {
        var c = board.space_ctx;
        c.beginPath();
        c.lineWidth = lineWidth;
        c.moveTo(x1+this.w/2,y1+this.h/2);
        c.quadraticCurveTo(x2+this.w/2,y2+this.h/2,x3+this.w/2,y3+this.h/2);
        c.strokeStyle = 'red';
        c.stroke();
    };
    this.is_empty_at = function(x,y) {
        var ctx = this.space_ctx;
        var ix = Math.max(0, Math.min(this.w, x+this.w/2));
        var iy = Math.max(0, Math.min(this.h, y+this.h/2));
        var id = ctx.getImageData(ix,iy,1,1);
        //ctx.fillStyle = "rgb(0,255,0)";
        //ctx.fillRect(ix,iy,1,1);
        if (id.data[0] > 0 || id.data[1] > 0 || id.data[2] > 0) {
            return false;
        }
        return true;
    };
}

function PowerUps() {
    this.available = [];
    this.taken = [];
    this.usage = {};
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
    this.add = function() {
        var attempts = 10;
        for (i=0; i<attempts; i++) {
            var p = new PowerUpSpeed();
            var overlap = this.select(p.x, p.y, p.radius);
            if (overlap.length == 0) {
                this.available.push(p);
                return;
            }
        }
    };
    this.pick_from = function(pl, x, y) {
        var result = this.select(x,y);
        for (var i=result.length-1; i>=0; i--) {
            var p = result[i];
            this.taken.push(p);
            this.available.splice(this.available.indexOf(p),1);
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

function PowerUpSpeed() {
    this.img = new Image();
    this.img.src = "img/Brain-Games-red.png";
    this.radius = 16;
    this.age = Number.MIN_VALUE;
    this.x = (Math.random()-0.5)*(board.w-2*this.radius);
    this.y = (Math.random()-0.5)*(board.h-2*this.radius);
    this.draw = function(){
        c.drawImage(this.img, this.x - this.radius + cw2, this.y - this.radius + ch2, 2*this.radius, 2*this.radius);
    };
    this.finished = function() {
        return this.age >= 100;
    };
    this.move = function(){
        this.age += 1;
    };
    this.upgrade = function(pl) {
        pl.size *= 2;
        this.age = 0;
    };
    this.release = function(pl) {
        pl.size *= 0.5;
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
