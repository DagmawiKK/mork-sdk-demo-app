use std::path::PathBuf;

use crate::models::{ChemicalSimilarity, DrugInteraction, PatientMedication};
use mork_rust_sdk::mork_api::{
    ClearRequest, Mm2Cell, MorkApiClient, Namespace, ReadRequest, TransformDetails,
    TransformRequest, UploadRequest,
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

    pub async fn ingest_chemically_similar(
        &self,
        data: ChemicalSimilarity,
    ) -> Result<String, String> {
        let sim_fact = format!("(chemically_similar {} {})", data.drug_a, data.drug_b);
        let pattern = "(chemically_similar $a $b)".to_string();

        let req = UploadRequest::new()
            .namespace(PathBuf::from("/fda/interactions"))
            .pattern(pattern.clone())
            .template(sim_fact.clone())
            .data(sim_fact);

        self.client.dispatch(req).await.map_err(|e| e.to_string())
    }

    pub async fn clear_data(&self, namespace: PathBuf, pattern: String) -> Result<String, String> {
        let req = ClearRequest::new().namespace(namespace).expr(pattern);

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

    pub async fn infer_risks(&self) -> Result<String, String> {
        let fda_ns = Namespace::from(PathBuf::from("/fda/interactions"));

        // If Drug A interacts with Drug B, and Drug A is similar to Drug C, then Drug C interacts with Drug B.
        let rule_1 = TransformRequest::new().transform_input(
            TransformDetails::new()
                .patterns(vec![
                    Mm2Cell::new_pattern("(interacts $a $b $s)".to_string(), fda_ns.clone()),
                    Mm2Cell::new_pattern("(chemically_similar $a $c)".to_string(), fda_ns.clone()),
                ])
                .templates(vec![Mm2Cell::new_template(
                    "(interacts $c $b $s)".to_string(),
                    fda_ns.clone(),
                )]),
        );

        // If Drug A interacts with Drug B, and Drug B is similar to Drug C, then Drug A interacts with Drug C.
        let rule_2 = TransformRequest::new().transform_input(
            TransformDetails::new()
                .patterns(vec![
                    Mm2Cell::new_pattern("(interacts $a $b $s)".to_string(), fda_ns.clone()),
                    Mm2Cell::new_pattern("(chemically_similar $b $c)".to_string(), fda_ns.clone()),
                ])
                .templates(vec![Mm2Cell::new_template(
                    "(interacts $a $c $s)".to_string(),
                    fda_ns.clone(),
                )]),
        );

        // Execute both rules
        let res1 = self.client.dispatch(rule_1).await;
        let res2 = self.client.dispatch(rule_2).await;

        match (res1, res2) {
            (Ok(_), Ok(_)) => Ok("Inferred risks based on chemical similarity checks".to_string()),
            (Err(e), _) => Err(e.to_string()),
            (_, Err(e)) => Err(e.to_string()),
        }
    }
}
