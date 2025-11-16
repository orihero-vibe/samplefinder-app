import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeStack from '@/navigation/HomeStack';
import ProfileScreen from '@/screens/tabs/ProfileScreen';
import FavoritesScreen from '@/screens/tabs/favorites/FavoritesScreen';
import CalendarStack from '@/navigation/CalendarStack';
import PromotionsScreen from '@/screens/tabs/PromotionsScreen';
import { HomeIcon, ProfileIcon, HeartIcon, CalendarIcon, SparkleIcon } from '@/icons';
import { Colors } from '@/constants/Colors';

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
  Favorites: undefined;
  Calendar: undefined;
  Promotions: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  
  const getIcon = (routeName: string, isFocused: boolean) => {
    const iconSize = 40;
    const iconColor = isFocused ? Colors.white : Colors.pinDarkBlue;
    const circleColor = Colors.white;
    
    switch (routeName) {
      case 'Home':
        return <HomeIcon size={iconSize} color={iconColor} circleColor={circleColor} />;
      case 'Profile':
        return <ProfileIcon size={iconSize} color={iconColor} circleColor={circleColor} />;
      case 'Favorites':
        return <HeartIcon size={iconSize} color={iconColor} circleColor={circleColor} filled={isFocused} />;
      case 'Calendar':
        return <CalendarIcon size={iconSize} color={iconColor} circleColor={circleColor} />;
      case 'Promotions':
        return <SparkleIcon size={iconSize} color={iconColor} circleColor={circleColor} />;
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/main-footer-bg.png')}
      style={[styles.background, { paddingBottom: insets.bottom }]}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as keyof TabParamList);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {getIcon(route.name, isFocused)}
            </TouchableOpacity>
          );
        })}
      </View>
    </ImageBackground>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Promotions" component={PromotionsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  background: {
    paddingBottom: 0,
    height: 100,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  tab: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabNavigator;

