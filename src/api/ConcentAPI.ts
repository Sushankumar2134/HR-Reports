import api from './axios';

export interface PatientOption {
  id: number | string;
  name: string;
}

export interface SurgeryOption {
  id: number | string;
  name: string;
}

export interface ConcentRow {
  id: number | string;
  patient: string;
  patientId: number | string;
  surgery: string;
  surgeryId: number | string;
  status: 'Granted' | 'Refused' | 'Pending';
  consentDate: string;
}

export interface ConcentDetail extends ConcentRow {
  procedureExplained: string;
  risksExplained: string;
  remarks: string;
  document?: string;
}

export const getConcentList = async (): Promise<ConcentRow[]> => {
  try {
    const response = await api.get('/consents');

    const data = response.data.data || [];

    return data.map((item: any) => ({
      id: item.id,

    patient:
  `${item.patient?.first_name || ''} ${item.patient?.last_name || ''}`.trim() || 'N/A',

      patientId: item.patient_id,

      surgery:
        item.surgery?.surgery_type ||
        item.surgery?.name ||
        'N/A',

      surgeryId: item.surgery_id,

      status:
        item.consent_status || 'Pending',

      consentDate:
        item.consent_taken_at || '',
    }));

  } catch (error) {

    console.log('Error fetching consent list:', error);

    return [];
  }
};

// Get consent details
export const getConcentById = async (id: number | string): Promise<ConcentDetail | null> => {
  try {
    const response = await api.get(`/consents/${id}`);
    const item = response.data.data || response.data;
    
    return {
      id: item.id || item.consentId,
     patient:
  `${item.patient?.first_name || ''} ${item.patient?.last_name || ''}`.trim(),

      patientId: item.patientId || item.patient_id,
surgery:
  item.surgery?.surgery_type ||
  item.surgery?.name ||
  '',
      surgeryId: item.surgeryId || item.surgery_id,
      status: item.status || 'Pending',
      consentDate:
  item.consent_taken_at ||
  item.consentDate ||
  item.consent_date ||
  '',
      procedureExplained: item.procedureExplained || item.procedure_explained || '',
      risksExplained: item.risksExplained || item.risks_explained || '',
      remarks: item.remarks || '',
      document: item.document || item.documentUrl || '',
    };
  } catch (error) {
    console.log('Error fetching consent details:', error);
    return null;
  }
};

// Get consent history for a patient
export const getConcentHistory = async (patientId: number | string): Promise<ConcentRow[]> => {
  try {
    const response = await api.get(`/consents/history/${patientId}`);
    const data = response.data.data || response.data || [];
    
    return Array.isArray(data)
      ? data.map((item: any) => ({
          id: item.id || item.consentId,
        patient:
  `${item.patient?.first_name || ''} ${item.patient?.last_name || ''}`.trim(),
          patientId: item.patientId || item.patient_id,
         surgery:
  item.surgery?.surgery_type ||
  item.surgery?.name ||
  '',
          surgeryId: item.surgeryId || item.surgery_id,
          status: item.status || 'Pending',
          consentDate:
  item.consent_taken_at ||
  item.consentDate ||
  item.consent_date ||
  '',
        }))
      : [];
  } catch (error) {
    console.log('Error fetching consent history:', error);
    return [];
  }
};

// Get list of patients
export const getPatients = async (): Promise<PatientOption[]> => {
  try {
    const response = await api.get('/patients');
    const data = response.data.data || response.data || [];
    
    return Array.isArray(data)
      ? data.map((item: any) => ({
          id: item.id || item.patientId,
          name: item.name || item.patientName || '',
        }))
      : [];
  } catch (error) {
    console.log('Error fetching patients:', error);
    return [];
  }
};

// Get list of surgeries
export const getSurgeries = async (): Promise<SurgeryOption[]> => {
  try {
    const response = await api.get('/surgeries');

    const data = response.data.data || response.data || [];

    return Array.isArray(data)
      ? data.map((item: any) => ({
          id: item.id,

          name:
            `${item.patient?.first_name || ''} ${item.patient?.last_name || ''}`.trim() +
            ` - ${item.surgery_type || ''}` +
            ` (${item.surgery_date || ''})`,
        }))
      : [];

  } catch (error) {

    console.log('Error fetching surgeries:', error);

    return [];
  }
};
// Create consent record
export const createConsent = async (payload: {
  patientId: number | string;
  surgeryId: number | string;
  status: string;
  procedureExplained: string;
  risksExplained: string;
  remarks: string;
  consentDate: string;
  document?: any;
}): Promise<any> => {
  try {
    const formData = new FormData();
    
    formData.append('patient_id', String(payload.patientId));

    // Laravel expected names
    formData.append('surgery_id', String(payload.surgeryId));

    formData.append('consent_status', payload.status);

    formData.append(
      'procedure_explained',
      payload.procedureExplained,
    );

    formData.append(
      'risks_explained',
      payload.risksExplained,
    );

    formData.append('remarks', payload.remarks);

    if (payload.document) {
      formData.append('document', {
        uri: payload.document.uri,
        type: payload.document.mimeType || 'application/octet-stream',
        name: payload.document.name,
      } as any);
    }

    const response = await api.post(
      '/consents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log('Error creating consent:', error);
    throw error;
  }
};

// Update consent record
export const updateConsent = async (id: number | string, payload: any): Promise<any> => {
  try {
    const response = await api.put(`/consents/${id}`, payload);
    return response.data;
  } catch (error) {
    console.log('Error updating consent:', error);
    throw error;
  }
};

// Delete consent record
export const deleteConsent = async (id: number | string): Promise<any> => {
  try {
    const response = await api.delete(`/consents/${id}`);
    return response.data;
  } catch (error) {
    console.log('Error deleting consent:', error);
    throw error;
  }
};
