// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#4-client-networking
import io from 'socket.io-client';
import { throttle } from 'throttle-debounce';
import { processGameUpdate, sendWaitingMessage, sendHand, sendHandWaitingMessage } from './state';

const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

export const connect = onGameOver => (
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
    socket.on(Constants.MSG_TYPES.WAITING_MESSAGE, sendWaitingMessage);
    socket.on(Constants.MSG_TYPES.SEND_HAND, sendHand);
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      document.getElementById('disconnect-modal').classList.remove('hidden');
      document.getElementById('reconnect-button').onclick = () => {
        window.location.reload();
      };
    });
  })
);

export const play = username => {
  socket.emit(Constants.MSG_TYPES.JOIN_LOBBY, username, socket.id);
  socket.on(Constants.MSG_TYPES.WAITING_MESSAGE, sendWaitingMessage);
  socket.on(Constants.MSG_TYPES.SEND_HAND, sendHand);
  socket.on(Constants.MSG_TYPES.HAND_WAITING_MESSAGE, sendHandWaitingMessage);
};

export const playHand = hand => {
  console.log(hand);
  
  socket.emit(Constants.MSG_TYPES.PLAY_HAND, hand, socket.id);
}

export const updateDirection = throttle(20, dir => {
  socket.emit(Constants.MSG_TYPES.INPUT, dir);
});
