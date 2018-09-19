const turnIntoCoord = function(x) {

    /*
    convert an Integer into [lat, long]
  
    INPUT:  integer, boardSize (N x N)
  
    OUTPUT: [lat, long]
    */

    //lat = index of ROW
    //long = index of COLUMN
    let long, lat;
    long = parseInt(x % boardSize);
    lat = Math.floor(x / boardSize);

    return [lat, long];
}

const distance = function(posA, posB) {
    /*
    calculate the distance between Point A[Ax, Ay] and Point B[Bx, By]
    using the formula: d = sqrt((x1-x2)^2 + (y1-y2)^2)
    */
    let distance = Math.sqrt(Math.pow(posA[0] - posB[0], 2) + Math.pow(posA[1] - posB[1], 2));

    return distance;
}

const calcPath = function(currPos, target) {
    /* 
    INPUT: A[x, y]   &   B[x1, y1]
    OUTPUT: an array of points that the player would pass through, if he go from A to B
    */
    let d, cX, cY, tX, tY, path;

    d = distance(currPos, target);

    cX = currPos[0];
    cY = currPos[1];

    tX = target[0];
    tY = target[1];

    // if user clicks on the same line (horizontally || vertically)
    if (cX == tX || cY == tY) {

        path = [];

        // direction means backwards || forwards || up || down
        //  1 : forwards || down
        // -1 : backwards || up
        let direction = (cY < tY || cX < tX) ? 1 : -1;

        if (cX == tX) {
            //moving horizontally
            let moveY = cY;
            for (let i = 0; i < d; i++) {
                moveY += direction;
                path.push([cX, moveY]);
            }
        } else if (cY == tY) {
            //moving vertically
            let moveX = cX;
            for (let i = 0; i < d; i++) {
                moveX += direction;
                path.push([moveX, cY]);
            }
        }
    }

    return path;
}

const validatePath = function(path) {
    /* 
    function that check, if the moving path is possible from the current position.
  
    INPUT: [x, y] & path [[x1, y1], [x2, y2],...]
  
    OUTPUT: true / false
    */
    // if path is not undefined.
    if (path) {
        let d = path.length;
        // 1st condition is: maximal 3 cells
        if (d <= 3) {
            // loop through path with   for ... of ...
            for (let i of path) {

                // if there exists an obstacle || a player in the path, then return false immediately.
                if (objectsData[i[0]][i[1]] == 1 || [1, 2].indexOf(playersData[i[0]][i[1]]) != -1) {
                    return false;
                }
            }
            return true;
        }
    } else {
        return false;
    }
}

const calcValidAreaToMove = function(playerPos) {

    /* depends on current position of player, the function will calculate all valid points on map that the player can move to in his turn, both horizontally and vertically
  
    // INPUT: player's current position [x, y]
    // OUTPUT: valid area that the player can move to in his turn.
                [[x1, y1]. [x2, y2],...]
  
    */

    let X = playerPos[0];
    let Y = playerPos[1];

    // max. 3 tiles each turn.
    let stepsMax = 3;

    // max. Area inside the board that Player can move (invalid points inclusive. Ex: a obstacle point)
    let movingArea = [];

    for (let i = -1 * stepsMax; i <= stepsMax; i++) {

        // all possible points on the same row
        if (0 <= Y + i && Y + i < boardSize && i != 0) {
            // points must be inside the board.
            let point = [X, Y + i];

            // path from the player to this point
            let path = calcPath(playerPos, point);

            // if the path is valid
            if (validatePath(path)) {
                movingArea.push(point);
            }
        }

        // all possible points in the same column
        if (0 <= X + i && X + i < boardSize && i != 0) {
            let point = [X + i, Y];

            // path from the player to this point
            let path = calcPath(playerPos, point);

            // if the path is valid
            if (validatePath(path)) {
                movingArea.push(point);
            }
        }
    }

    return movingArea;
}

const onWeapon = function(currPlayer) {
    /*
    the function check if the player is standing on a weapon.
    
    INPUT: current player position.
    OUTPUT: true / false
    */
    let weapons = [4, 5, 6, 7, 8]; // IDs of weapons on the board.

    let playerX = currPlayer.position[0];
    let playerY = currPlayer.position[1];

    return weapons.indexOf(objectsData[playerX][playerY]) != -1;
}