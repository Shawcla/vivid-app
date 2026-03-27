import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  View, Image, Dimensions, ViewStyle, TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius, Spacing, Shadow } from '../utils/theme';

const { width } = Dimensions.get('window');

// ─── PurpleButton ─────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const VividButton: React.FC<ButtonProps> = ({
  label, onPress, loading, disabled, variant = 'primary', size = 'md', style, icon
}) => {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  const paddingMap = { sm: 10, md: 14, lg: 18 };
  const fontMap = { sm: 13, md: 15, lg: 17 };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        isPrimary && styles.btnPrimary,
        isGhost && styles.btnGhost,
        isDanger && styles.btnDanger,
        disabled && { opacity: 0.5 },
        { paddingVertical: paddingMap[size] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.white : Colors.purpleNeon} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text style={[styles.btnText, { fontSize: fontMap[size] }, isGhost && { color: Colors.purpleNeon }]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── FilmCard (portrait) ──────────────────────────────────────────────────────
interface FilmCardProps {
  film: {
    id: string;
    title: string;
    thumbnail_url?: string;
    genre?: string;
    content_type?: string;
    views?: number;
    creator_username?: string;
  };
  onPress: () => void;
  width?: number;
}

export const FilmCard: React.FC<FilmCardProps> = ({ film, onPress, width: cardWidth = 130 }) => {
  const thumbColors = [
    ['#1a0a2e', '#4a1a7a'],
    ['#0a1a2e', '#1a3a5a'],
    ['#2e0a1a', '#5a1a3a'],
    ['#0a2e1a', '#1a5a3a'],
    ['#2e1a0a', '#5a3a1a'],
  ];
  const colorPair = thumbColors[film.id.charCodeAt(0) % thumbColors.length];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ width: cardWidth }}>
      <View style={[styles.filmCard, { width: cardWidth }]}>
        {film.thumbnail_url ? (
          <Image source={{ uri: film.thumbnail_url }} style={styles.filmThumb} resizeMode="cover" />
        ) : (
          <LinearGradient colors={colorPair as any} style={styles.filmThumb}>
            <Text style={{ fontSize: 28 }}>🎬</Text>
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(10,10,15,0.95)']}
          style={styles.filmOverlay}
        />
        <View style={styles.filmInfo}>
          <Text style={styles.filmTitle} numberOfLines={2}>{film.title}</Text>
          {film.genre && (
            <View style={styles.genreTag}>
              <Text style={styles.genreTagText}>{film.genre.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── WideCard (landscape, for Continue Watching) ─────────────────────────────
interface WideCardProps {
  film: any;
  onPress: () => void;
  progress?: number;
  rank?: number;
}

export const WideCard: React.FC<WideCardProps> = ({ film, onPress, progress, rank }) => {
  const thumbColors = [
    ['#1a0a2e', '#4a1a7a'],
    ['#0a1a2e', '#1a3a5a'],
    ['#2e0a1a', '#5a1a3a'],
  ];
  const colorPair = thumbColors[film.id?.charCodeAt(0) % thumbColors.length] || thumbColors[0];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.wideCard}>
        {film.thumbnail_url ? (
          <Image source={{ uri: film.thumbnail_url }} style={styles.wideThumb} resizeMode="cover" />
        ) : (
          <LinearGradient colors={colorPair as any} style={styles.wideThumb}>
            <Text style={{ fontSize: 32 }}>🎬</Text>
          </LinearGradient>
        )}
        {rank !== undefined && (
          <Text style={styles.wideRank}>{String(rank).padStart(2, '0')}</Text>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(10,10,15,0.9)']}
          style={StyleSheet.absoluteFill}
        />
        {progress !== undefined && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        )}
        <View style={styles.wideInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.wideTitle} numberOfLines={1}>{film.title}</Text>
            <Text style={styles.wideMeta}>
              {progress !== undefined ? `${progress}% watched` : film.genre}
            </Text>
          </View>
          <Text style={{ color: Colors.purpleNeon, fontSize: 16 }}>▶</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onSeeAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>SEE ALL</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── GenrePill ────────────────────────────────────────────────────────────────
interface GenrePillProps {
  label: string;
  active?: boolean;
  onPress: () => void;
}

export const GenrePill: React.FC<GenrePillProps> = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </View>
  </TouchableOpacity>
);

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
export const LoadingSpinner: React.FC<{ size?: 'small' | 'large' }> = ({ size = 'large' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator color={Colors.purpleNeon} size={size} />
  </View>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ icon?: string; title: string; subtitle?: string }> = ({
  icon = '🎬', title, subtitle
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  btn: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  btnPrimary: {
    backgroundColor: Colors.purple,
    ...Shadow.purple,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  btnDanger: {
    backgroundColor: Colors.error,
  },
  btnText: {
    fontFamily: Fonts.body,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // FilmCard
  filmCard: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.dark3,
  },
  filmThumb: {
    width: '100%',
    aspectRatio: 2 / 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filmOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: '50%',
  },
  filmInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
  },
  filmTitle: {
    fontFamily: Fonts.body,
    fontWeight: '700',
    fontSize: 12,
    color: Colors.white,
    marginBottom: 4,
  },
  genreTag: {
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  genreTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.purpleNeon,
    letterSpacing: 0.8,
  },

  // WideCard
  wideCard: {
    width: 260,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.dark3,
  },
  wideThumb: {
    width: '100%',
    height: 145,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideRank: {
    position: 'absolute',
    top: 8,
    left: 10,
    fontFamily: Fonts.display,
    fontSize: 36,
    color: 'transparent',
    textShadowColor: 'rgba(192,132,252,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  progressBar: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.purpleNeon,
  },
  wideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  wideTitle: {
    fontFamily: Fonts.body,
    fontWeight: '700',
    fontSize: 13,
    color: Colors.white,
    marginBottom: 2,
  },
  wideMeta: {
    fontSize: 11,
    color: Colors.textDim,
    fontFamily: Fonts.body,
  },

  // SectionHeader
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: 20,
    letterSpacing: 1,
    color: Colors.white,
  },
  seeAll: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.purpleNeon,
    letterSpacing: 1.2,
    fontFamily: Fonts.body,
  },

  // GenrePill
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
    marginRight: Spacing.sm,
  },
  pillActive: {
    backgroundColor: 'rgba(139,47,201,0.2)',
    borderColor: Colors.purpleNeon,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Fonts.body,
  },
  pillTextActive: {
    color: Colors.purpleNeon,
  },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: {
    fontFamily: Fonts.display,
    fontSize: 22,
    letterSpacing: 1,
    color: Colors.white,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    fontFamily: Fonts.body,
    fontWeight: '300',
    maxWidth: 260,
  },
});
