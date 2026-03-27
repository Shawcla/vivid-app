import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiAPI } from '../services/api';
import { Colors, Fonts, Spacing, Radius } from '../utils/theme';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

interface AIChatProps {
  visible: boolean;
  onClose: () => void;
  film_id?: string;
  film_title?: string;
}

export function AIChat({ visible, onClose, film_id, film_title }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      text: film_title
        ? `Hi! Ask me anything about "${film_title}" or any movies, actors, or recommendations!`
        : "Hi! I'm your VIVID AI assistant. Ask me about movies, get recommendations, or chat about what to watch!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setLoading(true);
    
    try {
      const { data } = await aiAPI.chat(userText, film_id);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.response || "I'm not sure how to answer that. Try asking about movies or TV shows!",
      }]);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'AI is unavailable right now. Make sure your backend is connected to Ollama.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: `⚠️ ${errorMsg}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.role === 'user' && styles.msgRowUser]}>
      {item.role === 'ai' && (
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={14} color={Colors.purpleNeon} />
        </View>
      )}
      <View style={[styles.msgBubble, item.role === 'ai' ? styles.bubbleAI : styles.bubbleUser]}>
        <Text style={[styles.msgText, item.role === 'user' && styles.msgTextUser]}>
          {item.text}
        </Text>
      </View>
      {item.role === 'user' && (
        <View style={[styles.avatar, styles.avatarUser]}>
          <Ionicons name="person" size={12} color={Colors.white} />
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarHeader}>
              <Ionicons name="sparkles" size={18} color={Colors.purpleNeon} />
            </View>
            <View>
              <Text style={styles.headerTitle}>VIVID AI</Text>
              <Text style={styles.headerSubtitle}>Powered by Ollama • {film_title ? film_title : 'General'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={
            loading ? (
              <View style={[styles.msgRow, styles.msgRowAI]}>
                <View style={styles.avatar}><Ionicons name="sparkles" size={14} color={Colors.purpleNeon} /></View>
                <View style={[styles.msgBubble, styles.bubbleAI]}>
                  <ActivityIndicator size="small" color={Colors.purpleNeon} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick suggestions */}
        {messages.length === 1 && (
          <View style={styles.suggestions}>
            {[
              'Tell me about this film',
              'What are similar movies?',
              'Who stars in this?',
              'Recommend something to watch',
            ].map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => setInput(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about movies, actors, recommendations..."
            placeholderTextColor={Colors.textDim}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color={input.trim() ? Colors.white : Colors.textDim} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingTop: Spacing.xl,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatarHeader: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.dark3,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  headerSubtitle: { fontSize: 11, color: Colors.textDim },
  closeBtn: { padding: Spacing.xs },
  messagesList: { padding: Spacing.md, gap: Spacing.sm, flexGrow: 1 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs, marginBottom: Spacing.xs },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgRowAI: {},
  avatar: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.dark3,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarUser: { backgroundColor: Colors.purpleNeon },
  msgBubble: {
    maxWidth: '78%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bubbleAI: { backgroundColor: Colors.dark3, borderRadius: Radius.lg, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: Colors.purpleNeon, borderRadius: Radius.lg, borderBottomRightRadius: 4 },
  msgText: { fontSize: 14, color: Colors.white, lineHeight: 20 },
  msgTextUser: { color: Colors.white },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, padding: Spacing.sm, paddingHorizontal: Spacing.md },
  suggestionChip: {
    backgroundColor: Colors.dark3, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  suggestionText: { fontSize: 12, color: Colors.textMuted },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    padding: Spacing.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)",
    paddingBottom: Spacing.xl,
  },
  input: {
    flex: 1, backgroundColor: Colors.dark3, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: 14, color: Colors.white, maxHeight: 100,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.purpleNeon,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.dark3 },
});
