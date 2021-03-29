let appWidth = 1280;
let appHeight = 720;

let app = new PIXI.Application({width: window.innerWidth, height: window.innerHeight});

window.onresize = () => {
    app.renderer.autoResize = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
}

let leftArrow = keyboard("ArrowLeft");
let rightArrow = keyboard("ArrowRight");
let upArrow = keyboard("ArrowUp");
let downArrow = keyboard("ArrowDown");

let assets = {
    frog: "images/frog.png"
}

let sprites = {};

document.body.appendChild(app.view);

app.loader.add([
        assets.frog
    ]).load(setup);

function setup() {
    sprites.frog = new PIXI.Sprite(app.loader.resources[assets.frog].texture);

    sprites.frog.width = 32;
    sprites.frog.height = 32;

    sprites.frog.x = (app.view.width / 2) - (sprites.frog.width / 2);
    sprites.frog.y = (app.view.height / 2) - (sprites.frog.height / 2);

    sprites.frog.velocity = {x: 0, y: 0}

    app.stage.addChild(sprites.frog);
    app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {

    sprites.frog.x += sprites.frog.velocity.x * delta;
    sprites.frog.y += sprites.frog.velocity.y * delta;

    sprites.frog.x = clamp(sprites.frog.x, 0, app.view.width - sprites.frog.width);
    sprites.frog.y = clamp(sprites.frog.y, 0, app.view.height - sprites.frog.height);
}

function clamp(num, min, max) {
    return Math.max(min, Math.min(num, max));
}

leftArrow.press = () => {
    sprites.frog.velocity.x = -5;
};

leftArrow.release = () => {
    if(sprites.frog.velocity.x == -5) {
        sprites.frog.velocity.x = 0;
    }
};

rightArrow.press = () => {
    sprites.frog.velocity.x = 5;
};

rightArrow.release = () => {
    if(sprites.frog.velocity.x == 5) {
        sprites.frog.velocity.x = 0;
    }
};

downArrow.press = () => {
    sprites.frog.velocity.y = 5;
};

downArrow.release = () => {
    if(sprites.frog.velocity.y == 5) {
        sprites.frog.velocity.y = 0;
    }
};

upArrow.press = () => {
    sprites.frog.velocity.y = -5;
};

upArrow.release = () => {
    if(sprites.frog.velocity.y == -5) {
        sprites.frog.velocity.y = 0;
    }
};