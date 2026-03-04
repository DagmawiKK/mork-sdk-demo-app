import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Default Rocket port

export interface DrugInteraction {
  drug_a: string;
  drug_b: string;
  severity: string;
}

export interface PatientMedication {
  user_id: string;
  drug: string;
}

export interface RiskResponse {
  user_id: string;
  findings: string[];
}

export const api = {
  healthCheck: async () => {
    const response = await axios.get(`${API_BASE_URL}/health-check`);
    return response.data;
  },

  ingestInteraction: async (data: DrugInteraction) => {
    const response = await axios.post(`${API_BASE_URL}/ingest/interactions`, data);
    return response.data;
  },

  addPatientMedication: async (data: PatientMedication) => {
    const response = await axios.post(`${API_BASE_URL}/patient/add_medication`, data);
    return response.data;
  },

  checkRisks: async (userId: string) => {
    const response = await axios.get<RiskResponse>(`${API_BASE_URL}/patient/check_risks/${userId}`);
    return response.data;
  }
};
