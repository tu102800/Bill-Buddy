import { Tabs } from 'expo-router';
import { Receipt, History } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          height: 80,
          paddingTop: 8,
          paddingBottom: 16,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          borderRadius: 16,
        },
        tabBarActiveTintColor: '#0891b2',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontFamily: 'VarelaRound',
          fontSize: 13,
          fontWeight: '600',
          marginTop: 1,
          paddingBottom: 0,
        },
        tabBarIconStyle: {
          marginBottom: -1,
        },
        tabBarLabelPosition: 'below-icon',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Create',
          tabBarIcon: ({ size, color }) => (
            <Receipt size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <History size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}