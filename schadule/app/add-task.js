import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

// Request notification permissions
async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Failed to get notification permissions!');
  }
}

export default function AddTaskScreen() {
  const router = useRouter();
  const { scheduleId, taskId } = useLocalSearchParams();
  
  const [taskName, setTaskName] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(null); // 'start' or 'end'

  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // If editing, load existing task data
    if (taskId) {
      const loadTask = async () => {
        const tasksJson = await AsyncStorage.getItem('tasks');
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        const taskToEdit = tasks.find(t => t.id === taskId);
        if (taskToEdit) {
          setTaskName(taskToEdit.name);
          setStartTime(new Date(taskToEdit.startTime));
          setEndTime(new Date(taskToEdit.endTime));
        }
      };
      loadTask();
    }
  }, []);

  const onTimeChange = (event, selectedDate) => {
    setShowPicker(null);
    if (selectedDate) {
      if (showPicker === 'start') {
        setStartTime(selectedDate);
        // Also update end time if it's before the new start time
        if (selectedDate > endTime) {
            setEndTime(selectedDate);
        }
      } else if (showPicker === 'end') {
        setEndTime(selectedDate);
      }
    }
  };

  const scheduleTaskNotification = async (taskName, date, type) => {
      return await Notifications.scheduleNotificationAsync({
          content: {
              title: type === 'start' ? `Starting: ${taskName}` : `Ending: ${taskName}`,
              body: "Time to switch tasks!",
              sound: 'school-bell.mp3',
              data: { taskName }, // Pass data to the notification
          },
          trigger: date, // Schedule for a specific date and time
      });
  };

  const handleSaveTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Missing Name', 'Please enter a task name.');
      return;
    }
    if (endTime <= startTime) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }
    
    const tasksJson = await AsyncStorage.getItem('tasks');
    let tasks = tasksJson ? JSON.parse(tasksJson) : [];
    
    // Cancel old notifications if editing
    if (taskId) {
        const oldTask = tasks.find(t => t.id === taskId);
        if (oldTask?.startNotificationId) await Notifications.cancelScheduledNotificationAsync(oldTask.startNotificationId);
        // You can also cancel the end notification if you schedule one
    }
    
    // Schedule new notifications
    const startNotificationId = await scheduleTaskNotification(taskName, startTime, 'start');
    
    const taskData = {
      id: taskId || Date.now().toString(),
      scheduleId,
      name: taskName,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      startNotificationId,
    };
    
    if (taskId) { // Update existing task
      tasks = tasks.map(t => t.id === taskId ? taskData : t);
    } else { // Add new task
      tasks.push(taskData);
    }
    
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    Alert.alert('Success', 'Task has been saved.');
    router.back();
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Task Name" value={taskName} onChangeText={setTaskName} />
      
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPicker('start')}>
        <Text>Start Time: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.pickerButton} onPress={() => setShowPicker('end')}>
        <Text>End Time: {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? startTime : endTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
        <Text style={styles.saveButtonText}>Save Task</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { height: 50, borderColor: '#ddd', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, fontSize: 16, marginBottom: 20 },
  pickerButton: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  saveButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
