
import React from "react";

import {
  NavigationContainer,
  DarkTheme,
} from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

// Screens
import Home from "./screens/Home";
import Tasks from "./screens/Tasks";
import Settings from "./screens/Settings";

// Components
import UpdatePrompt from "./components/UpdatePrompt";
import { dismissOpenSwipeOnOutsideTouch } from "./components/SwipeToDelete";

const Stack = createNativeStackNavigator();

const headerOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: "#080D1B" },
  headerTintColor: "#38BDF8",
  headerShadowVisible: false,
  gestureEnabled: true,
};

const App = () => {
  return (
    <GestureHandlerRootView
      style={{ flex: 1 }}
      onStartShouldSetResponderCapture={
        dismissOpenSwipeOnOutsideTouch
      }
    >
      <SafeAreaProvider>
        <UpdatePrompt>
          <NavigationContainer theme={DarkTheme}>
            <StatusBar style="light" />

            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: "#080D1B",
                },
              }}
            >

              <Stack.Screen
                name="Home"
                component={Home}
              />

              <Stack.Screen
                name="Tasks"
                component={Tasks}
                options={({ route }) => ({
                  ...headerOptions,
                  title:
                    route.params?.listName ||
                    "My Existing Tasks",
                })}
              />

              <Stack.Screen
                name="Settings"
                component={Settings}
                options={{
                  ...headerOptions,
                  title: "Settings",
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </UpdatePrompt>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
