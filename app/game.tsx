import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import practiceRules from '../data/practiceRules.json';
import wordBank from '../data/wordBank.json';
import { useCombo } from '../hooks/useCombo';
import { layoutStyles } from '../styles/layout';
import { colors, theme as styles } from '../styles/theme'; // <-- Imported colors here!
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
  
  const { levelId } = useLocalSearchParams<{ levelId: string }>();

  const currentRule = useMemo(() => {
    for (const lvl of practiceRules) {
      const sub = lvl.sublevels.find(s => s.id === levelId);
      if (sub) {
        return { level: lvl.level, ...sub };
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

  const shuffledWords = useMemo(() => {
    if (!currentRule) return [];

    const levelData = wordBank.find(l => l.level === currentRule.level);
    if (!levelData) return [];

    const sublevelData = levelData.sublevels.find(s => s.sublevel === currentRule.sublevel);
    if (!sublevelData) return [];

    let availableWords: any[] = [];
    
    sublevelData.sounds.forEach(soundGroup => {
      if (currentRule.option_buttons.includes(soundGroup.target_ipa)) {
        soundGroup.words.forEach(wordObj => {
          availableWords.push({
            ...wordObj,
            target_ipa: soundGroup.target_ipa
          });
        });
      }
    });

    return shuffle(availableWords).slice(0, WORDS_PER_SESSION);
  }, [currentRule]);

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
          setTimeout(finishGame, 300);
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
    
    if (levelId) {
      await saveLevelCompletion(levelId); 
    }
    
    setIsFinished(true);
  };

  const progressPercent = ((wordIdx + (feedback.correct ? 1 : 0)) / WORDS_PER_SESSION) * 100;

  // --- Conditional Renders ---
  if (isFinished) {
    return (
      <View style={styles.container}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.menuTitle}>Niveau Terminé !</Text>
        <View style={{ marginVertical: 20, alignItems: 'center' }}>
          <Text style={styles.successSubtitle}>Score de base : 100 ⭐</Text>
          {/* REPLACED: #FFD700 with colors.gold */}
          <Text style={[styles.successSubtitle, { color: colors.gold, fontWeight: 'bold' }]}>
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
        {/* REPLACED: #FF4B4B with colors.heartRed */}
        <Heart color={colors.heartRed} size={80} fill={colors.heartRed} />
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
        {/* REPLACED: #FFD700 with colors.gold */}
        <Text style={{ fontSize: 36, fontWeight: '900', color: colors.gold, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}>
          {combo} À LA SUITE ! 🔥
        </Text>
      </Animated.View>

      <View style={[layoutStyles.hud, { flexDirection: 'column', gap: 8 }]}>
        <View style={layoutStyles.progressTrack}>
          <View style={[layoutStyles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color={colors.textMuted} size={28} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Heart color={colors.heartRed} size={24} fill={colors.heartRed} />
            <Text style={[layoutStyles.statText, { color: colors.heartRed, marginLeft: 5 }]}>{lives}</Text>
          </View>
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