const qs = e => document.querySelector(e);
const qsa = e => document.querySelectorAll(e);
const n = 50;
var shadow;
var score = 0;
var started = false;
var rules = true;
var loop = true;
var cover_layers = NaN;
var first_game = true;
var held;

sessionStorage.setItem("line-cleared", -1);

function hold() {
    var prev = held;

    held = blocks[blocks.length - 1]; // store last block
    blocks.splice(blocks.length - 1, 1); // delete last block

    if (!prev) dropBlock();
    else {
        blocks.push(prev);
        var b = blocks[blocks.length - 1];
        b.y = 0;
        b.x = canvas.width / 2 - n;
        b.uw = 1;
        b.uh = 1;

    }

    shadow_set(blocks[blocks.length - 1]);
}

const m = n * 3;
const o = n * .5;

var tetris_logo = [
    [25, 25, m * 3, m, "white"],
    [m + 25, m + 25, m, m, "white"],

    // T
    [25 + o * 0.95, 25 + o, o * 2.5, o, "red"],
    [25 + o * 1.70, 25 + o * 2, o, o * 3, "red"],

    // E
    [25 + o * 3.95, 25 + o, o, o * 4, "orange"],
    [25 + o * 3.95, 25 + o, o * 2, o, "orange"],
    [25 + o * 3.95, 25 + o * 2.5, o * 2, o, "orange"],
    [25 + o * 3.95, 25 + o * 4, o * 2, o, "orange"],

    // T
    [25 + o * 6.45, 25 + o, o * 2.5, o, "yellow"],
    [25 + o * 7.20, 25 + o * 2, o, o * 3, "yellow"],

    // R
    [25 + o * 9.45, 25 + o, o, o * 4, "green"],
    [25 + o * 9.95, 25 + o, o * 2, o, "green"],
    [25 + o * 10.95, 25 + o * 2, o, o, "green"],
    [25 + o * 10.40, 25 + o * 3, o, o, "green"], // patching hole
    [25 + o * 10.45, 25 + o * 3, o, o, "green"],
    [25 + o * 10.95, 25 + o * 4, o, o, "green"],

    // I
    [25 + o * 12.45, 25 + o, o, o * 4, "blue"],

    // S
    [25 + o * 13.95, 25 + o, o * 3, o, "purple"],
    [25 + o * 13.95, 25 + o * 2, o, o, "purple"],
    [25 + o * 13.95, 25 + o * 2.5, o * 3, o, "purple"],
    [25 + o * 15.95, 25 + o * 3, o, o, "purple"],
    [25 + o * 13.95, 25 + o * 4, o * 3, o, "purple"]
];


canvas.width = 100 * 5;
canvas.height = 1000;


function scoreSet(n, i) {

    if (parseInt(sessionStorage.getItem("line-cleared") || -1) == i) return;
    else console.log(parseInt(sessionStorage.getItem("line-cleared") || -1), i);

    sessionStorage.setItem("line-cleared", i);
    score += n;

}

function shadow_set(b) {

    shadow = new Block(b.x, 0, b.type, b.state, 51, { color: "white", border: "black", shadow: true });
    blocks[1] = shadow;
}

function boolean(block1, rect1, block2, rect2) {
    return (
        block1 != block2 &&
        (rect1[0] * n) + block1.x < (rect2[0] * n) + n + block2.x &&
        (rect1[0] * n) + n + block1.x > (rect2[0] * n) + block2.x &&
        (rect1[1] * n) + n + block1.y > (rect2[1] * n) + block2.y &&
        (rect1[1] * n) + block1.y < (rect2[1] * n) + n + block2.y &&
        !block2.speed &&
        block1.speed &&
        block1.y < block2.y &&
        !block2.shadow //the block to land on can't be a shadow

        /* &&
        block1.type != "floor" &&
        block2.type != "floor" */
    );
}

function blockCheck() {
    for (let block1 of blocks) {
        block1.y += block1.speed;
        block1.draw();


        for (let rect1 of block1.states[block1.state].rects) {
            for (let block2 of blocks) {
                for (let rect2 of block2.states[block2.state].rects) {

                    if (boolean(block1, rect1, block2, rect2)) {


                        block1.speed = 0;

                        if (blocks.indexOf(block1) == blocks.length - 1 || block1.shadow) {
                            if (!block1.shadow) {
                                dropBlock();
                                scoreSet(10);
                            }
                        }


                        block1.y = Math.floor(block1.y / n) * n;

                    } else if (
                        block1.x + (rect1[0] * n) == block2.x + (rect2[0] * n) &&
                        block1.y + (rect1[1] * n) == block2.y + (rect2[1] * n) &&
                        block1 != block2 &&
                        // !(block1.shadow && !block2.shadow) &&
                        // !(!block1.shadow && block2.shadow) &&
                        !block1.speed &&
                        !block2.speed
                    ) {
                        console.warn('umm physics?');
                        if (blocks.indexOf(block1) > blocks.indexOf(block2)) {
                            !block2.shadow && (block1.y -= n);
                            block1.speed = 0;
                        } else {
                            !block1.shadow && (block2.y -= n);
                            block2.speed = 0;
                        }

                    }

                }
            }
        }
    }
}

function lineCheck(y) {
    // check line
    var empty = true;
    var br = false;
    var count = 0;
    var rects_to_remove = [];

    for (var x = 0; x < Math.floor(canvas.width / n); x++) {

        for (let block of blocks) {
            for (let rect of block.states[block.state].rects) {
                if (
                    (rect[0] * n) + block.x == x * n &&
                    (rect[1] * n) + block.y == y * n &&
                    !block.speed &&
                    !block.shadow
                ) {

                    rects_to_remove.push({ block, index: block.states[block.state].rects.indexOf(rect) });
                    empty = false;
                    br = true;
                    count++;

                    break;
                }

                if (br) break;
            }
            if (br) {
                br = false;
                break;
            }
        }

    }

    rects_to_remove.reverse();

    if (count != Math.floor(canvas.width / n)) return false;
    return rects_to_remove;
}

function lineCheckTimeout(i) {
    var q = lineCheck(i);
    var list = [];
    if (q) {
        for (let rect of q) {
            rect.block.states[rect.block.state].rects.splice(rect.index, 1);
        }



        for (let b of blocks) {

            if (b.y < i * n && b.type != "floor" && !b.shadow) {
                for (let x = 0; x < n; x++) {
                    setTimeout(() => {
                        b.y += 1;
                    }, 5 * x)
                }
                scoreSet(500, i);

            }
            shadow_set(blocks[blocks.length - 1]);

        }
    }
}

function check(x, y, b) {
    for (let block of blocks) {
        for (let rect of block.states[block.state].rects) {
            if (
                (rect[0] * n) + block.x == x * n &&
                (rect[1] * n) + block.y == y * n &&
                b != block &&
                !block.shadow &&
                !b.shadow
                /* &&
                b.type != "floor" && 
                block.type != "floor" */
            ) {
                return true;
            }
        }
    }
    return false;
}

function gameLoop() {

    let temp = ctx.fillStyle;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = temp;

    blockCheck();

    for (var i = 0; i < Math.floor(canvas.height / n); i++) {
        var q = lineCheck(i);
        if (q) {
            setTimeout(lineCheckTimeout, 500, i);
        }
    }


    if (cover_layers <= 110 / 3 && cover_layers.toString() != "NaN") {
        for (let i of tetris_logo) {
            var t = ctx.fillStyle;
            ctx.fillStyle = i[4];
            ctx.fillRect(i[0], i[1], i[2], i[3]);
            ctx.fillStyle = t;
        }
        ctx.fillStyle = "rgba(0, 0, 0, " + Math.abs(cover_layers) * 0.03 + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        cover_layers++;

    } else { // score display
        ctx.fillStyle = "white";
        ctx.font = "45px Tahoma"
        ctx.fillText(score, 25, 60);
    }

    if (held) {
        held.x = 0;
        held.y = 0;
        held.uw = 0.5;
        held.uh = 0.5;
        ctx.font = "25px Tahoma"
        ctx.fillText("Hold: ", canvas.width - 100, 50)
        held.draw(canvas.width - (100 - held.w / n * 2), 75);
    }

    loop && requestAnimationFrame(gameLoop);
}

function add(x = Math.floor((canvas.width / 2) / n) - 1, type, state, speed, y = 0, w, h, color) {

    blocks.push(new Block(x * n, y * n, type, state || "N", speed || 5, color ? { color } : undefined, w, h));

    var b = blocks[blocks.length - 1];
    var destroy = false;
    for (let rect of b.states[b.state].rects) {

        if (check(rect[0] + (b.x / n), rect[1] + (b.y / n), b)) {
            destroy = true;
            break;
        }
    }
    if (destroy && rules) {
        blocks.splice(blocks.length - 1, 1);
        console.warn(`Block could not be placed. Physics would not be happy.`);
        blocks.splice(0, 2);
        for (let b of blocks) {
            b.speed = 5
        }

        rules = false;

        setTimeout(() => {
            // Y
            add(1, "L", "N", 2, 0 - 5, 0.5, 0.5, "red");
            add(2, "Z", "E", 2, 0.5 - 5, 0.5, 0.5, "red");

            // O
            add(3.5, "L", "N", 2, 0.5 - 5, 0.5, 0.5, "red");
            add(4, "L", "S", 2, 0.5 - 5, 0.5, 0.5, "red");

            // U
            add(5.5, "L", "N", 2, 0.5 - 5, 0.5, 0.5, "red");
            add(6.5, "J", "N", 2, 0.5 - 5, 0.5, 0.5, "red");

            // L
            add(1, "L", "N", 2, 3.5 - 5, 0.5, 0.5, "red");

            // O
            add(2.5, "L", "N", 2, 3.5 - 5, 0.5, 0.5, "red");
            add(3, "L", "S", 2, 3.5 - 5, 0.5, 0.5, "red");

            // S
            add(5, "L", "E", 2, 3.5 - 5, 0.5, 0.5, "red");
            add(4.5, "L", "W", 2, 4.5 - 5, 0.5, 0.5, "red");

            // E
            add(7, "J", "S", 2, 3.5 - 5, 0.5, 0.5, "red");
            add(7.5, "T", "S", 2, 4 - 5, 0.5, 0.5, "red");
            add(7, "J", "E", 2, 5 - 5, 0.5, 0.5, "red");



            for (let i = 1; i <= 14; i++) {
                setTimeout((t) => {
                    blocks[blocks.length - i].speed = 10;
                    if (t == 14) {
                        setTimeout(() => {
                            loop = false;
                            setTimeout(() => {
                                ctx.fillStyle = "green";
                                ctx.font = "50px Cursive"
                                ctx.strokeStyle = "lightgreen";
                                ctx.beginPath();
                                ctx.roundRect(canvas.width / 2 - 115, canvas.height / 2 - 75, 220, 110, 40);
                                ctx.stroke();
                                ctx.fillStyle = "white";
                                ctx.fillText("Retry?", canvas.width / 2 - 80, canvas.height / 2);

                                started = false;
                                blocks = [];
                                score = 0;
                                first_game = false;

                            }, 100);
                        }, 2000)
                    }
                }, 100 * i + 1500, i);


            }

        }, 1000);

    } else {
        shadow_set(blocks[blocks.length - 1]);
    }


}

class Block {
    constructor(x, y, type = "square", state = "N", speed = 1, data = { color: undefined, border: undefined, shadow: false }, w = 1, h = 1) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.type = type;
        this.rects = [];
        this.state = state;
        data.border && (this.border = data.border);
        this.shadow = data.shadow;
        this.uw = w;
        this.uh = h;

        switch (type) {
            case "square": {

                this.h = h * 1;
                this.w = w * 1;
                this.states = {
                    "N": {
                        rects: [
                            [0, 0]
                        ],
                        holesTop: {
                            1: 0
                        },
                        holesBottom: {
                            1: 0
                        }
                    }
                }
            } break;

            case "O": {
                this.color = "rgb(145, 238, 18)";
                this.h = h * 2;
                this.w = w * 2;
                this.states = {
                    "N": {
                        rects: [
                            [0, 0],
                            [1, 0],
                            [0, 1],
                            [1, 1],
                        ],
                        holesTop: {
                            1: 0,
                            2: 0
                        },
                        holesBottom: {
                            1: 0,
                            2: 0
                        }
                    }
                }
            } break;
            case "I": {

                this.color = "rgb(149, 157, 90)";
                this.h = h * 4;
                this.w = w * 1;

                this.states = {
                    "N": {
                        rects: [
                            [0, 0],
                            [0, 1],
                            [0, 2],
                            [0, 3]
                        ],
                        holesTop: {
                            1: 0
                        },
                        holesBottom: {
                            1: 0
                        }
                    },
                    "E": {
                        rects: [
                            [0, 0],
                            [1, 0],
                            [2, 0],
                            [3, 0]
                        ],
                        holesTop: {
                            1: 0,
                            2: 0,
                            3: 0,
                            4: 0
                        },
                        holesBottom: {
                            1: 0,
                            2: 0,
                            3: 0,
                            4: 0
                        }
                    }
                }
            } break;
            case "S": {

                this.color = "rgb(39, 98, 139)";
                this.h = h * 2;
                this.w = w * 3;

                this.states = {
                    "N": {
                        rects: [
                            [1, 0],
                            [2, 0],
                            [0, 1],
                            [1, 1]
                        ],
                        holesTop: {
                            1: 1,
                            2: 0,
                            3: 0
                        },
                        holesBottom: {
                            1: 0,
                            2: 0,
                            3: 1
                        }
                    },
                    "E": {
                        rects: [
                            [0, 0],
                            [0, 1],
                            [1, 1],
                            [1, 2]
                        ],
                        holesTop: {
                            1: 0,
                            2: 1
                        },
                        holesBottom: {
                            1: 1,
                            2: 0
                        }
                    }
                }
            } break;
            case "Z": {

                this.color = "rgb(33, 132, 84)";
                this.h = h * 2;
                this.w = w * 3;

                this.states = {
                    "N": {
                        rects: [
                            [0, 0],
                            [1, 0],
                            [1, 1],
                            [2, 1]
                        ],
                        holesTop: {
                            1: 0,
                            2: 0,
                            3: 1
                        },
                        holesBottom: {
                            1: 1,
                            2: 0,
                            3: 0
                        }
                    },
                    "E": {
                        rects: [
                            [1, 0],
                            [0, 1],
                            [1, 1],
                            [0, 2]
                        ],
                        holesTop: {
                            1: 1,
                            2: 0
                        },
                        holesBottom: {
                            1: 0,
                            2: 1
                        }
                    }
                }
            } break;
            case "L": {

                this.color = "rgb(150, 188, 40)";
                this.h = h * 3;
                this.w = w * 2;

                this.states = {
                    "N": {
                        rects: [
                            [0, 0],
                            [0, 1],
                            [0, 2],
                            [1, 2]
                        ],
                        holesTop: {
                            1: 0,
                            2: 2
                        },
                        holesBottom: {
                            1: 0,
                            2: 0
                        }
                    },
                    "E": {
                        rects: [
                            [0, 0],
                            [1, 0],
                            [2, 0],
                            [0, 1]
                        ],
                        holesTop: {
                            1: 0,
                            2: 0,
                            3: 0
                        },
                        holesBottom: {
                            1: 0,
                            2: 1,
                            3: 1
                        }
                    },
                    "S": {
                        rects: [
                            [0, 0],
                            [1, 0],
                            [1, 1],
                            [1, 2]
                        ],
                        holesTop: {
                            1: 0,
                            2: 0
                        },
                        holesBottom: {
                            1: 2,
                            2: 0
                        }
                    },
                    "W": {
                        rects: [
                            [2, 0],
                            [0, 1],
                            [1, 1],
                            [2, 1]
                        ],
                        holesTop: {
                            1: 1,
                            2: 1,
                            3: 0
                        },
                        holesBottom: {
                            1: 0,
                            2: 0,
                            3: 0
                        }
                    }
                }
            } break;
            case "J": {

                this.color = "rgb(36, 56, 197)";
                this.h = h * 3;
                this.w = w * 2;

                this.states = {
                    "N": {
                        rects: [
                            [1, 0],
                            [1, 1],
                            [0, 2],
                            [1, 2]
                        ],
                        holesTop: {
                            1: 2,
                            2: 0
                        },
                        holesBottom: {
                            1: 0,
                            2: 0
                        }
                    },
                    "E": {
                        rects: [
                            [0, 0],
                            [0, 1],
                            [1, 1],
                            [2, 1]
                        ],
                        holesTop: {
                            1: 0,
                            2: 1,
                            3: 1
                        },
                        holesBottom: {
                            1: 0,
                            2: 0,
                            3: 0
                        }
                    },
                    "S": {
                        rects: [
                            [0, 0],
                            [1, 0],
                            [0, 1],
                            [0, 2]
                        ],
                        holesTop: {
                            1: 0,
                            2: 0
                        },
                        holesBottom: {
                            1: 0,
                            2: 2
                        }
                    },
                    "W": {
                        rects: [
                            [0, 0],
                            [1, 0],
                            [2, 0],
                            [2, 1]
                        ],
                        holesTop: {
                            1: 0,
                            2: 0,
                            3: 0
                        },
                        holesBottom: {
                            1: 1,
                            2: 1,
                            3: 0
                        }
                    }
                }
            } break;
            case "T": {

                this.color = "rgb(76, 25, 209)";
                this.h = h * 2;
                this.w = w * 3;

                this.states = {
                    "N": {
                        rects: [
                            [0, 0],
                            [1, 0],
                            [2, 0],
                            [1, 1]
                        ],
                        holesTop: {
                            1: 0,
                            2: 0,
                            3: 0
                        },
                        holesBottom: {
                            1: 1,
                            2: 0,
                            3: 1
                        }
                    },
                    "E": {
                        rects: [
                            [1, 0],
                            [0, 1],
                            [1, 1],
                            [1, 2]
                        ],
                        holesTop: {
                            1: 1,
                            2: 0
                        },
                        holesBottom: {
                            1: 1,
                            2: 0
                        }
                    },
                    "S": {
                        rects: [
                            [1, 0],
                            [0, 1],
                            [1, 1],
                            [2, 1]
                        ],
                        holesTop: {
                            1: 1,
                            2: 0,
                            3: 1
                        },
                        holesBottom: {
                            1: 0,
                            2: 0,
                            3: 0
                        }
                    },
                    "W": {
                        rects: [
                            [0, 0],
                            [0, 1],
                            [1, 1],
                            [0, 2]
                        ],
                        holesTop: {
                            1: 0,
                            2: 1
                        },
                        holesBottom: {
                            1: 0,
                            2: 1
                        }
                    }
                }

            } break;
            case "floor": {
                this.h = canvas.width / n;
                this.w = canvas.width / n;

                this.states = {
                    "N": {
                        rects: []
                    }
                }
                for (let i = 0; i < this.w; i++) {
                    for (let j = 0; j < this.w * 2; j++) {
                        this.states["N"].rects.push([i, j]);
                    }
                }
                this.color = "black";
                this.speed = 0;
            } break;
        }

        if (this.shadow) this.color = "white";
        if (data.color) this.color = data.color;

        this.h *= n;
        this.w *= n;

        this.rotate(this.state, true);
        this.update();


    }
    draw(x = 0, y = 0) {
        this.update()
        ctx.fillStyle = this.color;

        if (this.border) {
            ctx.strokeStyle = this.border;
            ctx.lineWidth = "1";
        } else {
            ctx.strokeStyle = "";
            ctx.lineWidth = "0";
        }

        for (let rect of this.states[this.state].rects) {


            ctx.fillRect(
                x + this.x + rect[0] * n * this.uw,
                y + this.y + rect[1] * n * this.uh,
                n * this.uw,
                n * this.uh
            );

            this.border && ctx.strokeRect(
                x + this.x + rect[0] * n * this.uw,
                y + this.y + rect[1] * n * this.uh,
                n * this.uw,
                n * this.uh
            );

        }
    }

    rotate(dir, init = false) {

        this.update();



        let prev = this.state;
        this.state = dir;

        if (
            ((this.state == "N" || this.state == "S") && (prev == "E" || prev == "W")) ||
            ((this.state == "E" || this.state == "W") && (prev == "N" || prev == "S")) ||
            (init && dir != "N" && dir != "S")
        ) {
            let temp = this.h;
            this.h = this.w;
            this.w = temp;
        }

        if (this.w + this.x > canvas.width && this.type != "floor" && rules) {
            this.rotate(prev)
            return false;
        } else return true;

    }

    update() {

        if (!this.states[this.state]) {
            if (this.state == "S") this.state = "N";
            if (this.state == "W") this.state = "E";

            if (!this.states[this.state]) {
                this.state = "N";
            }

        }
    }
}


var c = qs('#canvas');
var ctx = c.getContext('2d');



var x = 0;
var y = 0;
ctx.fillStyle = "lightblue";
ctx.strokeStyle = "black";
ctx.lineWidth = 0.1;
var blocks = [];


var z = n;

function dropBlock() {

    add(undefined, ["O", "I", "J", "L", "S", "Z", "T"][Math.floor(Math.random() * 7)], ["N", "E", "S", "W"][Math.floor(Math.random() * 4)], 2)
}


window.addEventListener('keydown', e => {


    var b = blocks[blocks.length - 1];

    if (!b) return;

    var executed = false;



    var dirs = Object.keys(b.states);

    if (loop) {
        if (e.key == "ArrowUp") {
            executed = b.rotate(dirs[(dirs.indexOf(b.state) + 1) % dirs.length]);

        } else if (e.key == "ArrowLeft" && b.x - n >= 0) {
            b.x -= n;
            executed = true;
            setTimeout(() => {
                if (b.speed == 0) {
                    b.x += n /* * 2 */;
                    b.speed = 1
                }
                executed = false;
            }, 100);
        } else if (e.key == "ArrowRight" && b.x + b.w + n <= Math.floor(canvas.width / n) * n) {

            b.x += n;
            executed = true;

            setTimeout(() => {
                if (b.speed == 0) {
                    b.x -= n /* * 2 */;
                    b.speed = 1
                }
                executed = false;
            }, 100);
        } else if (e.key == "ArrowDown") {
            blocks[blocks.length - 1].speed = 80
        } else if (e.key == "c") {
            hold();
            executed = true;
        }
    }

    if (e.key == "Escape") {
        if (loop) {
            loop = false;
        } else {
            loop = true;
            gameLoop();
        }
    }

    ["ArrowLeft", "ArrowRight", /* "ArrowDown", */ "ArrowUp", "C"].includes(e.key) && started && executed && shadow_set(b);


})

qs('canvas').addEventListener("click", function () {
    if (!started) {
        document.body.style.backgroundColor = "black";
        setTimeout(() => { cover_layers = -100 / 3, reset() }, first_game ? 1350 : 0);
        var interval = setInterval(() => {
            if (cover_layers <= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    dropBlock();
                    started = true
                }, first_game ? 2000 : 1500);
            }
        }, 100)


    }
})

function reset() {
    started = false;
    loop = true;
    rules = true;
    score = 0;
    held = undefined;
    gameLoop();
    blocks.push(new Block(0, Math.floor(canvas.height / n) * n, "floor"));
    blocks.push(new Block(0, 0, "square", "N", 0, {}));
}
