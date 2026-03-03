use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DrugInteraction {
    pub drug_a: String,
    pub drug_b: String,
    pub severity: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct PatientMedication {
    pub user_id: String,
    pub drug: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RiskResponse {
    pub user_id: String,
    pub findings: Vec<String>,
}
