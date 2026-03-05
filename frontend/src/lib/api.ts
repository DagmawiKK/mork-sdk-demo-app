import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; 

export interface DrugInteraction {
  drug_a: string;
  drug_b: string;
  severity: string;
}

export interface ChemicalSimilarity {
  drug_a: string;
  drug_b: string;
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

  ingestChemicallySimilar: async (data: ChemicalSimilarity) => {
    const response = await axios.post(`${API_BASE_URL}/ingest/chemically_similar`, data);
    return response.data;
  },

  addPatientMedication: async (data: PatientMedication) => {
    const response = await axios.post(`${API_BASE_URL}/patient/add_medication`, data);
    return response.data;
  },

  inferRisks: async () => {
    const response = await axios.post(`${API_BASE_URL}/infer_risks`);
    return response.data;
  },

  checkRisks: async (userId: string) => {
    const response = await axios.get<RiskResponse>(`${API_BASE_URL}/patient/check_risks/${userId}`);
    return response.data;
  },
  
  clearData: async (namespace: string, expr: string) => {
    const response = await axios.post(`${API_BASE_URL}/clear`, { namespace, expr });
    return response.data;
  },

  exploreData: async (namespace: string, pattern: string, token: string) => {
    const response = await axios.post(`${API_BASE_URL}/explore`, { namespace, pattern, token });
    return response.data;
  },

  ingestMetta: async (content: string) => {
    const response = await axios.post(`${API_BASE_URL}/ingest/metta`, content, {
      headers: { 'Content-Type': 'text/plain' }
    });
    return response.data;
  },
};
