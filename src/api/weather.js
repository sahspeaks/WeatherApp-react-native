// Geocoding
// http://api.openweathermap.org/geo/1.0/direct?q={city_name}&limit={limit}&appid={API_KEY}
// Weather API
// https://api.openweathermap.org/data/2.5/weather?lat={lattitude}&lon={longitude}&appid={API_KEY}&units=metric
//Direct geocoding
// https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}&units=metric

import axios from 'axios';
// import {API_KEY} from '@env';

let lattitude = 13.63551;
let longitude = 79.41989;
let API_KEY = 'bb05774a8d17d4b9b85ba64181b7fc5b';

const forecastEndpoint = params =>
  `https://api.openweathermap.org/data/2.5/forecast?lat=${params.lat}&lon=${params.lon}&appid=${API_KEY}&units=metric&cnt=10`;
const weatherEndpoint = params =>
  `https://api.openweathermap.org/data/2.5/weather?lat=${params.lat}&lon=${params.lon}&appid=${API_KEY}&units=metric`;
const locationEndpoint = params =>
  `http://api.openweathermap.org/geo/1.0/direct?q=${params.city}&limit=5&appid=${API_KEY}`;

const apiCall = async endpoint => {
  const options = {
    method: 'GET',
    url: endpoint,
  };
  try {
    console.log('before axios');
    const response = await axios.request(options);
    console.log('after axios');
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getWeatherForecast = params => {
  const forecastURL = forecastEndpoint(params);
  return apiCall(forecastURL);
};
export const getLocation = params => {
  const locationURl = locationEndpoint(params);
  return apiCall(locationURl);
};
export const getTodayWeather = params => {
  const locationURl = weatherEndpoint(params);
  return apiCall(locationURl);
};
