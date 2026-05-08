import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import practiceRules from '../data/practiceRules.json';
import wordBank from '../data/wordBank.json';
import { layoutStyles } from '../styles/layout';
import { theme as styles } from '../styles/theme';
import { addStars, getUserStats, saveLevelCompletion, updateLives } from '../utils/storage';

const WORDS_PER_SESSION = 2;

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

  const [wordIdx, setWordIdx] = useState(0);
  const [lives, setLives] = useState(5);
  const [feedback, setFeedback] = useState<{choice: string | null, correct: boolean | null}>({ choice: null, correct: null });
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

    if (correct) {
      setTimeout(() => {
        if (wordIdx + 1 < shuffledWords.length) {
          setWordIdx(prev => prev + 1);
          setFeedback({ choice: null, correct: null });
        } else {
          finishGame();
        }
      }, 600);
    } else {
      const newLives = Math.max(0, lives - 1);
      setLives(newLives);
      await updateLives(newLives);
      setTimeout(() => setFeedback({ choice: null, correct: null }), 1000);
    }
  };

  const finishGame = async () => {
    await addStars(100);
    await saveLevelCompletion(currentLevelIdx);
    setIsFinished(true);
  };

  const progressPercent = (wordIdx / WORDS_PER_SESSION) * 100;

  if (isFinished) {
    return (
      <View style={styles.container}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.menuTitle}>Niveau Terminé !</Text>
        <Text style={styles.successSubtitle}>
          Bravo ! Vous avez terminé votre session de {WORDS_PER_SESSION} mots et gagné 100 étoiles !
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace("/")}>
          <Text style={styles.btnText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (lives <= 0) {
    return (
      <View style={styles.container}>
        <Heart color="#FF4B4B" size={80} fill="#FF4B4B" />
        <Text style={styles.menuTitle}>Plus de vies !</Text>
        <Text style={styles.successSubtitle}>Reposez-vous et réessayez plus tard.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace("/")}>
          <Text style={styles.btnText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={layoutStyles.hud}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#AFC2CB" size={28} />
        </TouchableOpacity>

        <View style={layoutStyles.progressTrack}>
          <View style={[layoutStyles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Heart color="#FF4B4B" size={24} fill="#FF4B4B" />
          <Text style={[layoutStyles.statText, { color: '#FF4B4B' }]}>{lives}</Text>
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