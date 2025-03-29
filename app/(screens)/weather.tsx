import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://192.168.120.231:5000';

type WeatherData = {
  current: {
    date: string;
    rainfall: number;
    temperature: number;
  };
  forecast: Array<{
    Day: string;
    'Rainfall (mm)': number;
    'Temperature (°C)': number;
    index: number;
  }>;
  success: boolean;
};

export default function WeatherScreen() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    return Number(num).toFixed(2);
  };

  const fetchWeatherData = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/weather_forecast`);
      const data = await response.json();
      
      console.log('Weather API Response:', data);

      if (data.success && data.current && data.forecast) {
        setWeatherData(data);
      } else {
        console.error('Invalid data structure:', data);
        throw new Error('Invalid weather data format');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError('Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeatherData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="wb-sunny" size={48} color="#FFA000" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View 
          entering={FadeIn}
          style={styles.content}
        >
          {weatherData?.current && (
            <BlurView intensity={20} style={styles.currentWeatherCard}>
              <Text style={styles.cardTitle}>Current Weather</Text>
              <View style={styles.currentWeatherContent}>
                <MaterialIcons 
                  name="wb-sunny"
                  size={64} 
                  color="#FFA000" 
                />
                <Text style={styles.temperature}>
                  {formatNumber(weatherData.current.temperature)}°C
                </Text>
                <Text style={styles.conditions}>
                  {weatherData.current.date}
                </Text>
                <View style={styles.weatherDetails}>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="grain" size={24} color="#2196F3" />
                    <Text style={styles.detailText}>
                      {formatNumber(weatherData.current.rainfall)} mm
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          )}

          {weatherData?.forecast && weatherData.forecast.length > 0 && (
            <BlurView intensity={20} style={styles.forecastCard}>
              <Text style={styles.cardTitle}>5-Day Forecast</Text>
              <View style={styles.forecastList}>
                {weatherData.forecast.map((day, index) => (
                  <View key={index} style={styles.forecastItem}>
                    <Text style={styles.forecastDate}>{day.Day}</Text>
                    <MaterialIcons 
                      name="wb-sunny"
                      size={32} 
                      color="#FFA000" 
                    />
                    <View style={styles.forecastDetails}>
                      <Text style={styles.forecastTemp}>
                        {formatNumber(day['Temperature (°C)'])}°C
                      </Text>
                      <Text style={styles.forecastRainfall}>
                        {formatNumber(day['Rainfall (mm)'])} mm
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </BlurView>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  currentWeatherCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  currentWeatherContent: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 8,
  },
  conditions: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 16,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  forecastCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  forecastList: {
    marginTop: 16,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  forecastDate: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  forecastDetails: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  forecastRainfall: {
    fontSize: 14,
    color: '#2196F3',
  },
}); 