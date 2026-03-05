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

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ChemicalSimilarity {
    pub drug_a: String,
    pub drug_b: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ClearRequestData {
    pub namespace: String,
    pub expr: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExploreRequestData {
    pub namespace: String,
    pub pattern: String,
    pub token: Option<String>,
}
