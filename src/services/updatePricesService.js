import C from '@/constants/constants';

//DATA LOADING VIA HTTP IMPLEMENTED IN 'load-data-via-http' BRANCH!!!

const socket = new WebSocket(`${C.BASE_URL_WS}/v2?api_key=${C.API_KEY}`);

socket.addEventListener('message', (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: fromSymbol,
    PRICE: price,
    INFO: errorInfo,
    PARAMETER: param
  } = JSON.parse(e.data);

  let newPrice = price;
  let currency = fromSymbol;

  if (type === C.BAD_RESPONSE_TYPE && !errorInfo.includes('pair')) {
    newPrice = C.UNKNOWN_TICKER_PRICE;
    currency = param.split('~').at(2);
  }

  if (newPrice) {
    const handlers = tickersHandlers.get(currency);
    handlers.forEach((fn) => fn(newPrice));
  }
});

const toggleSubscribeToTickerOnWs = (ticker, action) => {
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
  toggleSubscribeToTickerOnWs(ticker, C.ADD_SUBSCRIBE_ACTION);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  toggleSubscribeToTickerOnWs(ticker, C.REMOVE_SUBSCRIBE_ACTION);
};

window.tickers = tickersHandlers;
