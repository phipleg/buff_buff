window.onload = function(){
    canvas = document.getElementById("big");
    canvas.width = window.innerWidth * 0.9;
    canvas.width = 1024;
    canvas.height = window.innerHeight * 0.85;
    canvas.height = 720;
    sounds = {};
    sounds['blast'] = function() { return new Audio("sounds/blast_5.mp3"); };
    sounds['crash'] = function() { return new Audio("sounds/car_crash.mp3"); };
    sounds['forcefield'] = function() { return new Audio("sounds/forcefield.mp3"); };
    sounds['howl_short'] = function() { return new Audio("sounds/howl_short.mp3"); };
    c = canvas.getContext("2d");
    ch2 = Math.floor(canvas.height/2);
    cw2 = Math.floor(canvas.width/2);
    state = 'init';
    transition();
    run();

    window.addEventListener("keydown", function (e) { e.preventDefault(); transition(e.which, true); }, true);
    window.addEventListener("keyup", function (e) { e.preventDefault(); transition(e.which, false); }, true);
}
// names of known key codes (0-255)

var keyboardMap = [
  "", // [0]
  "", // [1]
  "", // [2]
  "CANCEL", // [3]
  "", // [4]
  "", // [5]
  "HELP", // [6]
  "", // [7]
  "BACK_SPACE", // [8]
  "TAB", // [9]
  "", // [10]
  "", // [11]
  "CLEAR", // [12]
  "ENTER", // [13]
  "ENTER_SPECIAL", // [14]
  "", // [15]
  "SHIFT", // [16]
  "CONTROL", // [17]
  "ALT", // [18]
  "PAUSE", // [19]
  "CAPS_LOCK", // [20]
  "KANA", // [21]
  "EISU", // [22]
  "JUNJA", // [23]
  "FINAL", // [24]
  "HANJA", // [25]
  "", // [26]
  "ESCAPE", // [27]
  "CONVERT", // [28]
  "NONCONVERT", // [29]
  "ACCEPT", // [30]
  "MODECHANGE", // [31]
  "SPACE", // [32]
  "PAGE_UP", // [33]
  "PAGE_DOWN", // [34]
  "END", // [35]
  "HOME", // [36]
  "LEFT", // [37]
  "UP", // [38]
  "RIGHT", // [39]
  "DOWN", // [40]
  "SELECT", // [41]
  "PRINT", // [42]
  "EXECUTE", // [43]
  "PRINTSCREEN", // [44]
  "INSERT", // [45]
  "DELETE", // [46]
  "", // [47]
  "0", // [48]
  "1", // [49]
  "2", // [50]
  "3", // [51]
  "4", // [52]
  "5", // [53]
  "6", // [54]
  "7", // [55]
  "8", // [56]
  "9", // [57]
  "COLON", // [58]
  "SEMICOLON", // [59]
  "LESS_THAN", // [60]
  "EQUALS", // [61]
  "GREATER_THAN", // [62]
  "QUESTION_MARK", // [63]
  "AT", // [64]
  "A", // [65]
  "B", // [66]
  "C", // [67]
  "D", // [68]
  "E", // [69]
  "F", // [70]
  "G", // [71]
  "H", // [72]
  "I", // [73]
  "J", // [74]
  "K", // [75]
  "L", // [76]
  "M", // [77]
  "N", // [78]
  "O", // [79]
  "P", // [80]
  "Q", // [81]
  "R", // [82]
  "S", // [83]
  "T", // [84]
  "U", // [85]
  "V", // [86]
  "W", // [87]
  "X", // [88]
  "Y", // [89]
  "Z", // [90]
  "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
  "", // [92]
  "CONTEXT_MENU", // [93]
  "", // [94]
  "SLEEP", // [95]
  "NUMPAD0", // [96]
  "NUMPAD1", // [97]
  "NUMPAD2", // [98]
  "NUMPAD3", // [99]
  "NUMPAD4", // [100]
  "NUMPAD5", // [101]
  "NUMPAD6", // [102]
  "NUMPAD7", // [103]
  "NUMPAD8", // [104]
  "NUMPAD9", // [105]
  "MULTIPLY", // [106]
  "ADD", // [107]
  "SEPARATOR", // [108]
  "SUBTRACT", // [109]
  "DECIMAL", // [110]
  "DIVIDE", // [111]
  "F1", // [112]
  "F2", // [113]
  "F3", // [114]
  "F4", // [115]
  "F5", // [116]
  "F6", // [117]
  "F7", // [118]
  "F8", // [119]
  "F9", // [120]
  "F10", // [121]
  "F11", // [122]
  "F12", // [123]
  "F13", // [124]
  "F14", // [125]
  "F15", // [126]
  "F16", // [127]
  "F17", // [128]
  "F18", // [129]
  "F19", // [130]
  "F20", // [131]
  "F21", // [132]
  "F22", // [133]
  "F23", // [134]
  "F24", // [135]
  "", // [136]
  "", // [137]
  "", // [138]
  "", // [139]
  "", // [140]
  "", // [141]
  "", // [142]
  "", // [143]
  "NUM_LOCK", // [144]
  "SCROLL_LOCK", // [145]
  "WIN_OEM_FJ_JISHO", // [146]
  "WIN_OEM_FJ_MASSHOU", // [147]
  "WIN_OEM_FJ_TOUROKU", // [148]
  "WIN_OEM_FJ_LOYA", // [149]
  "WIN_OEM_FJ_ROYA", // [150]
  "", // [151]
  "", // [152]
  "", // [153]
  "", // [154]
  "", // [155]
  "", // [156]
  "", // [157]
  "", // [158]
  "", // [159]
  "CIRCUMFLEX", // [160]
  "EXCLAMATION", // [161]
  "DOUBLE_QUOTE", // [162]
  "HASH", // [163]
  "DOLLAR", // [164]
  "PERCENT", // [165]
  "AMPERSAND", // [166]
  "UNDERSCORE", // [167]
  "OPEN_PAREN", // [168]
  "CLOSE_PAREN", // [169]
  "ASTERISK", // [170]
  "PLUS", // [171]
  "PIPE", // [172]
  "HYPHEN_MINUS", // [173]
  "OPEN_CURLY_BRACKET", // [174]
  "CLOSE_CURLY_BRACKET", // [175]
  "TILDE", // [176]
  "", // [177]
  "", // [178]
  "", // [179]
  "", // [180]
  "VOLUME_MUTE", // [181]
  "VOLUME_DOWN", // [182]
  "VOLUME_UP", // [183]
  "", // [184]
  "", // [185]
  "SEMICOLON", // [186]
  "EQUALS", // [187]
  "COMMA", // [188]
  "MINUS", // [189]
  "PERIOD", // [190]
  "SLASH", // [191]
  "BACK_QUOTE", // [192]
  "", // [193]
  "", // [194]
  "", // [195]
  "", // [196]
  "", // [197]
  "", // [198]
  "", // [199]
  "", // [200]
  "", // [201]
  "", // [202]
  "", // [203]
  "", // [204]
  "", // [205]
  "", // [206]
  "", // [207]
  "", // [208]
  "", // [209]
  "", // [210]
  "", // [211]
  "", // [212]
  "", // [213]
  "", // [214]
  "", // [215]
  "", // [216]
  "", // [217]
  "", // [218]
  "OPEN_BRACKET", // [219]
  "BACK_SLASH", // [220]
  "CLOSE_BRACKET", // [221]
  "QUOTE", // [222]
  "", // [223]
  "META", // [224]
  "ALTGR", // [225]
  "", // [226]
  "WIN_ICO_HELP", // [227]
  "WIN_ICO_00", // [228]
  "", // [229]
  "WIN_ICO_CLEAR", // [230]
  "", // [231]
  "", // [232]
  "WIN_OEM_RESET", // [233]
  "WIN_OEM_JUMP", // [234]
  "WIN_OEM_PA1", // [235]
  "WIN_OEM_PA2", // [236]
  "WIN_OEM_PA3", // [237]
  "WIN_OEM_WSCTRL", // [238]
  "WIN_OEM_CUSEL", // [239]
  "WIN_OEM_ATTN", // [240]
  "WIN_OEM_FINISH", // [241]
  "WIN_OEM_COPY", // [242]
  "WIN_OEM_AUTO", // [243]
  "WIN_OEM_ENLW", // [244]
  "WIN_OEM_BACKTAB", // [245]
  "ATTN", // [246]
  "CRSEL", // [247]
  "EXSEL", // [248]
  "EREOF", // [249]
  "PLAY", // [250]
  "ZOOM", // [251]
  "", // [252]
  "PA1", // [253]
  "WIN_OEM_CLEAR", // [254]
  "" // [255]
];
keyCodes = {
    37: 'left',
    39: 'right',
    81: 'up',
    87: 'down',
    32: 'space',
    27: 'esc'
};

function transition(keyCode, keydown) {
    var input = null;
    var key;
    if (keyCode !== undefined) {
        input = keyCodes[keyCode];
        if (!keydown) {
            input += '_up';
        }
        //console.log({'state': state, 'input': input, 'key': keyCode, 'keydown': keydown});
        key = keyboardMap[keyCode];
    }
    player_keys = {
        37: { 'id': 0, 'direction': 'left' },
        39: { 'id': 0, 'direction': 'right' },
        81: { 'id': 1, 'direction': 'left' },
        87: { 'id': 1, 'direction': 'right' }
    };
    if ('init' === state) {
        background = new Background();
        gameconfig = new GameConfig();
        gamestart = new GameStart();
        state = 'menu';
        universe = [gamestart, background];
    } else if ('menu' === state) {
        if ('space' === input) {
            universe = [gameconfig, background];
            state = 'config';
        }
    } else if ('config' === state) {
        if ('space' === input) {
            if (gameconfig.valid) {
                board = new Board();
                info = new Info();
                powerups = new PowerUps();
                gameready = new GameReady();
                gameover = new GameOver();
                gamepause = new GamePause();
                players = new PlayerList();
                players.deploy();
                universe = [gameready, players, powerups, board, info, background];
                state = 'ready';
            }
        } else if ('esc' === input) {
            state = 'init';
        } else {
            if (null != key && keydown) {
                if (['1', '2', '3', '4', '5', '6', '7', '8'].indexOf(key) != -1) {
                    if ('right' != gameconfig.current_key) {
                        var idx = parseInt(key) -1;
                        if (gameconfig.current_player != idx) {
                            gameconfig.current_player = idx;
                        } else {
                            gameconfig.current_player = null;
                            gameconfig.current_key = null;
                        }
                        gameconfig.current_key = 'left';
                        var cfg = gameconfig.bindings[idx];
                        cfg.type = null;
                        cfg.left = null;
                        cfg.right = null;
                    }
                } else {
                    if (null != gameconfig.current_player) {
                        var cfg = gameconfig.bindings[gameconfig.current_player];
                        if ('left' == gameconfig.current_key && gameconfig.is_key_free(key)) {
                            cfg.left = key;
                            gameconfig.current_key = 'right';
                        } else if ('right' == gameconfig.current_key && gameconfig.is_key_free(key)) {
                            cfg.right = key;
                            gameconfig.current_key = null;
                            cfg.type = 'human';
                        }
                    }
                }
                gameconfig.validate();
            }
        }
    } else if ('ready' === state) {
        if ('space' === input) {
            universe = [players, powerups, board, info, background];
            state = 'playing';
        } else if ('esc' == input) {
            universe = [gameconfig, background];
            state = 'config';
        }
    } else if ('playing' === state) {
        if (null === input) {
        } else if ('esc' === input || 'space' === input) {
            prev_universe = universe;
            universe = [gamepause, players, powerups, board, info, background];
            state = 'pause';
        } else {
            for (var i=0; i<gameconfig.bindings.length; i++) {
                var cfg = gameconfig.bindings[i];
                var pl = players.by_name[cfg.name];
                if (cfg.type === 'human') {
                    if (key === cfg.left) {
                        pl.to_left = keydown;
                    } else if (key === cfg.right) {
                        pl.to_right = keydown;
                    }
                }
            }
        }
    } else if ('pause' === state) {
        if ('esc' === input) {
            universe = [gameconfig, background];
            state = 'config';
        } else if ('space' === input) {
            universe = prev_universe;
            state = 'playing';
        }
    } else if ('game_over' === state) {
        if ('space' == input) {
            universe = [gameconfig, background];
            state = 'config';
        }
    } else if ('round_over' === state) {
        if ('space' == input) {
            board.reset();
            powerups.reset();
            players.deploy();
            state = 'ready';
        }
    }
}


function run() {
    setInterval(function() {
        render();
        transition();

        for (var i = universe.length-1; i >= 0; i--) {
            object = universe[i];
            object.move();
        }
        if ('playing' == state) {
            if (1 >= players.count_alive()) {
                if (players.sorted()[0].score >= Math.max(players.goal, players.sorted()[1].score+2)) {
                    universe = [gameover, players, powerups, board, info, background];
                    state = 'game_over';
                } else {
                    state = 'round_over';
                }
            }
        }
    }, 25);
}

function render() {
    for (var i = universe.length-1; i >= 0; i--) {
        universe[i].draw();
    }
}

function Player(name, color, score){
    this.name = name;
    this.color = color;
    this.score = score;
    this.strokeStyle = color;
    this.alive = true;
    this.hit = false;
    this.size = 3;
    this.to_left = false;
    this.to_right = false;
    this.angle_delta = 0.0;
    this.angle = Math.random() * 2 * Math.PI;
    this.v = 2;
    this.x = (Math.random()-0.5)*(board.w-32);
    this.y = (Math.random()-0.5)*(board.h-32);
    this.x1 = this.x;
    this.y1 = this.y;
    this.has_hole = false;
    this.has_track = false;
    this.transparent = 0;
    this.rectangular = 0;
    this.draw = function(){
        if (!this.alive) {
            if (this.hit) {
                sounds['crash']().play();
            }
            c.beginPath();
            c.arc(this.x+cw2, this.y+ch2, 3+this.size, this.angle - 1*Math.PI, this.angle + 1*Math.PI, false);
            c.fillStyle = this.color;
            c.fill();
            return;
        }
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
                c.fillStyle = "yellow";
                c.fill();
            } else {
                c.lineWidth = "1";
                c.strokeStyle = "yellow";
                c.stroke();
            }
        } else {
            c.beginPath();
            c.arc(this.x+cw2, this.y+ch2, this.size, this.angle - 1*Math.PI, this.angle + 1*Math.PI, false);
            if (this.transparent == 0) {
                c.fillStyle = "yellow";
                c.fill();
            } else {
                c.lineWidth = "1";
                c.strokeStyle = "yellow";
                c.stroke();
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
        this.hit = false;
        if ('playing' != state || !this.alive) {
            return;
        }
        this.has_hole = board.time % 100 >= 80;
        this.has_track = !(this.has_hole || this.transparent > 0);
        var acc = this.acceleration();
        if (this.rectangular >= 1) {
            this.angle_delta = Math.PI/2;
            this.to_left = false;
            this.to_right = false;
        } else {
            this.angle_delta = Math.PI/32;
        }
        var da = acc * this.angle_delta;
        this.angle += da;
        var dl = Math.abs(Math.sin(da)) * (this.size+1);
        if (dl < this.v && (this.rectangular == 0 || acc == 0)) {
            dl = this.v;
        }
        var dx = Math.cos(this.angle) * dl;
        var dy = Math.sin(this.angle) * dl;
        var x0 = this.x + dx;
        var y0 = this.y + dy;
        var new_pos = board.project(x0, y0);
        x0 = new_pos[0];
        y0 = new_pos[1];

        this.hit = this.collision_detection(x0, y0) && this.has_track;
        if (this.hit) {
            this.alive = false;
        }
        var x2 = this.x1;
        var y2 = this.y1;
        this.x1 = this.x;
        this.y1 = this.y;
        this.x = x0;
        this.y = y0;
        if (this.has_track) {
            d01 = dist(this.x, this.y, this.x1, this.y1);
            d12 = dist(this.x1, this.y1, x2, y2);
            if (d01 < 100 && d12 < 100) {
                board.add_line(x2, y2, this.x1, this.y1, this.x, this.y, 2* this.size, this.strokeStyle);
            } else {
                board.add_line(this.x, this.y, this.x, this.y, this.x, this.y, 2* this.size, this.strokeStyle);
            }
        }
    };
    this.surface_points = function(new_x, new_y) {
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
                var sx = new_x + Math.cos(beta) * this.size;
                var sy = new_y + Math.sin(beta) * this.size;
                points.push(Math.floor(sx));
                points.push(Math.floor(sy));
            }
        }
        return points;
    };
    this.collision_detection = function(x,y) {
        var points = this.surface_points(x,y);
        for (var i=0; i<points.length-1; i+=2) {
            powerups.pick_from(this, points[i], points[i+1]);
        }
        return !board.is_empty_at(points);
    };
}

function PlayerList() {
    this.list = [];
    this.by_name = {};
    this.deploy = function() {
        var old_by_name = this.by_name;
        this.list = [];
        this.by_name = {};
        for (var i=0; i<gameconfig.bindings.length; i++) {
            var cfg = gameconfig.bindings[i];
            if ('human' == cfg.type) {
                var col = rgba(cfg.color.r, cfg.color.g, cfg.color.b, 1.0);
                var old_pl = old_by_name[cfg.name];
                var score = old_pl ? old_pl.score : 0.0;
                var pl = new Player(cfg.name, col, score);
                this.list.push(pl);
                this.by_name[pl.name] = pl;
            }
        }
        this.goal = 10 * (this.list.length - 1);
    };
    this.sorted = function() {
        var copy = this.list.slice();
        copy.sort(function(pl1, pl2) { return pl2.score - pl1.score; });
        return copy;
    };
    this.count_alive = function() {
        var result = 0;
        for (var i=0; i<this.list.length; i++) {
            if (this.list[i].alive) {
                result += 1;
            }
        }
        return result;
    };
    this.move = function() {
        for (var i=0; i<this.list.length; i++) {
            var pl = this.list[i];
            pl.move();
        }
        for (var i=0; i<this.list.length; i++) {
            var pl = this.list[i];
            if (pl.hit) {
                for (var j=0; j<this.list.length; j++) {
                    other = this.list[j];
                    if (other.alive) {
                        other.score += 1;
                    }
                }
            }
        }
    };
    this.draw = function() {
        for (var i=0; i<this.list.length; i++) {
            this.list[i].draw();
        }
    };
}

function Board() {
    this.space_canvas = document.getElementById("board");
    this.w = 700;
    this.h = this.w;
    this.space_canvas.width = this.w;
    this.space_canvas.height = this.h;
    this.time = 0;
    this.endless = 0;
    this.space_ctx = this.space_canvas.getContext("2d");
    this.sound = sounds['forcefield']();
    this.draw = function() {
        var ctx = this.space_ctx;
        var imDat = ctx.getImageData(0,0,this.w,this.h);
        c.putImageData(imDat,-this.w/2+cw2,-this.h/2+ch2);
        if (this.endless >= 1) {
            c.beginPath();
            c.lineWidth="4";
            c.strokeStyle="rgba(0,0,255," + (0.5 + 0.5*Math.sin(this.time/10.0)) + ")";
            c.rect(-this.w/2+cw2, -this.h/2+ch2, this.w, this.h);
            c.stroke();
            this.sound.play();
        } else {
            this.sound.pause();
        }
    };
    this.move = function(){
        this.time += 1;
        this.add_border();
    };
    this.add_border = function() {
        var ctx = this.space_ctx;
        ctx.beginPath();
        ctx.lineWidth="4";
        if (this.endless >= 1) {
            ctx.strokeStyle="black";
        } else {
            ctx.strokeStyle="yellow";
        }
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
    };
    this.reset = function() {
        this.clear();
        this.time = 0;
        this.endless = 0;
        this.sound.pause();
        this.currentTime = 0;
    };
    this.is_empty_at = function(points) {
        var x1=this.w; x2=0; y1=this.h; y2=0;
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
    this.project = function(x, y) {
        if (x < -this.w/2 || x >= this.w/2 || y < -this.h/2 || y >= this.h/2) {
            if (this.endless >= 1) {
                if (x < -this.w/2) {
                    x += this.w;
                }
                if (x >= this.w/2) {
                    x -= this.w;
                }
                if (y < -this.h/2) {
                    y += this.h;
                }
                if (y >= this.h/2) {
                    y -= this.h;
                }
            } else {
                x = clip(x, -this.w/2, this.w/2);
                y = clip(y, -this.h/2, this.h/2);
            }
        }
        return [x, y];
    };
}


function PowerUps() {
    this.available = [];
    this.taken = [];
    this.reset = function() {
        this.available = [];
        this.taken = [];
    };
    this.add = function() {
        var attempts = 10;
        for (i=0; i<attempts; i++) {
            var p;
            var rnd = getRandomInt(8);
            switch(rnd) {
                case 0: p = new PowerUpFaster(); break;
                case 1: p = new PowerUpSlower(); break;
                case 2: p = new PowerUpThicker(); break;
                case 3: p = new PowerUpThinner(); break;
                case 4: p = new PowerUpClear(); break;
                case 5: p = new PowerUpFlight(); break;
                case 6: p = new PowerUpRect(); break;
                case 7: p = new PowerUpFluffy(); break;
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
            var d = dist(x,y,p.x,p.y) - p.radius - other_radius;
            if (d <= 0) {
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
            sounds['howl_short']().play();
            p.owner = pl;
        }
    };
    this.draw = function(){
        for (var i=0; i<this.available.length; i++) {
            this.available[i].draw();
        }
    };
    this.move = function(){
        if (state != 'playing') {
            return;
        }
        var x = this.available.length;
        if (Math.random() < 1.0/(100. + (x+2)*(x+2))) {
            this.add();
        }
        for (var i=0; i<this.available.length; i++) {
            this.available[i].move();
        }
        for (var i=this.taken.length-1; i>=0; i--) {
            var p = this.taken[i];
            p.move();
            if (p.finished()) {
                var pl = p.owner;
                p.owner = null;
                p.release(pl);
                this.taken.splice(i,1);
            }
        }
    };
}

function PowerUpBase(kind) {
    if ('neutral' === kind) {
        this.color = 'blue';
    } else if ('positive' === kind) {
        this.color = 'green';
    }
    this.img = new Image();
    this.owner = null;
    this.x = 0;
    this.y = 0;
    this.radius = 16;
    this.age = 0;
    this.draw = function(){
        c.beginPath();
        c.arc(this.x + cw2,this.y + ch2, this.radius, 0, 2*Math.PI);
        c.fillStyle = this.color;
        c.fill();
        var r = this.radius;
        var w = 512/r;
        var h = 346/r;
        c.drawImage(this.img, this.x-w/2+cw2, this.y-h/2+ch2, w, h);
    };
    this.finished = function() {
        return this.age > 1;
    };
    this.move = function(){
        if (null != this.owner) {
            this.age += 1.0/500;
        }
    };
}


PowerUpThicker.prototype = new PowerUpBase('positive');
PowerUpThicker.prototype.constructor = PowerUpThicker;
function PowerUpThicker() {
    this.img.src = "img/font-awesome/svg/plus26.svg";
    this.upgrade = function(pl) {
        pl.size *= 2.0;
    };
    this.release = function(pl) {
        pl.size /= 2.0;
    };
}

PowerUpThinner.prototype = new PowerUpBase('positive');
PowerUpThinner.prototype.constructor = PowerUpSlower;
function PowerUpThinner() {
    this.img.src = "img/font-awesome/svg/minus20.svg";
    this.upgrade = function(pl) {
        pl.size *= 0.5;
    };
    this.release = function(pl) {
        pl.size /= 0.5;
    };
}

PowerUpFaster.prototype = new PowerUpBase('positive');
PowerUpFaster.prototype.constructor = PowerUpFaster;
function PowerUpFaster() {
    this.img.src = "img/font-awesome/svg/lightning14.svg";
    this.upgrade = function(pl) {
        pl.v *= 2.0;
    };
    this.release = function(pl) {
        pl.v /= 2.0;
    };
}

PowerUpSlower.prototype = new PowerUpBase('positive');
PowerUpSlower.prototype.constructor = PowerUpSlower;
function PowerUpSlower() {
    this.img.src = "img/font-awesome/svg/bug6.svg";
    this.upgrade = function(pl) {
        pl.v *= 0.5;
    };
    this.release = function(pl) {
        pl.v /= 0.5;
    };
}

PowerUpFlight.prototype = new PowerUpBase('positive');
PowerUpFlight.prototype.constructor = PowerUpFlight;
function PowerUpFlight() {
    this.img.src = "img/font-awesome/svg/plane12.svg";
    this.upgrade = function(pl) {
        pl.transparent += 1;
    };
    this.release = function(pl) {
        pl.transparent -= 1;
    };
}

PowerUpRect.prototype = new PowerUpBase('positive');
PowerUpRect.prototype.constructor = PowerUpRect;
function PowerUpRect() {
    this.img.src = "img/font-awesome/svg/retweet2.svg";
    this.upgrade = function(pl) {
        pl.rectangular += 1;
    };
    this.release = function(pl) {
        pl.rectangular -= 1;
    };
}

PowerUpFluffy.prototype = new PowerUpBase('neutral');
PowerUpFluffy.prototype.constructor = PowerUpFluffy;
function PowerUpFluffy() {
    this.img.src = "img/font-awesome/svg/fluffy1.svg";
    this.upgrade = function(pl) {
        board.endless += 1;
    };
    this.release = function(pl) {
        board.endless -= 1;
    };
}

PowerUpClear.prototype = new PowerUpBase('neutral');
PowerUpClear.prototype.constructor = PowerUpClear;
function PowerUpClear() {
    this.img.src = "img/font-awesome/svg/heart75.svg";
    this.upgrade = function(pl) {
        board.clear();
    };
    this.release = function(pl) {
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
        c.font = "16px pixelfont";
        c.textAlign = "left";
        c.fillStyle = "white";
        c.fillText("Goal " + players.goal, cw2+board.w/2+4, 32);
        var sorted = players.sorted();
        for (var i=0; i<sorted.length; i++) {
            var pl = sorted[i];
            c.fillStyle = pl.color;
            c.fillText(pl.name + " " + pl.score, cw2+board.w/2+4, 64+32*i);
        }
    };
    this.move = function(){};
}

function GameOver(){
    this.draw = function(){
        var winner = players.sorted()[0];
        c.fillStyle = "rgba(0,0,0,0.5)";
        c.fillRect(0, 0, canvas.width,canvas.height);
        c.textAlign = "center";
        c.fillStyle = winner.color;
        c.font = "50px pixelfont";
        c.fillText(winner.name, cw2, ch2-60);
        c.fillText('wins!', cw2, ch2);
        c.font = "30px pixelfont";
        c.fillText("press space to play again", cw2, ch2+60)
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
        c.fillText("BUFF BUFF", cw2, ch2-50);
        c.font = "30px pixelfont";
        c.fillText("press space to configure keys", cw2, ch2+100)
        c.font = "10px pixelfont";
        c.fillText("Sound by freesfx.co.uk", cw2, ch2*2 - 20)
    };
    this.move = function(){}
}

function GameConfig(){
    this.current_player = null;
    this.current_key = null;
    this.valid = false;
    this.bindings = [
        {name: 'Fred', left: null, right: null, color: { r: 255, g: 0, b: 0}, type: null},
        {name: 'Greenly', left: null, right: null,color: { r: 124, g: 252, b: 0}, type: null},
        {name: 'Pinkney', left: null, right: null, color: { r: 255, g: 105, b: 180}, type: null},
        {name: 'Bluebell', left: null, right: null, color: { r: 0, g: 191, b: 155}, type: null},
        {name: 'Willem', left: null, right: null, color: { r: 255, g: 140, b: 0}, type: null},
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
            var active = cfg.type || this.current_player == i;
            var alpha = active ? 1.0 : 0.3;
            c.fillStyle = rgba(color.r, color.g, color.b, alpha);
            c.fillText( (i+1) + " " + cfg.name, cw2-250, ch2-150 + 10 + (i+1)*40);
            c.fillStyle = rgba(color.r, color.g, color.b, (cfg.left || this.current_key === 'left' && active) ? 1.0: 0.5);
            c.fillText(cfg.left ? cfg.left : (active ? '?' : ''), cw2-40, ch2-150 + 10 + (i+1)*40);
            c.fillStyle = rgba(color.r, color.g, color.b, (cfg.right || this.current_key === 'right' && active) ? 1: 0.5);
            c.fillText(cfg.right ? cfg.right : (active ? '?' : ''), cw2+140, ch2-150 + 10 + (i+1)*40);
        }
        c.textAlign = "center";
        c.fillStyle = "white";
        if (this.valid) {
            c.fillText("press space to play", cw2, ch2+250)
        } else {
            c.fillText("configure at least 2 players!", cw2, ch2+250)
        }
    };
    this.move = function(){}
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

function rgba(r,g,b,a) {
    return "rgba(" + r + ',' + g + ',' + b + ',' + a + ')';
}
