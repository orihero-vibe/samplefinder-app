import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '@/screens/tabs/calendar/CalendarScreen';
import { BrandDetailsScreen, BrandDetailsData } from '@/screens/brand-details';

export type CalendarStackParamList = {
  CalendarMain: undefined;
  BrandDetails: { eventId: string } | { brand: BrandDetailsData };
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

const CalendarStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      <Stack.Screen name="BrandDetails" component={BrandDetailsScreen} />
    </Stack.Navigator>
  );
};

export default CalendarStack;

