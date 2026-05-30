import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/theme';
import { getUserStats } from '../utils/storage';
import { supabase } from '../utils/supabase';

type Player = {
  id: string;
  username: string;
  stars: number;
};

export default function RankingScreen() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUsername, setMyUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // 1. Get local username to highlight the user's own row
      const stats = await getUserStats();
      if (stats.username) setMyUsername(stats.username);

      // 2. Fetch the top 50 players from Supabase, sorted by stars
      const { data, error } = await supabase
        .from('users')
        .select('id, username, stars')
        .order('stars', { ascending: false })
        .limit(50);

      if (data) setPlayers(data);
      if (error) console.error("Error fetching ranking:", error);
      
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const renderItem = ({ item, index }: { item: Player; index: number }) => {
    const isMe = item.username === myUsername;
    const rank = index + 1;
    
    // Assign special medals to the top 3
    let rankDisplay = <Text style={styles.rankText}>{rank}</Text>;
    if (rank === 1) rankDisplay = <Text style={styles.medal}>🥇</Text>;
    if (rank === 2) rankDisplay = <Text style={styles.medal}>🥈</Text>;
    if (rank === 3) rankDisplay = <Text style={styles.medal}>🥉</Text>;

    return (
      <View style={[styles.playerRow, isMe && styles.myPlayerRow]}>
        <View style={styles.rankContainer}>{rankDisplay}</View>
        <Text style={[styles.usernameText, isMe && styles.myUsernameText]}>
          {item.username} {isMe && "(Toi)"}
        </Text>
        <Text style={styles.starsText}>{item.stars.toLocaleString()} ⭐</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.textMain} size={28} />
        </TouchableOpacity>
        <Trophy color={colors.gold} size={28} fill={colors.gold} style={{ marginRight: 10 }} />
        <Text style={styles.title}>Classement</Text>
        <View style={{ width: 28 }} /> {/* Spacer to keep title perfectly centered */}
      </View>

      {/* --- LEADERBOARD LIST --- */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.duoGreen} />
        </View>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 2, borderBottomColor: colors.border, backgroundColor: colors.surface },
  backButton: { marginRight: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textMain, flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 2, borderColor: colors.border },
  myPlayerRow: { borderColor: colors.gold, backgroundColor: '#FFF9E6' },
  rankContainer: { width: 40, alignItems: 'center', marginRight: 15 },
  rankText: { fontSize: 18, fontWeight: 'bold', color: colors.textMuted },
  medal: { fontSize: 24 },
  usernameText: { flex: 1, fontSize: 18, fontWeight: 'bold', color: colors.textMain },
  myUsernameText: { color: colors.goldDark },
  starsText: { fontSize: 16, fontWeight: '900', color: colors.gold },
});