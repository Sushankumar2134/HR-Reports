import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {getConcentHistory, ConcentRow, getConcentById} from '../../api/ConcentAPI';
import {useTheme} from '../../hooks';

const PRIMARY_PINK = '#CB0C9F';

const ConcentHistory = ({navigation, route}: any) => {
  const {colors} = useTheme();
  const {patientId} = route.params;
  const [historyData, setHistoryData] = useState<ConcentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getConcentHistory(patientId);
      setHistoryData(data);
    } catch (error) {
      console.log('History fetch error:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item: ConcentRow) => {
    navigation.navigate('ConcentDetails', {consentId: item.id});
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Consent History</Text>

      <View style={styles.tableContainer}>
        <ScrollView horizontal>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.headerCell, styles.indexCell]}>#</Text>
              <Text style={[styles.headerCell, styles.surgeryCell]}>SURGERY</Text>
              <Text style={[styles.headerCell, styles.statusCell]}>STATUS</Text>
              <Text style={[styles.headerCell, styles.dateCell]}>DATE</Text>
              <Text style={[styles.headerCell, styles.actionCell]}>ACTION</Text>
            </View>

            {historyData.length > 0 ? (
              historyData.map((item, index) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.indexCell]}>{index + 1}</Text>
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

                  <TouchableOpacity style={[styles.actionCell, styles.actionButton]} onPress={() => handleView(item)}>
                    <MaterialCommunityIcons name="eye" size={18} color={PRIMARY_PINK} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No History Found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default ConcentHistory;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 15},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 18},
  tableContainer: {backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden'},
  tableHeader: {backgroundColor: '#F3F4F6'},
  tableRow: {flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ECECEC', alignItems: 'center', minHeight: 55},
  headerCell: {fontWeight: '700', fontSize: 12, color: '#333', padding: 12},
  cell: {fontSize: 13, color: '#444', padding: 12},
  indexCell: {width: 60},
  surgeryCell: {width: 140},
  statusCell: {width: 120},
  dateCell: {width: 140},
  actionCell: {width: 100},
  statusWrapper: {justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 12},
  statusText: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, color: '#FFF', fontSize: 12, fontWeight: '600', overflow: 'hidden'},
  granted: {backgroundColor: '#28A745'},
  refused: {backgroundColor: '#DC3545'},
  pending: {backgroundColor: '#FFA500'},
  actionButton: {justifyContent: 'center', alignItems: 'center'},
  noDataContainer: {padding: 30, alignItems: 'center'},
  noDataText: {color: '#777', fontSize: 14},
});
