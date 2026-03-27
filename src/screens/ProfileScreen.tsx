import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, RefreshControl, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../context/authStore';
import { creatorsAPI } from '../services/api';
import { Colors, Fonts, Spacing, Radius } from '../utils/theme';
import { VividButton, LoadingSpinner, EmptyState } from '../components';

const { width } = Dimensions.get('window');

type Tab = 'films' | 'analytics' | 'earnings';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('films');
  const [stats, setStats] = useState<any>(null);
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isCreator = user?.plan === 'creator' || user?.plan === 'studio';

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      if (isCreator) {
        const [statsRes, filmsRes] = await Promise.all([
          creatorsAPI.getDashboardStats(),
          creatorsAPI.getDashboardFilms(),
        ]);
        setStats(statsRes.data);
        setFilms(filmsRes.data.films);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setActiveTab('films');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loggedOutWrap}>
          <LinearGradient colors={[Colors.purple, Colors.purpleGlow]} style={styles.loggedOutAvatar}>
            <Ionicons name="person-outline" size={34} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.loggedOutTitle}>You’re signed out</Text>
          <Text style={styles.loggedOutSub}>
            Sign in to manage your profile, uploads, and creator tools.
          </Text>
          <View style={styles.loggedOutButtons}>
            <VividButton label="Sign In" onPress={() => router.push('/login')} style={{ width: '100%' }} />
            <VividButton label="Browse as Guest" variant="ghost" onPress={() => router.replace('/(tabs)')} style={{ width: '100%' }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) return <LoadingSpinner />;

  const formatMoney = (dollars: string) => `$${parseFloat(dollars).toFixed(2)}`;
  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.purpleNeon} />}
      >
        {/* ── Profile Header ── */}
        <LinearGradient
          colors={['rgba(139,47,201,0.2)', 'transparent']}
          style={styles.profileHeader}
        >
          {/* Top row */}
          <View style={styles.headerTop}>
            <Text style={styles.screenTitle}>PROFILE</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Avatar & name */}
          <View style={styles.avatarRow}>
            <LinearGradient colors={[Colors.purple, Colors.purpleGlow]} style={styles.avatar}>
              <Text style={{ fontSize: 32 }}>🎬</Text>
            </LinearGradient>
            <View style={styles.nameCol}>
              <Text style={styles.displayName}>{user?.name}</Text>
              <Text style={styles.handle}>@{user?.username}</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>
                  {user?.plan === 'studio' ? '🏢 STUDIO' : user?.plan === 'creator' ? '⚡ CREATOR' : '👁 VIEWER'} — {user?.plan === 'studio' ? '$20/mo' : 'FREE'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          {isCreator && stats && (
            <View style={styles.statsRow}>
              {[
                { label: 'FILMS', value: formatNum(stats.stats.total_films) },
                { label: 'VIEWS', value: formatNum(stats.stats.total_views) },
                { label: 'LIKES', value: formatNum(stats.stats.total_likes) },
                { label: 'EARNED', value: formatMoney(stats.stats.earnings_this_month_dollars) },
              ].map((s) => (
                <View key={s.label} style={styles.statItem}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA buttons */}
          <View style={styles.headerBtns}>
            <VividButton
              label="Edit Profile"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/edit-profile')}
              style={{ flex: 1 }}
            />
            {isCreator && (
              <VividButton
                label="+ Upload Film"
                size="sm"
                onPress={() => router.push('/(tabs)/upload')}
                style={{ flex: 1 }}
              />
            )}
            {!isCreator && (
              <VividButton
                label="Become a Creator"
                size="sm"
                onPress={() => router.push('/upgrade')}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </LinearGradient>

        {/* ── Earnings Highlight ── */}
        {isCreator && stats && (
          <View style={styles.earningsCard}>
            <View style={styles.earningsLeft}>
              <Text style={styles.earningsLabel}>THIS MONTH</Text>
              <Text style={styles.earningsAmount}>
                {formatMoney(stats.stats.earnings_this_month_dollars)}
              </Text>
            </View>
            <View style={styles.earningsRight}>
              <Ionicons name="trending-up" size={18} color={Colors.success} />
              <Text style={styles.earningsTrend}>85% to you</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveTab('earnings')} style={styles.earningsLink}>
              <Text style={styles.earningsLinkText}>View All →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Tabs ── */}
        {isCreator && (
          <View style={styles.tabs}>
            {(['films', 'analytics', 'earnings'] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Tab Content ── */}
        {activeTab === 'films' && (
          <View style={styles.filmsGrid}>
            {films.length === 0 ? (
              <EmptyState
                icon="🎬"
                title="No films yet"
                subtitle="Upload your first AI film to get started"
              />
            ) : (
              films.map((film) => (
                <TouchableOpacity
                  key={film.id}
                  style={styles.myFilmCard}
                  onPress={() => router.push(`/film/${film.id}`)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#1a0a2e', '#4a1a7a']}
                    style={styles.myFilmThumb}
                  >
                    <Text style={{ fontSize: 22 }}>🎬</Text>
                    <View style={styles.myFilmViews}>
                      <Text style={styles.myFilmViewsText}>{formatNum(film.views)} views</Text>
                    </View>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: film.status === 'published' ? Colors.success : Colors.warning }
                    ]} />
                  </LinearGradient>
                  <View style={styles.myFilmInfo}>
                    <Text style={styles.myFilmTitle} numberOfLines={2}>{film.title}</Text>
                    <Text style={styles.myFilmMeta}>{film.content_type} · {film.genre}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'analytics' && stats && (
          <View style={styles.analyticsContainer}>
            {/* Recent views chart (simplified) */}
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>VIEWS LAST 7 DAYS</Text>
              <View style={styles.barChart}>
                {(stats.recent_views.length > 0 ? stats.recent_views : Array(7).fill({ views: 0 }))
                  .slice(-7)
                  .map((day: any, i: number) => {
                    const maxViews = Math.max(...(stats.recent_views.map((d: any) => d.views) || [1]));
                    const height = maxViews > 0 ? (day.views / maxViews) * 80 : 10;
                    return (
                      <View key={i} style={styles.barCol}>
                        <View style={[styles.bar, { height }]} />
                        <Text style={styles.barLabel}>{day.date?.slice(5) || `D${i + 1}`}</Text>
                      </View>
                    );
                  })}
              </View>
            </View>

            {/* Top films */}
            <Text style={styles.analyticsTitle}>TOP PERFORMING FILMS</Text>
            {stats.top_films.map((film: any, i: number) => (
              <View key={film.id} style={styles.topFilmRow}>
                <Text style={styles.topFilmRank}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topFilmTitle} numberOfLines={1}>{film.title}</Text>
                  <Text style={styles.topFilmViews}>{formatNum(film.views)} views · {formatNum(film.likes)} likes</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'earnings' && stats && (
          <View style={styles.earningsContainer}>
            <View style={styles.earningsBigCard}>
              <Text style={styles.earningsBigLabel}>TOTAL EARNED</Text>
              <Text style={styles.earningsBigAmount}>
                {formatMoney(stats.stats.earnings_this_month_dollars)}
              </Text>
              <Text style={styles.earningsBigSub}>This month · 85% revenue share</Text>
            </View>

            <Text style={[styles.analyticsTitle, { marginTop: Spacing.lg, marginHorizontal: Spacing.md }]}>
              LAST 6 MONTHS
            </Text>
            {stats.earnings_history.map((e: any) => (
              <View key={e.month} style={styles.earningsRow}>
                <Text style={styles.earningsMonth}>{e.month}</Text>
                <Text style={styles.earningsDollar}>{formatMoney(e.dollars)}</Text>
              </View>
            ))}

            {stats.earnings_history.length === 0 && (
              <EmptyState icon="💰" title="No earnings yet" subtitle="Start getting views to earn revenue" />
            )}
          </View>
        )}

        {/* Non-creator view */}
        {!isCreator && (
          <View style={styles.upgradeCard}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🎬</Text>
            <Text style={styles.upgradeTitle}>BECOME A CREATOR</Text>
            <Text style={styles.upgradeSub}>
              Upload your AI films for free and earn 85% of all revenue. Creator plan is free forever.
            </Text>
            <VividButton
              label="Upgrade to Creator (Free)"
              onPress={() => router.push('/upgrade')}
              style={{ marginTop: Spacing.lg, width: '100%' }}
            />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },

  loggedOutWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  loggedOutAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggedOutTitle: {
    color: Colors.white,
    fontFamily: Fonts.display,
    fontSize: 28,
    letterSpacing: 1,
  },
  loggedOutSub: {
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  loggedOutButtons: {
    width: '100%',
    gap: 10,
    marginTop: Spacing.sm,
  },

  profileHeader: { padding: Spacing.md, paddingBottom: Spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  screenTitle: { fontFamily: Fonts.display, fontSize: 22, letterSpacing: 2, color: Colors.white },
  logoutBtn: { padding: 8 },

  avatarRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(168,85,247,0.4)' },
  nameCol: { flex: 1, gap: 4 },
  displayName: { fontFamily: Fonts.display, fontSize: 24, letterSpacing: 1, color: Colors.white },
  handle: { fontSize: 13, color: Colors.purpleNeon, fontFamily: Fonts.body },
  planBadge: {
    backgroundColor: 'rgba(139,47,201,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  planBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.purpleNeon, letterSpacing: 1, fontFamily: Fonts.body },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md, paddingVertical: Spacing.md, borderTopWidth: 1, borderColor: 'rgba(168,85,247,0.15)' },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: Fonts.display, fontSize: 22, color: Colors.purpleNeon, textShadowColor: Colors.purple, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  statLabel: { fontSize: 9, fontWeight: '700', color: Colors.textDim, letterSpacing: 1.5, fontFamily: Fonts.body, marginTop: 2 },

  headerBtns: { flexDirection: 'row', gap: 10 },

  earningsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: 14,
    backgroundColor: Colors.dark3,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    gap: 10,
  },
  earningsLeft: { flex: 1 },
  earningsLabel: { fontSize: 9, fontWeight: '700', color: Colors.textDim, letterSpacing: 1.5, fontFamily: Fonts.body },
  earningsAmount: { fontFamily: Fonts.display, fontSize: 26, color: Colors.purpleNeon },
  earningsRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  earningsTrend: { fontSize: 11, color: Colors.success, fontFamily: Fonts.body, fontWeight: '600' },
  earningsLink: { paddingLeft: Spacing.sm },
  earningsLinkText: { fontSize: 12, color: Colors.purpleNeon, fontFamily: Fonts.body, fontWeight: '600' },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: 'rgba(168,85,247,0.15)', marginBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabActive: { borderColor: Colors.purpleNeon },
  tabText: { fontSize: 11, fontWeight: '700', color: Colors.textDim, letterSpacing: 1.5, fontFamily: Fonts.body },
  tabTextActive: { color: Colors.purpleNeon },

  // Films grid
  filmsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: Spacing.md },
  myFilmCard: { width: (width - Spacing.md * 2 - 10) / 2, borderRadius: Radius.md, overflow: 'hidden', backgroundColor: Colors.dark3 },
  myFilmThumb: { height: 100, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  myFilmViews: { position: 'absolute', bottom: 5, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  myFilmViewsText: { fontSize: 9, color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.body },
  statusDot: { position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 4 },
  myFilmInfo: { padding: 8 },
  myFilmTitle: { fontFamily: Fonts.body, fontWeight: '700', fontSize: 12, color: Colors.white, marginBottom: 3 },
  myFilmMeta: { fontSize: 10, color: Colors.textDim, fontFamily: Fonts.body },

  // Analytics
  analyticsContainer: { paddingHorizontal: Spacing.md },
  analyticsCard: { backgroundColor: Colors.dark3, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(168,85,247,0.15)', marginBottom: Spacing.lg },
  analyticsTitle: { fontFamily: Fonts.display, fontSize: 14, letterSpacing: 2, color: Colors.textMuted, marginBottom: Spacing.sm },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 8, justifyContent: 'space-between' },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '100%', backgroundColor: Colors.purple, borderRadius: 3, minHeight: 4 },
  barLabel: { fontSize: 8, color: Colors.textDim, fontFamily: Fonts.body },
  topFilmRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  topFilmRank: { fontFamily: Fonts.display, fontSize: 24, color: Colors.textDim, width: 30 },
  topFilmTitle: { fontFamily: Fonts.body, fontWeight: '700', fontSize: 14, color: Colors.white },
  topFilmViews: { fontSize: 11, color: Colors.textDim, fontFamily: Fonts.body },

  // Earnings
  earningsContainer: {},
  earningsBigCard: { margin: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.dark3, borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(168,85,247,0.25)', alignItems: 'center' },
  earningsBigLabel: { fontSize: 10, fontWeight: '700', color: Colors.textDim, letterSpacing: 2, fontFamily: Fonts.body, marginBottom: 6 },
  earningsBigAmount: { fontFamily: Fonts.display, fontSize: 48, color: Colors.purpleNeon },
  earningsBigSub: { fontSize: 12, color: Colors.textMuted, fontFamily: Fonts.body, marginTop: 4 },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  earningsMonth: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.body },
  earningsDollar: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white },

  // Upgrade card
  upgradeCard: { margin: Spacing.md, padding: Spacing.xl, backgroundColor: Colors.dark3, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)', alignItems: 'center' },
  upgradeTitle: { fontFamily: Fonts.display, fontSize: 28, letterSpacing: 2, color: Colors.white, marginBottom: 10 },
  upgradeSub: { fontSize: 14, color: Colors.textMuted, fontFamily: Fonts.body, fontWeight: '300', textAlign: 'center', lineHeight: 22 },
});
