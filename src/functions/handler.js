"use strict";
const axios = require('axios');
const { getPinnedProviders, toggleProviderPin } = require('../utils/db');
const { initializeDB } = require("../database/mongodb")

// Weather API configurations
const PROVIDERS = [
  {
    name: 'OpenWeatherMap',
    url: `https://api.openweathermap.org/data/2.5/weather?lat=19.0760&lon=72.8777&appid=3e678eb08a1805f1dde9dbb666dbaa42`,
  },
  {
    name: 'WeatherAPI',
    url: `https://api.weatherapi.com/v1/current.json?q=19.0760,72.8777&key=1cc87ae5261546aa90b61118242511`,
  },
  // {
  //   name: 'WeatherStack',
  //   url: `https://api.weatherstack.com/current?access_key=52b1d5eb942f513652a704b354d8a202`,
  // },
];

// Fetch weather data from a provider
const fetchProviderData = async (provider) => {
  try {
    const response = await axios.get(provider.url, { timeout: 5000 }); // Set a timeout for requests
    const data = response.data;
    if (!data) throw new Error("Empty response data");

    return {
      name: provider.name,
      temperature: data.main?.temp || data.current?.temp_c || null,
      windSpeed: data.wind?.speed || data.current?.wind_mph || null,
      humidity: data.main?.humidity || data.current?.humidity || null,
      cloud: data.clouds?.all || data.current?.cloud || null,
      isPinned: provider.isPinned, // Assume all providers are initially not pinned
    };
  } catch (error) {
    console.error(`Error fetching data from ${provider.name}: ${error.message}`);
    return { name: provider.name, error: error.message }; // Ensure a uniform return structure
  }
};

const fetchAllWeatherData = async () => {
  const pinnedProviders = await getPinnedProviders();

  const promises = PROVIDERS.map(fetchProviderData);
  const results = await Promise.allSettled(promises);

  return results.map((res, idx) => {
    const provider = PROVIDERS[idx];
    const isPinned = pinnedProviders.includes(provider.name);

    if (res.status === 'fulfilled') {
      return { ...res.value, isPinned };
    }

    console.error(`Failed to fetch from ${provider.name}:`, res.reason);
    return { name: provider.name, isPinned, error: res.reason.message };
  });
};


// Lambda Function: Fetch Weather Data
// module.exports.getWeather = async () => {
//   const pinnedProviders = await getPinnedProviders();
//   const promises = PROVIDERS.map(fetchProviderData);
//   const results = await Promise.all(promises);

//   const weatherData = results
//     .filter(Boolean)
//     .map((provider) => ({
//       ...provider,
//       isPinned: pinnedProviders.includes(provider.name),
//     }))
//     .sort((a, b) => b.isPinned - a.isPinned);

//   return {
//     statusCode: 200,
//     body: JSON.stringify(weatherData),
//   };
// };

// // Lambda Function: Toggle Pin Status
// module.exports.togglePin = async (event) => {
//   const { providerName } = JSON.parse(event.body);
//   if (!providerName) {
//     return {
//       statusCode: 400,
//       body: JSON.stringify({ error: 'Provider name is required.' }),
//     };
//   }

//   try {
//     const message = await toggleProviderPin(providerName);
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message }),
//     };
//   } catch (error) {
//     console.error('Error toggling pin status:', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: 'Internal Server Error' }),
//     };
//   }
// };
module.exports.getWeather = async () => {
  try {
    await initializeDB();
    const weatherData = await fetchAllWeatherData();

    return {
      statusCode: 200,
      body: JSON.stringify(weatherData),
    };
  } catch (error) {
    console.error('Error in getWeather handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};


module.exports.togglePin = async (event) => {
  try {
    await initializeDB();
    const { providerName } = JSON.parse(event.body);
    if (!providerName) {
      throw new Error('Provider name is required');
    }

    const message = await toggleProviderPin(providerName);
    return {
      statusCode: 200,
      body: JSON.stringify({ message }),
    };
  } catch (error) {
    console.error('Error in togglePin handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};
