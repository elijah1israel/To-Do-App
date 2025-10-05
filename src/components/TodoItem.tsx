import React from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Todo } from '../hooks/useTodos';
import COLORS from '../theme';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate?: (id: string, text: string) => void;
};

export default function TodoItem({ todo, onToggle, onRemove, onUpdate }: Props) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(todo.text);

  React.useEffect(() => setValue(todo.text), [todo.text]);

  React.useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [todo.done]);

  const formatDue = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const relativeDue = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const abs = Math.abs(diffMs);
    const minutes = Math.round(abs / 60000);
    if (minutes < 60) return diffMs > 0 ? `in ${minutes}m` : `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return diffMs > 0 ? `in ${hours}h` : `${hours}h ago`;
    const days = Math.round(hours / 24);
    return diffMs > 0 ? `in ${days}d` : `${days}d ago`;
  };

  const isOverdue = todo.dueDate ? new Date(todo.dueDate).getTime() < Date.now() && !todo.done : false;

  const [timeLeft, setTimeLeft] = React.useState<string | null>(() => {
    if (!todo.dueDate) return null;
    const diff = new Date(todo.dueDate).getTime() - Date.now();
    return diff > 0 ? formatCountdown(diff) : null;
  });

  React.useEffect(() => {
    if (!todo.dueDate || todo.done) return;
    let mounted = true;
    const update = () => {
      const diff = new Date(todo.dueDate!).getTime() - Date.now();
      if (!mounted) return;
      setTimeLeft(diff > 0 ? formatCountdown(diff) : null);
    };
    update();
    const id = setInterval(update, 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [todo.dueDate, todo.done]);

  function formatCountdown(ms: number) {
    if (ms <= 0) return '0s';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onToggle(todo.id)}
          style={styles.check}
        >
          <Text style={{ color: todo.done ? COLORS.primary : COLORS.muted }}>{todo.done ? '✔️' : '○'}</Text>
        </TouchableOpacity>

        {todo.priority ? (
          <View style={[styles.priority, todo.priority === 'high' ? { backgroundColor: COLORS.danger } : todo.priority === 'medium' ? { backgroundColor: COLORS.accent } : { backgroundColor: COLORS.muted }]} />
        ) : null}
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          {editing ? (
            <TextInput
              style={styles.textInput}
              value={value}
              onChangeText={setValue}
              onSubmitEditing={() => {
                setEditing(false);
                if (onUpdate) onUpdate(todo.id, value.trim());
              }}
              autoFocus
            />
          ) : (
            <TouchableOpacity style={{ flex: 1 }} onLongPress={() => setEditing(true)}>
                <Text style={[styles.text, todo.done && styles.done]} numberOfLines={2}>
                  {todo.text}
                </Text>
                <View style={styles.metaRowSmall}>
                  {todo.category ? <Text style={styles.categorySmall}>{todo.category}</Text> : null}
                  {todo.dueDate ? (
                    <Text style={[styles.dueText, isOverdue && styles.overdue]}>
                      ⏰ {formatDue(todo.dueDate)} · {relativeDue(todo.dueDate)}
                    </Text>
                  ) : null}
                </View>
            </TouchableOpacity>
          )}

          {todo.category ? <View style={styles.chip}><Text style={styles.chipText}>{todo.category}</Text></View> : null}
        </View>

        {(todo.subtasks && todo.subtasks.length > 0) ? (
          <View style={styles.subtasks}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${Math.round(((todo.subtasks ?? []).filter(st => st.done).length / (todo.subtasks ?? []).length) * 100)}%` }]} />
            </View>
            {todo.subtasks?.map((st) => (
              <View key={st.id} style={styles.subtaskRow}>
                <TouchableOpacity onPress={() => (onToggle as any)(todo.id)} style={styles.subCheck}>
                  <Text>{st.done ? '✔️' : '○'}</Text>
                </TouchableOpacity>
                <Text style={[styles.subText, st.done && styles.done]}>{st.text}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <TouchableOpacity onPress={() => onRemove(todo.id)} style={styles.rm}>
        <Text style={styles.rmText}>✖</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  check: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  leftCol: { alignItems: 'center', marginRight: 8 },
  priority: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  text: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: COLORS.text,
  },
  done: {
    textDecorationLine: 'line-through',
    color: COLORS.muted,
  },
  rm: {
    paddingHorizontal: 8,
  },
  rmText: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  chip: { backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginLeft: 8 },
  chipText: { color: COLORS.muted, fontSize: 12 },
  subtasks: { marginTop: 8 },
  progressBarBackground: { height: 6, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: 6, backgroundColor: COLORS.primary },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  subCheck: { width: 28, alignItems: 'center' },
  subText: { color: COLORS.muted },
  metaRowSmall: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  categorySmall: { color: COLORS.primary, fontSize: 12, marginRight: 8 },
  dueText: { color: COLORS.muted, fontSize: 12 },
  overdue: { color: COLORS.danger, fontWeight: '700' },
});
