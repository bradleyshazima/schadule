import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

// Configure notification behavior while the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // This listener is fired whenever a user taps on or receives a notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { taskName } = response.notification.request.content.data;
      if (taskName) {
        // Navigate to the alarm screen with the task name
        router.push({ pathname: '/alarm', params: { taskName } });
      }
    });

    return () => {
      responseSubscription.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#f8f8f8' }, headerTintColor: '#333' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-schedule"
        options={{
          presentation: 'modal',
          title: 'Add/Edit Schedule',
        }}
      />
      <Stack.Screen
        name="add-task"
        options={{
          presentation: 'modal',
          title: 'Add/Edit Task',
        }}
      />
      <Stack.Screen
        name="alarm"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
