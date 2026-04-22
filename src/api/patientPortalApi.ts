import instance from './axios';

export interface PatientAppointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
}

export interface PatientLabReport {
  id: string;
  patientName: string;
  sampleId: string;
  status: string;
  result: string;
  date: string;
}

export interface PatientRadiologyReport {
  id: string;
  patientName: string;
  scanType: string;
  status: string;
  findings: string;
  date: string;
}

const asArray = (payload: any) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  return [];
};

export const getPatientDashboard = async () => {
  try {

    const response =
      await instance.get(
        "/admin/patient-portal/dashboard"
      );

    const data =
      response.data?.data || {};

    const appointments =
      data.appointments || [];

    const labReports =
      data.lab_reports || [];

    const radiologyReports =
      data.radiology_reports || [];

    return {

      appointments:
        appointments.length,

      labReports:
        labReports.length,

      radiologyReports:
        radiologyReports.length,

      recentAppointments:
        appointments,

      recentLabReports:
        labReports,

      recentRadiologyReports:
        radiologyReports,

    };

  } catch (error) {

    console.log(
      "Dashboard error:",
      error
    );

    return {
      appointments: 0,
      labReports: 0,
      radiologyReports: 0,
      recentAppointments: [],
      recentLabReports: [],
      recentRadiologyReports: [],
    };

  }
};

export const getPatientAppointments = async (): Promise<PatientAppointment[]> => {
  try {
    const response = await instance.get('/admin/patient-portal/appointments');
    return asArray(response.data).map((row: any, index: number) => ({
      id: String(row.id ?? row.appointmentId ?? index + 1),
      patientName: String(row.patientName ?? row.patient_name ?? row.name ?? '-'),
      date: String(row.date ?? row.appointment_date ?? '-'),
      time: String(row.time ?? row.appointment_time ?? '-'),
      status: String(row.status ?? '-'),
    }));
  } catch (error) {
    console.log('Error fetching patient appointments:', error);
    return [];
  }
};

export const getPatientLabReports = async (): Promise<PatientLabReport[]> => {
  try {
    const response = await instance.get('/admin/patient-portal/lab-reports');
    return asArray(response.data).map((row: any, index: number) => ({
      id: String(row.id ?? row.reportId ?? index + 1),
      patientName: String(row.patientName ?? row.patient_name ?? row.name ?? '-'),
      sampleId: String(row.sampleId ?? row.sample_id ?? '-'),
      status: String(row.status ?? '-'),
      result: String(row.result ?? '-'),
      date: String(row.date ?? row.report_date ?? '-'),
    }));
  } catch (error) {
    console.log('Error fetching patient lab reports:', error);
    return [];
  }
};

export const getPatientRadiologyReports = async (): Promise<PatientRadiologyReport[]> => {
  try {
    const response = await instance.get('/admin/patient-portal/radiology-reports');
    return asArray(response.data).map((row: any, index: number) => ({
      id: String(row.id ?? row.reportId ?? index + 1),
      patientName: String(row.patientName ?? row.patient_name ?? row.name ?? '-'),
      scanType: String(row.scanType ?? row.scan_type ?? '-'),
      status: String(row.status ?? '-'),
      findings: String(row.findings ?? '-'),
      date: String(row.date ?? row.report_date ?? '-'),
    }));
  } catch (error) {
    console.log('Error fetching patient radiology reports:', error);
    return [];
  }
};
