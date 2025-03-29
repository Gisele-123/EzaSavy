import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

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

type PlantRecommendation = {
  name: string;
  confidence: number;
};

type SoilType = {
  name: string;
  rgb: [number, number, number];
  description: string;
};

const SOIL_TYPES: SoilType[] = [
  { name: 'Dark Brown', rgb: [120, 80, 50], description: 'Rich, fertile soil with high organic content' },
  { name: 'Light Brown', rgb: [180, 150, 100], description: 'Sandy soil with moderate fertility' },
  { name: 'Red', rgb: [200, 100, 80], description: 'Clay-rich soil with good drainage' },
  { name: 'Black', rgb: [50, 50, 50], description: 'Very rich soil with high organic matter' },
];

export default function SoilScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [soilDescription, setSoilDescription] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [responseType, setResponseType] = useState<'text' | 'voice'>('text');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`${API_URL}/weather_forecast`);
      const data = await response.json();
      if (data.current && data.forecast) {
        setWeatherData(data);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      await recording.startAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      setAudioUri(recording.getURI());
      setRecording(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    try {
      if (!audioUri) return;
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      await sound.playAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Changed from MediaTypeOptions
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) setImage(result.assets[0].uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) setImage(result.assets[0].uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const analyzeImage = async () => {
    try {
      setIsScanning(true);
      
      const selectedSoil = await new Promise<SoilType>((resolve) => {
        Alert.alert(
          'Select Soil Type',
          'Choose the soil type that best matches your sample:',
          SOIL_TYPES.map(soil => ({
            text: soil.name,
            onPress: () => resolve(soil)
          }))
        );
      });
  
      // Get weather data with fallback
      let day5Weather = {
        'Temperature (°C)': 25,
        'Rainfall (mm)': 150
      };
      
      try {
        const weatherResponse = await fetch(`${API_URL}/weather_forecast`);
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          if (weatherData.forecast && weatherData.forecast.length >= 5) {
            day5Weather = weatherData.forecast[4];
          }
        }
      } catch (weatherError) {
        console.warn('Using default weather values:', weatherError);
      }
  
      // Prepare API request
      const params = new URLSearchParams();
      params.append('R', Math.round(selectedSoil.rgb[0]).toString());
      params.append('G', Math.round(selectedSoil.rgb[1]).toString());
      params.append('B', Math.round(selectedSoil.rgb[2]).toString());
      params.append('pH', '6.8');
      params.append('light_hours', '10');
      params.append('temperature', day5Weather['Temperature (°C)'].toString());
      params.append('rainfall', day5Weather['Rainfall (mm)'].toString());
  
      try {
        const response = await fetch(`${API_URL}/predict_soil?${params.toString()}`);
        
        if (!response.ok) {
          // Try to get detailed error from response
          let errorDetails = 'Unknown server error';
          try {
            const errorResponse = await response.json();
            errorDetails = errorResponse.details || errorResponse.error || 'Unknown error';
          } catch (e) {
            errorDetails = await response.text();
          }
          throw new Error(`Server responded with error: ${errorDetails}`);
        }
  
        const responseData = await response.json();
        
        if (!responseData.success) {
          throw new Error(responseData.details || responseData.error || 'Analysis failed');
        }
  
        // Format results
        const formatResult = (value: number) => value.toFixed(1);
        const recommendations = responseData.recommendations.map(
          (rec: any, i: number) => 
            `${i+1}. ${rec.plant} (${formatResult(rec.confidence)}%) - ${rec.suitability}`
        ).join('\n');
  
        Alert.alert(
          '🌱 SOIL ANALYSIS REPORT',
          `
  🔍 Soil Properties (RGB): ${responseData.analysis.soil_color.join(', ')}
  🧪 pH: ${formatResult(responseData.analysis.pH)}
  ☀️ Light Exposure: ${responseData.analysis.light_hours} hours/day
  
  🌦️ Environmental Conditions:
     - Temperature: ${formatResult(responseData.analysis.temperature)}°C
     - Rainfall: ${formatResult(responseData.analysis.rainfall)}mm
  
  💡 Top Plant Recommendations:
  ${recommendations}
  
  ⭐ FINAL RECOMMENDATION ⭐
  ${responseData.recommendations[0].plant} (${formatResult(responseData.recommendations[0].confidence)}%)
          `,
          [{ text: 'OK', style: 'default' }]
        );
  
        setAiResponse(responseData);
        
      } catch (error) {
        console.error('API Error:', error);
        Alert.alert(
          'Analysis Failed',
          error instanceof Error ? error.message : 'Please check your input and try again',
          [{ text: 'OK', style: 'cancel' }]
        );
      }
    } catch (error) {
      console.error('Unexpected Error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again later.',
        [{ text: 'OK', style: 'cancel' }]
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!image && !soilDescription && !audioUri) {
      Alert.alert('Error', 'Please provide soil information');
      return;
    }
    setIsScanning(true);
    try {
      if (image) await analyzeImage();
      else if (soilDescription) {
        setAiResponse(`Analysis based on: "${soilDescription}"`);
      } else if (audioUri) {
        setAiResponse("Voice analysis not supported yet");
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to analyze soil');
    } finally {
      setIsScanning(false);
    }
  };

  const handleResponseTypeChange = async (type: 'text' | 'voice') => {
    setResponseType(type);
    if (type === 'voice' && aiResponse) {
      await Speech.speak(aiResponse, { language: 'en', rate: 0.9 });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Animated.View entering={FadeIn} style={styles.content}>
          <BlurView intensity={20} style={styles.card}>
            <View style={styles.header}>
              <MaterialIcons name="science" size={32} color="#4CAF50" />
              <Text style={styles.title}>Soil Analysis</Text>
            </View>

            <Text style={styles.description}>
              Analyze your soil sample to get plant recommendations.
            </Text>

            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <View style={styles.imagePreviewControls}>
                  <TouchableOpacity 
                    style={[styles.imagePreviewButton, styles.retakeButton]}
                    onPress={() => setImage(null)}
                  >
                    <MaterialIcons name="refresh" size={24} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Retake</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.imagePreviewButton, styles.analyzeButton]}
                    onPress={handleSubmit}
                    disabled={isScanning}
                  >
                    <MaterialIcons name="science" size={24} color="#FFFFFF" />
                    <Text style={styles.buttonText}>
                      {isScanning ? "Analyzing..." : "Analyze"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <MaterialIcons name="photo-camera" size={48} color="#4CAF50" />
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}

            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Choose Input Method:</Text>
              <View style={styles.inputOptions}>
                <TouchableOpacity 
                  style={[styles.inputOption, image && styles.inputOptionActive]}
                  onPress={() => {
                    Alert.alert(
                      'Choose Image Source',
                      'How would you like to get the soil image?',
                      [
                        { text: 'Take Photo', onPress: takePicture },
                        { text: 'Choose from Gallery', onPress: pickImage },
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <MaterialIcons name="photo-camera" size={24} color={image ? '#FFFFFF' : '#4CAF50'} />
                  <Text style={[styles.inputOptionText, image && styles.inputOptionTextActive]}>
                    Image
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.inputOption, soilDescription && styles.inputOptionActive]}
                  onPress={() => {
                    setImage(null);
                    setAudioUri(null);
                  }}
                >
                  <MaterialIcons name="text-fields" size={24} color={soilDescription ? '#FFFFFF' : '#4CAF50'} />
                  <Text style={[styles.inputOptionText, soilDescription && styles.inputOptionTextActive]}>
                    Text
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.inputOption, audioUri && styles.inputOptionActive]}
                  onPress={() => {
                    setImage(null);
                    setSoilDescription('');
                  }}
                >
                  <MaterialIcons name="mic" size={24} color={audioUri ? '#FFFFFF' : '#4CAF50'} />
                  <Text style={[styles.inputOptionText, audioUri && styles.inputOptionTextActive]}>
                    Voice
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.textInputContainer}>
              <Text style={styles.inputLabel}>Describe the soil's appearance:</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                placeholder="Enter soil color, texture, and other visual characteristics..."
                value={soilDescription}
                onChangeText={setSoilDescription}
              />
            </View>

            <View style={styles.audioContainer}>
              <Text style={styles.inputLabel}>Voice Description:</Text>
              <View style={styles.audioControls}>
                <TouchableOpacity 
                  style={[styles.audioButton, isRecording ? styles.recordingButton : null]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <MaterialIcons 
                    name={isRecording ? "stop" : "mic"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.buttonText}>
                    {isRecording ? "Stop" : "Record"}
                  </Text>
                </TouchableOpacity>

                {audioUri && (
                  <TouchableOpacity 
                    style={[styles.audioButton, styles.playButton]}
                    onPress={playRecording}
                  >
                    <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Play</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.submitButton, (!image && !soilDescription && !audioUri) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!image && !soilDescription && !audioUri || isScanning}
            >
              <MaterialIcons name={isScanning ? "hourglass-empty" : "send"} size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {isScanning ? "Processing..." : "Submit"}
              </Text>
            </TouchableOpacity>

            {aiResponse && (
              <BlurView intensity={20} style={styles.responseCard}>
                <Text style={styles.responseText}>{aiResponse}</Text>
                <View style={styles.responseTypeContainer}>
                  <TouchableOpacity 
                    style={[styles.responseTypeButton, responseType === 'text' && styles.responseTypeButtonActive]}
                    onPress={() => handleResponseTypeChange('text')}
                  >
                    <Text style={[styles.responseTypeButtonText, responseType === 'text' && styles.responseTypeButtonTextActive]}>
                      Text
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.responseTypeButton, responseType === 'voice' && styles.responseTypeButtonActive]}
                    onPress={() => handleResponseTypeChange('voice')}
                  >
                    <Text style={[styles.responseTypeButtonText, responseType === 'voice' && styles.responseTypeButtonTextActive]}>
                      Voice
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            )}
          </BlurView>

          <BlurView intensity={20} style={styles.instructions}>
            <Text style={styles.instructionsTitle}>How to Scan Soil</Text>
            <Text style={styles.instructionsText}>
              1. Place the soil sample in good lighting{'\n'}
              2. Hold the camera steady{'\n'}
              3. Ensure the entire sample is in frame{'\n'}
              4. Take a clear photo or describe the soil
            </Text>
          </BlurView>

          {weatherData && (
            <View style={styles.weatherContainer}>
              <Text style={styles.weatherTitle}>Weather Forecast</Text>
              <Text style={styles.weatherText}>
                Temperature: {weatherData.current.temperature}°C
              </Text>
              <Text style={styles.weatherText}>
                Rainfall: {weatherData.current.rainfall} mm
              </Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 24,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#E0E0E0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  inputOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  inputOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  inputOptionActive: {
    backgroundColor: '#4CAF50',
  },
  inputOptionText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  inputOptionTextActive: {
    color: '#FFFFFF',
  },
  textInputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  audioContainer: {
    marginBottom: 24,
  },
  audioControls: {
    flexDirection: 'row',
    gap: 12,
  },
  audioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#9C27B0',
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  playButton: {
    backgroundColor: '#FF9800',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  responseCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginTop: 16,
  },
  responseText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  responseTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  responseTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  responseTypeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  responseTypeButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  responseTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  instructions: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 24,
  },
  weatherContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  weatherText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  imagePreviewControls: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  imagePreviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: '#F44336',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
  },
});