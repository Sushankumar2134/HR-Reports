import instance from './axios';

export interface DischargeSummaryRow {
  id: string | number;
  patientName: string;
  admissionId: string;
  status: 'Discharged' | 'Pending Review' | 'In Progress' | string;
  notes: string;
  dischargeSummary: string;
  treatmentSummary: string;
  doctorName: string;
  diagnosis: string;
  dischargedOn: string;
}

const normalizeStatus = (value: unknown): DischargeSummaryRow['status'] => {
  const text = String(value ?? '').trim();

  if (!text) return 'Pending Review';

  const lowered = text.toLowerCase();

  if (lowered.includes('discharged')) return 'Discharged';
  if (lowered.includes('progress')) return 'In Progress';
  if (lowered.includes('review')) return 'Pending Review';

  return text;
};

const normalizeDischargeSummaryRows = (payload: any): DischargeSummaryRow[] => {

  const list =
    Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.data)
      ? payload.data.data
      : [];

  if (!list.length) {
    return [];
  }

  return list.map((item: any, index: number) => ({

    id: item.id ?? index + 1,

    patientName:
      item.patient
        ? `${item.patient.first_name} ${item.patient.last_name}`
        : 'Unknown Patient',

    admissionId:
      item.admission_id ?? `ADM-${10000 + index}`,

    status:
      normalizeStatus(item.status),

    notes:
      item.notes ?? 'No notes available.',

    dischargeSummary:
      item.notes ?? 'No discharge summary available.',

    treatmentSummary:
      item.treatment_summary ?? item.treatmentSummary ?? 'No treatment summary available.',

    doctorName:
      item.doctor_name ?? item.doctorName ?? 'Unknown Doctor',

    diagnosis:
      item.diagnosis ?? item.diagnosis_name ?? 'Diagnosis not available.',

    dischargedOn:
      item.discharge_date ?? ''

  }));
};

export const getDischargeSummaryList = async (): Promise<DischargeSummaryRow[]> => {
  try {
    const response = await instance.get(
      '/emr/discharge-summary-list'
    );

    return normalizeDischargeSummaryRows(
      response.data
    );

  } catch (error) {

    console.log(
      'Error fetching discharge summary list:',
      error
    );

    return [];
  }
};
export const saveDoctorNotes = async (
  ipdId: string,
  notes: string
) => {

  try {

    const response = await instance.post(

      `/emr/doctor-notes/${ipdId}`,

      {
        notes: notes
      }

    );

    return response.data;

  } catch (error) {

    console.log(
      'Error saving notes:',
      error
    );

    return null;

  }

};