import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

type SettingSection = {
  title: string;
  items: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    description?: string;
    type: 'toggle' | 'select' | 'action';
    value?: boolean;
    onPress?: () => void;
    onToggle?: (value: boolean) => void;
  }[];
};

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [language, setLanguage] = useState('English');

  const settingsSections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          title: 'Profile',
          type: 'action',
          onPress: () => console.log('Profile pressed'),
        },
        {
          icon: 'notifications',
          title: 'Notifications',
          description: 'Receive alerts and updates',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: 'security',
          title: 'Security',
          type: 'action',
          onPress: () => console.log('Security pressed'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'dark-mode',
          title: 'Dark Mode',
          description: 'Toggle dark theme',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: 'language',
          title: 'Language',
          description: 'Change app language',
          type: 'select',
          onPress: () => console.log('Language pressed'),
        },
        {
          icon: 'location-on',
          title: 'Location Services',
          description: 'Enable location-based features',
          type: 'toggle',
          value: locationServices,
          onToggle: setLocationServices,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help',
          title: 'Help Center',
          type: 'action',
          onPress: () => console.log('Help pressed'),
        },
        {
          icon: 'feedback',
          title: 'Send Feedback',
          type: 'action',
          onPress: () => console.log('Feedback pressed'),
        },
        {
          icon: 'info',
          title: 'About',
          type: 'action',
          onPress: () => console.log('About pressed'),
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Animated.View 
        entering={FadeIn}
        style={styles.header}
      >
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your app experience</Text>
      </Animated.View>

      {settingsSections.map((section, sectionIndex) => (
        <Animated.View 
          key={section.title}
          entering={FadeInDown.delay(sectionIndex * 200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <Animated.View 
              key={item.title}
              entering={FadeInDown.delay(sectionIndex * 200 + itemIndex * 100)}
              style={styles.settingItem}
            >
              <TouchableOpacity 
                style={styles.settingContent}
                onPress={item.onPress}
                disabled={item.type === 'toggle'}
              >
                <View style={styles.settingLeft}>
                  <MaterialIcons name={item.icon} size={24} color="#4CAF50" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    {item.description && (
                      <Text style={styles.settingDescription}>{item.description}</Text>
                    )}
                  </View>
                </View>
                {item.type === 'toggle' && (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                    thumbColor={item.value ? '#4CAF50' : '#FFFFFF'}
                  />
                )}
                {(item.type === 'action' || item.type === 'select') && (
                  <MaterialIcons name="chevron-right" size={24} color="#757575" />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      ))}

      <Animated.View 
        entering={FadeInDown.delay(800)}
        style={styles.logoutContainer}
      >
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => console.log('Logout pressed')}
        >
          <MaterialIcons name="logout" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </Animated.View>
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 16,
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
  },
  logoutContainer: {
    padding: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    marginLeft: 8,
    fontWeight: '600',
  },
}); 