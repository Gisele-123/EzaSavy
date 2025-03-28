import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface LogoProps {
  size?: number;
  color?: string;
  showText?: boolean;
}

export default function Logo({ size = 120, color = '#4CAF50', showText = true }: LogoProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <G>
          {/* Main leaf shape */}
          <Path
            d="M50,10 C60,10 70,20 75,30 C80,40 80,50 75,60 C70,70 60,80 50,85 C40,80 30,70 25,60 C20,50 20,40 25,30 C30,20 40,10 50,10"
            fill={color}
            opacity="0.9"
          />
          {/* Leaf veins */}
          <Path
            d="M50,10 L50,85"
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity="0.3"
          />
          <Path
            d="M50,10 C60,10 70,20 75,30"
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity="0.3"
          />
          <Path
            d="M50,10 C40,10 30,20 25,30"
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity="0.3"
          />
        </G>
      </Svg>
      {showText && (
        <Text style={[styles.text, { color }]}>EzaSavy</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
}); 