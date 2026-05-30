import { Slot } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/theme';

// Get the actual width and height of the user's physical phone screen
const { width, height } = Dimensions.get('window');

// We define our flock here. The offsets determine their position relative to the "leader".
const FLOCK = [
  { id: 1, size: 145, offsetX: 0, offsetY: 0, opacity: 0.74 },       // Leader (Center)
  { id: 2, size: 85, offsetX: 120, offsetY: 80, opacity: 0.7 },    // Trailing behind and right
  { id: 3, size: 80, offsetX: 60, offsetY: -90, opacity: 0.71 },    // Trailing behind and left
  { id: 4, size: 140, offsetX: 200, offsetY: -20, opacity: 0.75 },    // Far back
];

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);

  // --- Animation States ---
  const progressAnim = useRef(new Animated.Value(0)).current; 
  const fadeAnim = useRef(new Animated.Value(1)).current;     

  useEffect(() => {
    // 1. The Forward Movement
    Animated.timing(progressAnim, {
      toValue: 1, // Move the animation from 0% to 100%
      duration: 4500, // Takes 4.5 seconds
      easing: Easing.inOut(Easing.ease), 
      useNativeDriver: true,
    }).start();

    // 2. Fade out the splash screen right before the birds finish flying
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setIsAppReady(true));
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // =====================================================================
  // --- INTERPOLATIONS EXPLAINED ---
  // Interpolation translates our animation's "Time" (0 to 1) into "Pixels".
  // =====================================================================

  // 1. HORIZONTAL MOVEMENT (translateX)
  // Moving from the Right side to the Left side of the screen.
  const translateX = progressAnim.interpolate({
    inputRange: [0, 1], // As the timer goes from 0 to 1...
    outputRange: [
      width + 150, // START at 0: Start 150 pixels OFF-SCREEN to the RIGHT.
      -300         // END at 1: End 300 pixels OFF-SCREEN to the LEFT.
    ], 
  });

  // 2. VERTICAL MOVEMENT (translateY)
  // Moving from the Bottom to the Top of the screen.
  const translateY = progressAnim.interpolate({
    inputRange: [0, 1], // As the timer goes from 0 to 1...
    outputRange: [
      height + 150, // START at 0: Start 150 pixels BELOW the bottom of the screen.
      -300          // END at 1: End 300 pixels ABOVE the top of the screen.
    ], 
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Slot />

      {!isAppReady && (
        <Animated.View style={[styles.splashContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Oiseaux</Text>
          <Text style={styles.subtitle}>Apprendre en s'amusant</Text>

          {/* This is the invisible box moving diagonally across the screen */}
          <Animated.View style={[
            styles.flockContainer,
            { transform: [{ translateX }, { translateY }] }
          ]}>
            
            {/* We loop through our FLOCK array to render multiple birds inside the box */}
            {FLOCK.map((bird) => (
              <Animated.Image
                key={bird.id}
                source={require('../assets/images/bird.png')}
                style={[
                  styles.bird,
                  {
                    width: bird.size,
                    height: bird.size,
                    opacity: bird.opacity,
                    // We apply the offsets so they aren't stacked on top of each other
                    transform: [
                      { translateX: bird.offsetX },
                      { translateY: bird.offsetY },

                      // rotate image if needed
                      { rotate: '0deg' } 
                    ]
                  }
                ]}
                resizeMode="contain"
              />
            ))}
            
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.duoGreen,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  title: {
    fontSize: 54,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0F2E9',
  },
  flockContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bird: {
    position: 'absolute', // This lets us use offsets without pushing other birds around
  }
});