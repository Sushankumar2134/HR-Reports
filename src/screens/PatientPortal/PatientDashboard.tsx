// @ts-nocheck
import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';

import {Text} from '../../components';
import {useTheme} from '../../hooks';
import {getPatientDashboard} from '../../api/patientPortalApi';

const SCREEN_BG = '#e9edf2';
const SURFACE_BG = '#f8fafc';
const BORDER = '#cfd5de';
const PRIMARY_PINK = '#D81B8C';

const PatientDashboard = () => {
  const {sizes, colors} = useTheme();
  const navigation = useNavigation();
  const [summary, setSummary] = useState({
    appointments: 0,
    labReports: 0,
    radiologyReports: 0,
    recentAppointments: [],
    recentLabReports: [],
    recentRadiologyReports: [],
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
     const data = await getPatientDashboard();
      if (isMounted) {
        setSummary(data);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding, paddingBottom: sizes.xl}}>
      <Text h4 semibold style={styles.title}>
        Patient Dashboard
      </Text>

      <View style={styles.topRow}>
        <SummaryCard
          icon="calendar-outline"
          color="#2450f4"
          title="Appointments"
          value={summary.appointments}
          buttonLabel="VIEW ALL"
          onPress={() => navigation.navigate('PatientPortalAppointments' as never)}
        />
        <SummaryCard
          icon="pulse-outline"
          color="#00b966"
          title="Lab Reports"
          value={summary.labReports}
          buttonLabel="VIEW REPORTS"
          onPress={() => navigation.navigate('PatientPortalLabReports' as never)}
        />
        <SummaryCard
          icon="camera-outline"
          color="#ef4444"
          title="Radiology"
          value={summary.radiologyReports}
          buttonLabel="VIEW SCANS"
          onPress={() => navigation.navigate('PatientPortalRadiologyReports' as never)}
        />
      </View>

      <View style={styles.separator} />

      <View style={styles.bottomRow}>
        <View style={styles.recentCard}>
          <Text semibold color={colors.black} style={styles.recentTitle}>
            Recent Appointments
          </Text>
          <View style={styles.recentContent}>
            <Text color="#64748b">
              {summary.recentAppointments.length
                ? `${summary.recentAppointments.length} appointments`
                : 'No appointments'}
            </Text>
          </View>
        </View>

        <View style={styles.recentCard}>
          <Text semibold color={colors.black} style={styles.recentTitle}>
            Recent Lab Reports
          </Text>
          <View style={styles.recentContent}>
            <Text color="#64748b">
              {summary.recentLabReports.length
                ? `${summary.recentLabReports.length} reports`
                : 'No reports'}
            </Text>
          </View>
        </View>

        <View style={styles.recentCard}>
          <Text semibold color={colors.black} style={styles.recentTitle}>
            Recent Radiology Reports
          </Text>
          <View style={styles.recentContent}>
            <Text color="#64748b">
              {summary.recentRadiologyReports.length
                ? `${summary.recentRadiologyReports.length} reports`
                : 'No reports'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const SummaryCard = ({icon, color, title, value, buttonLabel, onPress}: any) => {
  return (
    <View style={styles.summaryCard}>
      <Ionicons name={icon} size={24} color={color} />
      <Text semibold center style={styles.summaryTitle}>
        {title}
      </Text>
      <Text h4 center semibold style={styles.summaryValue}>
        {value}
      </Text>

      <Pressable style={styles.viewButton} onPress={onPress}>
        <Text center semibold color="#ffffff" size={11}>
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  title: {
    color: '#0f2946',
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minHeight: 165,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: SURFACE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  summaryTitle: {
    marginTop: 8,
    marginBottom: 6,
    color: '#0f2946',
  },
  summaryValue: {
    marginBottom: 10,
    color: '#0f2946',
  },
  viewButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: PRIMARY_PINK,
    backgroundColor: PRIMARY_PINK,
    borderRadius: 3,
    paddingVertical: 5,
  },
  separator: {
    borderTopWidth: 1,
    borderColor: '#ced3dc',
    marginVertical: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recentCard: {
    flex: 1,
    minHeight: 155,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    backgroundColor: SURFACE_BG,
  },
  recentTitle: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  recentContent: {
    borderTopWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
});

export default PatientDashboard;
