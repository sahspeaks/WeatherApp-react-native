import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

//screens
import HomeScreen from '../screens/HomeScreen';

//Navigation
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer className="flex-1 absolute">
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
