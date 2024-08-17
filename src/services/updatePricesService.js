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

  if (type === C.BAD_RESPONSE_TYPE) {
    newPrice = '-';
    currency = param.split('~').at(2);

    if (errorInfo.includes('pair')) {
      const removeUsdSubscribeMessage = createMessageToWebSocket(
        C.REMOVE_SUBSCRIBE_ACTION,
        currency,
        C.USD
      );
      const addUsdtSubscribeMessage = createMessageToWebSocket(
        C.ADD_SUBSCRIBE_ACTION,
        currency,
        C.USDT
      );

      toggleSubscribeToTickerOnWs(removeUsdSubscribeMessage);
      toggleSubscribeToTickerOnWs(addUsdtSubscribeMessage);

      return;
    }
  }

  if (newPrice) {
    const currencyPair = getMapKeyFromTickerName(currency);
    console.log(currencyPair);

    const handlers = tickersHandlers.get(currencyPair);
    handlers.forEach((fn) => fn(newPrice));
  }
});

const createMessageToWebSocket = (action, firstCurrency, secondCurrency = C.USD) => ({
  action: action,
  subs: [`5~CCCAGG~${firstCurrency}~${secondCurrency}`]
});

const toggleSubscribeToTickerOnWs = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
};

const tickersHandlers = new Map();

const getMapKeyFromTickerName = (tickerName) => {
  return Array.from(tickersHandlers.keys())
    .filter((pair) => {
      return Object.keys(pair)[0] === tickerName;
    })
    .at(0);
};

export const subscribeToTicker = (ticker, cb) => {
  const tickersPair = {
    [ticker]: C.USD
  };

  const subscribers = tickersHandlers.get(tickersPair) || [];
  tickersHandlers.set(tickersPair, [...subscribers, cb]);

  const message = createMessageToWebSocket(C.ADD_SUBSCRIBE_ACTION, ticker);
  toggleSubscribeToTickerOnWs(message);
};

export const unsubscribeFromTicker = (tickerName) => {
  const currencyPair = getMapKeyFromTickerName(tickerName);

  const [firstCurrency, secondCurrency] = Object.entries(currencyPair)[0];
  tickersHandlers.delete(currencyPair);

  const message = createMessageToWebSocket(
    C.REMOVE_SUBSCRIBE_ACTION,
    firstCurrency,
    secondCurrency
  );

  toggleSubscribeToTickerOnWs(message);
};

window.tickers = tickersHandlers;
