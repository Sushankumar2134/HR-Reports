import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, View, Alert, TouchableOpacity} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {MaterialCommunityIcons} from '@expo/vector-icons';

import {Button, Text, Input} from '../../components';
import {useTheme} from '../../hooks';
import {createConsent, getSurgeries, SurgeryOption} from '../../api/ConcentAPI';

const PRIMARY_PINK = '#CB0C9F';
const CONSENT_STATUS = ['Select Status', 'Granted', 'Refused', 'Pending'];

const CreateConsent = ({navigation}: any) => {
  const {sizes, colors} = useTheme();

  const [surgeries, setSurgeries] = useState<SurgeryOption[]>([]);
  const [selectedSurgery, setSelectedSurgery] = useState<SurgeryOption | null>(null);
  const [consentStatus, setConsentStatus] = useState('Select Status');
  const [procedureExplained, setProcedureExplained] = useState('');
  const [risksExplained, setRisksExplained] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showSurgeryDropdown, setShowSurgeryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [docsNote, setDocsNote] = useState('No file chosen');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const surgeriesData = await getSurgeries();
      setSurgeries(Array.isArray(surgeriesData) ? surgeriesData : []);
    } catch (error) {
      console.log('Error loading data', error);
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
  };

  const handleSubmit = async () => {
    if (!selectedSurgery) return Alert.alert('Validation', 'Please select surgery');
    if (consentStatus === 'Select Status') return Alert.alert('Validation', 'Please select consent status');

    try {
      await createConsent({
        patientId: '',
        surgeryId: selectedSurgery!.id,
        status: consentStatus,
        procedureExplained,
        risksExplained,
        remarks,
        consentDate: new Date().toISOString().split('T')[0],
        document: document || undefined,
      });

      Alert.alert('Success', 'Consent saved successfully', [{text: 'OK', onPress: () => navigation.goBack()}]);
    } catch (error) {
      console.log('Create consent error', error);
      Alert.alert('Error', 'Failed to save consent');
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
      <Text h4 semibold style={{marginBottom: 18}}>Record Surgery Consent</Text>

      <View style={[styles.card, {backgroundColor: colors.card}]}>
        <Text size={14} semibold color={colors.text}>Surgery</Text>
        <DropdownButton label="Select Surgery" value={selectedSurgery?.name || 'Select Surgery'} onPress={() => setShowSurgeryDropdown(!showSurgeryDropdown)} />
        {showSurgeryDropdown && (
          <View style={[styles.dropdownMenu, {backgroundColor: colors.card, borderColor: colors.focus}]}>
            {surgeries.map(s => (
              <TouchableOpacity key={String(s.id)} style={styles.dropdownItem} onPress={() => {setSelectedSurgery(s); setShowSurgeryDropdown(false);}}>
                <Text size={13} color={colors.text}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Consent Status</Text>
        <DropdownButton label="Select Status" value={consentStatus} onPress={() => setShowStatusDropdown(!showStatusDropdown)} />
        {showStatusDropdown && (
          <View style={[styles.dropdownMenu, {backgroundColor: colors.card, borderColor: colors.focus}]}>
            {CONSENT_STATUS.map((st, i) => (
              <TouchableOpacity key={i} style={styles.dropdownItem} onPress={() => {setConsentStatus(st); setShowStatusDropdown(false);}}>
                <Text size={13} color={colors.text}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Procedure Explained</Text>
        <Input placeholder="Describe the procedure" value={procedureExplained} onChangeText={setProcedureExplained} multiline numberOfLines={4} style={{minHeight: 80, marginTop: 8}} />

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Risks Explained</Text>
        <Input placeholder="Explain risks involved" value={risksExplained} onChangeText={setRisksExplained} multiline numberOfLines={4} style={{minHeight: 80, marginTop: 8}} />

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Remarks</Text>
        <Input placeholder="Additional remarks (optional)" value={remarks} onChangeText={setRemarks} multiline numberOfLines={3} style={{minHeight: 60, marginTop: 8}} />

        <Text size={14} semibold color={colors.text} style={{marginTop: 14}}>Upload Consent Document</Text>
        <TouchableOpacity style={[styles.documentPicker, {borderColor: colors.focus, backgroundColor: colors.card, marginTop: 8}]} onPress={handlePickDocument}>
          <MaterialCommunityIcons name="upload" size={20} color={PRIMARY_PINK} style={{marginRight: 12}} />
          <Text size={14} color={colors.text}>{docsNote}</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, {backgroundColor: PRIMARY_PINK}]} onPress={() => navigation.goBack()}>
            <Text white bold>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, {backgroundColor: PRIMARY_PINK}]} onPress={handleSubmit}>
            <Text white bold>SAVE CONSENT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateConsent;

const styles = StyleSheet.create({
  container: {flex: 1},
  card: {borderRadius: 10, padding: 16},
  dropdownButton: {borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  dropdownMenu: {borderWidth: 1, borderRadius: 8, marginTop: 6, overflow: 'hidden'},
  dropdownItem: {paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee'},
  documentPicker: {borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center'},
  actionRow: {flexDirection: 'row', gap: 12, marginTop: 18},
  actionButton: {flex: 1, borderRadius: 8, paddingVertical: 14, alignItems: 'center'},
});
