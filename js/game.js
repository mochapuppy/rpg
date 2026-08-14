import AssetManager from "./asset_manager.js";
import TILE_TYPES from "./tiles.js";

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

        // X/Y collision footprint, in tiles.
        this.width = 0.6;
        this.height = 0.6;

        // Z is continuous height above the floor, also measured in tiles.
        this.z = 0;
        this.velocityZ = 0;
        this.bodyHeight = 0.8;
        this.onGround = true;
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

const playerImages = [];

for (let i = 0; i < 8; i++) {
    const image = new Image();
    image.src = `assets/sprites/player${i}.png`;
    playerImages.push(image);
}

const assetManager = new AssetManager();
let mapLayers = [];

const spriteSheet = new Image();
spriteSheet.src = "assets/sprites/sprite_sheet.png";
let player = new Player(new Vector(4,4), 0);
let input = {forward:'w',back:'s',left:'a',right:'d'};

// Vertical movement, in tile units.
const GRAVITY = 18;
const JUMP_SPEED = 7;
const GROUND_Z = 0;


// Testing
let coords = document.getElementById('coords');

const keys = {};
const justPressed = {};

document.addEventListener("keydown", function(e) {
    const key = e.key.toLowerCase();

    if (!keys[key]) {
        justPressed[key] = true;
    }

    keys[key] = true;
});

document.addEventListener("keyup", function(e) {
    keys[e.key.toLowerCase()] = false;
});

function update(deltaTime) {
    // Prevent huge physics steps after tabbing away / debugger pauses.
    deltaTime = Math.min(deltaTime, 0.05);

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

    // Jump only on the key-down edge, not every frame Space is held.
    if (justPressed[" "] && player.onGround) {
        player.velocityZ = JUMP_SPEED;
        player.onGround = false;
    }

    // Update vertical physics before X/Y collision so the current Z controls
    // whether a wall still intersects the player's body.
    //
    // While falling, check whether the player's feet crossed a standable top
    // surface. This is what lets layer_1 act as a Z=1 platform and layer_2 as
    // a Z=2 platform (for ordinary height-1 tiles).
    const previousZ = player.z;

    player.velocityZ -= GRAVITY * deltaTime;
    const nextZ = player.z + player.velocityZ * deltaTime;

    if (player.velocityZ <= 0) {
        const landingZ = findLandingSurface(
            player.pos.x,
            player.pos.y,
            previousZ,
            nextZ
        );

        if (landingZ !== null) {
            player.z = landingZ;
            player.velocityZ = 0;
            player.onGround = true;
        } else {
            player.z = nextZ;
            player.onGround = false;
        }
    } else {
        player.z = nextZ;
        player.onGround = false;
    }

    const nextX = player.pos.x + moveX * currentSpeed * deltaTime;
    const nextY = player.pos.y + moveY * currentSpeed * deltaTime;

    if (positionIsWalkable(nextX, player.pos.y, player.z)) {
        player.pos.x = nextX;
    }

    if (positionIsWalkable(player.pos.x, nextY, player.z)) {
        player.pos.y = nextY;
    }

    // Clear one-frame input flags.
    for (const key in justPressed) {
        delete justPressed[key];
    }
}

let lastTime = performance.now();

function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    update(deltaTime);
    render();

    coords.innerText =
        "X " + player.pos.x.toFixed(2) + "  " +
        "Y " + player.pos.y.toFixed(2) + "  " +
        "Z " + player.z.toFixed(2) + "  " +
        "vZ " + player.velocityZ.toFixed(2);

    requestAnimationFrame(gameLoop);
}

function drawTile(tileId, pixelX, pixelY) {
    if (tileId === 0) return;

    const tileType = TILE_TYPES[tileId];
    const sprite = tileType?.sprite;

    if (!sprite) return;

    ctx.drawImage(
        spriteSheet,
        sprite.x,
        sprite.y,
        sprite.width,
        sprite.height,
        pixelX,
        pixelY,
        RENDER_TILE_SIZE,
        RENDER_TILE_SIZE
    );
}

// For this rendering pass, each X/Y position shows only the highest
// non-empty tile. Lower layers are hidden until alpha/occlusion rules exist.
function getTopVisibleTile(mapX, mapY) {
    for (let layerIndex = mapLayers.length - 1; layerIndex >= 0; layerIndex--) {
        const layer = mapLayers[layerIndex];
        const tileId = layer?.[mapY]?.[mapX] ?? 0;

        if (tileId !== 0) {
            return tileId;
        }
    }

    return 0;
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
                mapY >= mapLayers[0].length ||
                mapX < 0 ||
                mapX >= mapLayers[0][mapY].length
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
                getTopVisibleTile(mapX, mapY),
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

    // Z does not change the squirrel's world Y coordinate. This is only a
    // visual lift so jumping reads clearly in the top-down view.
    const jumpPixelOffset = Math.round(player.z * RENDER_TILE_SIZE * 0.55);

    ctx.drawImage(
        image,
        Math.round(centerX - spriteSize / 2),
        Math.round(centerY - spriteSize / 2 - jumpPixelOffset),
        spriteSize,
        spriteSize
    );
}

// layer_0 is the base floor at Z=0. layer_1 contains the first block-height
// above that floor, so a normal height-1 tile there has a top at Z=1.
// layer_2 begins at Z=1, so a normal height-1 tile there has a top at Z=2.
// A tile can still be taller than one unit: its TILE_TYPES height extends its
// top beyond the normal layer boundary.
function getLayerBaseZ(layerIndex) {
    return Math.max(0, layerIndex - 1);
}

function getTileId(layerIndex, tileX, tileY) {
    return mapLayers[layerIndex]?.[tileY]?.[tileX] ?? 0;
}

function getTileVolume(layerIndex, tileId) {
    const tileType = TILE_TYPES[tileId];
    const height = tileType?.height ?? 0;

    if (height <= 0) return null;

    const bottom = getLayerBaseZ(layerIndex);

    return {
        bottom,
        top: bottom + height,
        standable: tileType.standable === true
    };
}

function getPlayerTileBounds(x, y) {
    const halfWidth = player.width / 2;
    const halfHeight = player.height / 2;
    const EPSILON = 0.0001;

    return {
        left: Math.floor(x - halfWidth),
        right: Math.floor(x + halfWidth - EPSILON),
        top: Math.floor(y - halfHeight),
        bottom: Math.floor(y + halfHeight - EPSILON)
    };
}

// Find the highest standable surface that the player's feet crossed during
// this falling step. Checking the full previousZ -> nextZ interval prevents
// the squirrel from tunneling through a platform on a fast frame.
function findLandingSurface(x, y, previousZ, nextZ) {
    const bounds = getPlayerTileBounds(x, y);
    const EPSILON = 0.0001;
    let landingZ = null;

    // The base world floor remains Z=0 for this pass.
    if (
        previousZ >= GROUND_Z - EPSILON &&
        nextZ <= GROUND_Z + EPSILON
    ) {
        landingZ = GROUND_Z;
    }

    for (let tileY = bounds.top; tileY <= bounds.bottom; tileY++) {
        for (let tileX = bounds.left; tileX <= bounds.right; tileX++) {
            for (let layerIndex = 1; layerIndex < mapLayers.length; layerIndex++) {
                const tileId = getTileId(layerIndex, tileX, tileY);
                if (tileId === 0) continue;

                const volume = getTileVolume(layerIndex, tileId);
                if (!volume?.standable) continue;

                const surfaceZ = volume.top;
                const crossedSurface =
                    previousZ >= surfaceZ - EPSILON &&
                    nextZ <= surfaceZ + EPSILON;

                if (
                    crossedSurface &&
                    (landingZ === null || surfaceZ > landingZ)
                ) {
                    landingZ = surfaceZ;
                }
            }
        }
    }

    return landingZ;
}

function positionIsWalkable(x, y, z = player.z) {
    const bounds = getPlayerTileBounds(x, y);
    const EPSILON = 0.0001;

    // layer_0 defines the map's X/Y footprint for now.
    const worldHeight = mapLayers[0]?.length ?? 0;
    const worldWidth = mapLayers[0]?.[0]?.length ?? 0;

    for (let tileY = bounds.top; tileY <= bounds.bottom; tileY++) {
        for (let tileX = bounds.left; tileX <= bounds.right; tileX++) {
            if (
                tileY < 0 ||
                tileY >= worldHeight ||
                tileX < 0 ||
                tileX >= worldWidth
            ) {
                return false;
            }

            // Check every physical layer. A layer_1 height-1 stone occupies
            // Z=0..1; a layer_2 height-1 stone occupies Z=1..2. Therefore:
            // - standing exactly on a top surface does not block X/Y movement
            // - hitting the side while vertically overlapping does block it
            // - sufficiently high jumps can pass over the object
            for (let layerIndex = 1; layerIndex < mapLayers.length; layerIndex++) {
                const tileId = getTileId(layerIndex, tileX, tileY);
                if (tileId === 0) continue;

                const volume = getTileVolume(layerIndex, tileId);
                if (!volume) continue;

                const playerBottom = z;
                const playerTop = z + player.bodyHeight;

                const overlapsVertically =
                    playerBottom < volume.top - EPSILON &&
                    playerTop > volume.bottom + EPSILON;

                if (overlapsVertically) {
                    return false;
                }
            }
        }
    }

    return true;
}

function assetManagerCallback() {
    mapLayers = [
        assetManager.getCSV('layer_0'),
        assetManager.getCSV('layer_1'),
        assetManager.getCSV('layer_2')
    ];

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// assetManager.loadFile('assets/maps/map.csv', 'map', assetManagerCallback);

assetManager.loadFiles([
    { path: 'assets/maps/layer_0.csv', name: 'layer_0' },
    { path: 'assets/maps/layer_1.csv', name: 'layer_1' },
    { path: 'assets/maps/layer_2.csv', name: 'layer_2' }
], assetManagerCallback);