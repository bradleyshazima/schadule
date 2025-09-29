// app/modal.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';

export default function AlarmModal() {
  const { message } = useLocalSearchParams(); // Get the message from the router
  const router = useRouter();

  useEffect(() => {
    let soundObject = null;
    const playSound = async () => {
      try {
        soundObject = new Audio.Sound();
        await soundObject.loadAsync(require('../assets/school_bell.mp3'));
        await soundObject.playAsync();
      } catch (error) {
        console.error("Couldn't play sound", error);
      }
    };
    playSound();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      backHandler.remove();
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, []);

  const dismissAlarm = () => {
    // Navigate back to the main tab screen
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.alarmText}>It's time for:</Text>
      <Text style={styles.messageText}>{message || 'Your Schedule'}</Text>
      <TouchableOpacity style={styles.dismissButton} onPress={dismissAlarm}>
        <Text style={styles.dismissButtonText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

// Keep the same styles as the previous response
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#007AFF' },
  alarmText: { fontSize: 24, color: '#fff', marginBottom: 20 },
  messageText: { fontSize: 48, fontWeight: 'bold', color: '#fff', textAlign: 'center', paddingHorizontal: 20 },
  dismissButton: { marginTop: 60, backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  dismissButtonText: { color: '#007AFF', fontSize: 20, fontWeight: 'bold' },
});