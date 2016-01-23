window.onload = function(){
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.85;
    ch2 = canvas.height/2;
    cw2 = canvas.width/2;
    c = canvas.getContext("2d");
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
    board = new Board({'width':400, 'height':400});
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
    this.x = (Math.random()-0.5)*board.w;
    this.y = (Math.random()-0.5)*board.h;
    this.pathx = [this.x];
    this.pathy = [this.y];
    this.draw = function(){
        c.beginPath();
        c.lineWidth=this.size * 2;
        c.strokeStyle=this.color;
        c.moveTo(this.pathx[0]+cw2, this.pathy[0]+ch2);
        for (var i=1; i<this.pathx.length; i++) {
            c.lineTo(this.pathx[i]+cw2, this.pathy[i]+ch2);
        };
        c.lineTo(this.x+cw2, this.y+ch2);
        c.stroke();
        c.beginPath();
        c.arc(this.x+cw2, this.y+ch2, this.size, this.angle - 0.5*Math.PI, this.angle + 0.5 * Math.PI, false);
        c.fillStyle = "yellow";
        c.fill();

    }
    this.move = function(){
        if (!this.alive || is_game_paused) {
            return;
        }
        if (!this.alive) {
            return;
        }
        this.pathx.push(this.x);
        this.pathy.push(this.y);
        if (this.left_pressed){
            this.angle -= this.angle_delta * 2.0 * Math.PI;
        }
        if (this.right_pressed){
            this.angle += this.angle_delta * 2.0 * Math.PI;
        }
        var vx = Math.cos(this.angle) * this.v;
        var vy = Math.sin(this.angle) * this.v;
        var new_x = this.x + vx;
        var new_y = this.y + vy;
        //console.log([this.x,this.y]);
        for (var dt=0; dt<=1; dt+=0.1) {
            for (var dx=-this.size; dx<this.size; dx++) {
                for (var dy=-this.size; dy<this.size; dy++) {
                    //console.log([dt, dx,dy]);
                    if (dx*dx+dy*dy<=this.size*this.size) {
                        var xx = dx + dt*this.x + (1-dt)*new_x + board.w/2;
                        var yy = dy + dt*this.y + (1-dt)*new_y + board.h/2;
                        xx = Math.min(board.w-1, Math.max(0,Math.floor(xx)));
                        yy = Math.min(board.h-1, Math.max(0,Math.floor(yy)));
                        var val = board.matrix[xx][yy];
                        if (val != 0 && board.time - val > this.size) {
                            this.alive = false;
                        }
                        board.matrix[xx][yy] = board.time;
                    }
                }
            }
        }
        if (this.alive) {
            this.x = new_x;
            this.y = new_y;
        }
    };
}

function Board(opts) {
    this.h = opts['height'];
    this.w = opts['width'];
    this.x = - this.w/2;
    this.y = - this.h/2;
    this.time = 10;
    this.matrix = new Array(this.w);
    for (var i=0; i<this.w; i++) {
        this.matrix[i] = new Array(this.h);
        for (var j=0; j<this.h; j++) {
            this.matrix[i][j] = 0;
        }
    }
    for (var i=0; i<this.w; i++) {
        this.matrix[i][0] = 1;
        this.matrix[i][this.h-1] = 1;
    }
    for (var j=0; j<this.h; j++) {
        this.matrix[0][j] = 1;
        this.matrix[this.w-1][j] = 1;
    }

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
    };
    this.log_matrix = function() {
        for (var i=0; i<this.w; i++) {
            console.log(this.matrix[i])
        }
    };
}

function Background() {
    this.draw = function(){
        c.fillStyle = is_game_paused ? "darkgrey" : "black";
        c.fillRect(0,0,canvas.width,canvas.height);
    };
    this.move = function(){}
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


function _remove(x){
    universe.splice(universe.indexOf(x), 1);
}


