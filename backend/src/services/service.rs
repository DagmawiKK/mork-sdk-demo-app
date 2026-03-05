use std::path::PathBuf;

use crate::models::{ChemicalSimilarity, DrugInteraction, PatientMedication};
use mork_rust_sdk::mork_api::{
    ClearRequest, ExploreRequest, Mm2Cell, MorkApiClient, Namespace, ReadRequest, TransformDetails,
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

    pub async fn explore_data(
        &self,
        namespace: PathBuf,
        pattern: String,
        token: Option<String>,
    ) -> Result<String, String> {
        let req = ExploreRequest::new()
            .namespace(namespace)
            .pattern(pattern)
            .token(token.unwrap_or_default());

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

        let res1 = self.client.dispatch(rule_1).await;
        let res2 = self.client.dispatch(rule_2).await;

        match (res1, res2) {
            (Ok(_), Ok(_)) => Ok("Inferred risks based on chemical similarity checks".to_string()),
            (Err(e), _) => Err(e.to_string()),
            (_, Err(e)) => Err(e.to_string()),
        }
    }

    pub async fn ingest_metta_file(&self, content: String) -> Result<String, String> {
        let mut processed = 0;
        let mut errors = Vec::new();

        for line in content.lines() {
            let line = line.trim();
            if line.is_empty() {
                continue;
            }

            // Simple parsing assuming space-separated S-expressions of form (tag arg1 arg2...)
            // Remove outer parens if present
            let clean_line = line.trim_start_matches('(').trim_end_matches(')');
            let parts: Vec<&str> = clean_line.split_whitespace().collect();

            if parts.is_empty() {
                continue;
            }

            let result = match parts[0] {
                "interacts" => {
                    if parts.len() >= 4 {
                        self.ingest_interaction(DrugInteraction {
                            drug_a: parts[1].to_string(),
                            drug_b: parts[2].to_string(),
                            severity: parts[3].to_string(),
                        })
                        .await
                    } else {
                        Err(format!("Invalid format for 'interacts': {}", line))
                    }
                }
                "chemically_similar" => {
                    if parts.len() >= 3 {
                        self.ingest_chemically_similar(ChemicalSimilarity {
                            drug_a: parts[1].to_string(),
                            drug_b: parts[2].to_string(),
                        })
                        .await
                    } else {
                        Err(format!("Invalid format for 'chemically_similar': {}", line))
                    }
                }
                "takes" => {
                    if parts.len() >= 3 {
                        self.add_patient_medication(PatientMedication {
                            user_id: parts[1].to_string(),
                            drug: parts[2].to_string(),
                        })
                        .await
                    } else {
                        Err(format!("Invalid format for 'takes': {}", line))
                    }
                }
                _ => Ok("Skipped unknown or unsupported relation".to_string()),
            };

            match result {
                Ok(_) => processed += 1,
                Err(e) => errors.push(e),
            }
        }

        if errors.is_empty() {
            Ok(format!("Successfully processed {} facts from file.", processed))
        } else {
            Ok(format!(
                "Processed {} facts. Encountered {} errors: {}",
                processed,
                errors.len(),
                errors.join("; ")
            ))
        }
    }
}
