import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  category?: string | null;
  dueDate?: string | null; // ISO date string
  priority?: 'low' | 'medium' | 'high';
  subtasks?: { id: string; text: string; done: boolean }[];
  recurring?: { interval: 'daily' | 'weekly' | 'monthly'; every?: number } | null;
};

const STORAGE_KEY = '@MyTodoApp:todos';

export default function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTodos(JSON.parse(raw));
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // persist on change
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos)).catch(() => {});
  }, [todos]);

  type AddParam =
    | string
    | ({
        text: string;
        category?: string | null;
        dueDate?: string | null;
        priority?: 'low' | 'medium' | 'high';
        recurring?: { interval: 'daily' | 'weekly' | 'monthly'; every?: number } | null;
      });

  const add = useCallback((p: AddParam) => {
    const nowId = String(Date.now());
    const payload = typeof p === 'string' ? { text: p } : p;
    const t: Todo = {
      id: nowId,
      text: payload.text,
      done: false,
      category: payload.category ?? null,
      dueDate: payload.dueDate ?? null,
      priority: payload.priority ?? 'medium',
      subtasks: [],
      recurring: payload.recurring ?? null,
    };
    setTodos((s) => [t, ...s]);
    return nowId;
  }, []);

  const toggle = useCallback((id: string) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const update = useCallback((id: string, text: string) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, text } : t)));
  }, []);

  const addSubtask = useCallback((todoId: string, text: string) => {
    const sid = String(Date.now());
    setTodos((s) =>
      s.map((t) =>
        t.id === todoId
          ? { ...t, subtasks: [...(t.subtasks ?? []), { id: sid, text, done: false }] }
          : t
      )
    );
    return sid;
  }, []);

  const toggleSubtask = useCallback((todoId: string, subtaskId: string) => {
    setTodos((s) =>
      s.map((t) =>
        t.id === todoId
          ? { ...t, subtasks: (t.subtasks ?? []).map((st) => (st.id === subtaskId ? { ...st, done: !st.done } : st)) }
          : t
      )
    );
  }, []);

  const removeSubtask = useCallback((todoId: string, subtaskId: string) => {
    setTodos((s) => s.map((t) => (t.id === todoId ? { ...t, subtasks: (t.subtasks ?? []).filter((st) => st.id !== subtaskId) } : t)));
  }, []);

  const markAll = useCallback((done: boolean) => {
    setTodos((s) => s.map((t) => ({ ...t, done })));
  }, []);

  const remove = useCallback((id: string) => {
    setTodos((s) => s.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setTodos([]), []);

  return { todos, loading, add, toggle, remove, clear, update, markAll } as const;
}
