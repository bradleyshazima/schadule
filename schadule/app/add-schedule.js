import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";

export default function AddScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [scheduleName, setScheduleName] = useState("");
  const [tasks, setTasks] = useState([]);
  const [currentScheduleId, setCurrentScheduleId] = useState(params.scheduleId || null);
  const [selectedDays, setSelectedDays] = useState([]); // array of dates
  const [repeatMode, setRepeatMode] = useState("once"); // "once" | "forever"

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  // build current week
  const getCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return [...Array(7)].map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };
  const week = getCurrentWeek();

  // load schedule when editing
  useFocusEffect(
    useCallback(() => {
      const setup = async () => {
        if (currentScheduleId) {
          const schedulesJson = await AsyncStorage.getItem("schedules");
          const schedules = schedulesJson ? JSON.parse(schedulesJson) : [];
          const current = schedules.find((s) => s.id === currentScheduleId);
          if (current) {
            setScheduleName(current.name);
            setSelectedDays(current.dates || []);
            setRepeatMode(current.repeat || "once");
          }
          loadTasksForSchedule(currentScheduleId);
        } else {
          setScheduleName("");
          setTasks([]);
          setSelectedDays([]);
          setRepeatMode("once");
        }
      };
      setup();
    }, [currentScheduleId])
  );

  // auto-save when name/dates/repeat changes
  useEffect(() => {
    const save = setTimeout(handleSaveSchedule, 500);
    return () => clearTimeout(save);
  }, [scheduleName, selectedDays, repeatMode]);

  const loadTasksForSchedule = async (scheduleId) => {
    const allTasksJson = await AsyncStorage.getItem("tasks");
    const allTasks = allTasksJson ? JSON.parse(allTasksJson) : [];
    const scheduleTasks = allTasks
      .filter((t) => t.scheduleId === scheduleId)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    setTasks(scheduleTasks);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleName.trim()) return;

    const schedulesJson = await AsyncStorage.getItem("schedules");
    let schedules = schedulesJson ? JSON.parse(schedulesJson) : [];
    let scheduleIdToSave = currentScheduleId;

    if (currentScheduleId) {
      schedules = schedules.map((s) =>
        s.id === currentScheduleId ? { ...s, name: scheduleName, dates: selectedDays, repeat: repeatMode } : s
      );
    } else {
      const newSchedule = {
        id: Date.now().toString(),
        name: scheduleName,
        dates: selectedDays,
        repeat: repeatMode,
      };
      schedules.push(newSchedule);
      scheduleIdToSave = newSchedule.id;
      setCurrentScheduleId(newSchedule.id);
    }
    await AsyncStorage.setItem("schedules", JSON.stringify(schedules));
  };

  const toggleDay = (day) => {
    const dayStr = day.toISOString().split("T")[0];
    setSelectedDays((prev) =>
      prev.includes(dayStr) ? prev.filter((d) => d !== dayStr) : [...prev, dayStr]
    );
  };

  const navigateToAddTask = (taskId) => {
    if (!currentScheduleId) {
      Alert.alert("Wait", "Please type a schedule name first (auto-saves).");
      return;
    }
    const params = { scheduleId: currentScheduleId };
    if (taskId) params.taskId = taskId;
    router.push({ pathname: "/add-task", params });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Auto-saving input */}
      <TextInput
        style={styles.input}
        placeholder="Schedule Name (e.g., Weekday Routine)"
        value={scheduleName}
        onChangeText={setScheduleName}
      />

      {/* Multi-select week view */}
      <View style={styles.weekRow}>
        {week.map((day, i) => {
          const dayStr = day.toISOString().split("T")[0];
          const isSelected = selectedDays.includes(dayStr);
          return (
            <TouchableOpacity key={i} onPress={() => toggleDay(day)} style={[styles.dayBox, isSelected && styles.activeDayBox]}>
              <Text style={[styles.dayLetter, isSelected && styles.activeText]}>{weekDays[i]}</Text>
              <Text style={[styles.dayNumber, isSelected && styles.activeText]}>{day.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Repeat mode */}
      <View style={styles.repeatRow}>
        <TouchableOpacity onPress={() => setRepeatMode("once")} style={[styles.repeatBtn, repeatMode === "once" && styles.activeRepeat]}>
          <Text style={repeatMode === "once" ? styles.activeText : null}>This Week Only</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRepeatMode("forever")} style={[styles.repeatBtn, repeatMode === "forever" && styles.activeRepeat]}>
          <Text style={repeatMode === "forever" ? styles.activeText : null}>Loop Forever</Text>
        </TouchableOpacity>
      </View>

      {/* Tasks */}
      <View style={styles.tasksHeader}>
        <Text style={styles.tasksTitle}>Tasks</Text>
        <TouchableOpacity style={styles.addTaskButton} onPress={() => navigateToAddTask(null)}>
          <FontAwesome5 name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      {tasks.length > 0 ? tasks.map((task) => (
        <TouchableOpacity key={task.id} style={styles.taskItem} onPress={() => navigateToAddTask(task.id)}>
          <Text style={styles.taskName}>{task.name}</Text>
          <Text style={styles.taskTime}>
            {new Date(task.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
            {new Date(task.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </TouchableOpacity>
      )) : <Text style={styles.noTasksText}>No tasks added yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  input: { height: 50, borderColor: "#ddd", borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, fontSize: 16, marginBottom: 20 },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  dayBox: { width: 40, height: 60, borderRadius: 10, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#ddd" },
  activeDayBox: { backgroundColor: "#007AFF", borderColor: "#0056b3" },
  dayLetter: { fontSize: 16, fontWeight: "bold", color: "#333" },
  dayNumber: { fontSize: 14, color: "#666" },
  activeText: { color: "#fff", fontWeight: "bold" },
  repeatRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  repeatBtn: { padding: 10, borderWidth: 1, borderRadius: 8, borderColor: "#ccc" },
  activeRepeat: { backgroundColor: "#007AFF", borderColor: "#0056b3" },
  tasksHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 10 },
  tasksTitle: { fontSize: 22, fontWeight: "bold" },
  addTaskButton: { backgroundColor: "#007AFF", width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  taskItem: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 8, marginBottom: 10 },
  taskName: { fontSize: 16, fontWeight: "500" },
  taskTime: { color: "gray", marginTop: 4 },
  noTasksText: { color: "gray", textAlign: "center", marginTop: 20 },
});
