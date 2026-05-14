import { Audio } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Volume2 } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { audioMap } from '../data/audioMap';
import wordBank from '../data/wordBank.json';
import { useCombo } from '../hooks/useCombo';
import { colors, theme as styles } from '../styles/theme';
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

  const currentLevelData = useMemo(() => {
    for (const lvl of wordBank) {
      const sub = lvl.sublevels.find(s => `${lvl.level}-${s.sublevel}` === levelId);
      if (sub) {
        return {
          id: levelId,
          option_buttons: sub.sounds.map(soundGroup => soundGroup.target_ipa),
          sounds: sub.sounds
        };
      }
    }
    return null;
  }, [levelId]);

  // --- Animation Logic ---
  const animScale = useRef(new Animated.Value(0.3)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  const popCombo = () => {
    animScale.setValue(0.3);
    animOpacity.setValue(1);
    Animated.sequence([
      Animated.spring(animScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
      Animated.delay(100),
      Animated.timing(animOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const { combo, maxCombo, updateCombo } = useCombo(popCombo); 

  // --- Game State ---
  const [wordIdx, setWordIdx] = useState(0);
  const [lives, setLives] = useState(5);
  const [feedback, setFeedback] = useState<{choice: string | null, correct: boolean | null}>({ choice: null, correct: null });
  const [isFinished, setIsFinished] = useState(false);
  
  // --- Audio State ---
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    getUserStats().then(stats => setLives(stats.lives));
  }, []);

  // Cleanup audio from memory when unmounting or changing words
  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const shuffledWords = useMemo(() => {
    if (!currentLevelData) return [];
    let availableWords: any[] = [];
    currentLevelData.sounds.forEach(soundGroup => {
      soundGroup.words.forEach(wordObj => {
        availableWords.push({
          ...wordObj,
          target_ipa: soundGroup.target_ipa
        });
      });
    });
    return shuffle(availableWords).slice(0, WORDS_PER_SESSION);
  }, [currentLevelData]);

  if (!currentLevelData || shuffledWords.length === 0) {
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

  // --- The Audio Playback Function ---
  const playWordAudio = async () => {
    try {
      // Look up the word in our generated map
      const audioResource = audioMap[currentWord.word];

      if (!audioResource) {
        console.warn(`No audio file mapped for the word: ${currentWord.word}`);
        return;
      }

      // Load and play the local file
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioResource,
        { shouldPlay: true }
      );
      setSound(newSound);
      
    } catch (error) {
      console.log("Error playing audio:", error);
    }
  };

  // Auto-play audio when the word appears (with safety cleanup!)
  useEffect(() => {
    if (currentWord && !isFinished) {
      // Add a tiny delay so the UI loads before the sound blasts
      const timer = setTimeout(() => {
        playWordAudio();
      }, 300); 

      // If the component unmounts or changes BEFORE 300ms, cancel the timer
      return () => clearTimeout(timer);
    }
  }, [wordIdx, currentWord, isFinished]);


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
    if (levelId) await saveLevelCompletion(levelId); 
    setIsFinished(true);
  };

  const visualWordIdx = feedback.correct ? wordIdx + 1 : wordIdx;
  const progressPercent = (visualWordIdx / WORDS_PER_SESSION) * 100;

  // --- Conditional Renders ---
  if (isFinished) {
    return (
      <View style={styles.container}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.menuTitle}>Niveau Terminé !</Text>
        <View style={{ marginVertical: 20, alignItems: 'center' }}>
          <Text style={styles.successSubtitle}>Score de base : 100 ⭐</Text>
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
        <Text style={{ fontSize: 36, fontWeight: '900', color: colors.gold, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}>
          {combo} À LA SUITE ! 🔥
        </Text>
      </Animated.View>

      <SafeAreaView style={{ position: 'absolute', top: 0, width: '100%', zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color={colors.textMuted} size={28} />
          </TouchableOpacity>

          <View style={{ flex: 1, height: 14, backgroundColor: colors.locked, borderRadius: 7, marginHorizontal: 15, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: colors.duoGreen, borderRadius: 7, width: `${progressPercent}%` }} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Heart color={colors.heartRed} size={24} fill={colors.heartRed} />
            <Text style={{ marginLeft: 6, fontWeight: 'bold', fontSize: 16, color: colors.heartRed }}>{lives}</Text>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.wordContainer}>
        {renderWord(currentWord.word, currentWord.underlined_indices)}
        
        {/* Play Audio Button */}
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 15, backgroundColor: colors.surface, borderRadius: 50, elevation: 2, shadowColor: colors.shadow, shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 }} 
          onPress={playWordAudio}
        >
          <Volume2 color={colors.duoGreen} size={32} />
        </TouchableOpacity>
      </View>

      <View style={styles.optionsGrid}>
        {currentLevelData.option_buttons.map((opt) => {
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