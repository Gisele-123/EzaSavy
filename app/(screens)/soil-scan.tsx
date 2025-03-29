import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert, 
  TextInput, 
  ScrollView,
  PermissionsAndroid,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'http://192.168.120.231:5000';

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
  
  // Voice recording states
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [recordedAudioURI, setRecordedAudioURI] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Clean up audio resources
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    fetchWeatherData();
    requestMicrophonePermission();
  }, []);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'EzaSavvy needs access to your microphone for voice input',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Failed to request microphone permission:', err);
        return false;
      }
    }
    return true;
  };

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
        const recommendationsWithTranslation = data.recommendations.map((rec: PlantRecommendation) => ({
          ...rec,
          kinyarwandaName: translateToKinyarwanda(rec.plant)
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

  const translateToKinyarwanda = (text: string): string => {
    const translations: Record<string, string> = {
      'maize': 'Ibigori',
      'beans': 'Ibishyimbo',
      'wheat': 'Ingano',
      'rice': 'Umuceri',
      'potato': 'Ibirayi',
      'sorghum': 'Amasaka'
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

  // Voice recording functions
  const startRecording = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Microphone permission is needed to record audio');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setRecordingStatus('recording');
      setRecordedAudioURI(null);
      setSoilDescription('');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      if (uri) {
        setRecordedAudioURI(uri);
        setRecordingStatus('recorded');
        simulateVoiceRecognition(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    if (!recordedAudioURI) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedAudioURI },
        { shouldPlay: true }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });

      await newSound.playAsync();
    } catch (err) {
      console.error('Failed to play recording', err);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const simulateVoiceRecognition = async (uri: string) => {
    // In a real app, you would send the audio file to your backend for transcription
    // For now, we'll simulate it with a prompt
    
    Alert.prompt(
      'Voice Input Confirmation',
      'We heard you say: (Edit if incorrect)',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setRecordingStatus('idle');
            setRecordedAudioURI(null);
          }
        },
        {
          text: 'Use This',
          onPress: (text) => {
            if (text) {
              setSoilDescription(text);
              setRecordingStatus('recorded');
            }
          },
        },
      ],
      'plain-text',
      soilDescription || 'dark brown soil with good drainage'
    );
  };

  const handleVoiceInputSubmit = async () => {
    if (!soilDescription.trim()) {
      Alert.alert('Error', 'No voice input detected or transcribed');
      return;
    }

    const lowerDesc = soilDescription.toLowerCase();
    let matchedRGB: [number, number, number] | null = null;

    for (const [colorName, rgb] of Object.entries(COLOR_MAPPING)) {
      if (lowerDesc.includes(colorName)) {
        matchedRGB = rgb;
        break;
      }
    }

    if (!matchedRGB) {
      Alert.alert('Info', "Couldn't determine soil color from voice input. Please select manually.");
    }

    const soil = await selectSoilType(soilDescription);
    if (soil) {
      await analyzeSoil(soil.rgb[0], soil.rgb[1], soil.rgb[2]);
    }
  };

  const resetRecording = () => {
    setRecordingStatus('idle');
    setRecordedAudioURI(null);
    setSoilDescription('');
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn} style={styles.content}>
          <LinearGradient
            colors={['#2E7D32', '#4CAF50']}
            style={styles.headerContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.header}>
              <MaterialIcons name="grass" size={36} color="#FFFFFF" />
              <Text style={styles.title}>Soil Analysis</Text>
              <Text style={styles.subtitle}>Get the best crops for your land</Text>
            </View>
          </LinearGradient>

          <View style={styles.card}>
            <Text style={styles.description}>
              Analyze your soil sample to get personalized plant recommendations.
            </Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'image' && styles.activeImageTab]}
                onPress={() => setActiveTab('image')}
              >
                <MaterialIcons name="image" size={20} color={activeTab === 'image' ? '#FFFFFF' : '#4CAF50'} />
                <Text style={[styles.tabText, activeTab === 'image' && styles.activeTabText]}>Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'text' && styles.activeTextTab]}
                onPress={() => setActiveTab('text')}
              >
                <MaterialIcons name="text-fields" size={20} color={activeTab === 'text' ? '#FFFFFF' : '#FF9800'} />
                <Text style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}>Text</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'voice' && styles.activeVoiceTab]}
                onPress={() => setActiveTab('voice')}
              >
                <MaterialIcons name="keyboard-voice" size={20} color={activeTab === 'voice' ? '#FFFFFF' : '#E91E63'} />
                <Text style={[styles.tabText, activeTab === 'voice' && styles.activeTabText]}>Voice</Text>
              </TouchableOpacity>
            </View>

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
                    <View style={styles.cameraIconContainer}>
                      <MaterialIcons name="photo-camera" size={48} color="#FFFFFF" />
                    </View>
                    <Text style={styles.placeholderText}>No image selected</Text>
                    <TouchableOpacity 
                      style={[styles.button, styles.cameraButton]}
                      onPress={takePicture}
                    >
                      <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, styles.galleryButton, { marginTop: 10 }]}
                      onPress={pickImage}
                    >
                      <MaterialIcons name="photo-library" size={24} color="#FFFFFF" />
                      <Text style={styles.buttonText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

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
                  style={[styles.button, styles.analyzeTextButton]}
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

            {activeTab === 'voice' && (
              <View style={styles.voiceContainer}>
                <View style={styles.voiceIconContainer}>
                  <MaterialIcons 
                    name={recordingStatus === 'recording' ? "mic-off" : "mic"} 
                    size={48} 
                    color="#FFFFFF" 
                  />
                </View>
                
                <Text style={styles.voiceInstruction}>
                  {recordingStatus === 'recording' 
                    ? "Listening... Describe your soil color now"
                    : recordingStatus === 'recorded'
                      ? "Recording complete!"
                      : "Press the button below and describe your soil color"}
                </Text>

                {recordingStatus === 'recorded' && recordedAudioURI && (
                  <View style={styles.recordingControls}>
                    <TouchableOpacity 
                      style={[styles.smallButton, styles.playButton]}
                      onPress={isPlaying ? stopPlayback : playRecording}
                    >
                      <MaterialIcons 
                        name={isPlaying ? "stop" : "play-arrow"} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.smallButtonText}>
                        {isPlaying ? "Stop" : "Play"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.smallButton, styles.retakeButton]}
                      onPress={resetRecording}
                    >
                      <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                      <Text style={styles.smallButtonText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {soilDescription && (
                  <View style={styles.voiceResultContainer}>
                    <Text style={styles.voiceResultLabel}>Transcription:</Text>
                    <TextInput
                      style={styles.voiceResultTextInput}
                      value={soilDescription}
                      onChangeText={setSoilDescription}
                      multiline
                    />
                  </View>
                )}

                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.voiceButton,
                    recordingStatus === 'recording' && styles.recordingActive,
                    recordingStatus === 'recorded' && styles.recordedActive
                  ]}
                  onPress={recordingStatus === 'recording' ? stopRecording : startRecording}
                >
                  <MaterialIcons 
                    name={recordingStatus === 'recording' ? "stop" : "keyboard-voice"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.buttonText}>
                    {recordingStatus === 'recording' 
                      ? "Stop Recording" 
                      : recordingStatus === 'recorded'
                        ? "Record Again"
                        : "Start Recording"}
                  </Text>
                </TouchableOpacity>

                {recordingStatus === 'recorded' && (
                  <TouchableOpacity 
                    style={[styles.button, styles.analyzeButton]}
                    onPress={handleVoiceInputSubmit}
                    disabled={isScanning}
                  >
                    <MaterialIcons name="science" size={24} color="#FFFFFF" />
                    <Text style={styles.buttonText}>
                      {isScanning ? "Analyzing..." : "Analyze Recording"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.parametersContainer}>
              <Text style={styles.sectionTitle}>Soil Parameters</Text>
              <View style={styles.parameterRow}>
                <View style={styles.parameterItem}>
                  <Text style={styles.inputLabel}>pH Level (6.0-7.5):</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={pH}
                    onChangeText={setPH}
                    placeholder="6.5"
                  />
                </View>
                <View style={styles.parameterItem}>
                  <Text style={styles.inputLabel}>Daily Light Hours:</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={lightHours}
                    onChangeText={setLightHours}
                    placeholder="10"
                  />
                </View>
              </View>
            </View>

            {selectedSoil && (
              <View style={styles.selectedSoilContainer}>
                <Text style={styles.selectedSoilTitle}>Selected Soil Type</Text>
                <View style={[styles.soilColorPreview, { backgroundColor: `rgb(${selectedSoil.rgb.join(',')})` }]} />
                <Text style={styles.selectedSoilText}>
                  {selectedSoil.name} {selectedSoil.kinyarwandaName && `(${selectedSoil.kinyarwandaName})`}
                </Text>
                <Text style={styles.selectedSoilDesc}>
                  {selectedSoil.description}
                </Text>
              </View>
            )}

            {weatherData && (
              <View style={styles.weatherContainer}>
                <Text style={styles.weatherTitle}>Current Weather Conditions</Text>
                <View style={styles.weatherRow}>
                  <MaterialIcons name="device-thermostat" size={24} color="#1565C0" />
                  <Text style={styles.weatherText}>
                    Temperature: {weatherData.temperature}°C
                  </Text>
                </View>
                <View style={styles.weatherRow}>
                  <MaterialIcons name="grain" size={24} color="#1565C0" />
                  <Text style={styles.weatherText}>
                    Rainfall: {weatherData.rainfall}mm
                  </Text>
                </View>
              </View>
            )}

            {recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommended Crops</Text>
                {recommendations.map((rec, index) => (
                  <View key={index} style={[
                    styles.recommendationItem,
                    index === 0 && styles.topRecommendation
                  ]}>
                    <View style={styles.recommendationBadge}>
                      <Text style={styles.recommendationRank}>{index + 1}</Text>
                    </View>
                    <View style={styles.recommendationContent}>
                      <Text style={styles.recommendationName}>
                        {rec.plant} {rec.kinyarwandaName && `(${rec.kinyarwandaName})`}
                      </Text>
                      <View style={styles.confidenceMeter}>
                        <View style={[
                          styles.confidenceBar,
                          { width: `${rec.confidence}%` }
                        ]} />
                      </View>
                      <Text style={styles.recommendationConfidence}>
                        {rec.confidence.toFixed(1)}% suitable ({rec.suitability})
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  headerContainer: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E9',
    marginTop: 5,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#455A64',
    marginBottom: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#ECEFF1',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeImageTab: {
    backgroundColor: '#4CAF50',
  },
  activeTextTab: {
    backgroundColor: '#FF9800',
  },
  activeVoiceTab: {
    backgroundColor: '#E91E63',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
  },
  cameraIconContainer: {
    backgroundColor: '#4CAF50',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 16,
    color: '#455A64',
    marginBottom: 20,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
    width: '100%',
  },
  galleryButton: {
    backgroundColor: '#2196F3',
    width: '100%',
  },
  analyzeTextButton: {
    backgroundColor: '#FF9800',
    width: '100%',
  },
  voiceButton: {
    backgroundColor: '#E91E63',
    width: '100%',
  },
  recordingActive: {
    backgroundColor: '#C2185B',
  },
  recordedActive: {
    backgroundColor: '#9C27B0',
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
  parametersContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 12,
  },
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parameterItem: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#455A64',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    marginBottom: 16,
  },
  textInputContainer: {
    marginBottom: 24,
  },
  voiceContainer: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
  },
  voiceIconContainer: {
    backgroundColor: '#E91E63',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceInstruction: {
    fontSize: 16,
    color: '#7B1FA2',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
    width: '100%',
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  // retakeButton: {
  //   backgroundColor: '#F44336',
  // },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voiceResultContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    width: '100%',
  },
  voiceResultLabel: {
    fontSize: 14,
    color: '#5E35B1',
    fontWeight: '600',
    marginBottom: 4,
  },
  voiceResultTextInput: {
    backgroundColor: '#EDE7F6',
    borderRadius: 8,
    padding: 10,
    color: '#4527A0',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginTop: 5,
  },
  selectedSoilContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: '#2E7D32',
  },
  selectedSoilTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 10,
  },
  soilColorPreview: {
    width: '100%',
    height: 30,
    borderRadius: 6,
    marginBottom: 10,
  },
  selectedSoilText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 16,
  },
  selectedSoilDesc: {
    color: '#2E7D32',
    fontSize: 14,
    marginTop: 6,
  },
  weatherContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: '#1565C0',
  },
  weatherTitle: {
    color: '#0D47A1',
    fontWeight: '700',
    marginBottom: 12,
    fontSize: 16,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherText: {
    color: '#1565C0',
    marginLeft: 8,
    fontSize: 15,
  },
  recommendationsContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8F00',
    marginBottom: 16,
  },
  recommendationItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topRecommendation: {
    borderWidth: 2,
    borderColor: '#FFC107',
    backgroundColor: '#FFFDE7',
  },
  recommendationBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationRank: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 4,
  },
  confidenceMeter: {
    height: 6,
    backgroundColor: '#ECEFF1',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  recommendationConfidence: {
    fontSize: 13,
    color: '#78909C',
  },
});