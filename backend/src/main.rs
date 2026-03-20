#[macro_use]
extern crate rocket;

use backend::build_rocket;

#[launch]
fn rocket() -> _ {
    build_rocket()
}

