import React, {useEffect, useMemo, useState,useCallback} from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {Button, Text} from '../../components';
import {useTheme} from '../../hooks';
import {BillingRow, deleteBilling, getBillingList} from '../../api/billing';
import {useFocusEffect} from '@react-navigation/native';

const PRIMARY_PINK = '#CB0C9F';

const BillingList = ({navigation}: any) => {
  const {sizes, colors} = useTheme();
  const [billingRows, setBillingRows] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState<BillingRow | null>(null);

  useFocusEffect(
  useCallback(() => {
    loadBillingList();
  }, [])
);
  const loadBillingList = async () => {
    try {
      setLoading(true);
      const data = await getBillingList();
      setBillingRows(data);
    } catch (error) {
      console.log('Error loading billing list:', error);
      Alert.alert('Error', 'Failed to load billing records');
    } finally {
      setLoading(false);
    }
  };


  const handleOpenDetails = (row: BillingRow) => {
    setSelectedBilling(row);
  };

  const handlePrintOrDownload = async (row: BillingRow) => {
    try {
      const receiptNo = row.receiptNo || '-';
      const status = row.status || 'Paid';
      const paymentMode = row.mode || '-';
      const patientName = row.patient || '-';
      const patientCode = row.patientCode || row.patientId || '-';
      const mobile = row.mobile || '-';
      const service = row.service || 'Consultation Fee';
      const consultationFee = Number(row.consultationFee ?? row.amount ?? 0).toFixed(2);
      const total = Number(row.total ?? row.amount ?? 0).toFixed(2);
      const collectedBy = row.collectedBy || 'Super Admin';

      const receiptText = [
        'Billing Details',
        `Receipt No: ${receiptNo}`,
        `Date: ${row.date || '-'}`,
        `Status: ${status}`,
        `Payment Mode: ${paymentMode}`,
        '',
        'Patient Details',
        `Name: ${patientName}`,
        `Patient Code: ${patientCode}`,
        `Mobile: ${mobile}`,
        '',
        'Billing Details',
        'Service | Amount (₹)',
        `${service} | ${consultationFee}`,
        `TOTAL | ${total}`,
        '',
        'Payment collected by Receptionist',
        `Collected By: ${collectedBy}`,
      ].join('\n');

      const fileName = `Billing_${receiptNo}.pdf`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, receiptText);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: `Billing ${receiptNo}`,
        });
      } else {
        Alert.alert('Success', 'Billing PDF prepared successfully');
      }
    } catch (error) {
      console.log('Error generating billing PDF:', error);
      Alert.alert('Error', 'Failed to generate billing receipt');
    }
  };

  const billingDetails = useMemo(() => {
    if (!selectedBilling) {
      return null;
    }

    return {
      receiptNo: selectedBilling.receiptNo || '-',
      date: selectedBilling.date || '-',
      status: selectedBilling.status || 'Paid',
      paymentMode: selectedBilling.mode || '-',
      patientName: selectedBilling.patient || '-',
      patientCode: selectedBilling.patientCode || selectedBilling.patientId || '-',
      mobile: selectedBilling.mobile || '-',
      service: selectedBilling.service || 'Consultation Fee',
      amount: Number(selectedBilling.consultationFee ?? selectedBilling.amount ?? 0),
      total: Number(selectedBilling.total ?? selectedBilling.amount ?? 0),
      collectedBy: selectedBilling.collectedBy || 'Super Admin',
    };
  }, [selectedBilling]);

  const TableHeader = ({title, width}: {title: string; width: number}) => (
    <View style={[styles.cell, {width}]}> 
      <Text size={12} semibold color={colors.text}>
        {title}
      </Text>
    </View>
  );

  const TableCell = ({
    content,
    width,
  }: {
    content: string | React.ReactNode;
    width: number;
  }) => (
    <View style={[styles.cell, {width}]}> 
      <Text size={11} color={colors.text}>
        {content}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{padding: sizes.padding}}>
      <View style={styles.headerContainer}>
        <Text h4 semibold style={styles.title}>
          Billing List
        </Text>
        <Button
          primary
          onPress={() => navigation.navigate('BillingEntry')}
          style={styles.addButton}>
          <Text white semibold size={12}>
            + ADD BILLING
          </Text>
        </Button>
      </View>

      {loading ? (
        <Text center gray>
          Loading...
        </Text>
      ) : billingRows.length === 0 ? (
        <Text center gray style={{marginTop: sizes.padding}}>
          No billing records found
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <TableHeader title="Receipt No" width={95} />
              <TableHeader title="Patient" width={130} />
              <TableHeader title="Amount" width={80} />
              <TableHeader title="Mode" width={90} />
              <TableHeader title="Date" width={100} />
              <TableHeader title="Action" width={92} />
            </View>

            {billingRows.map(row => (
              <View key={String(row.id)} style={styles.tableRow}>
                <TableCell content={row.receiptNo} width={95} />
                <TableCell content={row.patient} width={130} />
                <TableCell content={`₹${row.amount}`} width={80} />
                <TableCell content={row.mode} width={90} />
                <TableCell content={row.date} width={100} />
                <View style={[styles.cell, styles.actionCell, {width: 92}]}> 
                  <TouchableOpacity
                    onPress={() => handleOpenDetails(row)}
                    style={styles.actionIconButton}>
                    <MaterialCommunityIcons
                      name="eye-outline"
                      size={20}
                      color={PRIMARY_PINK}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handlePrintOrDownload(row)}
                    style={styles.actionIconButton}>
                    <MaterialCommunityIcons
                      name="download-outline"
                      size={20}
                      color={PRIMARY_PINK}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={Boolean(selectedBilling)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBilling(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text h4 semibold style={styles.modalTitle}>
                Billing Details
              </Text>
              <View style={styles.modalHeaderActions}>
                <Button
                  primary
                  onPress={() => setSelectedBilling(null)}
                  style={styles.modalActionButton}>
                  <Text white semibold size={12}>
                    ← BACK
                  </Text>
                </Button>
                <Button
                  primary
                  onPress={() => selectedBilling && handlePrintOrDownload(selectedBilling)}
                  style={styles.modalActionButton}>
                  <Text white semibold size={12}>
                    PRINT
                  </Text>
                </Button>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                <View style={styles.summaryRow}>
                  <DetailPill label="Receipt No" value={billingDetails?.receiptNo || '-'} />
                  <DetailPill label="Date" value={billingDetails?.date || '-'} />
                  <DetailPill label="Status" value={billingDetails?.status || '-'} highlight />
                  <DetailPill label="Payment Mode" value={billingDetails?.paymentMode || '-'} />
                </View>

                <View style={styles.sectionDivider} />

                <Text semibold style={styles.sectionTitle}>
                  Patient Details
                </Text>
                <View style={styles.patientGrid}>
                  <DetailField label="Name" value={billingDetails?.patientName || '-'} />
                  <DetailField label="Patient Code" value={billingDetails?.patientCode || '-'} />
                  <DetailField label="Mobile" value={billingDetails?.mobile || '-'} />
                </View>

                <View style={styles.sectionDivider} />

                <Text semibold style={styles.sectionTitle}>
                  Billing Details
                </Text>

                <View style={styles.detailTable}>
                  <View style={[styles.detailTableRow, styles.detailTableHeader]}>
                    <Text size={11} semibold>
                      SERVICE
                    </Text>
                    <Text size={11} semibold>
                      AMOUNT (₹)
                    </Text>
                  </View>
                  <View style={styles.detailTableRow}>
                    <Text size={12}>{billingDetails?.service || 'Consultation Fee'}</Text>
                    <Text size={12}>{Number(billingDetails?.amount ?? 0).toFixed(2)}</Text>
                  </View>
                  <View style={[styles.detailTableRow, styles.totalRow]}>
                    <Text size={12} semibold>
                      TOTAL
                    </Text>
                    <Text size={12} semibold color={colors.success}>
                      ₹{Number(billingDetails?.total ?? 0).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.footerRow}>
                  <Text size={12} color={colors.secondary}>
                    Payment collected by Receptionist
                  </Text>
                  <Text size={12} semibold color={colors.text}>
                    Collected By: {billingDetails?.collectedBy || 'Super Admin'}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const DetailPill = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => {
  const {colors} = useTheme();

  return (
    <View style={styles.detailPill}>
      <Text size={11} color={colors.secondary}>
        {label}
      </Text>
      <View
        style={[
          styles.detailPillValue,
          highlight ? styles.detailPillHighlight : null,
        ]}>
        <Text size={12} semibold color={highlight ? colors.white : colors.text}>
          {value}
        </Text>
      </View>
    </View>
  );
};

const DetailField = ({label, value}: {label: string; value: string}) => {
  const {colors} = useTheme();

  return (
    <View style={styles.detailField}>
      <Text size={12} semibold color={colors.secondary}>
        {label}
      </Text>
      <Text size={13} color={colors.text}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    flex: 1,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 2,
  },
  cell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  actionCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionIconButton: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 12,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    flex: 1,
    color: PRIMARY_PINK,
    marginRight: 12,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalActionButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalContent: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailPill: {
    width: '48%',
    marginBottom: 8,
  },
  detailPillValue: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  detailPillHighlight: {
    backgroundColor: PRIMARY_PINK,
    borderColor: PRIMARY_PINK,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#4B5563',
  },
  patientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailField: {
    width: '48%',
    marginBottom: 8,
  },
  detailTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  detailTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailTableHeader: {
    backgroundColor: '#F9FAFB',
  },
  totalRow: {
    borderBottomWidth: 0,
  },
  footerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
});

export default BillingList;
