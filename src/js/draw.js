const tile_padding = 6;

// size of file images
const icon_real_size = 64;

// size of icon that appear on the board
const icon_drawn_size = tileWidth - 2 * tile_padding;

const drawGrid = function() {

    //draw the background.
    ctx.fillStyle = "#805006";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // using for loop to draw the grid
    for (let i = 1; i < boardSize; i++) {
        ctx.beginPath();
        ctx.strokeStyle = "#A46400";
        //draw verticle lines of the board.
        ctx.moveTo(tileWidth * i, 0);
        ctx.lineTo(tileWidth * i, boardWidth);

        //draw the horizontal lines of the board.
        ctx.moveTo(0, tileWidth * i);
        ctx.lineTo(boardWidth, tileWidth * i);
        ctx.stroke();
    }

    // add black spots at crossing points of 2 line
    for (let i = 1; i < boardSize; i++) {
        for (let j = 1; j < boardSize; j++) {
            ctx.fillStyle = "black";
            ctx.fillRect(tileWidth * j - 1.2, tileWidth * i - 1.2, 2.5, 2.5);
            ctx.fill();
        }
    }
}

const drawObstacle = function(x, y) {
    /*
    draw an obstacle at [x, y] on the board.
    */
    let obstacle;
    obstacle = imgs.obstacle;
    x = x * tileWidth + 2 * tile_padding;
    y = y * tileWidth + tile_padding;

    ctx.drawImage(obstacle, 0, 0, icon_real_size, icon_real_size, y, x, icon_drawn_size, icon_drawn_size);
}

const drawWeapon = function(ID, x, y) {
    /*
    4: weapon 1
    5: weapon 2
    6: weapon 3
    7: weapon 4
    8: weapon 0 (default)
    */
    let weapon;
    x = x * tileWidth + tile_padding;
    y = y * tileWidth + tile_padding;
    switch (ID) {
        case 4:
            weapon = imgs.weapon1;
            break;
        case 5:
            weapon = imgs.weapon2;
            break;
        case 6:
            weapon = imgs.weapon3;
            break;
        case 7:
            weapon = imgs.weapon4;
            break;
        case 8:
            weapon = imgs.weapon0;
    }

    ctx.drawImage(weapon, 0, 0, icon_real_size, icon_real_size, y, x, icon_drawn_size, icon_drawn_size);
}

const drawPlayer = function(player) {
    /*
    1: player 1
    2: player 2
    */
    let playerImg;

    if (player.ID == 1) {
        playerImg = imgs.player1;
    } else if (player.ID == 2) {
        playerImg = imgs.player2;
    }


    let x = player.position[0] * tileWidth + 2 * tile_padding - 2.5;
    let y = player.position[1] * tileWidth + tile_padding;

    ctx.drawImage(playerImg, 0, 0, icon_real_size, icon_real_size, y, x, icon_drawn_size, icon_drawn_size);
}

const drawPossibleMoves = function(playerPos) {

    /*highlight all valid tiles that player can go to in his turn.*/

    // array of all valid points based on Player's current position
    let validPoints = calcValidAreaToMove(playerPos);

    // loop through the array and for each point, we draw a rectangle
    validPoints.forEach((curr) => {

        let y = curr[0] * tileWidth + 4.5;
        let x = curr[1] * tileWidth + 4.5;
        ctx.strokeStyle = "#258391";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tileWidth - 9, tileWidth - 9);
    });
}