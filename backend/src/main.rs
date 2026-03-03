#[macro_use]
extern crate rocket;

mod models;
mod routes;
mod services;

#[launch]
fn rocket() -> _ {
    println!("Starting MediGraph Backend...");

    rocket::build().mount("/", routes::get_routes())
}
