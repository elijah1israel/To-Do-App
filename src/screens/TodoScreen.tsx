import React, { useState, useRef } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTodos from '../hooks/useTodos';
import TodoItem from '../components/TodoItem';
import COLORS from '../theme';
import AdvancedAddModal from '../components/AdvancedAddModal';

export default function TodoScreen() {
  const { todos, loading, add, toggle, remove, clear, update, markAll } = useTodos();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const onAdd = () => {
    const t = text.trim();
    if (!t) return;
    add(t);
    setText('');
  };

  const remaining = todos.filter((t) => !t.done).length;
  const completed = todos.filter((t) => t.done).length;
  const filtered =
    filter === 'all' ? todos : filter === 'active' ? todos.filter((t) => !t.done) : todos.filter((t) => t.done);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Todo App</Text>
        <TouchableOpacity onPress={clear} style={styles.clear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          placeholder="Add a todo..."
          placeholderTextColor={COLORS.muted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={onAdd}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShowAdvanced(true)} style={styles.advBtn}>
          <Text style={styles.advText}>Advanced</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.countText}>{remaining} left</Text>
        <View style={styles.filters}>
          <TouchableOpacity onPress={() => setFilter('all')} style={[styles.pill, filter === 'all' && styles.pillActive]}>
            <Text style={filter === 'all' ? styles.pillTextActive : styles.pillText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('active')} style={[styles.pill, filter === 'active' && styles.pillActive]}>
            <Text style={filter === 'active' ? styles.pillTextActive : styles.pillText}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter('done')} style={[styles.pill, filter === 'done' && styles.pillActive]}>
            <Text style={filter === 'done' ? styles.pillTextActive : styles.pillText}>Done</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => markAll(completed === 0 ? true : false)} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>{completed === 0 ? 'Mark all' : 'Unmark'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading…</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TodoItem todo={item} onToggle={toggle} onRemove={remove} onUpdate={update} />
          )}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No todos yet — add one!</Text>
            </View>
          )}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          const t = text.trim();
          if (t) onAdd();
          else inputRef.current?.focus();
        }}
        onLongPress={() => setShowAdvanced(true)}
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AdvancedAddModal
        visible={showAdvanced}
        initialText={text}
        onCancel={() => setShowAdvanced(false)}
        onSubmit={(payload) => {
          setShowAdvanced(false);
          add(payload);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  clear: { padding: 8 },
  clearText: { color: COLORS.danger },
  inputRow: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
    padding: 12,
    borderRadius: 12,
  },
  advBtn: { marginLeft: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center' },
  advText: { color: COLORS.muted },
  addBtn: { marginLeft: 8, padding: 12, backgroundColor: COLORS.primary, borderRadius: 999, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  addText: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  metaRow: { flexDirection: 'row', paddingHorizontal: 12, alignItems: 'center', justifyContent: 'space-between' },
  countText: { color: COLORS.muted },
  filters: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  pillActive: { backgroundColor: COLORS.accent },
  pillText: { color: COLORS.muted },
  pillTextActive: { color: COLORS.white, fontWeight: '700' },
  markAllBtn: { padding: 8 },
  markAllText: { color: COLORS.primary },
  loading: { padding: 16, color: COLORS.text },
  empty: { padding: 24, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { color: COLORS.muted },
  fab: { position: 'absolute', right: 18, bottom: 40, backgroundColor: COLORS.accent, width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, elevation: 6 },
  fabText: { color: COLORS.white, fontSize: 28, fontWeight: '700' },
});
