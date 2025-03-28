import React, { useRef } from 'react';
import { View, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}

export default function AnimatedCard({
  children,
  style,
  onPress,
  disabled = false,
}: AnimatedCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(3)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 3,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => onPress?.());
  };

  const cardStyle = [
    styles.card,
    {
      transform: [{ scale: scaleAnim }],
      shadowOpacity: shadowAnim.interpolate({
        inputRange: [1, 3],
        outputRange: [0.1, 0.2],
      }),
      shadowRadius: shadowAnim.interpolate({
        inputRange: [1, 3],
        outputRange: [4, 8],
      }),
      opacity: disabled ? 0.5 : opacityAnim,
    },
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={cardStyle}>
        <BlurView intensity={20} style={styles.blurContainer}>
          {children}
        </BlurView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={cardStyle}>
      <BlurView intensity={20} style={styles.blurContainer}>
        {children}
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  blurContainer: {
    padding: 15,
  },
}); 