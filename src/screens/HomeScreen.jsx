import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  PermissionsAndroid,
} from 'react-native';

import React, {useCallback, useState, useEffect} from 'react';
import {theme} from '../theme/index';
import {debounce} from 'lodash';
import * as Progress from 'react-native-progress';
import Geolocation from 'react-native-geolocation-service';
import SplashScreen from 'react-native-splash-screen';

import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';

import {MapPinIcon} from 'react-native-heroicons/solid';
import {getLocation, getWeatherForecast, getTodayWeather} from '../api/weather';

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = React.useState(false);
  const [location, setLocation] = React.useState([]);
  const [weatherData, setWeatherData] = useState({
    name: '',
    sys: {country: ''},
    main: {temp: 0, humidity: 0},
    weather: [{description: '', icon: ''}],
    wind: {speed: 0},
  });
  const [forecastData, setForecastData] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());

  const handdleLocationPress = location => {
    setLocation([]);
    setShowSearch(false);
    setLoading(true);
    getWeatherForecast({
      lat: location.lat,
      lon: location.lon,
    })
      .then(data => {
        if (data && data.data) {
          console.log(data.data);
          setForecastData(data.data);
        } else {
          console.error('Unexpected data structure:', data);
        }
      })
      .catch(err => {
        console.error('Error fetching weather data:', err);
      });

    getTodayWeather({
      lat: location.lat,
      lon: location.lon,
    })
      .then(data => {
        if (data && data.data) {
          setWeatherData(data.data);
          setLoading(false);
        } else {
          console.error('Unexpected data structure:', data);
          // Optionally set weatherData to a default state or show an error message
        }
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        // Optionally set weatherData to a default state or show an error message
      });
  };
  const handleSearch = value => {
    console.log(value);
    if (value.length > 2) {
      getLocation({city: value}).then(data => {
        // console.log(data.data);
        setLocation(data.data);
        // location.map((item, index) => console.log(item.name));
      });
    }
  };
  const handleTextDebounce = useCallback(debounce(handleSearch, 1000), []);

  const {name, sys, main, weather, wind} = weatherData || {};

  useEffect(() => {
    SplashScreen.hide();
    // Update time every second
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'ios') {
        getLocation();
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Permission',
            message:
              'We need access to your location to show weather information',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          getDeviceLocation();
        } else {
          Alert.alert('Location Permission Denied');
        }
      }
    };

    requestLocationPermission();
  }, []);

  const getDeviceLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        getTodayWeather({lat: latitude, lon: longitude})
          .then(data => {
            if (data && data.data) {
              setWeatherData(data.data);
              setLoading(false);
            } else {
              console.error('Unexpected data structure:', data);
              // Optionally set weatherData to a default state or show an error message
            }
          })
          .catch(error => {
            console.error('Error fetching weather data:', error);
            // Optionally set weatherData to a default state or show an error message
          });
        getWeatherForecast({lat: latitude, lon: longitude})
          .then(data => {
            if (data && data.data) {
              console.log(data.data);
              setForecastData(data.data);
            } else {
              console.error('Unexpected data structure:', data);
            }
          })
          .catch(err => {
            console.error('Error fetching weather data:', err);
          });
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" />
      <Image
        source={require('../../assets/images/bg.png')}
        className="h-full w-full absolute"
        blurRadius={70}
      />
      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail size={140} thickness={6} color="#50B498" />
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View
              style={{height: '10%'}}
              className="mx-4 relative z-50 mt-1 flex-row justify-between items-center">
              {/* Current Location Button */}

              {!showSearch ? (
                <TouchableOpacity
                  onPress={getDeviceLocation}
                  style={{backgroundColor: theme.bgWhite(0.3)}}
                  className="rounded-full p-3 m-1">
                  <MapPinIcon size={25} color="white" />
                </TouchableOpacity>
              ) : null}

              {/* Search Bar */}
              <View
                className="flex-row justify-end items-center rounded-full"
                style={{
                  backgroundColor: showSearch
                    ? theme.bgWhite(0.2)
                    : 'transparent',
                }}>
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search City"
                    placeholderTextColor={'lightgray'}
                    className="pl-6 h-10 flex-1 text-base text-white"
                  />
                ) : null}

                <TouchableOpacity
                  onPress={() => setShowSearch(!showSearch)}
                  style={{backgroundColor: theme.bgWhite(0.3)}}
                  className="rounded-full p-3 m-1">
                  <MagnifyingGlassIcon size={25} color="white" />
                </TouchableOpacity>
              </View>
              {/* Search Bar Results */}
              {location.length > 0 && showSearch ? (
                <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                  {location.map((item, index) => {
                    return (
                      <TouchableOpacity
                        onPress={() => handdleLocationPress(item)}
                        key={index}
                        className="flex-row gap-2 border-0 p-3 px-4 mb-1 items-center">
                        <MapPinIcon size={25} color="gray" />
                        <Text className="text-lg text-gray-600">
                          {item.name}, {item.state}, {item.country}
                          {/* Hello */}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
            {/* Forecast */}
            <View className="mx-4 flex justify-around flex-1">
              {/* location */}
              <Text className="text-white text-center text-2xl font-bold">
                {`${name ? name + ',' : 'Unknown Location'}`}
                <Text className="text-lg font-semibold Itext-gray-300">
                  &nbsp;{`${sys?.country ? sys.country : ''}`}
                </Text>
              </Text>
              <Text className="text-white text-center text-base">
                {currentDate.toLocaleDateString('en-US', {weekday: 'long'})},{' '}
                {currentDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                  hour12: true,
                })}
              </Text>
              {/* weather image */}
              <View className="flex-row justify-center">
                {weather[0]?.icon ? (
                  <Image
                    source={{
                      uri: `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`,
                    }}
                    className="w-52 h-52"
                  />
                ) : (
                  <Image
                    source={{
                      uri: `https://openweathermap.org/img/wn/02d@4x.png`,
                    }}
                    className="w-52 h-52"
                  />
                )}
              </View>
              {/* degree celcius */}
              <View className="space-y-2">
                <Text className=" pt-2 text-center font-bold text-white text-6xl ml-5">
                  {main?.temp}&#176;
                </Text>
                <Text className="text-center text-white text-xl tracking-widest">
                  {' '}
                  {weather[0]?.description}
                </Text>
              </View>
              {/* Other Details */}
              <View className="flex-row justify-between mx-4">
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require('../../assets/icons/wind.png')}
                    className="w-6 h-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {wind?.speed} km
                  </Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require('../../assets/icons/drop.png')}
                    className="w-6 h-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {main?.humidity} %
                  </Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require('../../assets/icons/sun.png')}
                    className="w-6 h-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {sys?.sunrise
                      ? new Date(sys.sunrise * 1000).toLocaleTimeString(
                          'en-US',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          },
                        )
                      : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Forecast for next days */}

            <View className="mb-3 space-y-3">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size="22" color="white" />
                <Text className=" text-white text-base"> Hourly forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{paddingHorizontal: 15}}
                showsHorizontalScrollIndicator={false}>
                {/* Cards */}
                {forecastData?.list?.map((item, index) => {
                  const [datePart, timePart] = item?.dt_txt.split(' ');
                  const date = new Date(item?.dt_txt); // Create Date object from full dt_txt
                  const time = date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  });
                  // This will give us HH:MM format
                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      style={{backgroundColor: theme.bgWhite(0.15)}}>
                      <Image
                        source={{
                          uri: `https://openweathermap.org/img/wn/${item?.weather[0]?.icon}@4x.png`,
                        }}
                        className="h-11 w-11"
                      />
                      <Text className="text-white">
                        {date.toLocaleDateString('en-US', {weekday: 'short'})}
                      </Text>
                      <Text className="text-white">{time}</Text>
                      <Text className=" Itext-white text-xl font-semibold">
                        {item?.main?.temp}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
