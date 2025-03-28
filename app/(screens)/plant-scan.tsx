import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Audio } from 'expo-av';

type ScanMethod = 'camera' | 'text' | 'voice';

export default function PlantScanScreen() {
  const [scanMethod, setScanMethod] = useState<ScanMethod | null>(null);
  const [plantDescription, setPlantDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
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
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      // Here you would process the audio file
      console.log('Recording URI:', uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleScan = async () => {
    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Handle scan results
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View 
        entering={FadeIn}
        style={styles.header}
      >
        <Text style={styles.title}>Plant Disease Diagnosis</Text>
        <Text style={styles.subtitle}>Choose your preferred scanning method</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.optionCard}
        >
          <TouchableOpacity 
            style={[styles.option, scanMethod === 'camera' && styles.selectedOption]}
            onPress={() => setScanMethod('camera')}
          >
            <BlurView intensity={20} style={styles.optionContent}>
              <MaterialIcons name="camera-alt" size={32} color="#4CAF50" />
              <Text style={styles.optionTitle}>Camera</Text>
              <Text style={styles.optionDescription}>Take a photo of your plant</Text>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400)}
          style={styles.optionCard}
        >
          <TouchableOpacity 
            style={[styles.option, scanMethod === 'text' && styles.selectedOption]}
            onPress={() => setScanMethod('text')}
          >
            <BlurView intensity={20} style={styles.optionContent}>
              <MaterialIcons name="edit" size={32} color="#4CAF50" />
              <Text style={styles.optionTitle}>Text Input</Text>
              <Text style={styles.optionDescription}>Describe the plant symptoms</Text>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={styles.optionCard}
        >
          <TouchableOpacity 
            style={[styles.option, scanMethod === 'voice' && styles.selectedOption]}
            onPress={() => setScanMethod('voice')}
          >
            <BlurView intensity={20} style={styles.optionContent}>
              <MaterialIcons name="mic" size={32} color="#4CAF50" />
              <Text style={styles.optionTitle}>Voice Input</Text>
              <Text style={styles.optionDescription}>Describe symptoms verbally</Text>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {scanMethod === 'text' && (
        <Animated.View 
          entering={FadeInDown}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            placeholder="Describe the plant symptoms (leaves, stems, flowers, etc.)"
            value={plantDescription}
            onChangeText={setPlantDescription}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={handleScan}
          >
            <Text style={styles.scanButtonText}>Analyze Plant</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {scanMethod === 'voice' && (
        <Animated.View 
          entering={FadeInDown}
          style={styles.voiceContainer}
        >
          <TouchableOpacity 
            style={[styles.voiceButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <MaterialIcons 
              name={isRecording ? "stop" : "mic"} 
              size={32} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          <Text style={styles.voiceInstructions}>
            {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
          </Text>
        </Animated.View>
      )}
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
  optionsContainer: {
    padding: 16,
  },
  optionCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  optionContent: {
    padding: 20,
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 12,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  inputContainer: {
    padding: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceContainer: {
    padding: 16,
    alignItems: 'center',
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordingButton: {
    backgroundColor: '#F44336',
    animation: 'pulse 1s infinite',
  },
  voiceInstructions: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
}); 