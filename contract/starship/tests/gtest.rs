use extended_vft_client::traits::{ExtendedVftFactory, Vft};
use sails_rs::ActorId;
use sails_rs::{
    calls::*,
    gtest::{System, calls::*},
};
use starship_client::{Config, traits::*};

const ACTOR_ID: u64 = 42;

async fn init_ft(remoting: &GTestRemoting) -> ActorId {
    let code_id = remoting.system().submit_code(extended_vft::WASM_BINARY);
    let vft_factory = extended_vft_client::ExtendedVftFactory::new(remoting.clone());

    vft_factory
        .new("test".to_string(), "test".to_string(), 1)
        .send_recv(code_id, b"salt")
        .await
        .unwrap()
}

#[tokio::test]
async fn do_something_works() {
    let system = System::new();
    system.init_logger_with_default_filter("gwasm=debug,gtest=info,sails_rs=debug");
    system.mint_to(ACTOR_ID, 100_000_000_000_000);
    let remoting = GTestRemoting::new(system, ACTOR_ID.into());

    // Submit program code into the system
    let program_code_id = remoting.system().submit_code(starship::WASM_BINARY);

    let program_factory = starship_client::StarshipFactory::new(remoting.clone());
    let vft_id = init_ft(&remoting).await;
    let program_id = program_factory
        .new(Config {
            ft_contract: vft_id,
            nft_contract: vft_id,
            ship_price: 10_000,
            attempt_price: 200,
            booster_price: 100,
            one_point_in_value: 1_000_000_000,
            default_name: "Player".to_string(),
            default_free_attempts: 3,
            default_boosters: 0,
            default_level_ship: 0,
            max_level_ship: 10,
            daily_reset_offset_ms: 43_200_000,
            img_links: vec!["1".to_string(), "2".to_string(), "3".to_string()],
        })
        .send_recv(program_code_id, b"salt")
        .await
        .unwrap();

    let mut service_client = starship_client::Starship::new(remoting.clone());
    let mut vft_client = extended_vft_client::Vft::new(remoting.clone());

    vft_client
        .grant_minter_role(program_id)
        .send_recv(vft_id)
        .await
        .unwrap();

    vft_client
        .grant_burner_role(program_id)
        .send_recv(vft_id)
        .await
        .unwrap();

    service_client
        .add_points(200, 0)
        .send_recv(program_id)
        .await
        .unwrap();

    let player_info = service_client
        .player_info(ACTOR_ID.into())
        .recv(program_id)
        .await
        .unwrap();

    assert_eq!(player_info.number_of_attempts, 2);
    println!("PLAYER_INFO: {:?}", player_info);

    service_client
        .add_points(200, 0)
        .send_recv(program_id)
        .await
        .unwrap();

    let player_info = service_client
        .player_info(ACTOR_ID.into())
        .recv(program_id)
        .await
        .unwrap();

    assert_eq!(player_info.number_of_attempts, 1);

    remoting.system().run_to_block(86_400 / 3);

    service_client
        .add_points(200, 0)
        .send_recv(program_id)
        .await
        .unwrap();

    let player_info = service_client
        .player_info(ACTOR_ID.into())
        .recv(program_id)
        .await
        .unwrap();

    assert_eq!(player_info.number_of_attempts, 2);
    println!("PLAYER_INFO: {:?}", player_info);
}
