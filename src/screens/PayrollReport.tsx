import React from 'react';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {Button, Text} from '../components';
import {useTheme} from '../hooks';
import {getPayrollPayslipUrl, getPayrollReport, PayrollRow} from '../api/hrReportApi';

const PayrollReport = () => {
  const {sizes} = useTheme();

  const [payrollRows, setPayrollRows] = React.useState<PayrollRow[]>([]);

  React.useEffect(() => {
    let isMounted = true;

    const loadPayroll = async () => {
      const rows = await getPayrollReport();
      if (isMounted) {
        setPayrollRows(rows);
      }
    };

    loadPayroll();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDownload = async (row: PayrollRow) => {
    try {
      const payslipUrl = getPayrollPayslipUrl(row.id ?? row.employeeId);
      const fileName = `Payslip_${row.employeeId}_${new Date().toISOString().split('T')[0]}.pdf`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const downloaded = await FileSystem.downloadAsync(payslipUrl, fileUri);
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(downloaded.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share payslip for ${row.employeeId}`,
        });
      } else {
        Alert.alert('Success', `Payslip for ${row.employeeId} downloaded`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download payslip');
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding}}>
      <Text h4 semibold style={styles.title}>
        Payroll Summary Report
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <TableHeader title="Emp ID" width={95} />
            <TableHeader title="Name" width={110} />
            <TableHeader title="Department" width={110} />
            <TableHeader title="Basic" width={62} />
            <TableHeader title="Allowances" width={108} />
            <TableHeader title="Deductions" width={104} />
            <TableHeader title="Gross" width={64} />
            <TableHeader title="Net" width={50} />
            <TableHeader title="PF" width={40} />
            <TableHeader title="ESI" width={40} />
            <TableHeader title="Tax" width={50} />
            <TableHeader title="Status" width={96} />
            <TableHeader title="Payslip" width={120} />
          </View>

          {payrollRows.map((row) => (
            <View key={String(row.id ?? row.employeeId)} style={styles.tableRow}>
              <TableCell title={row.employeeId} width={95} />
              <TableCell title={row.name} width={110} />
              <TableCell title={row.department} width={110} />
              <TableCell title={String(row.basic)} width={62} />
              <TableCell title={String(row.allowances)} width={108} />
              <TableCell title={String(row.deductions)} width={104} />
              <TableCell title={String(row.gross)} width={64} />
              <TableCell title={String(row.net)} width={50} />
              <TableCell title={String(row.pf)} width={40} />
              <TableCell title={String(row.esi)} width={40} />
              <TableCell title={String(row.tax)} width={50} />
              <View style={[styles.tableCell, {width: 96}]}>
                <View style={styles.statusBadge}>
                  <Text semibold size={11} color="#ffffff">
                    {row.status}
                  </Text>
                </View>
              </View>
              <View style={[styles.tableCell, {width: 120}]}>
                <Button
                  color="#D81B8C"
                  shadow={false}
                  style={styles.downloadButton}
                  onPress={() => handleDownload(row)}>
                  <Text size={11} semibold color="#ffffff">
                    DOWNLOAD
                  </Text>
                </Button>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const TableHeader = ({title, width}: {title: string; width: number}) => (
  <View style={[styles.tableCell, styles.tableHeaderCell, {width}]}>
    <Text semibold color="#334155" size={12}>
      {title}
    </Text>
  </View>
);

const TableCell = ({title, width}: {title: string; width: number}) => (
  <View style={[styles.tableCell, {width}]}>
    <Text color="#334155" size={12}>
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e9edf2',
  },
  title: {
    color: '#0f2946',
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#e6eaef',
  },
  tableCell: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#cfd5de',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#f2f5f8',
  },
  tableHeaderCell: {
    backgroundColor: '#e6eaef',
  },
  statusBadge: {
    backgroundColor: '#16a34a',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  downloadButton: {
    minHeight: 28,
    minWidth: 90,
    borderRadius: 3,
    paddingHorizontal: 8,
  },
});

export default PayrollReport;
