import { useFocusEffect, useRouter } from 'expo-router';
import { Check, Flame, Heart, Lock, Star } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import wordBank from '../data/wordBank.json';
import { layoutStyles } from '../styles/layout';
import { colors } from '../styles/theme';
import { getUserStats, registerUserLocal, UserStats } from '../utils/storage';
import { supabase } from '../utils/supabase';

export default function MainMenu() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);

  // --- Registration State ---
  const [usernameInput, setUsernameInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadStats = async () => {
    const data = await getUserStats();
    setStats(data);
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
  const handleRegister = async () => {
    const cleanName = usernameInput.trim();
    if (!cleanName) return;

    setIsRegistering(true);
    setErrorMsg('');

    // 1. Try to insert the new user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([{ username: cleanName, stars: stats?.stars || 0 }])
      .select()
      .single();

    if (error) {
      setIsRegistering(false);
      // Supabase error code 23505 means "Unique Violation" (Name already taken)
      if (error.code === '23505') {
        setErrorMsg('Ce nom est déjà pris. Essayez un autre !');
      } else {
        setErrorMsg('Erreur de connexion. Réessayez.');
        console.error(error);
      }
      return;
    }

    // 2. If successful, save the new ID and Name to the phone's local storage
    if (data) {
      const newStats = await registerUserLocal(data.username, data.id);
      setStats(newStats); // This will automatically hide the registration screen!
    }
    setIsRegistering(false);
  };

  if (!stats) return null;

  // --- RENDER REGISTRATION SCREEN IF NO USERNAME ---
  if (!stats.username) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', padding: 20 }]}>
        <View style={styles.registrationCard}>
          <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 10 }}>👋</Text>
          <Text style={styles.sectionTitle}>Bienvenue !</Text>
          <Text style={[styles.nodeLabel, { textAlign: 'center', marginTop: 10, marginBottom: 30 }]}>
            Comment tu t'appelles ? Ce nom apparaîtra dans le classement v2.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ton pseudo..."
            placeholderTextColor={colors.textMuted}
            value={usernameInput}
            onChangeText={setUsernameInput}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={15}
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity 
            style={[layoutStyles.btn, { marginTop: 20, width: '100%', opacity: isRegistering ? 0.7 : 1 }]} 
            onPress={handleRegister}
            disabled={isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={layoutStyles.btnText}>Commencer</Text>
            )}
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
        <View style={layoutStyles.statItem}>
          <Flame color={colors.heartRed} size={20} fill={colors.heartRed} />
          <Text style={layoutStyles.statText}>4</Text>
        </View>
        
        {/* FIX: Make the Star counter a clickable button to the Leaderboard! */}
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
  
  // --- New Styles for Registration ---
  registrationCard: { backgroundColor: colors.surface, padding: 30, borderRadius: 24, borderWidth: 2, borderColor: colors.border, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  input: { backgroundColor: colors.background, borderWidth: 2, borderColor: colors.border, borderRadius: 16, padding: 15, fontSize: 18, color: colors.textMain, fontWeight: 'bold', textAlign: 'center' },
  errorText: { color: colors.heartRed, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
});