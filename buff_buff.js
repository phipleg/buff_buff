window.onload = function(){
    canvas = document.getElementById("big");
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.85;
    c = canvas.getContext("2d");
    ch2 = canvas.height/2;
    cw2 = canvas.width/2;
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
    gamestart = new GameStart();
    gameover = new GameOver();
    gamepause = new GamePause();
    universe = [gamestart, background];

}


function start_game() {
    if (!is_game_started) {
        is_game_started = true;
        universe = [player, board, info, background];
    }
}

function pause_game() {
    if (is_game_started) {
        if (!is_game_paused) {
            is_game_paused = true;
            prev_universe = universe;
            universe = [gamepause, player, board, info, background];
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

function on_keydown(e) {
    var key = e.which;
    if (37 == key) { // left
        player.left_pressed = true;
    }
    if (39 == key) { // right
        player.right_pressed = true;
    }
    if (13 == key) { // enter
        if (is_game_over) {
            game_init();
        }
        start_game();
    }
    if (32 == key) { // space
        pause_game();
    }
    if (27 == key) { // esc
        escape_game();
    }
    //console.log({'keydown': key});

}

function on_keyup(e) {
    var key = e.which;
    if (37 == key) { // left
        player.left_pressed = false;
    }
    if (39 == key) { // right
        player.right_pressed = false;
    }
}


function run() {
    setInterval(function() {
        for (i = universe.length-1; i >= 0; i--) {
            object = universe[i];
            object.move();
            object.draw();
        }
        if (is_game_started && !player.alive) {
            is_game_over = true;
            is_game_started = false;
            universe = [gameover, player, board, info, background];
        }
    }, 25);
}

function Player(){
    this.left_pressed = false;
    this.right_pressed = false;
    this.name = "Player";
    this.color = "red";
    this.alive = true;
    this.score = 0;
    this.size = 4;
    this.angle_delta = 1.0/64;
    this.angle = 0.0 * Math.PI;
    this.v = 2;
    this.x = 0*(Math.random()-0.5)*board.w;
    this.y = 0*(Math.random()-0.5)*board.h;
    this.is_transparent = false;
    this.draw = function(){
        if (!this.is_transparent) {
            c.beginPath();
            c.arc(this.x+cw2, this.y+ch2, this.size, this.angle - 0.5*Math.PI, this.angle + 0.5 * Math.PI, false);
            c.fillStyle = "yellow";
            c.fill();
        }
    }
    this.move = function(){
        if (!this.alive || is_game_paused) {
            return;
        }
        var da = this.left_pressed ? -1 : (this.right_pressed ? 1 : 0);
        this.angle += da *  this.angle_delta * 2.0 * Math.PI;
        var vx = Math.cos(this.angle) * this.v; var vy = Math.sin(this.angle) * this.v;
        var new_x = this.x + vx;
        var new_y = this.y + vy;
        if (this.is_collided(new_x,new_y)) {
            this.alive = false;
            return;
        }
        this.x = new_x;
        this.y = new_y;
        if (board.time % 100 < (2*this.size+5)) {
            this.is_transparent = true;
        } else {
            this.is_transparent = false;
        }
        if (!this.is_transparent) {
            board.add_circle(this.x, this.y, this.size);
        }
    };
    this.is_collided = function(new_x,new_y) {
        var collision = false;
        for (t=-1; t<= 1; t+=1.0/32) {
            var beta = this.angle + t*Math.PI/4 * 0.5;
            var dist = 1+this.size;
            var pixel_ok = board.is_empty(new_x + Math.cos(beta)*dist, new_y + Math.sin(beta)*dist);
            if (!pixel_ok) {
                collision = true;
            }
        }
        return collision;
    };
}

function Board() {
    this.space_canvas = document.getElementById("board");
    this.w = 400;
    this.h = 400;
    this.space_canvas.width = canvas.width;
    this.space_canvas.height = canvas.height;
    this.x = - this.w/2;
    this.y = - this.h/2;
    this.time = 0;
    this.space_ctx = this.space_canvas.getContext("2d");
    this.add_border = function() {
        var ctx = this.space_ctx;
        ctx.beginPath();
        ctx.lineWidth="1";
        ctx.strokeStyle="red";
        ctx.rect(this.x +cw2, this.y + ch2, this.w, this.h);
        ctx.stroke();
    };

    this.draw = function() {
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
        c.arc(x+cw2, y+ch2, radius, 0.0, 2.* Math.PI, false);
        c.fillStyle = "red";
        c.fill();
    };
    this.is_empty = function(x,y) {
        var ctx = this.space_ctx;
        var ix = Math.min(this.w/2, Math.max(-this.w/2, x)) + cw2;
        var iy = Math.min(this.h/2, Math.max(-this.h/2, y)) + ch2;
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

function Background() {
    this.draw = function(){
        c.fillStyle = is_game_paused ? "darkgrey" : "black";
        c.fillRect(0,0,canvas.width,canvas.height);
    };
    this.move = function(){};
}


function Info(){
    this.img = new Image();
    this.img.src = "img/Brain-Games-red.png";
    this.draw = function(){
        c.drawImage(this.img, 200, 16, 32, 32); 
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
