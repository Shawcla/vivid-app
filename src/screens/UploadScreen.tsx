import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Dimensions, Switch,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { uploadAPI } from '../services/api';
import { Colors, Fonts, Spacing, Radius } from '../utils/theme';
import { VividButton } from '../components';

const { width } = Dimensions.get('window');

const GENRES = ['Sci-Fi', 'Drama', 'Thriller', 'Horror', 'Romance', 'Documentary', 'Fantasy', 'Action', 'Animation', 'Comedy'];
const CONTENT_TYPES = ['film', 'short', 'series', 'documentary'];
const AI_TOOLS = ['Sora', 'Runway', 'Kling', 'Pika', 'Luma', 'Veo 2', 'Hailuo', 'Gen-3', 'Minimax', 'Wan'];

type UploadStep = 'select' | 'details' | 'uploading' | 'done';

export default function UploadScreen() {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>('select');
  const [videoFile, setVideoFile] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [contentType, setContentType] = useState('film');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const pickVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['video/mp4', 'video/quicktime', 'video/x-matroska'],
      copyToCacheDirectory: false,
    });
    if (!result.canceled && result.assets[0]) {
      setVideoFile(result.assets[0]);
      setStep('details');
    }
  };

  const pickThumbnail = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to add a thumbnail.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setThumbnail(result.assets[0].uri);
  };

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handlePublish = async () => {
    if (!title.trim()) return Alert.alert('Missing title', 'Please enter a title for your film.');
    if (!videoFile) return Alert.alert('No video', 'Please select a video file.');
    if (!genre) return Alert.alert('Select genre', 'Please choose a genre.');

    setStep('uploading');
    setUploadProgress(0);

    try {
      // Step 1: Upload thumbnail if selected
      let thumbnailUrl: string | undefined;
      let thumbnailKey: string | undefined;

      if (thumbnail) {
        const { data: thumbData } = await uploadAPI.uploadThumbnail(thumbnail);
        thumbnailUrl = thumbData.url;
        thumbnailKey = thumbData.key;
      }

      // Step 2: Get presigned URL for video
      const { data: presignData } = await uploadAPI.getPresignedUrl(
        videoFile.name,
        videoFile.mimeType || 'video/mp4',
        videoFile.size || 0
      );

      // Step 3: Upload video directly to R2
      await uploadAPI.uploadToStorage(
        presignData.uploadUrl,
        videoFile.uri,
        videoFile.mimeType || 'video/mp4',
        (progress) => setUploadProgress(progress)
      );

      // Step 4: Create film record
      await uploadAPI.createFilm({
        title: title.trim(),
        description: description.trim() || undefined,
        genre,
        content_type: contentType,
        ai_tools: selectedTools,
        video_key: presignData.key,
        thumbnail_url: thumbnailUrl,
        thumbnail_key: thumbnailKey,
        file_size_bytes: videoFile.size,
      });

      setStep('done');
    } catch (err: any) {
      Alert.alert('Upload failed', err?.response?.data?.error || 'Please try again.');
      setStep('details');
    }
  };

  // ── Step: Select Video ──────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>UPLOAD FILM</Text>
        </View>

        <View style={styles.selectContainer}>
          <TouchableOpacity style={styles.dropZone} onPress={pickVideo} activeOpacity={0.8}>
            <View style={styles.dropIcon}>
              <Ionicons name="cloud-upload-outline" size={48} color={Colors.purpleNeon} />
            </View>
            <Text style={styles.dropTitle}>Select Your Film</Text>
            <Text style={styles.dropSub}>MP4, MOV, MKV up to 50GB</Text>
            <VividButton label="Browse Files" onPress={pickVideo} style={{ marginTop: 20, width: 180 }} />
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>SUPPORTED FORMATS</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formatsRow}>
            {['MP4', 'MOV', 'MKV', 'WebM'].map((fmt) => (
              <View key={fmt} style={styles.formatChip}>
                <Text style={styles.formatText}>{fmt}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.purpleNeon} />
            <Text style={styles.infoText}>
              Videos upload directly to secure storage. Max 50GB per file. Creator plan is free.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Step: Uploading ─────────────────────────────────────────────────────────
  if (step === 'uploading') {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.uploadingCard}>
          <Text style={{ fontSize: 48, marginBottom: 20 }}>🎬</Text>
          <Text style={styles.uploadingTitle}>UPLOADING</Text>
          <Text style={styles.uploadingFile} numberOfLines={1}>{videoFile?.name}</Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{uploadProgress}%</Text>

          <Text style={styles.uploadingHint}>Don't close the app while uploading</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Step: Done ──────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={styles.doneCard}>
          <Text style={{ fontSize: 60, marginBottom: 20 }}>🚀</Text>
          <Text style={styles.doneTitle}>PUBLISHED!</Text>
          <Text style={styles.doneSub}>"{title}" is now live on VIVID</Text>
          <VividButton
            label="View My Film"
            onPress={() => router.push('/profile')}
            style={{ marginTop: 32, width: 220 }}
          />
          <VividButton
            label="Upload Another"
            variant="ghost"
            onPress={() => {
              setStep('select');
              setVideoFile(null);
              setThumbnail(null);
              setTitle('');
              setDescription('');
              setGenre('');
              setSelectedTools([]);
              setUploadProgress(0);
            }}
            style={{ marginTop: 12, width: 220 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Step: Details Form ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStep('select')}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FILM DETAILS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>

        {/* File selected */}
        <View style={styles.fileCard}>
          <Ionicons name="film-outline" size={20} color={Colors.purpleNeon} />
          <Text style={styles.fileName} numberOfLines={1}>{videoFile?.name}</Text>
          <Text style={styles.fileSize}>
            {videoFile?.size ? `${(videoFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB` : ''}
          </Text>
        </View>

        {/* Thumbnail */}
        <TouchableOpacity style={styles.thumbPickerBtn} onPress={pickThumbnail} activeOpacity={0.8}>
          <Ionicons name="image-outline" size={20} color={thumbnail ? Colors.purpleNeon : Colors.textDim} />
          <Text style={[styles.thumbPickerText, thumbnail && { color: Colors.purpleNeon }]}>
            {thumbnail ? '✓ Thumbnail selected' : 'Add Thumbnail (Optional)'}
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>FILM TITLE *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter your film title..."
            placeholderTextColor={Colors.textDim}
            maxLength={120}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell viewers what your film is about..."
            placeholderTextColor={Colors.textDim}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Content Type */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>CONTENT TYPE</Text>
          <View style={styles.pillGroup}>
            {CONTENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.optionPill, contentType === type && styles.optionPillActive]}
                onPress={() => setContentType(type)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionPillText, contentType === type && styles.optionPillTextActive]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Genre */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>GENRE *</Text>
          <View style={styles.pillGroup}>
            {GENRES.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.optionPill, genre === g && styles.optionPillActive]}
                onPress={() => setGenre(g)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionPillText, genre === g && styles.optionPillTextActive]}>
                  {g.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Tools */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>AI TOOLS USED</Text>
          <View style={styles.pillGroup}>
            {AI_TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool}
                style={[styles.optionPill, selectedTools.includes(tool) && styles.optionPillActive]}
                onPress={() => toggleTool(tool)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionPillText, selectedTools.includes(tool) && styles.optionPillTextActive]}>
                  {tool}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <VividButton
          label="🚀 PUBLISH TO VIVID"
          onPress={handlePublish}
          size="lg"
          style={{ marginTop: Spacing.lg, marginBottom: 100 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  centered: { alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderColor: 'rgba(168,85,247,0.12)',
  },
  headerTitle: {
    fontFamily: Fonts.display,
    fontSize: 22,
    letterSpacing: 2,
    color: Colors.white,
  },

  // Select step
  selectContainer: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  dropZone: {
    borderWidth: 2,
    borderColor: 'rgba(168,85,247,0.35)',
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(139,47,201,0.04)',
    marginBottom: Spacing.lg,
  },
  dropIcon: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(168,85,247,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  dropTitle: {
    fontFamily: Fonts.display,
    fontSize: 22,
    letterSpacing: 1,
    color: Colors.white,
    marginBottom: 6,
  },
  dropSub: { fontSize: 13, color: Colors.textDim, fontFamily: Fonts.body },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textDim,
    letterSpacing: 1.5,
    marginHorizontal: 12,
    fontFamily: Fonts.body,
  },

  formatsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: Spacing.lg },
  formatChip: {
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  formatText: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, fontFamily: Fonts.body },

  infoCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(139,47,201,0.08)',
    borderRadius: Radius.md,
    padding: 14,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.textMuted, fontFamily: Fonts.body, fontWeight: '300', lineHeight: 20 },

  // Details form
  form: { padding: Spacing.md },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.dark3,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    marginBottom: Spacing.md,
  },
  fileName: { flex: 1, fontSize: 13, color: Colors.text, fontFamily: Fonts.body, fontWeight: '500' },
  fileSize: { fontSize: 11, color: Colors.textDim, fontFamily: Fonts.body },

  thumbPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: Spacing.md,
  },
  thumbPickerText: { fontSize: 14, color: Colors.textDim, fontFamily: Fonts.body, fontWeight: '500' },

  field: { marginBottom: Spacing.lg },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDim,
    letterSpacing: 1.8,
    fontFamily: Fonts.body,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.dark3,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    borderRadius: Radius.md,
    padding: 12,
    color: Colors.text,
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  textArea: { height: 90, paddingTop: 12 },

  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
  },
  optionPillActive: {
    backgroundColor: 'rgba(139,47,201,0.2)',
    borderColor: Colors.purpleNeon,
  },
  optionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    fontFamily: Fonts.body,
  },
  optionPillTextActive: { color: Colors.purpleNeon },

  // Uploading step
  uploadingCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.dark3,
    borderRadius: Radius.xl,
    width: width - 48,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
  },
  uploadingTitle: {
    fontFamily: Fonts.display,
    fontSize: 32,
    letterSpacing: 3,
    color: Colors.white,
    marginBottom: 8,
  },
  uploadingFile: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: Fonts.body,
    marginBottom: 24,
    maxWidth: 260,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.dark4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.purpleNeon,
    shadowColor: Colors.purpleNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.8,
  },
  progressText: {
    fontFamily: Fonts.display,
    fontSize: 22,
    color: Colors.purpleNeon,
    marginBottom: 12,
  },
  uploadingHint: { fontSize: 12, color: Colors.textDim, fontFamily: Fonts.body },

  // Done step
  doneCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.dark3,
    borderRadius: Radius.xl,
    width: width - 48,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  doneTitle: {
    fontFamily: Fonts.display,
    fontSize: 40,
    letterSpacing: 4,
    color: Colors.purpleNeon,
    textShadowColor: Colors.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  doneSub: { fontSize: 15, color: Colors.textMuted, fontFamily: Fonts.body, fontWeight: '300', textAlign: 'center', marginTop: 8 },
});
