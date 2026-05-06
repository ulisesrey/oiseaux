import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#F5F7FA' },
        headerShadowVisible: false, // Removes the line under the header
        headerTintColor: '#007AFF', // Color of the back button text
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* 1. Hide header on the Main Menu */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      
      {/* 2. Customize header on the Game Screen */}
      <Stack.Screen 
        name="game" 
        options={{ 
          headerTitle: "Entraînement", 
          headerBackTitle: "Quitter", // This changes the back button text on iOS
        }} 
      />
    </Stack>
  );
}