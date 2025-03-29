import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export default function SoilScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [soilDescription, setSoilDescription] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<'text' | 'voice'>('text');
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      
      if (status !== 'granted' || cameraStatus !== 'granted' || audioStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera, media library, and microphone permissions to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      await recording.startAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  const playRecording = async () => {
    try {
      if (!audioUri) return;
      
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      await sound.playAsync();
    } catch (error) {
      Alert.alert('Error', 'Failed to play recording. Please try again.');
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

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        handleScan(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        handleScan(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleScan = async (imageUri: string) => {
    setScanning(true);
    try {
      // Here you would typically send the image to your backend for analysis
      // For now, we'll simulate a delay and response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated AI response
      const response = "Based on the image analysis, this soil appears to be rich in organic matter with a dark brown color indicating good fertility. The texture suggests a loamy composition, which is ideal for most crops. The pH level appears to be neutral, which is optimal for plant growth.";
      setAiResponse(response);
      
      // If voice response is selected, play it
      if (responseType === 'voice') {
        // Here you would typically use text-to-speech to convert the response
        // For now, we'll just show a message
        Alert.alert(
          "Analysis Complete",
          "Playing voice response...",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Analysis Complete",
          "Soil analysis has been completed successfully!",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to analyze soil. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async () => {
    if (!image && !soilDescription && !audioUri) {
      Alert.alert(
        "No Input",
        "Please provide at least one form of input (image, text description, or voice recording) before submitting.",
        [{ text: "OK" }]
      );
      return;
    }

    setScanning(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Simulated AI response based on input type
      let response = "Based on the provided information:\n\n";
      
      if (image) {
        response += "• Image Analysis: The soil appears to be rich in organic matter with a dark brown color indicating good fertility.\n";
      }
      if (soilDescription) {
        response += `• Text Description: ${soilDescription}\n`;
      }
      if (audioUri) {
        response += "• Voice Description: [Audio recording analyzed]\n";
      }
      
      response += "\nOverall Analysis: The soil shows optimal conditions for most crops with a balanced pH level and good nutrient content. Consider adding organic compost to maintain fertility.";
      
      setAiResponse(response);
      
      if (responseType === 'voice') {
        // Convert the response to speech
        await Speech.speak(response, {
          language: 'en',
          pitch: 1,
          rate: 0.9,
        });
      } else {
        Alert.alert(
          "Analysis Complete",
          "Soil analysis has been completed successfully!",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to analyze soil. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setScanning(false);
    }
  };

  // Add function to handle response type change
  const handleResponseTypeChange = async (type: 'text' | 'voice') => {
    setResponseType(type);
    if (type === 'voice' && aiResponse) {
      try {
        await Speech.speak(aiResponse, {
          language: 'en',
          pitch: 1,
          rate: 0.9,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to play voice response. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Animated.View 
          entering={FadeIn}
          style={styles.content}
        >
          <BlurView intensity={20} style={styles.card}>
            <View style={styles.header}>
              <MaterialIcons name="science" size={32} color="#4CAF50" />
              <Text style={styles.title}>Soil Analysis</Text>
            </View>

            <Text style={styles.description}>
              Analyze your soil sample to get detailed information about its composition, pH level, and nutrient content.
            </Text>

            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                {scanning && (
                  <View style={styles.scanningOverlay}>
                    <MaterialIcons name="science" size={40} color="#FFFFFF" />
                    <Text style={styles.scanningText}>Analyzing soil...</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.placeholder}>
                <MaterialIcons name="photo-camera" size={48} color="#4CAF50" />
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cameraButton]}
                onPress={takePhoto}
              >
                <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.galleryButton]}
                onPress={pickImage}
              >
                <MaterialIcons name="photo-library" size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>Choose from Gallery</Text>
              </TouchableOpacity>
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
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </Text>
                </TouchableOpacity>

                {audioUri && (
                  <TouchableOpacity 
                    style={[styles.audioButton, styles.playButton]}
                    onPress={playRecording}
                  >
                    <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Play Recording</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.submitButton, (!image && !soilDescription && !audioUri) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!image && !soilDescription && !audioUri || scanning}
            >
              <MaterialIcons name={scanning ? "hourglass-empty" : "send"} size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {scanning ? "Processing..." : "Submit for Analysis"}
              </Text>
            </TouchableOpacity>

            {aiResponse && (
              <View style={styles.responseContainer}>
                <Text style={styles.inputLabel}>AI Analysis:</Text>
                <View style={styles.responseContent}>
                  <Text style={styles.responseText}>{aiResponse}</Text>
                  <View style={styles.responseTypeContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.responseTypeButton,
                        responseType === 'text' && styles.responseTypeButtonActive
                      ]}
                      onPress={() => handleResponseTypeChange('text')}
                    >
                      <MaterialIcons name="text-fields" size={24} color={responseType === 'text' ? '#FFFFFF' : '#666666'} />
                      <Text style={[
                        styles.responseTypeText,
                        responseType === 'text' && styles.responseTypeTextActive
                      ]}>Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.responseTypeButton,
                        responseType === 'voice' && styles.responseTypeButtonActive
                      ]}
                      onPress={() => handleResponseTypeChange('voice')}
                    >
                      <MaterialIcons name="volume-up" size={24} color={responseType === 'voice' ? '#FFFFFF' : '#666666'} />
                      <Text style={[
                        styles.responseTypeText,
                        responseType === 'voice' && styles.responseTypeTextActive
                      ]}>Voice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </BlurView>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.delay(200)}
          style={styles.instructions}
        >
          <BlurView intensity={20} style={styles.instructionsContent}>
            <Text style={styles.instructionsTitle}>How to Scan Soil</Text>
            <Text style={styles.instructionsText}>
              1. Place the soil sample in good lighting{'\n'}
              2. Hold the camera steady{'\n'}
              3. Ensure the entire sample is in frame{'\n'}
              4. Take a clear photo{'\n'}
              5. Describe the soil's appearance{'\n'}
              6. Optionally record a voice description{'\n'}
              7. Choose your preferred response format
            </Text>
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
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
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
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
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
  },
  galleryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  responseContainer: {
    marginBottom: 24,
  },
  responseContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  responseText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  responseTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  responseTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  responseTypeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  responseTypeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  responseTypeTextActive: {
    color: '#FFFFFF',
  },
  instructions: {
    padding: 20,
  },
  instructionsContent: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  submitButton: {
    backgroundColor: '#FF9800',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
}); 