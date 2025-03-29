import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://192.168.120.231:5000'; // Change to your backend IP

type PlantRecommendation = {
  plant: string;
  confidence: number;
  suitability: string;
  kinyarwandaName?: string;
};

type SoilType = {
  name: string;
  rgb: [number, number, number];
  description: string;
  kinyarwandaName?: string;
};

const SOIL_TYPES: SoilType[] = [
  { 
    name: 'Black', 
    rgb: [120, 80, 50], 
    description: 'Rich, fertile soil with high organic content',
    kinyarwandaName: 'umukara'
  },
  { 
    name: 'Gray', 
    rgb: [180, 150, 100], 
    description: 'Sandy soil with moderate fertility',
    kinyarwandaName: 'ikijuju'
  },
  { 
    name: 'Red', 
    rgb: [200, 100, 80], 
    description: 'Clay-rich soil with good drainage',
    kinyarwandaName: 'umutuku'
  },
  { 
    name: 'Alluvial', 
    rgb: [50, 50, 50], 
    description: 'Very rich soil with high organic matter',
    kinyarwandaName: 'ikigina'
  },
];

// Color mapping from text descriptions to RGB values
const COLOR_MAPPING: Record<string, [number, number, number]> = {
  'black': [120, 80, 50],
  'gray': [180, 150, 100],
  'red': [200, 100, 80],
  'alluvial': [50, 50, 50],
  'clay': [189, 161, 137],
  'dark brown': [101, 67, 33],
  'light brown': [181, 136, 99],
  'sandy': [237, 201, 175],
  'loamy': [160, 120, 90]
};

export default function SoilScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recommendations, setRecommendations] = useState<PlantRecommendation[]>([]);
  const [selectedSoil, setSelectedSoil] = useState<SoilType | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [pH, setPH] = useState('6.5');
  const [lightHours, setLightHours] = useState('10');
  const [activeTab, setActiveTab] = useState<'image' | 'text' | 'voice'>('image');
  const [soilDescription, setSoilDescription] = useState('');

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`${API_URL}/weather_forecast`);
      const data = await response.json();
      if (data.success) {
        setWeatherData(data.current);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const selectSoilType = async (colorDesc?: string): Promise<SoilType> => {
    // If we have a color description, try to match it first
    if (colorDesc) {
      const lowerDesc = colorDesc.toLowerCase();
      for (const [colorName, rgb] of Object.entries(COLOR_MAPPING)) {
        if (lowerDesc.includes(colorName)) {
          const matchedSoil = SOIL_TYPES.find(soil => 
            soil.name.toLowerCase() === colorName || 
            soil.kinyarwandaName?.toLowerCase() === colorName
          );
          if (matchedSoil) {
            setSelectedSoil(matchedSoil);
            return matchedSoil;
          }
        }
      }
    }

    // Fall back to manual selection if no match found
    const soil = await new Promise<SoilType>((resolve) => {
      Alert.alert(
        'Select Soil Type',
        'Choose the soil type that best matches your sample:',
        SOIL_TYPES.map(soil => ({
          text: soil.name,
          onPress: () => resolve(soil)
        }))
      );
    });
    setSelectedSoil(soil);
    return soil;
  };

  const analyzeSoil = async (R: number, G: number, B: number) => {
    if (!selectedSoil) {
      Alert.alert('Error', 'Please select soil type first');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          R,
          G,
          B,
          pH: parseFloat(pH) || 6.5,
          light_hours: parseFloat(lightHours) || 10
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Add Kinyarwanda translations to recommendations
        const recommendationsWithTranslation = data.recommendations.map((rec: PlantRecommendation) => ({
          ...rec,
          kinyarwandaName: translateToKinyarwanda(rec.plant) // This would call your translation service
        }));
        
        setRecommendations(recommendationsWithTranslation);
        Alert.alert(
          'Analysis Complete',
          `Top recommendation: ${data.recommendations[0].plant}`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(data.error || 'Failed to analyze soil');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsScanning(false);
    }
  };

  // Mock translation function - replace with actual API call
  const translateToKinyarwanda = (text: string): string => {
    // In a real app, you would call your translation API here
    const translations: Record<string, string> = {
      'maize': 'Ibigori',
      'beans': 'Ibishyimbo',
      'wheat': 'Ingano',
      'rice': 'Umuceri'
    };
    return translations[text.toLowerCase()] || text;
  };

  const handleSubmit = async () => {
    if (activeTab === 'image' && !image) {
      Alert.alert('Error', 'Please take or select an image first');
      return;
    }
    
    const soil = await selectSoilType();
    if (soil) {
      await analyzeSoil(soil.rgb[0], soil.rgb[1], soil.rgb[2]);
    }
  };

  const handleTextInputSubmit = async () => {
    if (!soilDescription.trim()) {
      Alert.alert('Error', 'Please describe your soil color');
      return;
    }

    // Try to match the description to a known color
    const lowerDesc = soilDescription.toLowerCase();
    let matchedRGB: [number, number, number] | null = null;

    for (const [colorName, rgb] of Object.entries(COLOR_MAPPING)) {
      if (lowerDesc.includes(colorName)) {
        matchedRGB = rgb;
        break;
      }
    }

    if (!matchedRGB) {
      Alert.alert('Info', "Couldn't determine soil color from description. Please select manually.");
    }

    const soil = await selectSoilType(soilDescription);
    if (soil) {
      await analyzeSoil(soil.rgb[0], soil.rgb[1], soil.rgb[2]);
    }
  };

  const handleVoiceInputSubmit = async () => {
    Alert.alert('Info', 'Voice input will be processed here');
    const soil = await selectSoilType();
    if (soil) {
      await analyzeSoil(soil.rgb[0], soil.rgb[1], soil.rgb[2]);
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

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'image' && styles.activeTab]}
                onPress={() => setActiveTab('image')}
              >
                <MaterialIcons name="image" size={20} color={activeTab === 'image' ? '#FFFFFF' : '#4CAF50'} />
                <Text style={[styles.tabText, activeTab === 'image' && styles.activeTabText]}>Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'text' && styles.activeTab]}
                onPress={() => setActiveTab('text')}
              >
                <MaterialIcons name="text-fields" size={20} color={activeTab === 'text' ? '#FFFFFF' : '#4CAF50'} />
                <Text style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}>Text</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'voice' && styles.activeTab]}
                onPress={() => setActiveTab('voice')}
              >
                <MaterialIcons name="keyboard-voice" size={20} color={activeTab === 'voice' ? '#FFFFFF' : '#4CAF50'} />
                <Text style={[styles.tabText, activeTab === 'voice' && styles.activeTabText]}>Voice</Text>
              </TouchableOpacity>
            </View>

            {/* Image Tab Content */}
            {activeTab === 'image' && (
              <>
                {image ? (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <View style={styles.imagePreviewControls}>
                      <TouchableOpacity 
                        style={[styles.imagePreviewButton, styles.retakeButton]}
                        onPress={() => {
                          setImage(null);
                          setSelectedSoil(null);
                          setRecommendations([]);
                        }}
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
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={takePicture}
                    >
                      <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, { marginTop: 10 }]}
                      onPress={pickImage}
                    >
                      <MaterialIcons name="photo-library" size={24} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* Text Tab Content */}
            {activeTab === 'text' && (
              <View style={styles.textInputContainer}>
                <Text style={styles.inputLabel}>Describe your soil color:</Text>
                <TextInput
                  style={[styles.textInput, { height: 100 }]}
                  multiline
                  placeholder="e.g. dark brown, reddish clay, etc."
                  placeholderTextColor="#999"
                  value={soilDescription}
                  onChangeText={setSoilDescription}
                />
                <TouchableOpacity 
                  style={styles.button}
                  onPress={handleTextInputSubmit}
                  disabled={isScanning}
                >
                  <MaterialIcons name="science" size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>
                    {isScanning ? "Analyzing..." : "Analyze Soil"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Voice Tab Content */}
            {activeTab === 'voice' && (
              <View style={styles.voiceContainer}>
                <View style={styles.voiceIconContainer}>
                  <MaterialIcons name="mic" size={48} color="#4CAF50" />
                </View>
                <Text style={styles.voiceInstruction}>
                  Press the button below and describe your soil color
                </Text>
                <TouchableOpacity 
                  style={[styles.button, styles.voiceButton]}
                  onPress={handleVoiceInputSubmit}
                  disabled={isScanning}
                >
                  <MaterialIcons name="keyboard-voice" size={24} color="#FFFFFF" />
                  <Text style={styles.buttonText}>
                    {isScanning ? "Processing..." : "Start Recording"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>pH Level (6.0-7.5):</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={pH}
                onChangeText={setPH}
                placeholder="6.5"
              />
              
              <Text style={styles.inputLabel}>Daily Light Hours:</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={lightHours}
                onChangeText={setLightHours}
                placeholder="10"
              />
            </View>

            {selectedSoil && (
              <View style={styles.selectedSoilContainer}>
                <Text style={styles.selectedSoilText}>
                  Selected Soil: {selectedSoil.name} {selectedSoil.kinyarwandaName && `(${selectedSoil.kinyarwandaName})`}
                </Text>
                <Text style={styles.selectedSoilDesc}>
                  {selectedSoil.description}
                </Text>
              </View>
            )}

            {weatherData && (
              <View style={styles.weatherContainer}>
                <Text style={styles.weatherTitle}>Current Weather</Text>
                <Text style={styles.weatherText}>
                  Temperature: {weatherData.temperature}°C
                </Text>
                <Text style={styles.weatherText}>
                  Rainfall: {weatherData.rainfall}mm
                </Text>
              </View>
            )}

            {recommendations.length > 0 && (
              <BlurView intensity={20} style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommended Plants</Text>
                {recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationName}>
                      {index + 1}. {rec.plant} {rec.kinyarwandaName && `(${rec.kinyarwandaName})`}
                    </Text>
                    <Text style={styles.recommendationConfidence}>
                      {rec.confidence.toFixed(1)}% confidence ({rec.suitability})
                    </Text>
                  </View>
                ))}
              </BlurView>
            )}
          </BlurView>
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  activeTabText: {
    color: '#FFFFFF',
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
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#4CAF50',
  },
  voiceButton: {
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  inputContainer: {
    marginVertical: 16,
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
    marginBottom: 16,
  },
  voiceContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
  },
  voiceIconContainer: {
    backgroundColor: '#E8F5E9',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceInstruction: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  selectedSoilContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  selectedSoilText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  selectedSoilDesc: {
    color: '#2E7D32',
    fontSize: 14,
    marginTop: 4,
  },
  weatherContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  weatherTitle: {
    color: '#1565C0',
    fontWeight: '600',
    marginBottom: 8,
  },
  weatherText: {
    color: '#1565C0',
  },
  recommendationsContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  recommendationItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  recommendationConfidence: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});