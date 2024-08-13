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

export const loadAvailableTickers = async () => {
  try {
    const responseData = await fetchData(`${BASE_URL}/data/all/coinlist?summary=true`);

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
