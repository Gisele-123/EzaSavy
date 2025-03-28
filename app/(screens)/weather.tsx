import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function WeatherScreen() {
  // Mock weather data
  const currentWeather = {
    temperature: 25,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 12,
    location: 'Kigali, Rwanda',
  };

  const forecast = [
    { day: 'Today', temp: 25, condition: 'Sunny' },
    { day: 'Tomorrow', temp: 23, condition: 'Partly Cloudy' },
    { day: 'Wed', temp: 22, condition: 'Rainy' },
    { day: 'Thu', temp: 24, condition: 'Cloudy' },
    { day: 'Fri', temp: 26, condition: 'Sunny' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Animated.View 
        entering={FadeIn}
        style={styles.header}
      >
        <Text style={styles.title}>Weather Forecast</Text>
        <Text style={styles.subtitle}>{currentWeather.location}</Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(200)}
        style={styles.currentWeather}
      >
        <BlurView intensity={20} style={styles.currentWeatherCard}>
          <Text style={styles.temperature}>{currentWeather.temperature}°C</Text>
          <Text style={styles.condition}>{currentWeather.condition}</Text>
          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <MaterialIcons name="water-drop" size={24} color="#4CAF50" />
              <Text style={styles.detailText}>{currentWeather.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="air" size={24} color="#4CAF50" />
              <Text style={styles.detailText}>{currentWeather.windSpeed} km/h</Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(400)}
        style={styles.forecastContainer}
      >
        <Text style={styles.forecastTitle}>5-Day Forecast</Text>
        {forecast.map((day, index) => (
          <Animated.View 
            key={day.day}
            entering={FadeInDown.delay(600 + index * 100)}
            style={styles.forecastItem}
          >
            <BlurView intensity={20} style={styles.forecastCard}>
              <Text style={styles.forecastDay}>{day.day}</Text>
              <MaterialIcons 
                name={day.condition === 'Sunny' ? 'wb-sunny' : 
                      day.condition === 'Rainy' ? 'grain' : 
                      'cloud'} 
                size={24} 
                color="#4CAF50" 
              />
              <Text style={styles.forecastTemp}>{day.temp}°C</Text>
            </BlurView>
          </Animated.View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
  currentWeather: {
    padding: 16,
  },
  currentWeatherCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  condition: {
    fontSize: 20,
    color: '#757575',
    marginBottom: 16,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 4,
  },
  forecastContainer: {
    padding: 16,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 16,
  },
  forecastItem: {
    marginBottom: 12,
  },
  forecastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    width: 80,
  },
  forecastTemp: {
    fontSize: 16,
    color: '#757575',
    width: 60,
    textAlign: 'right',
  },
}); 