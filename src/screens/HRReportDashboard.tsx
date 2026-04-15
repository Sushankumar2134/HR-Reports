// @ts-nocheck
import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';

import {Text} from '../components';
import {useTheme} from '../hooks';
import {getHRDashboardSummary} from '../api/hrReportApi';

type ReportSection =
  | 'staff'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'overtime'
  | 'departmentSalary';

const BORDER_COLOR = '#cfd5de';
const SURFACE_COLOR = '#f8fafc';
const SCREEN_BG = '#e9edf2';

const HRReportDashboard = () => {
  const navigation = useNavigation();
  const {colors, sizes} = useTheme();
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalReports: 6,
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboardSummary = async () => {
      const data = await getHRDashboardSummary();
      if (isMounted) {
        setSummary(data);
      }
    };

    loadDashboardSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const screenMapping: Record<ReportSection, string> = {
    staff: 'StaffStrengthReport',
    attendance: 'AttendanceReport',
    leave: 'LeaveReport',
    payroll: 'PayrollReport',
    overtime: 'OvertimeReport',
    departmentSalary: 'DepartmentSalaryReport',
  };

  const reportButtons: {
    key: ReportSection;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {key: 'staff', label: 'Staff Strength', icon: 'people-outline'},
    {key: 'attendance', label: 'Attendance', icon: 'calendar-outline'},
    {key: 'leave', label: 'Leave Report', icon: 'document-text-outline'},
    {key: 'payroll', label: 'Payroll', icon: 'cash-outline'},
    {key: 'overtime', label: 'Overtime', icon: 'time-outline'},
    {
      key: 'departmentSalary',
      label: 'Department Salary',
      icon: 'pie-chart-outline',
    },
  ];

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: SCREEN_BG}}
      contentContainerStyle={{paddingBottom: sizes.xl + sizes.l}}>
      <View style={styles.wrapper}>
        <Text h4 semibold color={colors.black} marginBottom={sizes.sm}>
          HR Reports Dashboard
        </Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryBlue]}>
            <Text semibold center color={colors.black}>
              Total Employees
            </Text>
            <Text h3 center semibold color={colors.black}>
              {summary.totalEmployees}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryGreen]}>
            <Text semibold center color={colors.black}>
              Total Reports
            </Text>
            <Text h3 center semibold color={colors.black}>
              {summary.totalReports}
            </Text>
          </View>
        </View>

        <View style={styles.reportsGrid}>
          {reportButtons.map((item) => {
            return (
              <Pressable
                key={item.key}
                style={styles.reportButton}
                onPress={() => navigation.navigate(screenMapping[item.key] as never)}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={colors.black}
                />
                <Text
                  semibold
                  color={colors.black}
                  style={{marginTop: 6}}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default HRReportDashboard;

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    minHeight: 92,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d4dbe5',
  },
  summaryBlue: {
    backgroundColor: '#34b3ff',
  },
  summaryGreen: {
    backgroundColor: '#42df98',
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  reportButton: {
    width: '31%',
    backgroundColor: SURFACE_COLOR,
    borderRadius: 10,
    minHeight: 78,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
