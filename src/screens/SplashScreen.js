import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  StatusBar 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SplashScreen({ navigation }) {
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;  // Start invisible
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Start slightly smaller
  const moveAnim = useRef(new Animated.Value(50)).current;   // Start slightly lower

  useEffect(() => {
    // 1. Run Animations in parallel (Fade, Grow, Move Up)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Wait for 3 seconds, then navigate to Login
    const timer = setTimeout(() => {
      navigation.replace('Login'); // 'replace' means user can't go back to splash
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden /> 
      
      {/* Animated Content Wrapper */}
      <Animated.View style={{ 
        opacity: fadeAnim, 
        transform: [{ scale: scaleAnim }, { translateY: moveAnim }],
        alignItems: 'center' 
      }}>
        
        {/* Icon Circle */}
        <View style={styles.iconCircle}>
          <Ionicons name="briefcase" size={60} color="#0056b3" />
        </View>

        {/* App Title */}
        <Text style={styles.title}>Rozgaar Point</Text>
        <Text style={styles.subtitle}>Find Your Future Today</Text>

      </Animated.View>

      {/* Loading Dots at bottom */}
      <View style={styles.loaderContainer}>
        <Text style={styles.version}>Version 1.0</Text>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0056b3', // Main Brand Color (Blue)
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
    fontFamily: 'serif', // Or your custom font
  },
  subtitle: {
    color: '#e0e0e0',
    fontSize: 14,
    marginTop: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 40,
  },
  version: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  }
});