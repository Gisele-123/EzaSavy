import { Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#4CAF50',
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen 
        name="soil-scan" 
        options={{ 
          title: 'Soil Scan',
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialIcons name="help" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialIcons name="history" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="plant-scan" 
        options={{ 
          title: 'Plant Scan',
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialIcons name="help" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialIcons name="history" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="weather" 
        options={{ 
          title: 'Weather',
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialIcons name="refresh" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialIcons name="location-on" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="bot" 
        options={{ 
          title: 'EzaSavvyBot',
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialIcons name="help" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialIcons name="settings" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialIcons name="save" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 16,
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
  },
}); 