import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, View, Alert, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import {MaterialCommunityIcons} from '@expo/vector-icons';

import {Button, Text, Input} from '../../components';
import {useTheme} from '../../hooks';
import {createRefund, getPatients, PatientOption, updateRefund,} from '../../api/RefundAPI';

const PRIMARY_PINK = '#CB0C9F';

const REFUND_TYPES = ['Select Refund Type', 'OPD', 'IPD', 'Pharmacy', 'Laboratory', 'Advance', 'Insurance', 'Cancellation'];
const BILL_TYPES = ['Select Bill Type', 'OPD', 'IPD', 'Pharmacy', 'Laboratory'];

const EditRefund = ({navigation, route}: any) => {
  const {sizes, colors} = useTheme();
  const refundData = route?.params?.refund || {};

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [refundType, setRefundType] = useState(refundData.refundType || 'Select Refund Type');
  const [billType, setBillType] = useState(refundData.billType || 'Select Bill Type');
  const [refundAmount, setRefundAmount] = useState(refundData.amount ? String(refundData.amount).replace(/₹|,/g, '') : '');
const [refundReason, setRefundReason] =
  useState(refundData.refundReason || refundData.refund_reason || '');
  const [remarks, setRemarks] = useState(refundData.remarks || '');
  const [billId, setBillId] = useState(refundData.billId || '');
  const [refundDate, setRefundDate] = useState(refundData.date || '');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showRefundDropdown, setShowRefundDropdown] = useState(false);
  const [showBillDropdown, setShowBillDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [document, setDocument] = useState<any>(null);
  const [docsNote, setDocsNote] = useState('No file chosen');

  useEffect(() => {loadPatients();}, []);

  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(Array.isArray(data) ? data : []);
      if (refundData.patient) {
        const found = (Array.isArray(data) ? data : []).find(p => p.name === refundData.patient);
        if (found) setSelectedPatient(found);
      }
    } catch (error) {
      console.log('Error loading patients', error);
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({type: ['image/*', 'application/pdf']});
      if (!res.canceled && (res as any).assets && (res as any).assets.length > 0) {
        const asset = (res as any).assets[0];
        setDocument(asset);
        setDocsNote(asset.name || 'Document selected');
      } else if (!res.canceled && (res as any).name) {
        setDocument(res);
        setDocsNote((res as any).name || 'Document selected');
      }
    } catch (error) {
      console.log('Document picker error', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };const handleSubmit = async () => {

  if (!selectedPatient) {
    return Alert.alert(
      'Validation',
      'Please select patient',
    );
  }

  if (!refundReason.trim()) {
    return Alert.alert(
      'Validation',
      'Refund reason is required',
    );
  }

  try {

    await updateRefund(
      refundData.id,
      {
        patientId: selectedPatient.id,

        refundType,

        billType,

        refundAmount:
          Number(refundAmount),

        refundReason,

        remarks,

        refundDate,

        billId:
          billId || undefined,
      },
    );

    Alert.alert(
      'Success',
      'Refund updated successfully',
      [
        {
          text: 'OK',
          onPress: () =>
            navigation.goBack(),
        },
      ],
    );

  } catch (error: any) {

    console.log(
      'Update refund error',
      error?.response?.data,
    );

    Alert.alert(
      'Error',
      'Failed to update refund',
    );
  }
};
  const DropdownButton = ({label, value, onPress}: {label: string; value: string; onPress: () => void}) => (
    <TouchableOpacity style={[styles.dropdownButton, {borderColor: colors.focus, backgroundColor: colors.card}]} onPress={onPress}>
      <Text size={14} color={value === label ? colors.gray : colors.text}>{value}</Text>
      <MaterialCommunityIcons name="chevron-down" size={20} color={colors.gray} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]} contentContainerStyle={{paddingBottom: sizes.padding * 2}}>
      <Text h4 semibold style={{marginBottom: 18}}>Edit Refund</Text>

      <View style={[styles.card, {backgroundColor: colors.card}]}>
        <Text size={14} semibold color={colors.text}>Patient</Text>
        <DropdownButton label="Select Patient" value={selectedPatient?.name || 'Select Patient'} onPress={() => setShowPatientDropdown(!showPatientDropdown)} />
        {showPatientDropdown && (
          <View style={[styles.dropdownMenu, {backgroundColor: colors.card, borderColor: colors.focus}]}>
            {patients.map(p => (
              <TouchableOpacity key={String(p.id)} style={styles.dropdownItem} onPress={() => {setSelectedPatient(p); setShowPatientDropdown(false);}}>
                <Text size={13} color={colors.text}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Refund Type</Text>
        <DropdownButton label="Select Refund Type" value={refundType} onPress={() => setShowRefundDropdown(!showRefundDropdown)} />
        {showRefundDropdown && (
          <View style={[styles.dropdownMenu, {backgroundColor: colors.card, borderColor: colors.focus}]}>
            {REFUND_TYPES.map((rt, i) => (
              <TouchableOpacity key={i} style={styles.dropdownItem} onPress={() => {setRefundType(rt); setShowRefundDropdown(false);}}>
                <Text size={13} color={colors.text}>{rt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Bill Type</Text>
        <DropdownButton label="Select Bill Type" value={billType} onPress={() => setShowBillDropdown(!showBillDropdown)} />
        {showBillDropdown && (
          <View style={[styles.dropdownMenu, {backgroundColor: colors.card, borderColor: colors.focus}]}>
            {BILL_TYPES.map((bt, i) => (
              <TouchableOpacity key={i} style={styles.dropdownItem} onPress={() => {setBillType(bt); setShowBillDropdown(false);}}>
                <Text size={13} color={colors.text}>{bt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Refund Date</Text>
        <TouchableOpacity style={[styles.dropdownButton, {borderColor: colors.focus, backgroundColor: colors.card}]} onPress={() => setShowDatePicker(true)}>
          <Text size={14} color={refundDate ? colors.text : colors.gray}>{refundDate || 'mm/dd/yyyy'}</Text>
          <MaterialCommunityIcons name="calendar" size={20} color={PRIMARY_PINK} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={(e, selected) => {setShowDatePicker(false); if (selected) { setDate(selected); setRefundDate(`${selected.getMonth()+1}/${selected.getDate()}/${selected.getFullYear()}`); } }} />
        )}

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Refund Amount</Text>
        <Input placeholder="Enter refund amount" value={refundAmount} onChangeText={setRefundAmount} keyboardType="decimal-pad" style={{marginTop: 8}} />

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Bill ID</Text>
        <Input placeholder="Enter bill ID (optional)" value={billId} onChangeText={setBillId} style={{marginTop: 8}} />

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Refund Reason</Text>
        <Input placeholder="Enter refund reason" value={refundReason} onChangeText={setRefundReason} multiline numberOfLines={4} style={{minHeight: 80, marginTop: 8}} />

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Remarks (Optional)</Text>
        <Input placeholder="Enter remarks" value={remarks} onChangeText={setRemarks} multiline numberOfLines={3} style={{minHeight: 60, marginTop: 8}} />

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Supporting Document</Text>
        <TouchableOpacity style={[styles.documentPicker, {borderColor: colors.focus, backgroundColor: colors.card, marginTop: 8}]} onPress={handlePickDocument}>
          <MaterialCommunityIcons name="upload" size={20} color={PRIMARY_PINK} style={{marginRight: 12}} />
          <Text size={14} color={colors.text}>{docsNote}</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton, {backgroundColor: PRIMARY_PINK}]} onPress={() => navigation.goBack()}>
            <Text white bold>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.submitButton, {backgroundColor: PRIMARY_PINK}]} onPress={handleSubmit}>
            <Text white bold>UPDATE REFUND</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default EditRefund;

const styles = StyleSheet.create({
  container: {flex: 1},
  card: {borderRadius: 10, padding: 16},
  dropdownButton: {borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  dropdownMenu: {borderWidth: 1, borderRadius: 8, marginTop: 6, overflow: 'hidden'},
  dropdownItem: {paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee'},
  documentPicker: {borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center'},
  actionRow: {flexDirection: 'row', gap: 12, marginTop: 18},
  actionButton: {flex: 1, borderRadius: 8, paddingVertical: 14, alignItems: 'center'},
  cancelButton: {},
  submitButton: {},
});
