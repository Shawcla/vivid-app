import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { creatorsAPI, filmsAPI } from '../../src/services/api';
import { Colors, Fonts, Spacing, Radius } from '../../src/utils/theme';
import { LoadingSpinner, EmptyState } from '../../src/components';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 2 - 10) / 2;

export default function WatchlistScreen() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'history'>('watchlist');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [wlRes, histRes] = await Promise.all([
        creatorsAPI.getWatchlist(),
        creatorsAPI.getHistory(),
      ]);
      setWatchlist(wlRes.data.watchlist || []);
      setHistory(histRes.data.history || []);
    } catch (err: any) {
      console.warn('Watchlist load error:', err?.message || err);
      // Not logged in or no data — show empty gracefully
      setWatchlist([]);
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemove = async (filmId: string) => {
    await filmsAPI.removeFromWatchlist(filmId);
    setWatchlist((prev) => prev.filter((f) => f.id !== filmId));
  };

  const formatProgress = (seconds: number, total: number) => {
    if (!total) return null;
    return Math.round((seconds / total) * 100);
  };

  const thumbColors: [string, string][] = [
    ['#1a0a2e', '#4a1a7a'],
    ['#0a1a2e', '#1a3a5a'],
    ['#2e0a1a', '#5a1a3a'],
    ['#0a2e1a', '#1a5a3a'],
    ['#2e1a0a', '#5a3a1a'],
  ];

  if (loading) return <LoadingSpinner />;

  const activeData = activeTab === 'watchlist' ? watchlist : history;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MY LIST</Text>
        <Text style={styles.count}>
          {activeTab === 'watchlist' ? `${watchlist.length} films` : `${history.length} watched`}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['watchlist', 'history'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={tab === 'watchlist' ? 'bookmark' : 'time'}
              size={14}
              color={activeTab === tab ? Colors.purpleNeon : Colors.textDim}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'watchlist' ? 'WATCHLIST' : 'HISTORY'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Film Grid */}
      <FlatList
        data={activeData}
        numColumns={2}
        keyExtractor={(item) => item.id + activeTab}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 10 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.purpleNeon} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'watchlist' ? '🔖' : '📺'}
            title={activeTab === 'watchlist' ? 'Your list is empty' : 'No watch history'}
            subtitle={activeTab === 'watchlist' ? 'Add films to watch later' : 'Films you watch will appear here'}
          />
        }
        renderItem={({ item, index }) => {
          const colors = thumbColors[index % thumbColors.length];
          const progress = activeTab === 'history'
            ? formatProgress(item.progress_seconds || 0, item.duration_seconds || 0)
            : null;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/film/${item.id}`)}
              activeOpacity={0.85}
            >
              {/* Thumbnail */}
              <View style={styles.thumb}>
                {item.thumbnail_url ? (
                  <Image source={{ uri: item.thumbnail_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={colors} style={StyleSheet.absoluteFill}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 28 }}>🎬</Text>
                    </View>
                  </LinearGradient>
                )}

                {/* Progress bar */}
                {progress !== null && progress !== undefined && (
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                )}

                {/* Completed badge */}
                {item.completed && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={10} color={Colors.dark} />
                  </View>
                )}

                {/* Remove from watchlist */}
                {activeTab === 'watchlist' && (
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item.id)}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <Ionicons name="close" size={12} color={Colors.white} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.filmTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.filmMeta}>
                  {activeTab === 'history' && progress !== null
                    ? `${progress}% watched`
                    : item.genre || item.creator_username}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: { fontFamily: Fonts.display, fontSize: 26, letterSpacing: 2, color: Colors.white },
  count: { fontSize: 12, color: Colors.textDim, fontFamily: Fonts.body, fontWeight: '600', letterSpacing: 1 },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.dark3,
    borderRadius: Radius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.sm,
  },
  tabActive: { backgroundColor: 'rgba(139,47,201,0.25)', borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  tabText: { fontSize: 11, fontWeight: '700', color: Colors.textDim, letterSpacing: 1.5, fontFamily: Fonts.body },
  tabTextActive: { color: Colors.purpleNeon },

  grid: { paddingHorizontal: Spacing.md, paddingBottom: 100 },

  card: {
    flex: 1,
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.dark3,
    maxWidth: CARD_WIDTH,
  },
  thumb: {
    width: '100%',
    height: 130,
    backgroundColor: Colors.dark4,
    position: 'relative',
    overflow: 'hidden',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.purpleNeon,
  },
  completedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { padding: 10 },
  filmTitle: {
    fontFamily: Fonts.body,
    fontWeight: '700',
    fontSize: 13,
    color: Colors.white,
    marginBottom: 4,
    lineHeight: 18,
  },
  filmMeta: { fontSize: 11, color: Colors.textDim, fontFamily: Fonts.body },
});
