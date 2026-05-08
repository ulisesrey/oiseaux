import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
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
  
  // 1. Get the String ID (e.g., "1-2") instead of an index
  const { levelId } = useLocalSearchParams<{ levelId: string }>();

  // 2. Find the rule in our Curriculum Tree
  const currentRule = useMemo(() => {
    for (const lvl of practiceRules) {
      const sub = lvl.sublevels.find(s => s.id === levelId);
      if (sub) {
        return { level: lvl.level, ...sub }; // We attach the parent Level number to help find words
      }
    }
    return null;
  }, [levelId]);

  // --- Combo Animation Logic ---
  const animScale = useRef(new Animated.Value(0.3)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  const popCombo = () => {
    animScale.setValue(0.3);
    animOpacity.setValue(1);
    Animated.sequence([
      Animated.spring(animScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(animOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const { combo, maxCombo, updateCombo } = useCombo(popCombo); 

  // --- Game State ---
  const [wordIdx, setWordIdx] = useState(0);
  const [lives, setLives] = useState(5);
  const [feedback, setFeedback] = useState<{choice: string | null, correct: boolean | null}>({ choice: null, correct: null });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    getUserStats().then(stats => setLives(stats.lives));
  }, []);

  // 3. Extract the Words from the Word Bank Tree
  const shuffledWords = useMemo(() => {
    if (!currentRule) return [];

    // Find Level block
    const levelData = wordBank.find(l => l.level === currentRule.level);
    if (!levelData) return [];

    // Find Sublevel block
    const sublevelData = levelData.sublevels.find(s => s.sublevel === currentRule.sublevel);
    if (!sublevelData) return [];

    // Flatten the sounds array into a single array of words
    let availableWords: any[] = [];
    
    sublevelData.sounds.forEach(soundGroup => {
      // Security check: Only grab words if their sound is actually one of our option buttons
      if (currentRule.option_buttons.includes(soundGroup.target_ipa)) {
        soundGroup.words.forEach(wordObj => {
          // We manually attach the target_ipa to the word so the game logic can check the answer
          availableWords.push({
            ...wordObj,
            target_ipa: soundGroup.target_ipa
          });
        });
      }
    });

    return shuffle(availableWords).slice(0, WORDS_PER_SESSION);
  }, [currentRule]);

  // Fallback if rule not found or word array is empty
  if (!currentRule || shuffledWords.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.menuTitle}>Erreur de niveau</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
    
    // 4. Save progress using the new string ID (e.g. "1-2") instead of a number!
    if (levelId) {
      await saveLevelCompletion(levelId); 
    }
    
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

      <Animated.View style={{ 
        position: 'absolute', top: 120, zIndex: 10, width: '100%', alignItems: 'center',
        opacity: animOpacity, transform: [{ scale: animScale }] 
      }}>
        <Text style={{ fontSize: 36, fontWeight: '900', color: '#FFD700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}>
          {combo} À LA SUITE ! 🔥
        </Text>
      </Animated.View>

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

      <View style={styles.wordContainer}>
        {renderWord(currentWord.word, currentWord.underlined_indices)}
      </View>

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