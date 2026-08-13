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
    }
}

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const TILE_SIZE = 32;

const grassImage = new Image();
grassImage.src = "assets/grass.png";

const stoneImage = new Image();
stoneImage.src = "assets/stone.png";

const playerImages = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

playerImages[0].src = "assets/player0.png";
playerImages[1].src = "assets/player1.png";
playerImages[2].src = "assets/player2.png";
playerImages[3].src = "assets/player3.png";

const assetManager = new AssetManager();
const MAP_VIEW_SIZE = 15;
let tileMap;
let player = new Player(new Vector(4,4), 0);
let input = {forward:'w',back:'s',left:'a',right:'d'};
let immovableTiles = [2, 3];

// Testing
let coords = document.getElementById('coords');

document.addEventListener('keydown', function(e) {
    switch (e.key.toLowerCase()) {
        case input.forward:
            player.rot = 0;

            if (tileIsMovable(player.pos.x, player.pos.y - 1)) {
                player.pos.y--;
            }
            break;

        case input.back:
            player.rot = 180;

            if (tileIsMovable(player.pos.x, player.pos.y + 1)) {
                player.pos.y++;
            }
            break;

        case input.left:
            player.rot = 270;

            if (tileIsMovable(player.pos.x - 1, player.pos.y)) {
                player.pos.x--;
            }
            break;

        case input.right:
            player.rot = 90;

            if (tileIsMovable(player.pos.x + 1, player.pos.y)) {
                player.pos.x++;
            }
            break;
    }

    drawCanvasMap();
    coords.innerText = player.pos.x + " " + player.pos.y;
});

function drawTile(tileId, screenX, screenY) {
    const pixelX = screenX * TILE_SIZE;
    const pixelY = screenY * TILE_SIZE;

    switch (tileId) {
        case 1:
            ctx.drawImage(
                grassImage,
                pixelX,
                pixelY,
                TILE_SIZE,
                TILE_SIZE
            );
            break;

        case 2:
            ctx.drawImage(
                stoneImage,
                pixelX,
                pixelY,
                TILE_SIZE,
                TILE_SIZE
            );
            break;
    }
}

function drawCanvasMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const halfView = Math.floor((MAP_VIEW_SIZE + 2) / 2);

    for (let screenY = 0; screenY < MAP_VIEW_SIZE + 2; screenY++) {
        for (let screenX = 0; screenX < MAP_VIEW_SIZE + 2; screenX++) {

            const mapX = player.pos.x - halfView + screenX;
            const mapY = player.pos.y - halfView + screenY;

            if (
                mapY < 0 ||
                mapY >= tileMap.length ||
                mapX < 0 ||
                mapX >= tileMap[mapY].length
            ) {
                continue;
            }

            drawTile(
                tileMap[mapY][mapX],
                screenX,
                screenY
            );
        }
    }

    drawCanvasPlayer();
}

function drawCanvasPlayer() {
    const centerTile = Math.floor((MAP_VIEW_SIZE + 2) / 2);

    let image;

    switch (player.rot) {
        case 0:
            image = playerImages[0];
            break;
        case 90:
            image = playerImages[1];
            break;
        case 180:
            image = playerImages[2];
            break;
        case 270:
            image = playerImages[3];
            break;
    }

    ctx.drawImage(
        image,
        centerTile * TILE_SIZE,
        centerTile * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
    );
}

function tileIsMovable(x, y) {
    if (
        y < 0 ||
        y >= tileMap.length ||
        x < 0 ||
        x >= tileMap[y].length
    ) {
        return false;
    }

    return !immovableTiles.includes(tileMap[y][x]);
}

function assetManagerCallback() {
    tileMap = assetManager
        .get('map')
        .trim()
        .split("\n")
        .map(row => row.split(",").map(Number));

    // drawMap();
    drawCanvasMap();
}

assetManager.loadFile('assets/map.csv', 'map', assetManagerCallback);