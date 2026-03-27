import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Share, FlatList, Image, ActivityIndicator,
  StatusBar, Alert,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { filmsAPI } from '../services/api';
import { Colors, Fonts, Spacing, Radius } from '../utils/theme';
import { WideCard, LoadingSpinner } from '../components';
import { AIChat } from '../components/AIChat';

const { width } = Dimensions.get('window');

export default function FilmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [film, setFilm] = useState<any>(null);
  const [upNext, setUpNext] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playerError, setPlayerError] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const progressRef = useRef(0);
  const videoViewRef = useRef<any>(null);

  const player = useVideoPlayer(
    film?.video_url || null,
    (p) => {
      p.loop = false;
      p.volume = 1.0;
    }
  );

  useEffect(() => {
    if (!film?.video_url) {
      setShowPlayer(false);
      setIsBuffering(false);
      return;
    }
    setPlayerError('');
  }, [film?.video_url]);

  useEffect(() => { loadFilm(); }, [id]);

  const loadFilm = async () => {
    try {
      const { data } = await filmsAPI.get(id);
      setFilm(data.film);
      const { data: related } = await filmsAPI.list({ genre: data.film.genre, limit: 5 });
      setUpNext(related.films.filter((f: any) => f.id !== id));
    } catch (err: any) {
      console.error('Film load error:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    try { await filmsAPI.like(film.id); } catch {}
  };

  const handleWatchlist = async () => {
    try {
      if (inWatchlist) {
        setInWatchlist(false);
        await filmsAPI.removeFromWatchlist(film.id);
      } else {
        setInWatchlist(true);
        await filmsAPI.addToWatchlist(film.id);
      }
    } catch {}
  };

  const handleShare = async () => {
    await Share.share({
      message: `Watch "${film.title}" on VIVID — AI Cinema Streaming`,
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  const formatViews = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  if (loading) return <LoadingSpinner />;
  if (!film) return null;

  const playerWidth = width;
  const playerHeight = (width * 9) / 16;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Video Player / Thumbnail ── */}
      <View style={[styles.playerWrapper, { height: playerHeight }]}>
        {showPlayer && film.video_url ? (
          <>
            <VideoView
              ref={videoViewRef}
              player={player}
              style={styles.player}
              allowsPictureInPicture
              allowsFullscreen
              nativeControls
              contentFit="contain"
            />
            {isBuffering && (
              <View style={styles.bufferingOverlay}>
                <ActivityIndicator size="large" color={Colors.purpleNeon} />
                <Text style={styles.bufferingText}>Buffering...</Text>
              </View>
            )}
          </>
        ) : (
          /* Thumbnail with play overlay */
          <TouchableOpacity
            style={styles.thumbWrapper}
            onPress={() => {
              if (film.video_url) {
                setShowPlayer(true);
                player.play();
              } else {
                Alert.alert('No Video', 'This content does not have a video file yet.');
              }
            }}
            activeOpacity={0.9}
          >
            {film.thumbnail_url ? (
              <Image
                source={{ uri: film.thumbnail_url }}
                style={styles.thumb}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient colors={['#1a0a2e', '#4a1a7a']} style={styles.thumb} />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={StyleSheet.absoluteFill}
            />
            {/* Play button */}
            <View style={styles.playOverlay}>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={36} color={Colors.white} style={{ marginLeft: 4 }} />
              </View>
              {film.duration_seconds && (
                <View style={styles.durationChip}>
                  <Text style={styles.durationText}>
                    {formatDuration(film.duration_seconds)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Back button */}
        <SafeAreaView style={styles.playerNav} edges={['top']}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Close player button */}
        {showPlayer && (
          <SafeAreaView style={styles.playerNavRight} edges={['top']}>
            <TouchableOpacity
              onPress={() => { setShowPlayer(false); player.pause(); }}
              style={styles.backBtn}
            >
              <Ionicons name="close" size={22} color={Colors.white} />
            </TouchableOpacity>
          </SafeAreaView>
        )}
        {/* Fullscreen button */}
        {showPlayer && (
          <SafeAreaView style={styles.fullscreenBtn} edges={['bottom']}>
            <TouchableOpacity
              onPress={() => videoViewRef.current?.enterFullscreen?.()}
              style={styles.fsBtn}
            >
              <Ionicons name="expand" size={24} color={Colors.white} />
            </TouchableOpacity>
          </SafeAreaView>
        )}
      </View>

      {/* ── Scrollable Info ── */}
      <ScrollView style={styles.info} showsVerticalScrollIndicator={false}>
        {/* Title & meta */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{film.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>{new Date(film.published_at).getFullYear()}</Text>
            <View style={styles.metaDot} />
            {film.genre && <Text style={styles.metaItem}>{String(film.genre).toUpperCase()}</Text>}
            {film.duration_seconds && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.metaItem}>{formatDuration(film.duration_seconds)}</Text>
              </>
            )}
          </View>
        </View>

        {/* AI Tools */}
        {film.ai_tools?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolsRow}>
            {film.ai_tools.map((tool: string) => (
              <View key={tool} style={styles.toolChip}>
                <Text style={styles.toolChipText}>{tool} ✦</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {[
            { icon: liked ? 'heart' : 'heart-outline', label: String(film.likes || 0), onPress: handleLike, active: liked },
            { icon: inWatchlist ? 'bookmark' : 'bookmark-outline', label: 'My List', onPress: handleWatchlist, active: inWatchlist },
            { icon: 'sparkles', label: 'Ask AI', onPress: () => setShowAIChat(true), active: false, ai: true },
            { icon: 'share-outline', label: 'Share', onPress: handleShare, active: false },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionBtn}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, action.active && styles.actionIconActive]}>
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color={action.active ? Colors.purpleNeon : Colors.textMuted}
                />
              </View>
              <Text style={[styles.actionLabel, action.active && { color: Colors.purpleNeon }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        {film.description && (
          <Text style={styles.description}>{film.description}</Text>
        )}

        {/* Creator */}
        <TouchableOpacity
          style={styles.creatorCard}
          onPress={() => router.push(`/creator/${film.creator_username}`)}
          activeOpacity={0.85}
        >
          <View style={styles.creatorAvatar}>
            <Ionicons name="person" size={20} color={Colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.creatorName}>{film.creator_name}</Text>
            <Text style={styles.creatorHandle}>@{film.creator_username}</Text>
          </View>
          <TouchableOpacity style={styles.followBtn} activeOpacity={0.8}>
            <Text style={styles.followBtnText}>FOLLOW</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Views */}
        <View style={styles.viewsRow}>
          <Ionicons name="eye-outline" size={14} color={Colors.textDim} />
          <Text style={styles.viewsText}>{formatViews(film.views)} views</Text>
        </View>

        {/* AI Chat Button */}
        <TouchableOpacity
          style={styles.aiChatBtn}
          onPress={() => setShowAIChat(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={18} color={Colors.purpleNeon} />
          <Text style={styles.aiChatBtnText}>Ask AI about this film</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textDim} />
        </TouchableOpacity>

        {/* Up Next */}
        {upNext.length > 0 && (
          <View style={[styles.upNext, { marginBottom: 100 }]}>
            <Text style={styles.upNextTitle}>UP NEXT</Text>
            <FlatList
              data={upNext}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <WideCard film={item} onPress={() => router.replace(`/film/${item.id}`)} />
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* AI Chat Modal */}
      <AIChat
        visible={showAIChat}
        onClose={() => setShowAIChat(false)}
        film_id={film.id}
        film_title={film.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  playerWrapper: { width, backgroundColor: '#000', position: 'relative' },
  player: { width: '100%', height: '100%' },
  thumbWrapper: { width: '100%', height: '100%', position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  playOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 72, height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  durationChip: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: { color: Colors.white, fontSize: 12, fontWeight: '700', fontFamily: Fonts.body },
  bufferingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bufferingText: { color: Colors.white, fontSize: 14, fontFamily: Fonts.body },
  playerNav: { position: 'absolute', top: 0, left: 0 },
  playerNavRight: { position: 'absolute', top: 0, right: 0 },
  fullscreenBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  fsBtn: {
    margin: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    margin: Spacing.md,
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info
  info: { flex: 1 },
  titleRow: { padding: Spacing.md, paddingBottom: Spacing.sm },
  title: {
    fontFamily: Fonts.display, fontSize: 26, letterSpacing: 0.5,
    color: Colors.white, marginBottom: 8,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  metaItem: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.body, fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textDim },

  // Tools
  toolsRow: { paddingLeft: Spacing.md, marginBottom: Spacing.md },
  toolChip: {
    backgroundColor: 'rgba(139,47,201,0.12)',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.25)',
    borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6,
  },
  toolChipText: { fontSize: 11, fontWeight: '600', color: Colors.purpleNeon, fontFamily: Fonts.body },

  // Actions
  actions: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: 'rgba(168,85,247,0.1)',
    marginBottom: Spacing.md,
  },
  actionBtn: { alignItems: 'center', gap: 5 },
  actionIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.dark3,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  actionIconActive: { borderColor: Colors.purpleNeon, backgroundColor: 'rgba(168,85,247,0.1)' },
  actionLabel: { fontSize: 11, color: Colors.textDim, fontFamily: Fonts.body, fontWeight: '600' },

  // Description
  description: {
    fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.body,
    fontWeight: '300', lineHeight: 22,
    paddingHorizontal: Spacing.md, marginBottom: Spacing.lg,
  },

  // Creator
  creatorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: Spacing.md, padding: 14,
    backgroundColor: Colors.dark3, borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.15)', marginBottom: Spacing.md,
  },
  creatorAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center',
  },
  creatorName: { fontFamily: Fonts.body, fontWeight: '700', fontSize: 15, color: Colors.white },
  creatorHandle: { fontSize: 12, color: Colors.textDim, fontFamily: Fonts.body },
  followBtn: {
    borderWidth: 1, borderColor: Colors.purpleNeon, borderRadius: Radius.sm,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  followBtnText: {
    fontSize: 11, fontWeight: '700', color: Colors.purpleNeon,
    fontFamily: Fonts.body, letterSpacing: 1.2,
  },

  // Views
  viewsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, marginBottom: Spacing.lg,
  },
  viewsText: { fontSize: 12, color: Colors.textDim, fontFamily: Fonts.body },

  // AI Chat Button
  aiChatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: Spacing.md, marginBottom: Spacing.lg,
    padding: Spacing.md, backgroundColor: Colors.dark3,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)',
  },
  aiChatBtnText: {
    flex: 1, fontSize: 14, color: Colors.white, fontFamily: Fonts.body, fontWeight: '600',
  },

  // Up Next
  upNext: { paddingLeft: Spacing.md },
  upNextTitle: {
    fontFamily: Fonts.display, fontSize: 18, letterSpacing: 1.5,
    color: Colors.white, marginBottom: Spacing.sm,
  },
});
