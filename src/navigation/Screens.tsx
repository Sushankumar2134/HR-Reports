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
  BillingList,
  BillingEntry,
  RefundList,
  CreateRefund,
  EditRefund,
  EmergencyRecords,
  // EMR access module is registered directly from the new screen file.
  PatientPortalDashboard,
  PatientPortalAppointments,
  PatientPortalLabReports,
  PatientPortalRadiologyReports,
} from '../screens';
import DischargeSummaryList from '../screens/EMRAccess/DischargeSummaryList';
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

      <Stack.Screen
        name="BillingList"
        component={BillingList}
        options={{title: 'Billing', headerShown: false}}
      />

      <Stack.Screen
        name="BillingEntry"
        component={BillingEntry}
        options={{title: 'Add Billing', headerShown: false}}
      />

      <Stack.Screen
        name="RefundList"
        component={RefundList}
        options={{title: 'Refund Management', headerShown: false}}
      />

      <Stack.Screen
        name="CreateRefund"
        component={CreateRefund}
        options={{title: 'Create Refund', headerShown: false}}
      />

      <Stack.Screen
        name="EditRefund"
        component={EditRefund}
        options={{title: 'Edit Refund', headerShown: false}}
      />
      
      <Stack.Screen
        name="EmergencyRecords"
        component={EmergencyRecords}
        options={{title: 'Emergency Records', headerShown: false}}
      />

      <Stack.Screen
        name="EMRAccess"
        component={DischargeSummaryList}
        options={{title: 'Discharge Summary List', headerShown: false}}
      />

      <Stack.Screen
        name="PatientPortalDashboard"
        component={PatientPortalDashboard}
        options={{title: 'Patient Dashboard', headerShown: false}}
      />

      <Stack.Screen
        name="PatientPortalAppointments"
        component={PatientPortalAppointments}
        options={{title: 'Appointments', headerShown: false}}
      />

      <Stack.Screen
        name="PatientPortalLabReports"
        component={PatientPortalLabReports}
        options={{title: 'Lab Reports', headerShown: false}}
      />

      <Stack.Screen
        name="PatientPortalRadiologyReports"
        component={PatientPortalRadiologyReports}
        options={{title: 'Radiology Reports', headerShown: false}}
      />

    </Stack.Navigator>
  );
};

