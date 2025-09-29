import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Octicons, FontAwesome6 } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderRadius: 16,
          backgroundColor: "#ffffff",
          height: 80,
          paddingVertical: 20 ,
          borderTopWidth: 0,
          elevation: 4, // shadow on Android
          shadowColor: "#000", // shadow on iOS
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarIcon: ({ color, focused }) => {
          let icon;
          let label;

          if (route.name === "index") {
            icon = <Octicons name="home-fill" size={22} color={focused ? "#007AFF" : "#999"} />;
            label = "Home";
          } else if (route.name === "schedules") {
            icon = <Octicons name="tasklist" size={22} color={focused ? "#007AFF" : "#999"} />;
            label = "Schedules";
          } else if (route.name === "week") {
            icon = <FontAwesome6 name="table" size={22} color={focused ? "#007AFF" : "#999"} />;
            label = "Week";
          }

          if (focused) {
            return (
              <View
                style={{
                  width: 120,
                  height: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: 'space-between',
                  gap: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: "#f0f6ff",
                }}
              >
                {icon}
                <Text style={{ color: "#007AFF", fontSize: 14, fontWeight: "500" }}>{label}</Text>
              </View>
            );
          }

          return icon;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Schazule",
        }}
      />
      <Tabs.Screen
        name="schedules"
        options={{
          title: "Schedules",
          headerTitle: "My Schedules",
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: "Week",
          headerTitle: "This Week",
        }}
      />
    </Tabs>
  );
}
