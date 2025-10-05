import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import COLORS from '../theme';

type Props = {
  visible: boolean;
  initialText?: string;
  onCancel: () => void;
  onSubmit: (payload: { text: string; category?: string | null; dueDate?: string | null; priority?: 'low' | 'medium' | 'high' | undefined }) => void;
};

export default function AdvancedAddModal({ visible, initialText = '', onCancel, onSubmit }: Props) {
  const [text, setText] = useState(initialText);
  const [category, setCategory] = useState<string | null>(null);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const CATEGORIES = ['personal', 'work', 'school', 'other'];
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [time, setTime] = useState(''); // HH:MM (24h)
  // internal date object for pickers
  const [pickDate, setPickDate] = useState<Date | null>(() => (initialText ? new Date() : null));
  const [hour, setHour] = useState<number | null>(null);
  const [minute, setMinute] = useState<number | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    let dueIso: string | null = null;
    if (date) {
      // normalize time input to HH:MM
      let t = time ? time : '00:00';
      if (t) {
        const parts = t.split(':').map((p) => p.trim());
        let hh = parts[0] ?? '00';
        let mm = parts[1] ?? '00';
        // pad
        if (hh.length === 1) hh = '0' + hh;
        if (mm.length === 1) mm = '0' + mm;
        t = `${hh}:${mm}`;
      }
      const iso = `${date}T${t}:00`;
      // quick validation
      if (!isNaN(Date.parse(iso))) dueIso = new Date(iso).toISOString();
    }

    onSubmit({ text: trimmed, category: category ?? null, dueDate: dueIso, priority });
    // reset local state
    setText('');
    setCategory(null);
    setDate('');
    setTime('');
    setPriority('medium');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Add advanced todo</Text>
          <TextInput placeholder="Task" value={text} onChangeText={setText} placeholderTextColor={COLORS.muted} style={styles.input} />
          {/* Category dropdown */}
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: COLORS.muted, marginBottom: 6 }}>Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryList((s) => !s)} style={styles.input}>
              <Text style={{ color: COLORS.text }}>{(category ?? 'personal').toString().charAt(0).toUpperCase() + (category ?? 'personal').toString().slice(1)}</Text>
            </TouchableOpacity>
            {showCategoryList ? (
              <View style={styles.dropdown}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => {
                      setCategory(c);
                      setShowCategoryList(false);
                    }}
                    style={styles.dropdownItem}
                  >
                    <Text style={{ color: COLORS.text }}>{c.charAt(0).toUpperCase() + c.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.muted, marginBottom: 6 }}>Date</Text>
              <View style={styles.rowInline}>
                <TouchableOpacity onPress={() => {
                  // decrement day
                  const d = pickDate ? new Date(pickDate) : new Date();
                  d.setDate(d.getDate() - 1);
                  setPickDate(d);
                  setDate(d.toISOString().slice(0,10));
                }} style={styles.smallBtn}><Text style={{ color: COLORS.bg, fontWeight: '700' }}>-</Text></TouchableOpacity>
                <View style={styles.dateDisplay}><Text style={{ color: COLORS.text }}>{(pickDate ?? new Date()).toISOString().slice(0,10)}</Text></View>
                <TouchableOpacity onPress={() => {
                  const d = pickDate ? new Date(pickDate) : new Date();
                  d.setDate(d.getDate() + 1);
                  setPickDate(d);
                  setDate(d.toISOString().slice(0,10));
                }} style={styles.smallBtn}><Text style={{ color: COLORS.bg, fontWeight: '700' }}>+</Text></TouchableOpacity>
              </View>
            </View>

            <View style={{ width: 120, marginLeft: 8 }}>
              <Text style={{ color: COLORS.muted, marginBottom: 6 }}>Time</Text>
              <View style={styles.rowInline}>
                <TouchableOpacity onPress={() => {
                  const h = hour ?? new Date().getHours();
                  const nh = (h + 23) % 24; setHour(nh); setTime(`${String(nh).padStart(2,'0')}:${String(minute ?? 0).padStart(2,'0')}`);
                }} style={styles.smallBtn}><Text style={{ color: COLORS.bg, fontWeight: '700' }}>-</Text></TouchableOpacity>
                <View style={styles.timeDisplay}><Text style={{ color: COLORS.text }}>{(hour ?? new Date().getHours()).toString().padStart(2,'0')}:{(minute ?? new Date().getMinutes()).toString().padStart(2,'0')}</Text></View>
                <TouchableOpacity onPress={() => {
                  const h = hour ?? new Date().getHours();
                  const nh = (h + 1) % 24; setHour(nh); setTime(`${String(nh).padStart(2,'0')}:${String(minute ?? 0).padStart(2,'0')}`);
                }} style={styles.smallBtn}><Text style={{ color: COLORS.bg, fontWeight: '700' }}>+</Text></TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <TouchableOpacity onPress={() => { const now = new Date(); setPickDate(now); setDate(now.toISOString().slice(0,10)); setHour(now.getHours()); setMinute(now.getMinutes()); setTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`); }} style={[styles.quickBtn, { marginRight: 8 }]}><Text style={{ color: COLORS.bg, fontWeight: '700' }}>Now</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => { setHour(12); setMinute(0); setTime('12:00'); }} style={styles.quickBtn}><Text style={{ color: COLORS.bg, fontWeight: '700' }}>Noon</Text></TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.rowSpace}>
            <TouchableOpacity onPress={() => setPriority('low')} style={[styles.priorityBtn, priority === 'low' && styles.priorityActive]}>
              <Text style={priority === 'low' ? styles.priorityTextActive : styles.priorityText}>Low</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPriority('medium')} style={[styles.priorityBtn, priority === 'medium' && styles.priorityActive]}>
              <Text style={priority === 'medium' ? styles.priorityTextActive : styles.priorityText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPriority('high')} style={[styles.priorityBtn, priority === 'high' && styles.priorityActive]}>
              <Text style={priority === 'high' ? styles.priorityTextActive : styles.priorityText}>High</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submit} style={styles.submit}>
              <Text style={styles.submitText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  // push the sheet slightly up from the bottom so buttons are comfortable to tap
  sheet: { backgroundColor: COLORS.surface, padding: 16, paddingBottom: 28, marginBottom: 18, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  title: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: COLORS.inputBg, color: COLORS.text, padding: 10, borderRadius: 8, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  rowInline: { flexDirection: 'row', alignItems: 'center' },
  smallBtn: { padding: 8, borderRadius: 6, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  dateDisplay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  timeDisplay: { width: 56, alignItems: 'center', justifyContent: 'center', padding: 8 },
  quickBtn: { padding: 8, borderRadius: 6, backgroundColor: COLORS.white },
  dropdown: { backgroundColor: COLORS.inputBg, borderRadius: 8, marginTop: 8, overflow: 'hidden' },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.02)' },
  priorityBtn: { flex: 1, padding: 10, borderRadius: 8, marginHorizontal: 4, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)', alignItems: 'center' },
  priorityActive: { backgroundColor: COLORS.accent },
  priorityText: { color: COLORS.muted },
  priorityTextActive: { color: COLORS.white, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, paddingBottom: 6 },
  cancel: { padding: 10, marginRight: 8 },
  cancelText: { color: COLORS.muted },
  submit: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 },
  submitText: { color: COLORS.white, fontWeight: '700' },
});
