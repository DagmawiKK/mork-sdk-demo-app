use std::path::PathBuf;

use crate::models::{DrugInteraction, PatientMedication};
use mork_rust_sdk::mork_api::{
    Mm2Cell,
    MorkApiClient,
    Namespace,
    ReadRequest,
    TransformDetails,
    TransformRequest,
    UploadRequest,
};

pub struct GraphService {
    client: MorkApiClient,
}

impl GraphService {
    pub fn new() -> Self {
        GraphService {
            client: MorkApiClient::new(),
        }
    }

    pub async fn ingest_interaction(&self, data: DrugInteraction) -> Result<String, String> {
        let interaction_fact = format!(
            "(interacts {} {} {})",
            data.drug_a, data.drug_b, data.severity
        );

        let pattern = "(interacts $a $b $s)".to_string();

        let req = UploadRequest::new()
            .namespace(PathBuf::from("/fda/interactions"))
            .pattern(pattern.clone())
            .template(interaction_fact.clone())
            .data(interaction_fact);

        self.client.dispatch(req).await.map_err(|e| e.to_string())
    }

    pub async fn add_patient_medication(&self, data: PatientMedication) -> Result<String, String> {
        let med_fact = format!("(takes {} {})", data.user_id, data.drug);
        let namespace_path = PathBuf::from(format!("/patients/{}", data.user_id));
        let pattern = "(takes $u $d)".to_string();
        let req = UploadRequest::new()
            .namespace(namespace_path.clone())
            .pattern(pattern.clone())
            .template(med_fact.clone())
            .data(med_fact);

        self.client.dispatch(req).await.map_err(|e| e.to_string())
    }

    pub async fn check_risks(&self, user_id: String) -> Result<Vec<String>, String> {
        let transform_input = TransformDetails::new()
            .patterns(vec![
                Mm2Cell::new_pattern(
                    "(interacts $d1 $d2 $s)".to_string(),
                    Namespace::from(PathBuf::from("/fda/interactions")),
                ),
                Mm2Cell::new_pattern(
                    format!("(takes {} $d1)", user_id),
                    Namespace::from(PathBuf::from(format!("/patients/{}", user_id))),
                ),
                Mm2Cell::new_pattern(
                    format!("(takes {} $d2)", user_id),
                    Namespace::from(PathBuf::from(format!("/patients/{}", user_id))),
                ),
            ])
            .templates(vec![Mm2Cell::new_template(
                "(Warning $d1 $d2 $s)".to_string(),
                Namespace::from(PathBuf::from("/alerts")),
            )]);

        // execute transformation
        let _ = self
            .client
            .dispatch(TransformRequest::new().transform_input(transform_input))
            .await;

        // read Results
        let read_input = TransformDetails::new()
            .patterns(vec![Mm2Cell::new_pattern(
                "$w".to_string(),
                Namespace::from(PathBuf::from("/alerts")),
            )])
            .templates(vec![Mm2Cell::new_template(
                "$w".to_string(),
                Namespace::from(PathBuf::from("/alerts")),
            )]);

        let result = self
            .client
            .dispatch(ReadRequest::new().transform_input(read_input))
            .await
            .map_err(|e| e.to_string())?;

        let findings: Vec<String> = result
            .lines()
            .filter(|line| line.contains("(Warning"))
            .map(|s| s.trim().to_string())
            .collect();

        Ok(findings)
    }
}
