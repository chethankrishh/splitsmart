import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { SplitterProvider } from "../context/SplitterContext";
import { BudgetProvider } from "../context/BudgetContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { Radius } from "../utils/theme";

function TabIcon({
  name,
  focused,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  focused: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.iconWrap,
        focused && { backgroundColor: colors.tabActivePill },
      ]}
    >
      <Ionicons
        name={name}
        size={22}
        color={focused ? colors.tabIconActive : colors.tabIconInactive}
      />
    </View>
  );
}

function AppTabs() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarActiveTintColor: colors.tabIconActive,
        tabBarInactiveTintColor: colors.tabIconInactive,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="splitter"
        options={{
          title: "Splitter",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "people" : "people-outline"}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "wallet" : "wallet-outline"}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SplitterProvider>
        <BudgetProvider>
          <AppTabs />
        </BudgetProvider>
      </SplitterProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
});
