import { useFocusEffect, useRouter } from 'expo-router';
import { Check, Flame, Heart, Lock, Star } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import wordBank from '../data/wordBank.json';
import { layoutStyles } from '../styles/layout';
import { colors } from '../styles/theme';
// 1. We imported calculateStreak here!
import { calculateStreak, getUserStats, registerUserLocal, UserStats } from '../utils/storage';
import { supabase } from '../utils/supabase';

export default function MainMenu() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  
  // 2. We added a state to hold the current streak
  const [streak, setStreak] = useState(0); 

  // --- Registration State ---
  const [usernameInput, setUsernameInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const loadStats = async () => {
    const data = await getUserStats();
    setStats(data);
    // 3. We calculate the streak and save it to the state
    setStreak(calculateStreak(data.played_dates)); 
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
      const interval = setInterval(loadStats, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  const flatSublevels = useMemo(() => {
    return wordBank.flatMap(level =>
      level.sublevels.map(s => ({ ...s, id: `${level.level}-${s.sublevel}` }))
    );
  }, []);

  // --- Handle Supabase Registration ---
  const handleRegister = async (isSkip = false) => {
    let cleanName = '';

    if (isSkip) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      cleanName = `Anonyme-${randomNum}`;
    } else {
      cleanName = usernameInput.trim();
      if (!cleanName) {
        setErrorMsg('Entre un pseudo !');
        return;
      }
    }

    setIsRegistering(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('users')
      .insert([{ username: cleanName, stars: stats?.stars || 0, played_dates: stats?.played_dates || [] }])
      .select()
      .single();

    if (error) {
      setIsRegistering(false);
      if (error.code === '23505') {
        if (isSkip) {
          handleRegister(true);
          return;
        }
        setErrorMsg('Ce nom est déjà pris. Essayez un autre !');
      } else {
        setErrorMsg('Erreur de connexion. Réessayez.');
        console.error(error);
      }
      return;
    }

    if (data) {
      const newStats = await registerUserLocal(data.username, data.id);
      setStats(newStats); 
    }
    setIsRegistering(false);
  };

  if (!stats) return null;

  // --- RENDER REGISTRATION SCREEN IF NO USERNAME ---
  if (!stats.username) {
    return (
      <SafeAreaView style={styles.regSafeArea}>
        <View style={styles.regContainer}>
          <Text style={styles.regTitle}>Prêt à décoller ? 🐦</Text>
          <Text style={styles.regSubtitle}>Choisis un pseudo pour rejoindre le classement mondial.</Text>

          <TextInput
            style={styles.regInput}
            placeholder={isFocused ? '' : 'Ton pseudo...'} 
            placeholderTextColor="#A0A0A0"
            value={usernameInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChangeText={(text) => {
              setUsernameInput(text);
              setErrorMsg(''); 
            }}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={15}
          />

          {errorMsg ? <Text style={styles.regErrorText}>{errorMsg}</Text> : null}

          <TouchableOpacity 
            style={[styles.regPrimaryBtn, { opacity: isRegistering ? 0.7 : 1 }]} 
            onPress={() => handleRegister(false)}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.regPrimaryBtnText}>Commencer</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.regSkipBtn} 
            onPress={() => handleRegister(true)}
            disabled={isRegistering}
          >
            <Text style={styles.regSkipBtnText}>Jouer en anonyme</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDER NORMAL MAIN MENU ---
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- HEADER HUD --- */}
      <View style={layoutStyles.headerContainer}>
        
        {/* 4. And finally, we display the dynamic streak here! */}
        <View style={layoutStyles.statItem}>
          <Flame color={colors.heartRed} size={20} fill={colors.heartRed} />
          <Text style={layoutStyles.statText}>{streak}</Text> 
        </View>
        
        <TouchableOpacity 
          style={[layoutStyles.statItem, layoutStyles.starBg]}
          onPress={() => router.push("/ranking")}
          activeOpacity={0.7}
        >
          <Star color={colors.gold} size={20} fill={colors.gold} />
          <Text style={[layoutStyles.statText, layoutStyles.whiteText]}>{stats.stars.toLocaleString()}</Text>
        </TouchableOpacity>

        <View style={layoutStyles.statItem}>
          <Heart color={colors.heartRed} size={20} fill={colors.heartRed} />
          <Text style={layoutStyles.statText}>{stats.lives}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {wordBank.map((levelBlock) => (
          <View key={`level-${levelBlock.level}`} style={styles.levelBlockWrapper}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{levelBlock.level_title}</Text>
            </View>

            {levelBlock.sublevels.map((sublevel) => {
              const id = `${levelBlock.level}-${sublevel.sublevel}`;
              const absoluteIndex = flatSublevels.findIndex(s => s.id === id);
              const isFirstNode = absoluteIndex === 0;
              const prevNode = isFirstNode ? null : flatSublevels[absoluteIndex - 1];
              
              const isUnlocked = isFirstNode || (stats.progress && stats.progress[prevNode!.id] > 0);
              const isCompleted = stats.progress && stats.progress[id] > 0;
              const isCurrent = isUnlocked && !isCompleted;

              const translateX = Math.sin(absoluteIndex * 0.9) * 60;

              return (
                <View key={id} style={[styles.nodeWrapper, { transform: [{ translateX }] }]}>
                  <TouchableOpacity 
                    disabled={!isUnlocked}
                    activeOpacity={0.8}
                    style={[
                      styles.node,
                      isCompleted && styles.nodeCompleted,
                      isCurrent && styles.nodeCurrent,
                      !isUnlocked && styles.nodeLocked,
                    ]}
                    onPress={() => router.push({ pathname: "/game", params: { levelId: id } })}
                  >
                    {isCompleted ? (
                      <Check color="#fff" size={40} strokeWidth={3} />
                    ) : !isUnlocked ? (
                      <Lock color={colors.textMuted} size={32} />
                    ) : (
                      <Star color="#fff" size={32} fill="#fff" />
                    )}
                  </TouchableOpacity>
                  <View style={styles.nodeLabelContainer}>
                    <Text style={[styles.nodeLabel, !isUnlocked && styles.nodeLabelLocked]}>
                      {sublevel.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingVertical: 40, alignItems: 'center' },
  levelBlockWrapper: { width: '100%', alignItems: 'center', marginBottom: 20 },
  nodeWrapper: { alignItems: 'center', marginVertical: 15 },
  sectionHeader: { backgroundColor: colors.duoGreen, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 16, width: '90%', marginBottom: 20, marginTop: 10 },
  sectionTitle: { color: colors.textWhite, fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  node: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 4, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  nodeCompleted: { backgroundColor: colors.gold, borderColor: colors.goldDark },
  nodeCurrent: { backgroundColor: colors.duoGreen, borderColor: colors.duoGreenDark, transform: [{ scale: 1.1 }] },
  nodeLocked: { backgroundColor: colors.locked, borderColor: colors.lockedDark },
  nodeLabelContainer: { marginTop: 8, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 2, borderColor: colors.border },
  nodeLabel: { fontSize: 14, fontWeight: 'bold', color: colors.textMain },
  nodeLabelLocked: { color: colors.textMuted },
  
  // --- Beautiful Registration Screen Styles ---
  regSafeArea: { flex: 1, backgroundColor: colors.duoGreen },
  regContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  regTitle: { fontSize: 36, fontWeight: '900', color: '#ffffff', marginBottom: 10, textAlign: 'center' },
  regSubtitle: { fontSize: 16, color: '#E0F2E9', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  regInput: { 
    backgroundColor: '#ffffff', 
    width: '100%', 
    paddingVertical: 18, 
    paddingHorizontal: 20, 
    borderRadius: 16, 
    fontSize: 20, 
    color: colors.duoGreen, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  regErrorText: { color: '#FFB4A2', fontWeight: 'bold', textAlign: 'center', marginBottom: 15, fontSize: 16 },
  regPrimaryBtn: { 
    backgroundColor: colors.gold, 
    width: '100%', 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5
  },
  regPrimaryBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' },
  regSkipBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  regSkipBtnText: { color: '#E0F2E9', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
});