// set player
// 1: player 01 moves
// 2: player 01 moves
// 3: no one moves
let flag;
$(document).ready(function() {
    const init = function() {
        // 0. set the flag
        flag = Math.floor(Math.random() * 2 + 1);

        // 1. create 2D-Array
        initMatrix();

        // 2. create the players and weapons.
        createWeapons();
        createPlayers();

        // 3. set random positions
        setRandomPosition();

        // 4. active the click event on canvas
        clickToMove();

        // 5. focus on a player that starts the game (by default)
        focusPlayer(flag);

        // 6. create the html content for the message box
        let msgBox_content = '<h2 id="playerInturn"></h2> <button class="btn choice attack" id="btn-attack">ATTACK</button> <button class="btn choice defense" id="btn-defense">DEFENSE</button>';

        $(DOMStrings.msgBox).html(msgBox_content);

        // 7. hide the message-box
        $(DOMStrings.msgBox).removeClass("message-box--active");
    }

    function setRandomPosition() {
        /*  
        The function set the random postions on the map from 00 - 99 and then will initially set up the objectsData matrix and playersData matrix as following:

        // in objectsData matrix
        0 - walkables
        1: obstacles
        4: weapon 1
        5: weapon 2
        6: weapon 3
        7: weapon 4
        8: weapon 0

        // in playersData matrix
        1: player 1
        2: player 2
        */
        let randomPositions, obstacles, weapons, players;
        randomPositions = [];
        players = [];

        // loop until we have 16 random numbers
        while (randomPositions.length != 16) {
            let i = Math.floor(Math.random() * Math.pow(boardSize, 2));
            //if (randomPositions.indexOf(i) == -1) {
            randomPositions.push(i);
            //}

            //positions of obstacles and weapon can be the same. If this happens, the weapon will be overwitten by the obstacle, and can not be collected by Players.
        }

        // 12 of 16 are position for obstacles
        obstacles = randomPositions.slice(0, 12);

        // 4 of 16 are positions for weapon
        weapons = randomPositions.slice(12);

        // random position for2 Players
        while (players.length != 2) {

            // get a random number
            let i = Math.floor(Math.random() * Math.pow(boardSize, 2));

            // if the number is unique
            if (players.indexOf(i) == -1 && randomPositions.indexOf(i) == -1) {
                players.push(i);
            }

            //if we have 2 posision, we need to make sure the distance between them != 1 at the beginning of game.
            if (players.length == 2) {

                //posA, posB in format [Ax,Ay]  && [Bx,By]
                let posA = turnIntoCoord(players[0]);
                let posB = turnIntoCoord(players[1]);

                // if distance == 1, then they pop out the 2nd position and re-loop the while loop to get a new position.
                if (distance(posA, posB) == 1) {
                    players.pop();
                }
            }
        }


        // now we have all the positions of things on the map but in the Integer format.
        // We want to convert all the position to format [long, lat]
        // Apply map() function for Array and using the turnIntoCoord() function to achieve that.

        obstacles = obstacles.map((curr) => curr = turnIntoCoord(curr));
        weapons = weapons.map((curr) => curr = turnIntoCoord(curr));
        players = players.map((curr) => curr = turnIntoCoord(curr));



        // Now, we have 3 arrays  obstacles, weapons, players. We need to initiate the objectsData matrix by using forEach();

        // weapons are represented by numbers from 4 to 7
        weapons.forEach((curr, index) => { objectsData[curr[0]][curr[1]] = index + 4 });

        // players are represented on the board playersData by 1 || 2
        players.forEach((curr, index) => { playersData[curr[0]][curr[1]] = index + 1 });

        // Obstacles are representedby 1
        obstacles.forEach((curr) => { objectsData[curr[0]][curr[1]] = 1 });




        // 4. assign default weapon to both players.
        player1.weapon = weapon0;
        player2.weapon = weapon0;

        // 5. assign position for players
        player1.position = players[0];
        player2.position = players[1];
    }

    const renderScene = function() {

        drawGrid();

        // 2. Loop through the objectsData matrix and playersData matrix to position draw corresponding things on map 
        let tileType = 0;

        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {

                tileType = objectsData[i][j];

                // where in the matrix the number 1
                if (tileType == 1) {
                    drawObstacle(i, j);

                    // if there is a Player01 at the coordination
                } else if (player1.position[0] == i && player1.position[1] == j) {
                    drawPlayer(player1);

                    // if there is a Player02 at the coordination
                } else if (player2.position[0] == i && player2.position[1] == j) {
                    drawPlayer(player2);

                    // if value from 4 - 8, then draw weapons.
                } else if ([4, 5, 6, 7, 8].indexOf(tileType) != -1) {
                    drawWeapon(tileType, i, j);
                } else {

                }
            }
        }
    }

    const renderPlayerDetails = function() {
        // Update player's detail in the detailBox (both sides of the canvas)
        let p1_health, p2_health, p1_weapon, p2_weapon, p1_shield_state, p2_shield_state;

        p1_health = player1.lifePoint < 0 ? 0 : player1.lifePoint;
        p1_weapon = player1.weapon;
        p1_shield_state = player1.shieldState == false ? "ATTACK" : "DEFENSE";


        p2_health = player2.lifePoint < 0 ? 0 : player2.lifePoint;
        p2_weapon = player2.weapon;
        p2_shield_state = player2.shieldState == false ? "ATTACK" : "DEFENSE";


        $(DOMStrings.player1LifePoint).text(p1_health);
        $(DOMStrings.player1ShieldState).text(p1_shield_state);
        $(DOMStrings.player1Damage).text(p1_weapon.damage);

        $(DOMStrings.player2LifePoint).text(p2_health);
        $(DOMStrings.player2ShieldState).text(p2_shield_state);
        $(DOMStrings.player2Damage).text(p2_weapon.damage);


        switch (p1_weapon.ID) {
            case 4:
                $(DOMStrings.player1Weapon).attr('src', 'img/weapons/w1-big.png');
                break;
            case 5:
                $(DOMStrings.player1Weapon).attr('src', 'img/weapons/w2-big.png');
                break;
            case 6:
                $(DOMStrings.player1Weapon).attr('src', 'img/weapons/w3-big.png');
                break;
            case 7:
                $(DOMStrings.player1Weapon).attr('src', 'img/weapons/w4-big.png');
                break;
            default:
                $(DOMStrings.player1Weapon).attr('src', 'img/weapons/w0-big.png');
        }


        switch (p2_weapon.ID) {
            case 4:
                $(DOMStrings.player2Weapon).attr('src', 'img/weapons/w1-big.png');
                break;
            case 5:
                $(DOMStrings.player2Weapon).attr('src', 'img/weapons/w2-big.png');
                break;
            case 6:
                $(DOMStrings.player2Weapon).attr('src', 'img/weapons/w3-big.png');
                break;
            case 7:
                $(DOMStrings.player2Weapon).attr('src', 'img/weapons/w4-big.png');
                break;
            default:
                $(DOMStrings.player2Weapon).attr('src', 'img/weapons/w0-big.png');
        }
    }


    const beginFight = function(player1, player2) {
        /*
        use to check if a fight can begin.
        */
        console.log("is checking fight.");
        // if 2 players stand next to each other. Then call the beginFight method of each player.
        if (distance(player1.position, player2.position) == 1) {
            player1.fight(player2);
            player2.fight(player1);
        }

        return new Promise((resolve, reject) => {
            // return promise to make sure the fight is finished, before we check if the game is over.
            resolve();
        });
    }

    const gameover = function() {

        // set the condition to end the game.
        let p1_blood = player1.lifePoint;
        let p2_blood = player2.lifePoint;

        // the game ends if one of 2 players are dead or both
        if (p1_blood <= 0 || p2_blood <= 0) {
            let msg;

            // if both players die at the same time.
            if (p1_blood <= 0 && p2_blood <= 0) {
                msg = `<h3>Draw</h3><h2>GAME OVER</h2>`;
            } else if (p2_blood > 0) {
                msg = `<h3> ${player2.name} won.</h3><h2>GAME OVER</h2>`;
            } else {
                msg = `<h3> ${player1.name} won.</h3><h2>GAME OVER</h2>`;
            }

            // display the message to message-box
            $(DOMStrings.msgBox).html(msg);
            // add class active to the msg-box
            $(DOMStrings.msgBox).addClass("message-box--active");
        } else {
            // if the game is not end. Then return a Promise and let player update shield.
            return new Promise((resolve, reject) => {
                resolve();
            });
        }

    }

    const update = function() {
        /*
        this function will be called with setInterval() to make sure the board always be up-to-date
        */
        renderScene();
        renderPlayerDetails();

        // draw possible moves of current player
        if (flag == 1) {
            drawPossibleMoves(player1.position);
        } else if (flag == 2) {
            drawPossibleMoves(player2.position);
        }
    }

    const clickToMove = function() {

        // move the current player with click event
        $(DOMStrings.canvas).on("click", function(e) {
            let currentPlayer;

            // 1. grap the current player.
            let players = [player1, player2];

            //console.log(e.pageX, e.pageY);
            //console.log($(this).offset().left, $(this).offset().top);

            // 2. calculate the clicked point on the map
            x = Math.floor((e.pageX - $(this).offset().left) / tileWidth);
            y = Math.floor((e.pageY - $(this).offset().top) / tileWidth);

            let target = [y, x];

            // 3. move the player based on the flag value
            if (flag == 1) {
                currentPlayer = players[0];
            } else if (flag == 2) {
                currentPlayer = players[1];
            }

            // 4. we use Asynchronous Promise.
            // move -> check fight -> check game over -> update shield.
            currentPlayer.moveTo(target)
                .then(() => {
                    return beginFight(player1, player2);
                })
                .then(() => {
                    return gameover();
                })
                .then(() => {
                    currentPlayer.updateShieldState();
                });


            // 5. if click on attack button then shieldState = false, else true
            // we must unbind the "click" event first to avoid double-binding
            $(DOMStrings.optionBtn).unbind("click").on("click", e => {

                // 1. which button was clicked on?
                let btn = e.target;

                if (btn.id == "btn-attack") {
                    currentPlayer.shieldState = false;
                } else if (btn.id == "btn-defense") {
                    currentPlayer.shieldState = true;
                }


                // 2. hide the message-box
                $(DOMStrings.msgBox).removeClass("message-box--active");

                // 3. in the moveTo() method of Player(), we set flag = 3. After choosing defense || attack, set the flag to currentPlayer.ID
                flag = currentPlayer.ID;

                // 4. swap the player                
                flag == 1 ? flag = 2 : flag = 1;

                // 5. focus on the next Player
                focusPlayer(flag);

                // 6. re-active click event for the canvas
                clickToMove();
            });
        });
    }

    const focusPlayer = function(flag) {
        if (flag == 1) {
            $(DOMStrings.player2DetailBox).removeClass('active');
            $(DOMStrings.player1DetailBox).addClass('active');
        } else if (flag == 2) {
            $(DOMStrings.player1DetailBox).removeClass('active');
            $(DOMStrings.player2DetailBox).addClass('active');
        }
    }



    // RULES button
    $(DOMStrings.rulesBtn).unbind("click").on("click", function(e) {
        e.preventDefault();
        $(DOMStrings.rulesBox).toggleClass("rules-active");
    });


    // NEW GAME button
    $(DOMStrings.newgameBtn).unbind("click").on("click", function(e) {

        // initiate the game
        init();

        //update the UI with speed of 60 frames per Second
        setInterval(update, 1000 / 60);

        // random damage of weapon each 3s
        setInterval(createWeapons, 3000);

        // hide the RULES box if it's on display.
        $(DOMStrings.rulesBox).removeClass("rules-active");
    });

    drawGrid();
});