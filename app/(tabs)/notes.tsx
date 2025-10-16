import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@sigmafe/notes";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }
  return date.toLocaleString();
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const persistNotes = useCallback(async (next: Note[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Failed to save notes", error);
      Alert.alert("Storage error", "We could not save your notes right now.");
    }
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Note[] = JSON.parse(stored);
        setNotes(
          parsed.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        );
      }
    } catch (error) {
      console.error("Failed to load notes", error);
      Alert.alert("Storage error", "We could not load your notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const resetEditor = useCallback(() => {
    setSelectedId(null);
    setTitle("");
    setContent("");
  }, []);

  const handleSelect = useCallback(
    (noteId: string) => {
      const note = notes.find((item) => item.id === noteId);
      if (!note) {
        return;
      }
      setSelectedId(noteId);
      setTitle(note.title);
      setContent(note.content);
    },
    [notes]
  );

  const handleSave = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent) {
      Alert.alert("Empty note", "Add a title or some text before saving.");
      return;
    }

    const now = new Date().toISOString();

    if (selectedId) {
      setNotes((current) => {
        const next = current.map((note) =>
          note.id === selectedId
            ? {
                ...note,
                title: trimmedTitle,
                content: trimmedContent,
                updatedAt: now,
              }
            : note
        );
        persistNotes(next);
        return next;
      });
      return;
    }

    const newNote: Note = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: trimmedTitle,
      content: trimmedContent,
      createdAt: now,
      updatedAt: now,
    };

    setNotes((current) => {
      const next = [newNote, ...current];
      persistNotes(next);
      return next;
    });
    setSelectedId(newNote.id);
  }, [content, persistNotes, selectedId, title]);

  const confirmDelete = useCallback(() => {
    if (!selectedId) {
      resetEditor();
      return;
    }

    Alert.alert("Delete note", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setNotes((current) => {
            const next = current.filter((note) => note.id !== selectedId);
            persistNotes(next);
            return next;
          });
          resetEditor();
        },
      },
    ]);
  }, [persistNotes, resetEditor, selectedId]);

  const sortedNotes = useMemo(() => {
    return [...notes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [notes]);

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="px-5 py-6">
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Notes
          </Text>
          <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Capture thoughts, meeting minutes, or study ideas in one place.
          </Text>

          <View className="mt-6 rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-900">
            <Text className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {selectedId ? "Edit note" : "New note"}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor="#94a3b8"
              className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write your note..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              className="mt-3 min-h-[160px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <View className="mt-4 flex-row flex-wrap items-center gap-3">
              <Pressable
                accessibilityRole="button"
                onPress={handleSave}
                className="rounded-xl bg-indigo-600 px-4 py-3"
              >
                <Text className="text-base font-semibold text-white">
                  Save note
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={resetEditor}
                className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-600"
              >
                <Text className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  Clear
                </Text>
              </Pressable>
              {selectedId && (
                <Pressable
                  accessibilityRole="button"
                  onPress={confirmDelete}
                  className="rounded-xl bg-rose-500 px-4 py-3"
                >
                  <Text className="text-base font-semibold text-white">
                    Delete
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <View className="mt-8">
            <Text className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {loading
                ? "Loading notes..."
                : sortedNotes.length
                ? "Your notes"
                : "No notes yet"}
            </Text>
            {!loading && !sortedNotes.length && (
              <Text className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Start by writing your first thought.
              </Text>
            )}
          </View>
        </View>

        <View className="px-5 pb-8">
          {sortedNotes.map((note) => {
            const isActive = note.id === selectedId;
            return (
              <Pressable
                key={note.id}
                onPress={() => handleSelect(note.id)}
                className={`mb-3 rounded-xl border px-4 py-3 shadow-sm ${
                  isActive
                    ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    isActive
                      ? "text-indigo-700 dark:text-indigo-200"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {note.title || "Untitled note"}
                </Text>
                {!!note.content && (
                  <Text
                    numberOfLines={2}
                    className="mt-1 text-sm text-slate-600 dark:text-slate-300"
                  >
                    {note.content}
                  </Text>
                )}
                <Text className="mt-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Updated {formatTimestamp(note.updatedAt)}
                </Text>
              </Pressable>
            );
          })}
          <View className="h-4" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
