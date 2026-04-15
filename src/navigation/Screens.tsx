import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  Articles,
  Components,
  Home,
  Profile,
  Register,
  Pro,
  HRReportDashboard,
  StaffStrengthReport,
  AttendanceReport,
  LeaveReport,
  PayrollReport,
  OvertimeReport,
  DepartmentSalaryReport,
} from '../screens';
import {useScreenOptions, useTranslation} from '../hooks';

const Stack = createStackNavigator();

export default () => {
  const {t} = useTranslation();
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions.stack}>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{title: t('navigation.home')}}
      />

      <Stack.Screen
        name="Components"
        component={Components}
        options={screenOptions.components}
      />

      <Stack.Screen
        name="Articles"
        component={Articles}
        options={{title: t('navigation.articles')}}
      />

      <Stack.Screen name="Pro" component={Pro} options={screenOptions.pro} />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="HRReportDashboard"
        component={HRReportDashboard}
        options={{title: 'HR Reports Dashboard', headerShown: false}}
      />

      <Stack.Screen
        name="StaffStrengthReport"
        component={StaffStrengthReport}
        options={{title: 'Staff Strength', headerShown: false}}
      />

      <Stack.Screen
        name="AttendanceReport"
        component={AttendanceReport}
        options={{title: 'Attendance', headerShown: false}}
      />

      <Stack.Screen
        name="LeaveReport"
        component={LeaveReport}
        options={{title: 'Leave Report', headerShown: false}}
      />

      <Stack.Screen
        name="PayrollReport"
        component={PayrollReport}
        options={{title: 'Payroll', headerShown: false}}
      />

      <Stack.Screen
        name="OvertimeReport"
        component={OvertimeReport}
        options={{title: 'Overtime', headerShown: false}}
      />

      <Stack.Screen
        name="DepartmentSalaryReport"
        component={DepartmentSalaryReport}
        options={{title: 'Department Salary', headerShown: false}}
      />

    </Stack.Navigator>
  );
};

