import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {getConcentList, ConcentRow, deleteConsent} from '../../api/ConcentAPI';

const PRIMARY_PINK = '#CB0C9F';

const ConcentList = ({navigation}: any) => {
  const [consentData, setConsentData] = useState<ConcentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

  const unsubscribe = navigation.addListener('focus', () => {
    loadConsents();
  });

  return unsubscribe;

}, [navigation]);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const data = await getConcentList();
      setConsentData(data);
    } catch (error) {
      console.log('Consent fetch error:', error);
      Alert.alert('Error', 'Failed to load consents');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item: ConcentRow) => {
    navigation.navigate('ConcentDetails', {consentId: item.id});
  };

  const handleHistory = (item: ConcentRow) => {
    navigation.navigate('ConcentHistory', {patientId: item.patientId});
  };

  const handleDelete = (item: ConcentRow) => {
    Alert.alert('Delete Consent', `Delete consent for ${item.patient}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteConsent(item.id);
            loadConsents();
            Alert.alert('Success', 'Consent deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete consent');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Surgery Consent</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateConsent')}>
          <Text style={styles.buttonText}>+ ADD CONSENT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableContainer}>
        <ScrollView horizontal>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.headerCell, styles.indexCell]}>#</Text>
              <Text style={[styles.headerCell, styles.patientCell]}>PATIENT</Text>
              <Text style={[styles.headerCell, styles.surgeryCell]}>SURGERY</Text>
              <Text style={[styles.headerCell, styles.statusCell]}>STATUS</Text>
              <Text style={[styles.headerCell, styles.dateCell]}>CONSENT DATE</Text>
              <Text style={[styles.headerCell, styles.actionCell]}>ACTION</Text>
            </View>

            {consentData.length > 0 ? (
              consentData.map((item, index) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.indexCell]}>{index + 1}</Text>
                  <Text style={[styles.cell, styles.patientCell]}>{item.patient}</Text>
                  <Text style={[styles.cell, styles.surgeryCell]}>{item.surgery}</Text>

                  <View style={[styles.statusCell, styles.statusWrapper]}>
                    <Text
                      style={[
                        styles.statusText,
                        item.status === 'Granted'
                          ? styles.granted
                          : item.status === 'Refused'
                          ? styles.refused
                          : styles.pending,
                      ]}>
                      {item.status}
                    </Text>
                  </View>

                  <Text style={[styles.cell, styles.dateCell]}>{item.consentDate}</Text>

                  <View style={[styles.actionCell, styles.actionRow]}>
                    <TouchableOpacity onPress={() => handleView(item)} style={styles.iconButton}>
                      <MaterialCommunityIcons name="eye" size={18} color={PRIMARY_PINK} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleHistory(item)} style={styles.iconButton}>
                      <MaterialCommunityIcons name="history" size={18} color={PRIMARY_PINK} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconButton}>
                      <MaterialCommunityIcons name="trash-can" size={18} color={PRIMARY_PINK} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No Consents Found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default ConcentList;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F6FA', padding: 15},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20},
  title: {fontSize: 22, fontWeight: '700', color: '#1A1A1A'},
  createButton: {backgroundColor: PRIMARY_PINK, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 6, elevation: 3},
  buttonText: {color: '#FFFFFF', fontWeight: '700', fontSize: 13},
  tableContainer: {backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden'},
  tableHeader: {backgroundColor: '#F3F4F6'},
  tableRow: {flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ECECEC', alignItems: 'center', minHeight: 55},
  headerCell: {fontWeight: '700', fontSize: 12, color: '#333', padding: 12},
  cell: {fontSize: 13, color: '#444', padding: 12},
  indexCell: {width: 60},
  patientCell: {width: 140},
  surgeryCell: {width: 140},
  statusCell: {width: 120},
  dateCell: {width: 140},
  actionCell: {width: 140},
  statusWrapper: {justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 12},
  statusText: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, color: '#FFF', fontSize: 12, fontWeight: '600', overflow: 'hidden'},
  granted: {backgroundColor: '#28A745'},
  refused: {backgroundColor: '#DC3545'},
  pending: {backgroundColor: '#FFA500'},
  actionRow: {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 8},
  iconButton: {padding: 6},
  noDataContainer: {padding: 30, alignItems: 'center'},
  noDataText: {color: '#777', fontSize: 14},
});
