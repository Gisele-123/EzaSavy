import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface ProfilePlaceholderProps {
  size?: number;
  color?: string;
}

export default function ProfilePlaceholder({ size = 80, color = '#2E7D32' }: ProfilePlaceholderProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background circle */}
        <Circle cx="50" cy="50" r="45" fill={color} opacity="0.1" />
        
        {/* User icon */}
        <G transform="translate(25, 25) scale(0.5)">
          <Circle cx="50" cy="35" r="25" fill={color} opacity="0.9" />
          <Path
            d="M50,70 C65,70 80,85 80,100 L20,100 C20,85 35,70 50,70"
            fill={color}
            opacity="0.9"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
}); 