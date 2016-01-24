window.onload = function(){
    canvas = document.getElementById("big");
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.85;
    c = canvas.getContext("2d");
    ch2 = Math.floor(canvas.height/2);
    cw2 = Math.floor(canvas.width/2);
    game_init();
    run();
}

window.addEventListener("keydown", on_keydown, true);
window.addEventListener("keyup", on_keyup, true);

function game_init() {
    is_game_started = false;
    is_game_over = false;
    is_game_paused = false;

    background = new Background();
    board = new Board();
    player = new Player();
    info = new Info();
    powerups = new PowerUps();
    gamestart = new GameStart();
    gameover = new GameOver();
    gamepause = new GamePause();
    universe = [gamestart, background];

}

function start_game() {
    if (!is_game_started) {
        is_game_started = true;
        universe = [player, powerups, board, info, background];
    }
}

function pause_game() {
    if (is_game_started) {
        if (!is_game_paused) {
            is_game_paused = true;
            prev_universe = universe;
            universe = [gamepause, player, powerups, board, info, background];
        } else {
            is_game_paused = false;
            universe = prev_universe;
        }
    }
}

function escape_game() {
    if (is_game_paused) {
        game_init();
    } else {
        pause_game();
    }
}

function check_game_over() {
    if (is_game_started && !player.alive) {
        is_game_over = true;
        is_game_started = false;
        universe = [gameover, player, powerups, board, info, background];
    }
}

function on_keydown(e) {
    var key = e.which;
    if (37 == key) { // left
        player.left_pressed = true;
    } else if (39 == key) { // right
        player.right_pressed = true;
    } else if (81 == key) { // q
        player.up_pressed = true;
    } else if (87 == key) { // w
        player.down_pressed = true;
    } else if (13 == key) { // enter
        if (is_game_over) {
            game_init();
        }
        start_game();
    } else if (32 == key) { // space
        pause_game();
    } else if (27 == key) { // esc
        escape_game();
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
            object.move();
            object.draw();
        }
        check_game_over();
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
    this.size = 4;
    this.angle_delta = 1.0/32;
    this.angle = 0.0 * Math.PI;
    this.v = 1;
    this.x = 0*(Math.random()-0.5)*board.w;
    this.y = 0*(Math.random()-0.5)*board.h;
    this.prev_x = this.x;
    this.prev_y = this.y;
    this.is_transparent = false;
    this.draw = function(){
        c.beginPath();
        c.arc(this.x+cw2, this.y+ch2, this.size, this.angle - 1*Math.PI, this.angle + 1 * Math.PI, false);
        c.fillStyle = "yellow";
        c.fill();
    }
    this.move = function(){

        if (!this.alive || is_game_paused) {
            return;
        }
        var dsize = this.up_pressed ? 1.1 : (this.down_pressed ? 0.9 : 1);
        this.size = this.size*dsize;
        var dangle = this.left_pressed ? -1 : (this.right_pressed ? 1 : 0);
        this.angle += dangle * this.angle_delta / Math.max(2.0, Math.sqrt(this.size)) * 2.0 * Math.PI;
        var vx = Math.cos(this.angle) * this.v; var vy = Math.sin(this.angle) * this.v;
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
        var dist = 1.1 * this.size;
        for (var t=-1; t<=1; t+=1){
            var beta = this.angle + t * Math.PI/2 * 0.8;
            var sx = new_x + Math.cos(beta) * dist;
            var sy = new_y + Math.sin(beta) * dist;
            var hit = !board.is_empty_at(sx, sy);
            if (hit) {
                this.alive = false;
            }
            powerups.pick_from(sx,sy);
        }
    };
}

function Board() {
    this.space_canvas = document.getElementById("board");
    this.w = 600;
    this.h = 300;
    this.space_canvas.width = this.w;
    this.space_canvas.height = this.h;
    this.x = - this.w/2;
    this.y = - this.h/2;
    this.time = 0;
    this.space_ctx = this.space_canvas.getContext("2d");
    this.add_border = function() {
        var ctx = this.space_ctx;
        ctx.beginPath();
        ctx.lineWidth="1";
        ctx.strokeStyle="red";
        ctx.rect(0, 0, this.w, this.h);
        ctx.stroke();
    };

    this.draw = function() {
        var id = this.space_ctx.getImageData(0,0,this.w,this.h);
        c.putImageData(id,this.x+cw2,this.y+ch2);
        c.beginPath();
        c.lineWidth="1";
        c.strokeStyle="yellow";
        c.rect(this.x + cw2, this.y + ch2, this.w, this.h);
        c.stroke();
    };
    this.move = function(){
        if (is_game_over || is_game_paused) {
            return;
        }
        this.time += 1;
        this.add_border();
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
        var r = id.data[0]; // detect collisions on red channel
        ctx.fillStyle = "rgb(0,255,0)";
        ctx.fillRect(ix,iy,1,1);
        if (r > 0) {
            return false;
        }
        return true;
    };
}

function PowerUps() {
    this.array = [];
    this.select = function(x,y, other_radius) {
        var result = [];
        if (!other_radius) {
            other_radius = 0;
        }
        for (var i=this.array.length-1; i>=0; i--) {
            var p = this.array[i];
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
        for (i=0; i<10; i++) {
            var p = new PowerUpSpeed();
            var overlap = this.select(p.x, p.y, p.radius);
            if (overlap.length == 0) {
                this.array.push(p);
                return;
            }
        }
    };
    this.pick_from = function(x,y) {
        var result = this.select(x,y);
        for (var i=result.length-1; i>=0; i--) {
            var p = result[i];
            this.array.splice(this.array.indexOf(p),1);
        }
    };
    this.draw = function(){
        for (var i=0; i<this.array.length; i++) {
            this.array[i].draw();
        }
    };
    this.move = function(){
        if (Math.random() < 1.0/(10. + this.array.length*this.array.length)) {
            this.add();
        }
    };
}

function PowerUpSpeed() {
    this.img = new Image();
    this.img.src = "img/Brain-Games-red.png";
    this.x = (Math.random()-0.5)*board.w;
    this.y = (Math.random()-0.5)*board.h/2;
    this.radius = 16;
    this.draw = function(){
        c.drawImage(this.img, this.x - this.radius + cw2, this.y - this.radius + ch2, 2*this.radius, 2*this.radius);
    };
    this.move = function(){};
}

function Background() {
    this.draw = function(){
        c.fillStyle = "black";
        c.fillRect(0,0,canvas.width,canvas.height);
    };
    this.move = function(){};
}


function Info(){
    this.draw = function(){
        c.fillStyle = player.alive ? "white" : "grey";
        c.font = "16px pixelfont";
        c.textAlign = "left";
        c.fillText("Score: " + player.score, 0, 16);
        c.fillText("Time: " + board.time, 100, 16);
    };
    this.move = function(){}
}

function GameOver(){
    this.draw = function(){
        c.textAlign = "center";
        c.fillStyle = "white";
        c.font = "20px pixelfont";
        c.fillText("Final score: " + player.score, cw2, 20);
        c.font = "50px pixelfont";
        c.fillText("GAME OVER", cw2, ch2);
        c.font = "30px pixelfont";
        c.fillText("Press ENTER to play again", cw2, ch2+130)
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
        c.fillText("press SPACE to continue", cw2, ch2+130)
        c.fillText("press ESC to restart", cw2, ch2+160)
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
        c.fillText("press ENTER to play", cw2, ch2+130)
    };
    this.move = function(){}
}
