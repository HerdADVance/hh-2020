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

const card1 = document.getElementById('card1');

Promise.all([
  //connect(onGameOver),
  //downloadAssets(),
]).then(() => {
  
  card1.classList.add(DECK[3].suit + DECK[3].rank);
  
  usernameInput.focus();
  
  joinGame.onclick = () => {

    play(usernameInput.value);
    joinContainer.classList.add('hidden');

    initState();
    //startCapturingInput();
    //startRendering();
    //setLeaderboardHidden(false);

  };
}).catch(console.error);


function onGameOver() {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
}
