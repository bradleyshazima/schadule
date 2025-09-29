import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WeekScreen() {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [schedules, setSchedules] = useState([]);

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const getCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday start
    return [...Array(7)].map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const week = getCurrentWeek();

  useEffect(() => {
    const loadSchedules = async () => {
      const schedulesJson = await AsyncStorage.getItem("schedules");
      const allSchedules = schedulesJson ? JSON.parse(schedulesJson) : [];
      const daySchedules = allSchedules.filter(
        (s) => new Date(s.date).toDateString() === selectedDay.toDateString()
      );
      setSchedules(daySchedules);
    };
    loadSchedules();
  }, [selectedDay]);

  return (
    <View style={styles.container}>
      <View style={styles.weekRow}>
        {week.map((day, i) => {
          const isActive = day.toDateString() === selectedDay.toDateString();
          return (
            <TouchableOpacity key={i} onPress={() => setSelectedDay(day)} style={[styles.dayBox, isActive && styles.activeDayBox]}>
              <Text style={[styles.dayLetter, isActive && styles.activeText]}>{weekDays[i]}</Text>
              <Text style={[styles.dayNumber, isActive && styles.activeText]}>{day.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.dayScheduleTitle}>
        {selectedDay.toLocaleDateString(undefined, { weekday: "long" })} Schedule
      </Text>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No schedules for this day.</Text>}
        renderItem={({ item }) => {
          const startTime = item.tasks?.length ? new Date(item.tasks[0].startTime) : null;
          const endTime = item.tasks?.length ? new Date(item.tasks[item.tasks.length - 1].endTime) : null;

          return (
            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleName}>{item.name}</Text>
              {startTime && endTime && (
                <Text style={styles.scheduleTime}>
                  {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f8" },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  dayBox: { width: 40, height: 60, borderRadius: 10, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#ddd" },
  activeDayBox: { backgroundColor: "#007AFF", borderColor: "#0056b3" },
  dayLetter: { fontSize: 16, fontWeight: "bold", color: "#333" },
  dayNumber: { fontSize: 14, color: "#666" },
  activeText: { color: "#fff" },
  dayScheduleTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  scheduleCard: { backgroundColor: "#fff", padding: 16, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  scheduleName: { fontSize: 18, fontWeight: "bold" },
  scheduleTime: { fontSize: 14, color: "#555", marginTop: 4 },
  emptyText: { color: "gray", marginTop: 20, textAlign: "center" },
});
