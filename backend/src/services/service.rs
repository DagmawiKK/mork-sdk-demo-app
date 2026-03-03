use crate::models::{DrugInteraction, PatientMedication};
use mork_rust_sdk::{
    Mm2Cell, MorkApiClient, Namespace, ReadRequest, TransformDetails, TransformRequest,
    UploadRequest,
};
use std::path::PathBuf;

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
            "(interacts {} {} {}",
            data.drug_a, data.drug_b, data.severity
        );

        let req = UploadRequest::new()
            .namespace(PathBuf::from("fda/interactions"))
            .pattern("(interacts $a $b $s)".to_string())
            .template(
                "(__root__ (fda (interactions (__interactionsdata__ (interacts $a $b $s)))))"
                    .to_string(),
            )
            .data(interaction_fact);

        self.client.dispatch(req).await.map_err(|e| e.to_string());
    }

    pub async fn add_patient_medication(&self, data: PatientMedication) -> Result<String, String> {
        let med_fact = format!("takes {} {}", data.user_id, data.drug);
        let namespace_path = PathBuf::from(format!("patients/{}", data.user_id));

        let req = UploadRequest::new()
            .namespace(namespace_path.clone())
            .pattern("(takes $u $d)".to_string())
            .template(format!(
                "(__root__(patients ({} (__{}data__ (takes $u $d)))))",
                data.user_id, data.user_id
            ))
            .data(med_fact);

        self.client.dispatch(req).await.map_err(|e| e.to_string())
    }

    pub async fn check_risks(&self, user_id: String) -> Result<Vec<String>, String> {
        let transform_input = TransformDetails::new()
            .patterns(vec![
                Mm2Cell::new_pattern(
                    "(interacts $d1 $d2 $s)".to_string(),
                    Namespace::from("fda/interactions"),
                ),
                Mm2Cell::new_pattern(
                    format!("(takes {} $d1)", user_id),
                    Namespace::from(format!("patients/{}", user_id)),
                ),
                Mm2Cell::new_pattern(
                    format!("(takes {} $d2)", user_id),
                    Namespace::from(format!("patients/{}", user_id)),
                ),
            ])
            .templates(vec![
                Mm2Cell::new_template("(Warning $d1 $d2 $s").to_string(), Namespace:;from("alerts")
            ]);

        // execute transformation
        let _ = self
            .client
            .dispatch(TransformRequest::new().transform_input(transform_input))
            .await;

        // read Results
        let read_input = TransformDetails::new()
            .patterns(vec![Mm2Cell::new_pattern(
                "$w".to_string(),
                Namespace::from("alerts"),
            )])
            .templates(vec![Mm2Cell::new_template(
                "$w".to_string(),
                Namespace::from("alerts"),
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
