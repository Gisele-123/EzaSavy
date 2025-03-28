import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

type MenuItem = {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  route: string;
};

type SidebarProps = {
  isVisible: boolean;
  onClose: () => void;
};

export default function Sidebar({ isVisible, onClose }: SidebarProps) {
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const menuItems: MenuItem[] = [
    {
      title: 'Soil Scan',
      icon: 'grass',
      route: '/(screens)/soil-scan',
    },
    {
      title: 'Plant Scan',
      icon: 'camera-alt',
      route: '/(screens)/plant-scan',
    },
    {
      title: 'Weather',
      icon: 'wb-sunny',
      route: '/(screens)/weather',
    },
    {
      title: 'EzaSavvyBot',
      icon: 'chat',
      route: '/(screens)/bot',
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/(screens)/settings',
    },
  ];

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route);
  };

  return (
    <>
      {isVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View style={[styles.overlayBackground, { opacity: fadeAnim }]} />
        </TouchableOpacity>
      )}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <BlurView intensity={20} style={styles.sidebarContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.route)}
              >
                <View style={styles.menuItemContent}>
                  <MaterialIcons name={item.icon} size={24} color="#FFFFFF" />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    zIndex: 1001,
  },
  sidebarContent: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
}); 