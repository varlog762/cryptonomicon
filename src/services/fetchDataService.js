const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com';

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

const loadPrices = async () => {
  if (!tickersHandlers.size) {
    return;
  }

  const PATH = `/data/pricemulti?fsyms=${Array.from(tickersHandlers.keys()).join(',')}&tsyms=USD&api_key=${API_KEY}`;

  const responseData = await fetchData(`${BASE_URL}${PATH}`);

  const updatedPrices = Object.fromEntries(
    Object.entries(responseData).map(([name, price]) => [name, Object.values(price)[0]])
  );

  Object.entries(updatedPrices).forEach(([tickerName, price]) => {
    const handlers = tickersHandlers.get(tickerName) || [];
    handlers.forEach((fn) => fn(price));
  });
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
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};

setInterval(loadPrices, 5000);

window.tickers = tickersHandlers;
