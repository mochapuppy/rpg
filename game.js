import AssetManager from "./asset_manager.js";

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Player {
    constructor(pos, rot) {
        this.pos = pos;
        this.rot = rot;
        this.speed = 4; // tiles per second

        this.width = 0.6;
        this.height = 0.6;
    }
}

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const VIEW_TILE_COUNT = 11;
const TILE_SIZE = 16;
const RENDER_SCALE = 4;
const RENDER_TILE_SIZE = TILE_SIZE * RENDER_SCALE;

const CANVAS_SIZE = VIEW_TILE_COUNT * RENDER_TILE_SIZE;

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

ctx.imageSmoothingEnabled = false;

const grassImage = new Image();
grassImage.src = "assets/grass.png";

const stoneImage = new Image();
stoneImage.src = "assets/stone.png";

const playerImages = [];

for (let i = 0; i < 8; i++) {
    const image = new Image();
    image.src = `assets/player${i}.png`;
    playerImages.push(image);
}

const assetManager = new AssetManager();
let tileMap;
let player = new Player(new Vector(4,4), 0);
let input = {forward:'w',back:'s',left:'a',right:'d'};
let immovableTiles = [2, 3];

// Testing
let coords = document.getElementById('coords');

const keys = {};

document.addEventListener("keydown", function(e) {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", function(e) {
    keys[e.key.toLowerCase()] = false;
});

function update(deltaTime) {
    let moveX = 0;
    let moveY = 0;

    if (keys[input.forward]) moveY -= 1;
    if (keys[input.back])    moveY += 1;
    if (keys[input.left])    moveX -= 1;
    if (keys[input.right])   moveX += 1;

    // Set facing direction
    if (moveX === 0 && moveY < 0)       player.rot = 0;
    else if (moveX > 0 && moveY < 0)    player.rot = 45;
    else if (moveX > 0 && moveY === 0)  player.rot = 90;
    else if (moveX > 0 && moveY > 0)    player.rot = 135;
    else if (moveX === 0 && moveY > 0)  player.rot = 180;
    else if (moveX < 0 && moveY > 0)    player.rot = 225;
    else if (moveX < 0 && moveY === 0)  player.rot = 270;
    else if (moveX < 0 && moveY < 0)    player.rot = 315;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
        const length = Math.hypot(moveX, moveY);
        moveX /= length;
        moveY /= length;
    }

    // Sprint
    const currentSpeed = keys["control"]
        ? player.speed * 1.50
        : player.speed;

    const nextX = player.pos.x + moveX * currentSpeed * deltaTime;

    const nextY = player.pos.y + moveY * currentSpeed * deltaTime;

    if (positionIsWalkable(nextX, player.pos.y)) {
        player.pos.x = nextX;
    }

    if (positionIsWalkable(player.pos.x, nextY)) {
        player.pos.y = nextY;
    }
}

let lastTime = performance.now();

function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    update(deltaTime);
    render();

    coords.innerText =
        player.pos.x.toFixed(2) + " " +
        player.pos.y.toFixed(2);

    requestAnimationFrame(gameLoop);
}

function drawTile(tileId, pixelX, pixelY) {
    let image;

    switch (tileId) {
        case 1:
            image = grassImage;
            break;

        case 2:
            image = stoneImage;
            break;

        default:
            return;
    }

    ctx.drawImage(
        image,
        pixelX,
        pixelY,
        RENDER_TILE_SIZE,
        RENDER_TILE_SIZE
    );
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const halfView = Math.floor(VIEW_TILE_COUNT / 2);

    const playerTileX = Math.floor(player.pos.x);
    const playerTileY = Math.floor(player.pos.y);

    const offsetX = Math.round(
        (player.pos.x - playerTileX) * RENDER_TILE_SIZE
    );

    const offsetY = Math.round(
        (player.pos.y - playerTileY) * RENDER_TILE_SIZE
    );

    for (let screenY = -1; screenY <= VIEW_TILE_COUNT; screenY++) {
        for (let screenX = -1; screenX <= VIEW_TILE_COUNT; screenX++) {

            const mapX =
                playerTileX - halfView + screenX;

            const mapY =
                playerTileY - halfView + screenY;

            if (
                mapY < 0 ||
                mapY >= tileMap.length ||
                mapX < 0 ||
                mapX >= tileMap[mapY].length
            ) {
                continue;
            }

            const pixelX =
                screenX * RENDER_TILE_SIZE
                - offsetX
                + RENDER_TILE_SIZE / 2;

            const pixelY =
                screenY * RENDER_TILE_SIZE
                - offsetY
                + RENDER_TILE_SIZE / 2;

            drawTile(
                tileMap[mapY][mapX],
                pixelX,
                pixelY
            );
        }
    }

    drawCanvasPlayer();
}

function drawCanvasPlayer() {
    const imageIndex = player.rot / 45;
    const image = playerImages[imageIndex];

    const spriteSize = RENDER_TILE_SIZE;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.drawImage(
        image,
        Math.round(centerX - spriteSize / 2),
        Math.round(centerY - spriteSize / 2),
        spriteSize,
        spriteSize
    );
}

function positionIsWalkable(x, y) {
    const halfWidth = player.width / 2;
    const halfHeight = player.height / 2;

    const left   = x - halfWidth;
    const right  = x + halfWidth;
    const top    = y - halfHeight;
    const bottom = y + halfHeight;

    const EPSILON = 0.0001;

    const leftTile   = Math.floor(left);
    const rightTile  = Math.floor(right - EPSILON);
    const topTile    = Math.floor(top);
    const bottomTile = Math.floor(bottom - EPSILON);

    for (let tileY = topTile; tileY <= bottomTile; tileY++) {
        for (let tileX = leftTile; tileX <= rightTile; tileX++) {

            if (
                tileY < 0 ||
                tileY >= tileMap.length ||
                tileX < 0 ||
                tileX >= tileMap[tileY].length
            ) {
                return false;
            }

            if (immovableTiles.includes(tileMap[tileY][tileX])) {
                return false;
            }
        }
    }

    return true;
}

function assetManagerCallback() {
    tileMap = assetManager
        .get('map')
        .trim()
        .split("\n")
        .map(row => row.split(",").map(Number));

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

assetManager.loadFile('assets/map.csv', 'map', assetManagerCallback);