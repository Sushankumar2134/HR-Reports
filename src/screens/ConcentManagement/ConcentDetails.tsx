import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert} from 'react-native';
import {useTheme} from '../../hooks';
import {getConcentById, ConcentDetail} from '../../api/ConcentAPI';

const PRIMARY_PINK = '#CB0C9F';

const ConcentDetails = ({navigation, route}: any) => {
  const {colors} = useTheme();
  const {consentId} = route.params;
  const [consentDetail, setConsentDetail] = useState<ConcentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsentDetail();
  }, []);

  const loadConsentDetail = async () => {
    try {
      setLoading(true);
      const data = await getConcentById(consentId);
      setConsentDetail(data);
    } catch (error) {
      console.log('Error loading consent detail:', error);
      Alert.alert('Error', 'Failed to load consent details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={{color: colors.text}}>Loading...</Text>
      </View>
    );
  }

  if (!consentDetail) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={{color: colors.text}}>No data found</Text>
        <TouchableOpacity style={[styles.backButton, {backgroundColor: PRIMARY_PINK}]} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.text}]}>Consent Details</Text>

      <View style={[styles.card, {backgroundColor: colors.card}]}>
        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: colors.text}]}>Patient</Text>
          <Text style={[styles.value, {color: colors.text}]}>{consentDetail.patient}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: colors.text}]}>Surgery</Text>
          <Text style={[styles.value, {color: colors.text}]}>{consentDetail.surgery}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: colors.text}]}>Consent Status</Text>
          <Text style={[styles.value, {color: colors.text}]}>{consentDetail.status}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: colors.text}]}>Procedure Explained</Text>
          <Text style={[styles.valueMulti, {color: colors.text}]}>{consentDetail.procedureExplained || 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: colors.text}]}>Risks Explained</Text>
          <Text style={[styles.valueMulti, {color: colors.text}]}>{consentDetail.risksExplained || 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: colors.text}]}>Remarks</Text>
          <Text style={[styles.valueMulti, {color: colors.text}]}>{consentDetail.remarks || 'N/A'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: colors.text}]}>Consent Date</Text>
          <Text style={[styles.value, {color: colors.text}]}>{consentDetail.consentDate}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={[styles.label, {color: colors.text}]}>Document</Text>
          <Text style={[styles.value, {color: colors.text}]}>{consentDetail.document ? 'Document Uploaded' : 'No Document'}</Text>
        </View>

        <TouchableOpacity style={[styles.backButton, {backgroundColor: PRIMARY_PINK}]} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ConcentDetails;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 15},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 18},
  card: {borderRadius: 10, padding: 16, marginBottom: 20},
  detailRow: {paddingVertical: 12},
  label: {fontSize: 14, fontWeight: '600', marginBottom: 6},
  value: {fontSize: 14, fontWeight: '400'},
  valueMulti: {fontSize: 14, fontWeight: '400', lineHeight: 20},
  divider: {height: 1, backgroundColor: '#eee', marginVertical: 8},
  backButton: {borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 18},
  backText: {color: '#FFFFFF', fontWeight: '700', fontSize: 14},
});
