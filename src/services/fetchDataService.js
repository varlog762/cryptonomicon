const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY;
const BASE_URL = 'https://min-api.cryptocompare.com';

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
  async fetchTickerPriceFromApi(tickerName) {
    const PATH = `/data/price?fsym=${tickerName}&tsyms=USD&api_key=${API_KEY}`;

    return await fetchData(`${BASE_URL}${PATH}`);
  },
  async fetchAvailableTickers() {
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
  }
};
