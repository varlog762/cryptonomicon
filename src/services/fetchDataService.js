const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com';

const tickers = new Map();

const fetchData = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch datax:', error);
  }
};

export default {
  async loadPrices(tickerNames) {
    if (Array.isArray(tickerNames)) {
      tickerNames = tickerNames.join(',');
    }

    const PATH = `/data/pricemulti?fsyms=${tickerNames}&tsyms=USD&api_key=${API_KEY}`;

    const responseData = await fetchData(`${BASE_URL}${PATH}`);

    const tickersWithPrices = Object.fromEntries(
      Object.entries(responseData).map(([name, price]) => [name, Object.values(price)[0]])
    );

    return tickersWithPrices;
  },
  async loadAvailableTickers() {
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
  },
  subscribeToTicker(ticker, cb) {
    const subscribers = tickers.get(ticker) || [];
    tickers.set(ticker, [...subscribers, cb]);
  },
  unsubscribeFromTicker(ticker, cb) {
    const subscribers = tickers.get(ticker) || [];
    tickers.set(
      ticker,
      subscribers.filter((fn) => fn !== cb)
    );
  }
};
