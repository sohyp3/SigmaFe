import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "@sigmafe/tasks";
const DUE_SOON_THRESHOLD_MINUTES = 60;
const CHECK_INTERVAL_MS = 60 * 1000;

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string | null;
  completed: boolean;
  createdAt: string;
}

type NotifiedSets = {
  soon: Set<string>;
  overdue: Set<string>;
};

const initialNotifiedSets = (): NotifiedSets => ({
  soon: new Set<string>(),
  overdue: new Set<string>(),
});

const normalizeDateInput = (value: string) => {
  if (!value.trim()) {
    return "";
  }

  // Allow users to enter "YYYY-MM-DD HH:mm" or ISO strings.
  const trimmed = value.trim();
  if (trimmed.includes("T")) {
    return trimmed;
  }
  return trimmed.replace(" ", "T");
};

const formatDueDate = (iso?: string | null) => {
  if (!iso) {
    return "No deadline";
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown deadline";
  }

  return parsed.toLocaleString();
};

const isDueSoon = (dueDate?: string | null) => {
  if (!dueDate) {
    return false;
  }
  const target = new Date(dueDate).getTime();
  if (!Number.isFinite(target)) {
    return false;
  }
  const now = Date.now();
  return target > now && target - now <= DUE_SOON_THRESHOLD_MINUTES * 60 * 1000;
};

const isOverdue = (dueDate?: string | null) => {
  if (!dueDate) {
    return false;
  }
  const target = new Date(dueDate).getTime();
  if (!Number.isFinite(target)) {
    return false;
  }
  return target <= Date.now();
};

export default function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDateInput, setDueDateInput] = useState("");
  const [loading, setLoading] = useState(true);

  const tasksRef = useRef<Task[]>([]);
  const notifiedRef = useRef<NotifiedSets>(initialNotifiedSets());

  const saveTasks = useCallback(async (next: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Failed to save tasks", error);
      Alert.alert("Storage error", "We couldn't save your tasks right now.");
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Task[] = JSON.parse(stored);
        setTasks(
          parsed.sort((a, b) =>
            (a.completed === b.completed
              ? 0
              : a.completed
              ? 1
              : -1) ||
            (a.dueDate && b.dueDate
              ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              : a.dueDate
              ? -1
              : 1)
          )
        );
      }
    } catch (error) {
      console.error("Failed to load tasks", error);
      Alert.alert("Storage error", "We couldn't load your tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    tasksRef.current = tasks;

    const existingIds = new Set(tasks.map((task) => task.id));
    // Clean up notifications that belong to removed tasks.
    notifiedRef.current.soon.forEach((id) => {
      if (!existingIds.has(id)) {
        notifiedRef.current.soon.delete(id);
      }
    });
    notifiedRef.current.overdue.forEach((id) => {
      if (!existingIds.has(id)) {
        notifiedRef.current.overdue.delete(id);
      }
    });

    const now = Date.now();
    tasks.forEach((task) => {
      if (task.completed || !task.dueDate) {
        notifiedRef.current.soon.delete(task.id);
        notifiedRef.current.overdue.delete(task.id);
        return;
      }

      const dueTime = new Date(task.dueDate).getTime();
      if (!Number.isFinite(dueTime)) {
        return;
      }

      if (dueTime - now > DUE_SOON_THRESHOLD_MINUTES * 60 * 1000) {
        notifiedRef.current.soon.delete(task.id);
      }

      if (dueTime > now) {
        notifiedRef.current.overdue.delete(task.id);
      }
    });
  }, [tasks]);

  const checkDeadlines = useCallback(() => {
    const now = Date.now();
    const soon: Task[] = [];
    const overdue: Task[] = [];

    tasksRef.current.forEach((task) => {
      if (task.completed || !task.dueDate) {
        return;
      }
      const dueTime = new Date(task.dueDate).getTime();
      if (!Number.isFinite(dueTime)) {
        return;
      }

      if (dueTime <= now) {
        if (!notifiedRef.current.overdue.has(task.id)) {
          overdue.push(task);
          notifiedRef.current.overdue.add(task.id);
        }
        return;
      }

      if (
        dueTime - now <= DUE_SOON_THRESHOLD_MINUTES * 60 * 1000 &&
        !notifiedRef.current.soon.has(task.id)
      ) {
        soon.push(task);
        notifiedRef.current.soon.add(task.id);
      }
    });

    if (overdue.length) {
      const message = overdue
        .map((task) => `• ${task.title} (${formatDueDate(task.dueDate)})`)
        .join("\n");
      Alert.alert("Overdue tasks", `${message}\n\nMark them done or update the deadline.`);
    }

    if (soon.length) {
      const message = soon
        .map((task) => `• ${task.title} (${formatDueDate(task.dueDate)})`)
        .join("\n");
      Alert.alert(
        "Due soon",
        `${message}\n\nThese tasks are due within the next ${DUE_SOON_THRESHOLD_MINUTES} minutes.`
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkDeadlines();
    }, [checkDeadlines])
  );

  useEffect(() => {
    checkDeadlines();
    const interval = setInterval(checkDeadlines, CHECK_INTERVAL_MS);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkDeadlines();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [checkDeadlines]);

  const handleAddTask = useCallback(() => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Give your task a short name so you remember it.");
      return;
    }

    let dueDateISO: string | null | undefined = null;
    if (dueDateInput.trim()) {
      const normalized = normalizeDateInput(dueDateInput);
      const parsed = new Date(normalized);
      if (Number.isNaN(parsed.getTime())) {
        Alert.alert(
          "Invalid deadline",
          "Use a format like 2025-12-31 17:30 or 2025-12-31T17:30."
        );
        return;
      }
      dueDateISO = parsed.toISOString();
    }

    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDateISO,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((current) => {
      const next = [newTask, ...current];
      saveTasks(next);
      return next;
    });

    setTitle("");
    setDescription("");
    setDueDateInput("");

    // Reset notification flags so the new task can be picked up immediately.
    notifiedRef.current.soon.delete(newTask.id);
    notifiedRef.current.overdue.delete(newTask.id);

    setTimeout(checkDeadlines, 200);
  }, [checkDeadlines, description, dueDateInput, saveTasks, title]);

  const toggleCompletion = useCallback(
    (taskId: string) => {
      setTasks((current) => {
        const next = current.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        saveTasks(next);
        return next;
      });
      notifiedRef.current.soon.delete(taskId);
      notifiedRef.current.overdue.delete(taskId);
    },
    [saveTasks]
  );

  const removeTask = useCallback(
    (taskId: string) => {
      setTasks((current) => {
        const next = current.filter((task) => task.id !== taskId);
        saveTasks(next);
        return next;
      });
      notifiedRef.current.soon.delete(taskId);
      notifiedRef.current.overdue.delete(taskId);
    },
    [saveTasks]
  );

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) {
        return -1;
      }
      if (b.dueDate) {
        return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks]);

  const TaskCard = ({ task }: { task: Task }) => {
    const dueSoon = isDueSoon(task.dueDate);
    const overdue = isOverdue(task.dueDate);

    return (
      <View
        className={`mb-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${
          overdue ? "border-red-400" : dueSoon ? "border-amber-400" : ""
        }`}
      >
        <Pressable onPress={() => toggleCompletion(task.id)}>
          <Text
            className={`text-lg font-semibold ${
              task.completed ? "text-slate-400 line-through" : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {task.title}
          </Text>
        </Pressable>
        {!!task.description && (
          <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {task.description}
          </Text>
        )}
        <View className="mt-2 flex-row flex-wrap items-center justify-between gap-2">
          <Text
            className={`text-xs font-medium uppercase tracking-wide ${
              overdue
                ? "text-red-500"
                : dueSoon
                ? "text-amber-500"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {overdue ? "Overdue" : dueSoon ? "Due soon" : "Deadline"}
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-300">
            {formatDueDate(task.dueDate)}
          </Text>
        </View>
        <View className="mt-3 flex-row items-center justify-end gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={() => toggleCompletion(task.id)}
            className={`rounded-md px-3 py-2 ${
              task.completed
                ? "bg-emerald-500/10"
                : "bg-emerald-500"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                task.completed ? "text-emerald-600" : "text-white"
              }`}
            >
              {task.completed ? "Mark as active" : "Mark complete"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => removeTask(task.id)}
            className="rounded-md bg-rose-500 px-3 py-2"
          >
            <Text className="text-sm font-semibold text-white">Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        <View className="px-5 py-6">
          <Text className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Your to-do list
          </Text>
          <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Add what needs doing, include a deadline, and we will remind you when it is close.
          </Text>

          <View className="mt-6 rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-900">
            <Text className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              New task
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor="#94a3b8"
              className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Details (optional)"
              placeholderTextColor="#94a3b8"
              multiline
              className="mt-3 min-h-[80px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <TextInput
              value={dueDateInput}
              onChangeText={setDueDateInput}
              placeholder="Deadline (e.g. 2025-12-31 17:30)"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <Pressable
              accessibilityRole="button"
              onPress={handleAddTask}
              className="mt-4 items-center justify-center rounded-xl bg-blue-600 px-4 py-3"
            >
              <Text className="text-base font-semibold text-white">Add task</Text>
            </Pressable>
          </View>

          <View className="mt-8">
            <Text className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {loading
                ? "Loading tasks..."
                : sortedTasks.length
                ? "Upcoming tasks"
                : "Nothing to do yet"}
            </Text>
            {!loading && !sortedTasks.length && (
              <Text className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Create your first task to get started.
              </Text>
            )}
          </View>
        </View>

        <View className="px-5 pb-8">
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          <View className="h-4" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
