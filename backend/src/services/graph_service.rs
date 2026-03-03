use mork_rust_sdk::{
    MorkApiClient, UploadRequest, TransfromRequest, ReadRequest, Transform Request, Mm2Cell, Namespace
};
use std::path::PathBuf;
use crate::models::{DrugInteraction, PatientMedication};

pub struct GraphService {
    client: MorkApiClient,
}

impl GraphService {
    pub fn new() -> Self {
        GraphService {
            client: MorkApiClient::new()
        }
    }

    pub async fn ingest_interaction(&self, data: DrugInteraction) -> Result<String, String> {
        let interaction_fact = format!("(interacts {} {} {}", data.drug_a, data.drug_b, data.severity);

        let req = UploadRequest::new()
            .namespace(PathBuf::from("fda/interactions"))
            .pattern("(interacts $a $b $s)".to_string())
            .template("(__root__ (fda (interactions (__interactionsdata__ (interacts $a $b $s)))))".to_string())
            .data(interaction_fact);

        self.client.dispatch(req).await.map_err(|e| e.to_string());
    }

    pub async fn add_patient_medication(&self, data: PatientMedication) -> Result<String, String> {
        let med_fact = format!("takes {} {}", data.user_id, data.drug);
        let namespace_path = PathBuf::from(format!("patients/{}", data.user_id));

        let req = UploadRequest::new()
            .namespace(namespace_path.clone())
            .pattern("(takes $u $d)".to_string())
            .template(format!("(__root__(patients ({} (__{}data__ (takes $u $d)))))", data.user_id, data.user_id))
            .data(med_fact);

        self.client.dispatch(req).await.map_err(|e| e.to_string())
        
    }

}
