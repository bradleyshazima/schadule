import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, BackHandler, AppState } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio } from 'expo-av';

export default function AlarmScreen() {
  const { taskName } = useLocalSearchParams();
  const router = useRouter();
  const soundObject = useRef(new Audio.Sound());

  useEffect(() => {
    let timeoutId;

    const playSoundAndSetTimer = async () => {
      try {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
        });
        await soundObject.current.loadAsync(require('../assets/audio/school-bell.mp3'));
        await soundObject.current.playAsync();
      } catch (error) {
        console.error("Couldn't play sound", error);
      }

      // Set a timer to dismiss the alarm after 30 seconds
      timeoutId = setTimeout(() => {
        router.replace('/'); // Go back to home screen
      }, 30000); // 30 seconds
    };

    playSoundAndSetTimer();

    // Prevent the user from using the hardware back button to dismiss
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

    // Cleanup function
    return () => {
      backHandler.remove();
      clearTimeout(timeoutId);
      soundObject.current.unloadAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Time for:</Text>
      <Text style={styles.taskText}>{taskName || 'Your next task!'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff3b30', // A strong alarm color
  },
  titleText: {
    fontSize: 28,
    color: '#fff',
  },
  taskText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
});
