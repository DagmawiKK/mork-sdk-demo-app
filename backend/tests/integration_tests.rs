use rocket::local::blocking::Client;
use rocket::http::{Status, ContentType};
use backend::build_rocket;
use backend::models::{DrugInteraction, ChemicalSimilarity, PatientMedication, ExploreRequestData, ClearRequestData};

// Helper function to create a client
fn client() -> Client {
    Client::tracked(build_rocket()).expect("valid rocket instance")
}

// Helper to clear data (Best effort cleanup)
fn clear_namespace(client: &Client, namespace: &str, pattern: &str) {
    let _ = client.post("/clear")
        .header(ContentType::JSON)
        .json(&ClearRequestData {
            namespace: namespace.to_string(),
            expr: pattern.to_string(),
        }).dispatch();
}

#[test]
fn test_health_check() {
    let client = client();
    let response = client.get("/health-check").dispatch();
    assert_eq!(response.status(), Status::Ok);
    assert_eq!(response.into_string(), Some("MediGraph API is Online".into()));
}

#[test]
fn test_ingest_interaction() {
    let client = client();
    let interaction1 = DrugInteraction {
        drug_a: "TestDrugA".to_string(),
        drug_b: "TestDrugB".to_string(),
        severity: "Severe".to_string(),
    };
    
    let res = client.post("/ingest/interactions")
        .header(ContentType::JSON)
        .json(&interaction1)
        .dispatch();
    assert_eq!(res.status(), Status::Ok);

    let interaction2 = DrugInteraction {
        drug_a: "TestDrugA".to_string(),
        drug_b: "TestDrugC".to_string(),
        severity: "Mild".to_string(),
    };
    let res = client.post("/ingest/interactions")
        .header(ContentType::JSON)
        .json(&interaction2)
        .dispatch();
    assert_eq!(res.status(), Status::Ok);

    // Verify via Explore
    let explore_req = ExploreRequestData {
        namespace: "/fda/interactions".to_string(),
        pattern: "(interacts TestDrugA $x $y)".to_string(), 
        token: Some("".to_string()),
    };
    let res = client.post("/explore")
        .header(ContentType::JSON)
        .json(&explore_req)
        .dispatch();
    assert_eq!(res.status(), Status::Ok);
    let body = res.into_string().unwrap();
    assert!(body.contains("TestDrugA"), "Did not find interaction in graph");
    
    // Cleanup
    clear_namespace(&client, "/fda/interactions", "(interacts TestDrugA $x $y)");
}

#[test]
fn test_ingest_chemical_similarity() {
    let client = client();
    let similarity1 = ChemicalSimilarity {
        drug_a: "TestSimA".to_string(),
        drug_b: "TestSimB".to_string(),
    };
    
    let res = client.post("/ingest/chemically_similar")
        .header(ContentType::JSON)
        .json(&similarity1)
        .dispatch();
    assert_eq!(res.status(), Status::Ok);

    let similarity2 = ChemicalSimilarity {
        drug_a: "TestSimA".to_string(),
        drug_b: "TestSimC".to_string(),
    };
    
    let res = client.post("/ingest/chemically_similar")
        .header(ContentType::JSON)
        .json(&similarity2)
        .dispatch();
    assert_eq!(res.status(), Status::Ok);

    let explore_req = ExploreRequestData {
        namespace: "/fda/interactions".to_string(),
        pattern: "(chemically_similar TestSimA $x)".to_string(),
        token: Some("".to_string()),
    };
    let res = client.post("/explore")
        .header(ContentType::JSON)
        .json(&explore_req)
        .dispatch();
    assert_eq!(res.status(), Status::Ok);
    let body = res.into_string().unwrap();
    assert!(body.contains("TestSimA"), "Did not find similarity in graph");

    clear_namespace(&client, "/fda/interactions", "(chemically_similar TestSimA $x)");
}

#[test]
fn test_add_patient_medication() {
    let client = client();
    let med = PatientMedication { 
        user_id: "test_patient_meds".to_string(), 
        drug: "TestMedX".to_string() 
    };

    let res = client.post("/patient/add_medication")
        .header(ContentType::JSON)
        .json(&med)
        .dispatch();
    assert_eq!(res.status(), Status::Ok);

    clear_namespace(&client, "/patients/test_patient_meds", "(takes test_patient_meds TestMedX)");
}

#[test]
fn test_infer_risks_execution() {
    let client = client();
   
    let res = client.post("/infer_risks").dispatch();
    assert_eq!(res.status(), Status::Ok);
}

#[test]
fn test_check_risks_endpoint_structure() {
    let client = client();
    let patient_id = "test_patient_check";
    
    let res = client.get(format!("/patient/check_risks/{}", patient_id)).dispatch();
    assert_eq!(res.status(), Status::Ok);
    
    let body = res.into_string().unwrap();
    assert!(body.contains(patient_id), "Response should contain user_id");
    assert!(body.contains("findings"), "Response should contain findings field");
}

