import C from '@/constants/constants';

//DATA LOADING VIA HTTP IMPLEMENTED IN 'load-data-via-http' BRANCH!!!

const sharedWorker = new SharedWorker(new URL('../workers/sharedWorker.js', import.meta.url));
sharedWorker.port.start();

sharedWorker.port.addEventListener('message', (e) => {
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
      sharedWorker.port.postMessage(removeUsdSubscribeMessage);
      sharedWorker.port.postMessage(addUsdtSubscribeMessage);
      return;
    }
  }
  if (newPrice) {
    const currencyPair = getMapKeyFromTickerName(currency);
    const handlers = tickersHandlers.get(currencyPair) || [];
    handlers.forEach((fn) => fn(newPrice));
  }
});

const createMessageToWebSocket = (action, firstCurrency, secondCurrency = C.USD) => {
  const message = {
    action: action,
    subs: [`5~CCCAGG~${firstCurrency}~${secondCurrency}`]
  };

  return JSON.stringify(message);
};

const tickersHandlers = new Map();

const getMapKeyFromTickerName = (tickerName) => {
  return Array.from(tickersHandlers.keys())
    .filter((pair) => {
      return Object.keys(pair)[0] === tickerName;
    })
    .at(0);
};

export const subscribeToTicker = (tickerName, cb) => {
  const currencyPair = {
    [tickerName]: C.USD
  };

  const subscribers = tickersHandlers.get(currencyPair) || [];
  tickersHandlers.set(currencyPair, [...subscribers, cb]);

  const messageToWebSocket = createMessageToWebSocket(C.ADD_SUBSCRIBE_ACTION, tickerName);
  sharedWorker.port.postMessage(messageToWebSocket);
};

export const unsubscribeFromTicker = (tickerName) => {
  const currencyPair = getMapKeyFromTickerName(tickerName);

  const [firstCurrency, secondCurrency] = Object.entries(currencyPair)[0];
  tickersHandlers.delete(currencyPair);

  const messageToWebSocket = createMessageToWebSocket(
    C.REMOVE_SUBSCRIBE_ACTION,
    firstCurrency,
    secondCurrency
  );
  sharedWorker.port.postMessage(messageToWebSocket);
};

window.tickers = tickersHandlers;
