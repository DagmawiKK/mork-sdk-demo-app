use crate::models::{DrugInteraction, PatientMedication, RiskResponse};
use crate::services::GraphService;
use rocket::{get, post, routes, serde::json::Json};

#[get("/heath-check")]
pub fn health_check() -> &'static str {
    "MediGraph API is Online"
}

#[post("/ingest/interactions", data = "<input>")]
pub async fn ingest_interactions(input: Json<DrugInteraction>) -> Json<String> {
    let service = GraphService::new();
    match service.ingest_interaction(input.into_inner()).await {
        Ok(_) => Json("Interaction recorded: ACK".to_string()),
        Err(e) => Json(format!("Error; {}", e)),
    }
}

#[post("/patient/add_medication", data = "<input>")]
pub async fn add_medication(input: Json<PatientMedication>) -> Json<String> {
    let service = GraphService::new();
    match service.add_patient_medication(input.into_inner()).await {
        Ok(_) => Json("Medication added: ACK".to_string()),
        Err(e) => Json(format!("Error: {}", e)),
    }
}

#[get("/patient/check_risks/<user_id>")]
pub async fn check_risks(user_id: String) -> Json<RiskResponse> {
    let service = GraphService::new();
    let findings = service
        .check_risks(user_id.clone())
        .await
        .unwrap_or_default();

    Json(RiskResponse { user_id, findings })
}

pub fn get_routes() -> Vec<rocket::Route> {
    routes![
        heath_check,
        ingest_interactions,
        add_medication,
        check_risks
    ]
}
