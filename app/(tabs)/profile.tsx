import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProfilePlaceholder from '../../components/ProfilePlaceholder';

export default function ProfileScreen() {
  const router = useRouter();

  const menuItems = [
    { icon: 'person', title: 'Personal Information', route: '/profile/edit' },
    { icon: 'notifications', title: 'Notifications', route: '/profile/notifications' },
    { icon: 'language', title: 'Language', route: '/profile/language' },
    { icon: 'help', title: 'Help & Support', route: '/profile/help' },
    { icon: 'info', title: 'About EzaSavy', route: '/profile/about' },
    { icon: 'logout', title: 'Logout', route: '/login' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Image source={require('../../assets/images/profile.jpg')} style={{ width: 52,
    height: 52,
    borderRadius: 18,}}/>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Gisele Akuzwe M.</Text>
            <Text style={styles.email}>giselemigisha53@gmail.com</Text>
            <Text style={styles.location}>Kigali, Rwanda</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Active Crops</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Saved Tips</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemLeft}>
                <MaterialIcons name={item.icon as "person" | "notifications" | "language" | "help" | "info" | "logout"} size={24} color="#2E7D32" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
}); 