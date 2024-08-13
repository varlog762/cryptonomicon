const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'wss://streamer.cryptocompare.com';
const AGGREGATE_INDEX = '5';

//DATA LOADING VIA HTTP IMPLEMENTED IN 'load-data-via-http' BRANCH!!!

const socket = new WebSocket(`${BASE_URL}/v2?api_key=${API_KEY}`);

socket.addEventListener('message', (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: price } = JSON.parse(e.data);

  if (type === AGGREGATE_INDEX) {
    const handlers = tickersHandlers.get(currency) || [];
    handlers.forEach((fn) => fn(price));
  }
});

const subscribeToTickerOnWs = (ticker) => {
  const message = JSON.stringify({
    action: 'SubAdd',
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

const fetchData = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch datax:', error);
  }
};

export const loadAvailableTickers = async () => {
  try {
    const PATH = '/data/all/coinlist?summary=true';

    const responseData = await fetchData(`${BASE_URL}${PATH}`);

    if (responseData.Data) {
      return Object.values(responseData.Data).map((ticker) => ({
        symbol: ticker?.Symbol,
        fullName: ticker?.FullName
      }));
    }

    throw new Error('Bad response');
  } catch (error) {
    console.error('Failed to fetch available tickers:', error);
  }
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};

window.tickers = tickersHandlers;
