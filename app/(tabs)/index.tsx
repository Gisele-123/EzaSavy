import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Sidebar from '../../components/Sidebar';
import { router } from 'expo-router';

type QuickAction = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  route: string;
  color: string;
};

type DailyTip = {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

type StatCard = {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

export default function HomeScreen() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const userName = "Gisele"; 
  const quickActions: QuickAction[] = [
    {
      icon: 'camera-alt',
      title: 'Soil Scan',
      route: '/(screens)/soil-scan',
      color: '#4CAF50',
    },
    {
      icon: 'camera-alt',
      title: 'Plant Scan',
      route: '/(screens)/plant-scan',
      color: '#4CAF50',
    },
    {
      icon: 'wb-sunny',
      title: 'Weather',
      route: '/(screens)/weather',
      color: '#4CAF50',
    },
    {
      icon: 'chat',
      title: 'EzaSavvyBot',
      route: '/(screens)/bot',
      color: '#4CAF50',
    },
  ];

  const dailyTip: DailyTip = {
    title: "Today's Farming Tip",
    description: "Water your plants early in the morning to reduce evaporation and prevent fungal diseases. This helps plants absorb water more effectively.",
    icon: 'lightbulb',
  };

  const stats: StatCard[] = [
    {
      title: 'Soil Health',
      value: '85%',
      change: '+5%',
      icon: 'grass',
      color: '#4CAF50',
    },
    {
      title: 'Crop Growth',
      value: '92%',
      change: '+3%',
      icon: 'trending-up',
      color: '#4CAF50',
    },
    {
      title: 'Water Usage',
      value: '65%',
      change: '-2%',
      icon: 'water-drop',
      color: '#4CAF50',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Sidebar isVisible={isSidebarVisible} onClose={() => setIsSidebarVisible(false)} />
        
        <Animated.View 
          entering={FadeIn}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setIsSidebarVisible(true)}
            >
              <MaterialIcons name="menu" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>EzaSavy</Text>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
        <Image
                source={require('../../assets/images/profile.jpg')}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Animated.View 
            entering={FadeInDown.delay(200)}
            style={styles.welcomeSection}
          >
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}!</Text>
            <Text style={styles.welcomeSubtext}>Let's make your farming smarter today</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(300)}
            style={styles.statsSection}
          >
            <Text style={styles.sectionTitle}>Farm Statistics</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <Animated.View 
                  key={stat.title}
                  entering={FadeInDown.delay(350 + index * 100)}
                  style={styles.statCard}
                >
                  <BlurView intensity={20} style={styles.statContent}>
                    <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
                      <MaterialIcons name={stat.icon} size={24} color={stat.color} />
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                    <View style={styles.statChangeContainer}>
                      <MaterialIcons 
                        name={stat.change.startsWith('+') ? 'trending-up' : 'trending-down'} 
                        size={16} 
                        color={stat.change.startsWith('+') ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[
                        styles.statChange,
                        { color: stat.change.startsWith('+') ? '#4CAF50' : '#FF5252' }
                      ]}>
                        {stat.change}
                      </Text>
                    </View>
                  </BlurView>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(400)}
            style={styles.quickActions}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <Animated.View 
                  key={action.title}
                  entering={FadeInDown.delay(500 + index * 100)}
                  style={styles.actionCard}
                >
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => router.push(action.route as any)}
                  >
                    <BlurView intensity={20} style={styles.actionContent}>
                      <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
                        <MaterialIcons name={action.icon} size={32} color={action.color} />
                      </View>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                    </BlurView>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(600)}
            style={styles.tipSection}
          >
            <BlurView intensity={20} style={styles.tipContent}>
              <View style={styles.tipHeader}>
                <MaterialIcons name={dailyTip.icon} size={24} color="#4CAF50" />
                <Text style={styles.tipTitle}>{dailyTip.title}</Text>
              </View>
              <Text style={styles.tipDescription}>{dailyTip.description}</Text>
            </BlurView>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(700)}
            style={styles.weatherCard}
          >
            <BlurView intensity={20} style={styles.weatherContent}>
              <Text style={styles.weatherTitle}>Weather Forecast</Text>
              <View style={styles.weatherInfo}>
                <MaterialIcons name="wb-sunny" size={48} color="#4CAF50" />
                <View style={styles.weatherDetails}>
                  <Text style={styles.temperature}>25°C</Text>
                  <Text style={styles.location}>Kigali, Rwanda</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  profileButton: {
    padding: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#757575',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 4,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statContent: {
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  statChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChange: {
    fontSize: 14,
    marginLeft: 4,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionContent: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  tipSection: {
    padding: 16,
  },
  tipContent: {
    borderRadius: 12,
    padding: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  tipDescription: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  weatherCard: {
    padding: 16,
  },
  weatherContent: {
    borderRadius: 12,
    padding: 20,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 16,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetails: {
    marginLeft: 16,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  location: {
    fontSize: 16,
    color: '#757575',
  },
});


