import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react'; // Added useRef
import { Animated, Text, TouchableOpacity, View } from 'react-native'; // Added Animated
import practiceRules from '../data/practiceRules.json';
import wordBank from '../data/wordBank.json';
import { useCombo } from '../hooks/useCombo';
import { layoutStyles } from '../styles/layout';
import { theme as styles } from '../styles/theme';
import { addStars, getUserStats, saveLevelCompletion, updateLives } from '../utils/storage';

const WORDS_PER_SESSION = 5;

// --- Helpers ---
const shuffle = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array]; 
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

const renderWord = (word: string, indices: number[]) => {
  if (!indices || indices.length < 2) return <Text style={styles.wordText}>{word}</Text>;
  const [start, end] = indices;
  return (
    <Text style={styles.wordText}>
      {word.substring(0, start)}
      <Text style={styles.underlined}>{word.substring(start, end)}</Text>
      {word.substring(end)}
    </Text>
  );
};

export default function GameScreen() {
  const router = useRouter();
  const { levelIdx } = useLocalSearchParams();
  const currentLevelIdx = parseInt(levelIdx as string) || 0;

  // --- Combo Animation Logic ---
  // A. Define the starting animation values (Scale: 0.3, Opacity: 0)
  const animScale = useRef(new Animated.Value(0.3)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  // B. Define the function that runs the sequence
  const popCombo = () => {
    // Reset values immediately
    animScale.setValue(0.3);
    animOpacity.setValue(1);

    Animated.sequence([
      // 1. Pop up (Scale from 0.3 to 1.3 slightly too big)
      Animated.spring(animScale, {
        toValue: 1,
        friction: 4, // Control the bounciness
        tension: 40,
        useNativeDriver: true,
      }),
      // 2. Wait a beat
      Animated.delay(500),
      // 3. Fade out
      Animated.timing(animOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // --- Logic Hooks ---
  // Pass the animation function to the combo hook
  const { combo, maxCombo, updateCombo } = useCombo(popCombo); 

  // --- Game State ---
  const [wordIdx, setWordIdx] = useState(0);
  const [lives, setLives] = useState(5);
  const [feedback, setFeedback] = useState<{choice: string | null, correct: boolean | null}>({ 
    choice: null, 
    correct: null 
  });
  const [isFinished, setIsFinished] = useState(false);

  const currentRule = practiceRules[currentLevelIdx];

  useEffect(() => {
    getUserStats().then(stats => setLives(stats.lives));
  }, []);

  const shuffledWords = useMemo(() => {
    const filtered = wordBank.filter(item => 
      currentRule.target_sounds.includes(item.target_ipa)
    );
    return shuffle(filtered).slice(0, WORDS_PER_SESSION);
  }, [currentLevelIdx]);

  const currentWord = shuffledWords[wordIdx];

  const handlePress = async (choice: string) => {
    if (feedback.choice || isFinished || lives <= 0) return;

    const correct = choice === currentWord.target_ipa;
    setFeedback({ choice, correct });

    updateCombo(correct);

    if (correct) {
      setTimeout(() => {
        if (wordIdx + 1 < shuffledWords.length) {
          setWordIdx(prev => prev + 1);
          setFeedback({ choice: null, correct: null });
        } else {
          finishGame();
        }
      }, 700);
    } else {
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      await updateLives(newLives);
      setTimeout(() => setFeedback({ choice: null, correct: null }), 1000);
    }
  };

  const finishGame = async () => {
    const bonus = maxCombo * 10;
    await addStars(100 + bonus);
    await saveLevelCompletion(currentLevelIdx);
    setIsFinished(true);
  };

  const progressPercent = (wordIdx / WORDS_PER_SESSION) * 100;

  // --- Conditional Renders ---

  if (isFinished) {
    return (
      <View style={styles.container}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.menuTitle}>Niveau Terminé !</Text>
        <View style={{ marginVertical: 20, alignItems: 'center' }}>
          <Text style={styles.successSubtitle}>Score de base : 100 ⭐</Text>
          <Text style={[styles.successSubtitle, { color: '#FFD700', fontWeight: 'bold' }]}>
            Bonus Combo (x{maxCombo}) : +{maxCombo * 10} ⭐
          </Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace("/")}>
          <Text style={styles.btnText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (lives <= 0) {
    return (
      <View style={styles.container}>
        <Heart color="#FF4B4B" size={80} fill="#FF4B4B" />
        <Text style={styles.menuTitle}>Mince !</Text>
        <Text style={styles.successSubtitle}>Vous n'avez plus de vies. Attendez un peu ou réessayez !</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace("/")}>
          <Text style={styles.btnText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- Animated Combo Popup --- */}
      {/* 1. View must be 'Animated.View' */}
      <Animated.View style={{ 
        position: 'absolute', 
        top: 120, 
        zIndex: 10, 
        width: '100%', 
        alignItems: 'center',
        // 2. Link styles to the animated values
        opacity: animOpacity, 
        transform: [{ scale: animScale }] 
      }}>
        <Text style={{ 
          fontSize: 36, 
          fontWeight: '900', 
          color: '#FFD700', 
          textShadowColor: 'rgba(0,0,0,0.5)', 
          textShadowRadius: 4 
        }}>
          {combo} À LA SUITE ! 🔥
        </Text>
      </Animated.View>

      {/* Header HUD */}
      <View style={layoutStyles.hud}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#AFC2CB" size={28} />
        </TouchableOpacity>

        <View style={layoutStyles.progressTrack}>
          <View style={[layoutStyles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Heart color="#FF4B4B" size={24} fill="#FF4B4B" />
          <Text style={[layoutStyles.statText, { color: '#FF4B4B', marginLeft: 5 }]}>{lives}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.wordContainer}>
        {renderWord(currentWord.word, currentWord.underlined_indices)}
      </View>

      {/* Options */}
      <View style={styles.optionsGrid}>
        {currentRule.option_buttons.map((opt) => {
          const isCurrentChoice = feedback.choice === opt;
          return (
            <TouchableOpacity 
              key={opt} 
              activeOpacity={0.7}
              style={[
                styles.btn, 
                isCurrentChoice && (feedback.correct ? styles.btnSuccess : styles.btnError)
              ]} 
              onPress={() => handlePress(opt)}
            >
              <Text style={[styles.btnText, isCurrentChoice && styles.whiteText]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}