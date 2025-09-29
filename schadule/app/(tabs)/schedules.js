import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SchedulesScreen() {
  const [schedules, setSchedules] = useState([]);
  const router = useRouter();

  const loadSchedules = async () => {
    const schedulesJson = await AsyncStorage.getItem('schedules');
    setSchedules(schedulesJson ? JSON.parse(schedulesJson) : []);
  };

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [])
  );

  const deleteSchedule = async (scheduleId) => {
    try {
      // First, delete all tasks associated with this schedule
      const tasksJson = await AsyncStorage.getItem('tasks');
      let tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const remainingTasks = tasks.filter(task => task.scheduleId !== scheduleId);
      await AsyncStorage.setItem('tasks', JSON.stringify(remainingTasks));

      // Then, delete the schedule itself
      const remainingSchedules = schedules.filter(s => s.id !== scheduleId);
      await AsyncStorage.setItem('schedules', JSON.stringify(remainingSchedules));
      
      setSchedules(remainingSchedules); // Update state
      Alert.alert('Success', 'Schedule and its tasks have been deleted.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete schedule.');
    }
  };

  const handleEdit = (scheduleId) => {
    router.push({ pathname: '/add-schedule', params: { scheduleId } });
  };
  
  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No schedules created yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleName}>{item.name}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={() => handleEdit(item.id)} style={[styles.button, styles.editButton]}>
                <FontAwesome5 name="pen" size={16} color="#a3a3a3" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteSchedule(item.id)} style={[styles.button, styles.deleteButton]}>
                 <FontAwesome5 name="trash" size={16} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Link href="/add-schedule" asChild>
        <TouchableOpacity style={styles.addButton}>
          <FontAwesome5 name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  scheduleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, marginHorizontal: 15, marginVertical: 8, borderRadius: 10 },
  scheduleName: { fontSize: 18, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row' },
  button: { 
    padding: 16, 
    borderRadius: 5,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#a3a3a3'
   },

  addButton: { 
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },

  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});
