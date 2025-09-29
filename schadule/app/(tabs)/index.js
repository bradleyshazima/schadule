import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

export default function HomeScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todaysTasks, setTodaysTasks] = useState([]);

  // Function to get and filter tasks for today
  const loadTodaysTasks = async () => {
    const allTasksJson = await AsyncStorage.getItem('tasks');
    const allTasks = allTasksJson ? JSON.parse(allTasksJson) : [];
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const filteredTasks = allTasks
      .filter(task => {
        const taskDate = new Date(task.startTime);
        return taskDate >= startOfDay && taskDate < endOfDay;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    
    setTodaysTasks(filteredTasks);
  };

  // Load tasks when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadTodaysTasks();
    }, [])
  );

  // Update the clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCurrentTask = (startTime, endTime) => {
    const now = currentTime.getTime();
    return now >= new Date(startTime).getTime() && now < new Date(endTime).getTime();
  };
  
  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scheduleContainer}>
        <View style={styles.header}>
          <Text style={styles.timeText}>{currentTime.toLocaleTimeString('en-GB')}</Text>
          <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
        </View>

        <Text style={styles.scheduleTitle}>Current Task</Text>
        {todaysTasks.filter(task => isCurrentTask(task.startTime, task.endTime)).length === 0 ? (
          <Text style={styles.noTasksText}>No ongoing task now.</Text>
        ) : (
          todaysTasks
            .filter(task => isCurrentTask(task.startTime, task.endTime))
            .slice(0, 1) // only one ongoing task
            .map((task) => (
              <View key={task.id} style={[styles.taskCard, styles.currentTaskCard]}>
                <Text style={styles.scheduleNameText}>{task.scheduleName}</Text>
                <Text style={styles.currentTaskName}>{task.name}</Text>
                <Text style={styles.taskTime}>
                  {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{" "}
                  {new Date(task.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f4f4f8',
    marginTop: 28,
  },

  header: { 
    paddingVertical: 40, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    marginBottom: 20, 
    borderRadius: 10,
  },

  dateText: { 
    fontSize: 16,
    color: '#666' 
  },

  timeText: { 
    fontSize: 48, 
    fontWeight: 'bold',
    color: '#333'
  },

  scheduleContainer: { 
    padding: 20 
  },

  scheduleTitle: { 
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },

  taskCard: { 
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  currentTaskCard: { 
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
    transform: [{ scale: 1.05 }],
    flexDirection: 'column-reverse',

  },

  taskName: { 
    fontSize: 18,
    fontWeight: '500'
  },

  taskTime: { 
    fontSize: 14,
    color: '#666',
    marginTop: 5 
  },

  currentTaskText: { 
    color: '#fff'
  },

  noTasksText: { 
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: 'gray'
  },

  scheduleNameText: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 4,
  },

  currentTaskName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },

});
