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
let map = document.getElementById('map');
let mapTranslateY = document.getElementById('translate-y');
let mapTranslateX = document.getElementById('translate-x');
let playerSprite = document.getElementById("player");
let input = {forward:'w',back:'s',left:'a',right:'d'};
let immovableTiles = [2, 3];

// Testing
let coords = document.getElementById('coords');

document.addEventListener('keydown', function(e) {
    switch (e.key.toLowerCase()) {
        case input.forward:
            player.rot = 0;
            if (!tileIsMovable(player.pos.x, player.pos.y - 1)) {
                break;
            }
            translateMap('forward');
            player.pos.y--;
            break;
        case input.back:
            player.rot = 180;
            if (!tileIsMovable(player.pos.x, player.pos.y + 1)) {
                break;
            }
            translateMap('back');
            player.pos.y++;
            break;
        case input.left:
            player.rot = 270;
            if (!tileIsMovable(player.pos.x - 1, player.pos.y)) {
                break;
            }
            translateMap('left');
            player.pos.x--;
            break;
        case input.right:
            player.rot = 90;
            if (!tileIsMovable(player.pos.x + 1, player.pos.y)) {
                break;
            }
            translateMap('right');
            player.pos.x++;
            break;
    }
    // updatePlayerSprite();
    // drawMap();
    drawCanvasMap();
    coords.innerText = player.pos.x + " " + player.pos.y; // Testing
});

// for (let i = 0; i < (MAP_VIEW_SIZE + 2) ** 2; i++) {
//     map.innerHTML += '<div class="tile"></div>'
// }

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

function translateMap(direction) {
    const speed = `0.13s`;
    switch(direction) {
        case 'forward':
            mapTranslateY.style.animation = `none`
            void mapTranslateY.offsetWidth;
            mapTranslateY.style.animation = `move-down ` + speed;
            break;
        case 'back':
            mapTranslateY.style.animation = `none`
            void mapTranslateY.offsetWidth;
            mapTranslateY.style.animation = `move-up ` + speed;
            break;
        case 'left':
            mapTranslateX.style.animation = `none`
            void mapTranslateX.offsetWidth;
            mapTranslateX.style.animation = `move-right ` + speed;
            break;
        case 'right':
            mapTranslateX.style.animation = `none`
            void mapTranslateX.offsetWidth;
            mapTranslateX.style.animation = `move-left ` + speed;
            break;
    }
}

function drawMap() {
    for (let i = 0; i < (MAP_VIEW_SIZE + 2); i++) {
        for (let j = 0; j < (MAP_VIEW_SIZE + 2); j++) {
            let x = i + (player.pos.x - 8);
            let y = j + (player.pos.y - 8);

            let div = map.children[matrixToArray(i,j)];
            if (div === undefined || div === null) {
                console.log("Div. x: " + x + " y: " + y + " i: " + i + " j: " + j);
                continue;
            }

            let classList = div.classList;
            if (classList === undefined || classList === null) {
                console.log("classlist. x: " + x + " y: " + y + " i: " + i + " j: " + j);
                continue;
            }

            if (x < 0 || y < 0) {
                classList.remove('grass', 'stone');
                continue;
            }

            if (y >= tileMap.length || x >= tileMap[y].length) {
                classList.remove('grass', 'stone');
                continue;
            }

            switch (tileMap[y][x]) {
                case 0:
                    classList.remove('grass', 'stone');
                    break;
                case 1:
                    classList.add('grass');
                    classList.remove('stone');
                    break;
                case 2:
                    classList.add('stone');
                    classList.remove('grass');
            }
        }
    }
}

function updatePlayerSprite() {
    switch (player.rot) {
        case 0:
            playerSprite.style.backgroundImage = 'url("assets/player0.png")';
            break;
        case 90:
            playerSprite.style.backgroundImage = 'url("assets/player1.png")';
            break;
        case 180:
            playerSprite.style.backgroundImage = 'url("assets/player2.png")';
            break;
        case 270:
            playerSprite.style.backgroundImage = 'url("assets/player3.png")';
            break;
    }
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

function matrixToArray(x, y) {
    return (x + (y * (MAP_VIEW_SIZE + 2)));
}

assetManager.loadFile('assets/map.csv', 'map', assetManagerCallback);