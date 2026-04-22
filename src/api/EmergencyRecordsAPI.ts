import instance from "./axios";

export interface EmergencyRecord {
  uhid: string;
  patient: string;
  blood: string;
  contact: string;
  type: string;
  status: string;
}

export const getEmergencyRecords =
  async (): Promise<EmergencyRecord[]> => {
    try {
      const response =
        await instance.get(
          "/emergency-reports"
        );

      const list =
        response.data?.data || [];
return list.map((item: any, index: number) => ({
  uhid:
    item.patient_code
    || `TEMP-${index}`,

  patient:
    item.patient_name || "",

  blood:
    item.blood_group || "",

  contact:
    item.mobile || "",

  type:
    item.emergency_type || "",

  status: "Critical",
}));

    } catch (error) {
      console.log(
        "Error fetching emergency:",
        error
      );

      return [];
    }
};