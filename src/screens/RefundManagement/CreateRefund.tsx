//import React, {useState, useEffect} from 'react';
import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import {MaterialCommunityIcons} from '@expo/vector-icons';

import {Button, Text, Input} from '../../components';
import {useTheme} from '../../hooks';
import {createRefund, getPatients, PatientOption} from '../../api/RefundAPI';

const PRIMARY_PINK = '#CB0C9F';

const REFUND_TYPES = [
  'Select Refund Type',
  'OPD',
  'IPD',
  'Pharmacy',
  'Laboratory',
  'Advance',
  'Insurance',
  'Cancellation',
];

const BILL_TYPES = [
  'Select Bill Type',
  'OPD',
  'IPD',
  'Pharmacy',
  'Laboratory',
];

const CreateRefund = ({navigation}: any) => {
  const {sizes, colors} = useTheme();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [refundType, setRefundType] = useState('Select Refund Type');
  const [billType, setBillType] = useState('Select Bill Type');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [billId, setBillId] = useState('');
  const [refundDate, setRefundDate] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showRefundDropdown, setShowRefundDropdown] = useState(false);
  const [showBillDropdown, setShowBillDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [document, setDocument] = useState<any>(null);

          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() =>
              setShowBillDropdown(
                !showBillDropdown,
              )
            }>
            <View>
              <></>
            </View>

            <MaterialCommunityIcons
              name="chevron-down"
              size={22}
              color="#777"
            />
          </TouchableOpacity>

          {showBillDropdown && (
            <View style={styles.dropdownMenu}>
              {BILL_TYPES.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setBillType(item);
                    setShowBillDropdown(false);
                  }}>
                  <View>
                    <></>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* DATE PICKER */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDatePicker(true)}>
            <View>
              <></>
            </View>

            <MaterialCommunityIcons
              name="calendar"
              size={22}
              color={PRIMARY_PINK}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(
                event,
                selectedDate,
              ) => {
                setShowDatePicker(false);

                if (selectedDate) {
                  setDate(selectedDate);

                  const formattedDate =
                    `${selectedDate.getDate()}/` +
                    `${selectedDate.getMonth() + 1}/` +
                    `${selectedDate.getFullYear()}`;

                  setRefundDate(formattedDate);
                }
              }}
            />
          )}
        </View>

        {/* REFUND AMOUNT */}
        <View style={styles.section}>
          <View style={styles.input}>
            <></>
          </View>
        </View>

        {/* BILL ID */}
        <View style={styles.section}>
          <View style={styles.input}>
            <></>
          </View>
        </View>

        {/* REFUND REASON */}
        <View style={styles.section}>
          <View
            style={[
              styles.input,
              {
                minHeight: 100,
              },
            ]}>
            <></>
          </View>
        </View>

        {/* REMARKS */}
        <View style={styles.section}>
          <View
            style={[
              styles.input,
              {
                minHeight: 80,
              },
            ]}>
            <></>
          </View>
        </View>

        {/* DOCUMENT PICKER */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.documentPicker}
            onPress={handlePickDocument}>
            <MaterialCommunityIcons
              name="upload"
              size={22}
              color={PRIMARY_PINK}
              style={{
                marginRight: 10,
              }}
            />

            <View>
              <></>
            </View>
          </TouchableOpacity>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}>
          <View>
            <></>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateRefund;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 15,
  },

  header: {
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    elevation: 2,
  },

  section: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },

  dropdownButton: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },

  dropdownText: {
    fontSize: 14,
    color: '#333',
  },

  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },

  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFF',
  },

  documentPicker: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },

  documentText: {
    fontSize: 14,
    color: '#555',
  },

  submitButton: {
    backgroundColor: PRIMARY_PINK,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  submitText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});