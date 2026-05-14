import React, {
  useEffect,
  useState,
} from 'react';

import instance from '../../api/axios';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Text} from '../../components';



const UsageMonitoring = () => {

  const [usageRows, setUsageRows] =
    useState<any[]>([]);

  useEffect(() => {

    loadUsage();

  }, []);

  const loadUsage = async () => {

    try {

      const response = await instance.get(
        '/usage-trackers'
      );

      console.log(
        'USAGE API:',
        response.data,
      );

      setUsageRows(response.data);

    } catch (error) {

      console.log(
        'USAGE FETCH ERROR:',
        error,
      );
    }
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text h4 semibold style={styles.title}>
        Usage Monitoring
      </Text>
      <Text style={styles.subtitle}>Monitor organization resource usage</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tableScroll}
      >
        <View style={styles.tableWrapper}>
          <View style={[styles.row, styles.header]}>
          <View style={styles.indexCell}>
            <Text semibold style={styles.cell}>
              #
            </Text>
          </View>
          <View style={styles.organizationCell}>
            <Text semibold style={styles.cell}>
              Organization
            </Text>
          </View>
          <View style={styles.planCell}>
            <Text semibold style={styles.cell}>
              Plan
            </Text>
          </View>
          <View style={styles.usageCell}>
            <Text semibold style={styles.cell}>
              Users
            </Text>
          </View>
          <View style={styles.usageCell}>
            <Text semibold style={styles.cell}>
              Patients
            </Text>
          </View>
          <View style={styles.usageCell}>
            <Text semibold style={styles.cell}>
              Hospitals
            </Text>
          </View>
          <View style={styles.statusCell}>
            <Text semibold style={styles.cell}>
              Status
            </Text>
          </View>
        </View>

          {usageRows.map((row, index) => (
            <View key={row.id} style={styles.row}>
            <View style={styles.indexCell}>
              <Text style={styles.cell}>{index + 1}</Text>
            </View>
            <View style={styles.organizationCell}>
              <Text style={styles.cell}>{row.organization}</Text>
            </View>
            <View style={styles.planCell}>
              <Text style={styles.cell}>{row.plan}</Text>
            </View>
            <View style={styles.usageCell}>
              <Text style={{...styles.cell, ...styles.successText}}>{row.users}</Text>
            </View>
            <View style={styles.usageCell}>
              <Text style={{...styles.cell, ...styles.successText}}>{row.patients}</Text>
            </View>
            <View style={styles.usageCell}>
              <Text style={{...styles.cell, ...styles.warningText}}>{row.hospitals}</Text>
            </View>
            <View style={styles.statusCell}>
              <Text style={{...styles.cell, ...styles.activeBadge}}>{row.status}</Text>
            </View>
          </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

export default UsageMonitoring;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#1C2746',
  },
  subtitle: {
    color: '#667085',
    marginTop: 4,
    marginBottom: 16,
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F7',
  },
  header: {
    backgroundColor: '#F8FAFC',
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#334155',
  },
  indexCell: {
    width: 52,
  },
  organizationCell: {
    width: 220,
  },
  planCell: {
    width: 140,
  },
  usageCell: {
    width: 160,
  },
  statusCell: {
    width: 110,
  },
  tableScroll: {
    // allow horizontal scrolling of the table on small screens
    paddingVertical: 0,
  },
  successText: {
    color: '#12B76A',
  },
  warningText: {
    color: '#155EEF',
  },
  activeBadge: {
    color: '#12B76A',
    fontWeight: '700',
  },
});
