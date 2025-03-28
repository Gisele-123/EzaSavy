import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface ScanOptionProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  color: string;
  delay: number;
}

export default function ScanScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const ScanOption = ({ title, icon, onPress, color, delay }: ScanOptionProps) => {
    const optionFadeAnim = React.useRef(new Animated.Value(0)).current;
    const optionSlideAnim = React.useRef(new Animated.Value(50)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(optionFadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(optionSlideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []);

    return (
      <Animated.View 
        style={[
          styles.optionContainer,
          {
            opacity: optionFadeAnim,
            transform: [
              { translateY: optionSlideAnim },
              { scale: scaleAnim }
            ],
          },
        ]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.optionTouchable}>
          <BlurView intensity={20} style={styles.blurContainer}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={icon} size={40} color={color} />
            </View>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionDescription}>
              {title === 'Soil Scan' 
                ? 'Analyze soil health and nutrients'
                : 'Diagnose plant diseases and health'}
            </Text>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <Text style={styles.title}>Choose Scan Type</Text>
        <Text style={styles.subtitle}>Select what you want to analyze</Text>
      </Animated.View>

      <ScrollView style={styles.content}>
        <View style={styles.optionsContainer}>
          <ScanOption
            title="Soil Scan"
            icon="grass"
            color="#4CAF50"
            onPress={() => router.push('/soil-scan')}
            delay={300}
          />
          <ScanOption
            title="Plant Scan"
            icon="local-florist"
            color="#4CAF50"
            onPress={() => router.push('/plant-scan')}
            delay={600}
          />
        </View>
      </ScrollView>
    </View>
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
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  optionsContainer: {
    padding: 20,
    gap: 20,
  },
  optionContainer: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  optionTouchable: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
}); 