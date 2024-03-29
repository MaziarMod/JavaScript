/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/

var scores, roundScore, activePlayer, dice, gamePlaying;

init();

    document.querySelector(".btn-roll").addEventListener('click', () => {
        if (gamePlaying) {

            //1. random number
            dice = Math.floor(Math.random() * 6) + 1 // create random number between 1-6

            //2. Display the result
            var diceDOM = document.querySelector('.dice');
            diceDOM.style.display = 'block';
            diceDOM.src = "dice-" + dice + '.png';

            //3. Update the run score IF the rolled number was Not 1
            if (dice !== 1){
              //Add score
              roundScore += dice;
              document.querySelector("#current-" + activePlayer).textContent = roundScore;

            } else {
              nextPlayer();
            }

        }
    });

    document.querySelector('.btn-hold').addEventListener('click', () => {
        if (gamePlaying) {

            // Add current score to the global score
            scores[activePlayer] += roundScore ;

            //Update the UI
            document.querySelector("#score-" + activePlayer).textContent = scores[activePlayer]

            //check if the player won the game
            if (scores[activePlayer] >= 20){
                document.querySelector("#name-" + activePlayer).textContent = 'Winner!!!';
                document.querySelector(".dice").style.display = 'none';
                document.querySelector(".player-" + activePlayer + '-panel').classList.add('winner');
                document.querySelector(".player-" + activePlayer + '-panel').classList.remove('active');

                // document.querySelector(".btn-roll").disabled = true;
                // document.querySelector(".btn-hold").disabled = true;
                gamePlaying = false;

            } else {
                //Next player
                nextPlayer();
            }
        }

    });

    function nextPlayer() {
        document.querySelector("#current-" + activePlayer).textContent = '0';
        activePlayer = activePlayer ? 0 : 1; // change the activePlayer status
        roundScore = 0; // reset the roundScore for new activePlayer

        //document.querySelector('.player-'+ activePlayer + '-panel').classList.remove('active');
        //document.querySelector('.player-'+ activePlayer + '-panel').classList.add('active');

        document.querySelector('.player-0-panel').classList.toggle('active');
        document.querySelector('.player-1-panel').classList.toggle('active');
        diceDOM.style.display = 'none';
    }

    document.querySelector('.btn-new').addEventListener('click', init);

    function init(){

        scores = [0, 0];
        activePlayer = 0;
        roundScore = 0;
        gamePlaying = true;

        //document.querySelector("#current-" + activePlayer).textContent = dice;
        //document.querySelector("#current-" + activePlayer). innerHTML = '<strong>' + dice + '</strong>'
        document.querySelector("#name-0").textContent = 'Player 1';
        document.querySelector("#name-1").textContent = 'Player 2';

        document.querySelector(".dice").style.display = 'none';
        document.querySelector("#score-0").textContent = '0';
        document.querySelector("#current-0").textContent = '0';
        document.querySelector("#score-1").textContent = '0';
        document.querySelector("#current-1").textContent = '0';

        document.querySelector('.player-0-panel').classList.remove('winner');
        document.querySelector('.player-1-panel').classList.remove('winner');

        document.querySelector('.player-0-panel').classList.remove('active');
        document.querySelector('.player-1-panel').classList.remove('active');

        document.querySelector('.player-0-panel').classList.add('active');
    }