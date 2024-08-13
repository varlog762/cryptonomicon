const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'wss://streamer.cryptocompare.com';
const AGGREGATE_INDEX = '5';
const ADD_SUBSCRIBE_ACTION = 'SubAdd';
const REMOVE_SUBSCRIBE_ACTION = 'SubRemove';

//DATA LOADING VIA HTTP IMPLEMENTED IN 'load-data-via-http' BRANCH!!!

const socket = new WebSocket(`${BASE_URL}/v2?api_key=${API_KEY}`);

socket.addEventListener('message', (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: price } = JSON.parse(e.data);

  if (type === AGGREGATE_INDEX) {
    const handlers = tickersHandlers.get(currency) || [];
    handlers.forEach((fn) => fn(price));
  }
});

const togleSubscribeToTickerOnWs = (ticker, action) => {
  const message = JSON.stringify({
    action: action,
    subs: [`5~CCCAGG~${ticker}~USD`]
  });

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(message);
    },
    { once: true }
  );
};

const tickersHandlers = new Map();

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  togleSubscribeToTickerOnWs(ticker, ADD_SUBSCRIBE_ACTION);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  togleSubscribeToTickerOnWs(ticker, REMOVE_SUBSCRIBE_ACTION);
};

window.tickers = tickersHandlers;
