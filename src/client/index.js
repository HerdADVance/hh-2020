// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#3-client-entrypoints
import { connect, play } from './networking';
// import { startRendering, stopRendering } from './render';
// import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
// import { setLeaderboardHidden } from './leaderboard';

import{ DECK } from '../shared/deck';

import './css/main.css';

const joinContainer = document.getElementById('join-container');
const joinGame = document.getElementById('join-game');
const usernameInput = document.getElementById('username-input');
const myUsername = document.getElementById('my-username');

const playHand = document.getElementById('play-hand');

document.addEventListener('click', function (event) {
    if (!event.target.matches('.card')) return;
    event.preventDefault();
    event.target.classList.toggle('selected');
}, false);

Promise.all([
  //connect(onGameOver),
  //downloadAssets(),
]).then(() => {
  
  //card1.classList.add(DECK[3].suit + DECK[3].rank);
  
  usernameInput.focus();
  
  joinGame.onclick = () => {

    play(usernameInput.value);
    myUsername.textContent = usernameInput.value;
    joinContainer.classList.add('hidden');

    initState();
    //startCapturingInput();
    //startRendering();
    //setLeaderboardHidden(false);

  };

  playHand.onclick = () => {
    let cards = document.getElementsByClassName('card');
    console.log(cards);
  }

}).catch(console.error);


function onGameOver() {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
}
