import C from '@/constants/constants';

//DATA LOADING VIA HTTP IMPLEMENTED IN 'load-data-via-http' BRANCH!!!

const sharedWorker = new SharedWorker('sharedWorker.js');

sharedWorker.port.addEventListener('message', (e) => {
  e;
  // const {
  //   TYPE: type,
  //   FROMSYMBOL: fromSymbol,
  //   PRICE: price,
  //   INFO: errorInfo,
  //   PARAMETER: param
  // } = JSON.parse(e.data);
  // let newPrice = price;
  // let currency = fromSymbol;
  // if (type === C.BAD_RESPONSE_TYPE) {
  //   newPrice = '-';
  //   currency = param.split('~').at(2);
  //   if (errorInfo.includes('pair')) {
  //     const removeUsdSubscribeMessage = createMessageToWebSocket(
  //       C.REMOVE_SUBSCRIBE_ACTION,
  //       currency,
  //       C.USD
  //     );
  //     const addUsdtSubscribeMessage = createMessageToWebSocket(
  //       C.ADD_SUBSCRIBE_ACTION,
  //       currency,
  //       C.USDT
  //     );
  //     toggleSubscribeToTickerOnWs(removeUsdSubscribeMessage);
  //     toggleSubscribeToTickerOnWs(addUsdtSubscribeMessage);
  //     return;
  //   }
  // }
  // if (newPrice) {
  //   const currencyPair = getMapKeyFromTickerName(currency);
  //   const handlers = tickersHandlers.get(currencyPair);
  //   handlers.forEach((fn) => fn(newPrice));
  // }
});

const createMessageToWebSocket = (action, firstCurrency, secondCurrency = C.USD) => ({
  action: action,
  subs: [`5~CCCAGG~${firstCurrency}~${secondCurrency}`]
});

const toggleSubscribeToTickerOnWs = (messageToWebSocket) => {
  const stringifiedMessage = JSON.stringify(messageToWebSocket);

  sharedWorker.port.postMessage(stringifiedMessage);
  console.log(stringifiedMessage);
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
  toggleSubscribeToTickerOnWs(messageToWebSocket);
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

  toggleSubscribeToTickerOnWs(messageToWebSocket);
};

window.tickers = tickersHandlers;
