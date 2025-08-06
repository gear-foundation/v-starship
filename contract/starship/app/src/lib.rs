#![no_std]

use crate::collections::hash_map::Entry;
use extended_vft_client::vft::io as vft_io;
use nft_client::nft::io as nft_io;
use sails_rs::collections::HashMap;
use sails_rs::gstd::msg;
use sails_rs::prelude::*;

const DAY_MS: u64 = 86_400_000;

struct StarshipService(());

#[derive(Debug)]
struct Storage {
    players_info: HashMap<ActorId, PlayerInfo>,
    config: Config,
    admin: ActorId,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo, PartialEq, Eq)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
struct PlayerInfo {
    player_name: String,
    earned_points: u128,
    number_of_attempts: u16,
    number_of_boosters: u16,
    ship_level: u16,
    attempt_timestamp: u64,
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo, PartialEq, Eq)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub struct Config {
    ft_contract: ActorId,
    nft_contract: ActorId,
    ship_price: u128,
    attempt_price: u128,
    booster_price: u128,
    one_point_in_value: u128,
    default_name: String,
    default_free_attempts: u16,
    default_boosters: u16,
    default_level_ship: u16,
    max_level_ship: u16,
    daily_reset_offset_ms: u64,
}

static mut STORAGE: Option<Storage> = None;

#[allow(static_mut_refs)]
impl StarshipService {
    pub fn init(config: Config) -> Self {
        unsafe {
            STORAGE = Some(Storage {
                config,
                players_info: HashMap::new(),
                admin: msg::source(),
            });
        }
        Self(())
    }
    fn get_mut(&mut self) -> &'static mut Storage {
        unsafe { STORAGE.as_mut().expect("Storage is not initialized") }
    }
    fn get(&self) -> &'static Storage {
        unsafe { STORAGE.as_ref().expect("Storage is not initialized") }
    }
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo, PartialEq, Eq)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub enum Event {
    PointsAdded(u128),
    PointsBought(u128),
    NewShipBought,
    ValuesHaveBeenWithdrawn,
    ConfigChanged(Config),
    AdminChanged(ActorId),
    NameSet(String),
    AttemptBought,
    BoosterBought,
}

#[sails_rs::service(events = Event)]
impl StarshipService {
    pub fn new() -> Self {
        Self(())
    }

    pub async fn add_points(&mut self, points: u128, num_spent_boosters: u16) {
        let storage = self.get_mut();
        let msg_source = msg::source();
        let timestamp = sails_rs::gstd::exec::block_timestamp();

        let info = if let Entry::Occupied(entry) = storage.players_info.entry(msg_source) {
            entry.into_mut()
        } else {
            mint(storage.config.nft_contract, msg_source, Some(0)).await;

            let player_info = PlayerInfo {
                earned_points: 0,
                player_name: storage.config.default_name.clone(),
                ship_level: storage.config.default_level_ship,
                number_of_attempts: storage.config.default_free_attempts,
                number_of_boosters: storage.config.default_boosters,
                attempt_timestamp: timestamp,
            };

            storage.players_info.insert(msg_source, player_info);
            storage
                .players_info
                .get_mut(&msg_source)
                .expect("just inserted")
        };

        let current_game_day = (timestamp - storage.config.daily_reset_offset_ms) / DAY_MS;
        let last_game_day =
            (info.attempt_timestamp - storage.config.daily_reset_offset_ms) / DAY_MS;
        let day_passed = current_game_day != last_game_day;

        if day_passed {
            if info.number_of_attempts < storage.config.default_free_attempts {
                info.number_of_attempts = storage.config.default_free_attempts;
            }
            info.attempt_timestamp = timestamp;
        }

        if info.number_of_attempts == 0 {
            panic!("No attempts left");
        }

        let request = vft_io::Mint::encode_call(msg_source, sails_rs::U256::from(points));
        msg::send_bytes_with_gas_for_reply(
            storage.config.ft_contract,
            request,
            5_000_000_000,
            0,
            0,
        )
        .expect("Error in sending a message")
        .await
        .expect("Error in mint Fungible Token");

        info.earned_points += points;
        info.number_of_attempts -= 1;
        info.number_of_boosters = info.number_of_boosters.saturating_sub(num_spent_boosters);

        self.emit_event(Event::PointsAdded(points))
            .expect("Event Invocation Error");
    }

    pub async fn set_name(&mut self, name: String) {
        let storage = self.get_mut();
        let msg_source = msg::source();

        storage
            .players_info
            .entry(msg_source)
            .and_modify(|info| {
                info.player_name = name.clone();
            })
            .or_insert({
                PlayerInfo {
                    player_name: name.clone(),
                    earned_points: 0,
                    ship_level: storage.config.default_level_ship,
                    number_of_attempts: storage.config.default_free_attempts,
                    number_of_boosters: storage.config.default_boosters,
                    attempt_timestamp: 0,
                }
            });
        self.emit_event(Event::NameSet(name))
            .expect("Event Invocation Error");
    }

    pub async fn buy_attempt(&mut self) {
        let storage = self.get_mut();
        let msg_source = msg::source();
        let timestamp = sails_rs::gstd::exec::block_timestamp();

        let current_game_day = (timestamp - storage.config.daily_reset_offset_ms) / DAY_MS;

        let request = vft_io::Burn::encode_call(
            msg_source,
            sails_rs::U256::from(storage.config.attempt_price),
        );

        msg::send_bytes_with_gas_for_reply(
            storage.config.ft_contract,
            request,
            5_000_000_000,
            0,
            0,
        )
        .expect("Error in sending a message")
        .await
        .expect("Error in burn Fungible Token");

        storage
            .players_info
            .entry(msg_source)
            .and_modify(|info| {
                let last_game_day =
                    (info.attempt_timestamp - storage.config.daily_reset_offset_ms) / DAY_MS;
                let day_passed = current_game_day != last_game_day;

                if day_passed {
                    info.number_of_attempts = storage.config.default_free_attempts;
                    info.attempt_timestamp = timestamp;
                }

                info.number_of_attempts += 1;
            })
            .or_insert_with(|| PlayerInfo {
                earned_points: 0,
                ship_level: storage.config.default_level_ship,
                number_of_attempts: storage.config.default_free_attempts + 1,
                number_of_boosters: storage.config.default_boosters,
                player_name: storage.config.default_name.clone(),
                attempt_timestamp: timestamp,
            });

        self.emit_event(Event::AttemptBought)
            .expect("Event Invocation Error");
    }

    pub async fn buy_booster(&mut self) {
        let storage = self.get_mut();
        let msg_source = msg::source();

        let request = vft_io::Burn::encode_call(
            msg_source,
            sails_rs::U256::from(storage.config.booster_price),
        );

        msg::send_bytes_with_gas_for_reply(
            storage.config.ft_contract,
            request,
            5_000_000_000,
            0,
            0,
        )
        .expect("Error in sending a message")
        .await
        .expect("Error in burn Fungible Token");

        storage
            .players_info
            .entry(msg_source)
            .and_modify(|info| {
                info.number_of_boosters += 1;
            })
            .or_insert({
                PlayerInfo {
                    earned_points: 0,
                    ship_level: storage.config.default_level_ship,
                    number_of_attempts: storage.config.default_free_attempts,
                    number_of_boosters: storage.config.default_boosters + 1,
                    player_name: storage.config.default_name.clone(),
                    attempt_timestamp: 0,
                }
            });

        self.emit_event(Event::BoosterBought)
            .expect("Event Invocation Error");
    }

    pub async fn buy_points(&mut self, points_amount: u128) {
        let storage = self.get_mut();
        let msg_source = msg::source();

        if msg::value() != points_amount * storage.config.one_point_in_value {
            panic!("Wrong value");
        }
        let request = vft_io::Mint::encode_call(msg_source, sails_rs::U256::from(points_amount));
        msg::send_bytes_with_gas_for_reply(
            storage.config.ft_contract,
            request,
            5_000_000_000,
            0,
            0,
        )
        .expect("Error in sending a message")
        .await
        .expect("Error in mint Fungible Token");

        self.emit_event(Event::PointsBought(points_amount))
            .expect("Event Invocation Error");
    }

    pub async fn buy_new_ship(&mut self) {
        let storage = self.get_mut();
        let msg_source = msg::source();
        let timestamp = sails_rs::gstd::exec::block_timestamp();

        if let Some(info) = storage.players_info.get(&msg_source) {
            if info.ship_level > storage.config.max_level_ship {
                panic!("Max level ship");
            }
        }

        let request =
            vft_io::Burn::encode_call(msg_source, sails_rs::U256::from(storage.config.ship_price));
        msg::send_bytes_with_gas_for_reply(
            storage.config.ft_contract,
            request,
            5_000_000_000,
            0,
            0,
        )
        .expect("Error in sending a message")
        .await
        .expect("Error in burn Fungible Token");

        match storage.players_info.entry(msg_source) {
            Entry::Occupied(mut entry) => {
                let info = entry.get_mut();

                mint(
                    storage.config.nft_contract,
                    msg_source,
                    Some(info.ship_level.into()),
                )
                .await;
            
                info.ship_level += 1;

            }
            Entry::Vacant(entry) => {
                mint(storage.config.nft_contract, msg_source, Some(0)).await;
                mint(storage.config.nft_contract, msg_source, Some(1)).await;

                entry.insert(PlayerInfo {
                    earned_points: 0,
                    ship_level: storage.config.default_level_ship + 1,
                    player_name: storage.config.default_name.clone(),
                    number_of_attempts: storage.config.default_free_attempts,
                    number_of_boosters: storage.config.default_boosters,
                    attempt_timestamp: timestamp,
                });
            }
        }

        self.emit_event(Event::NewShipBought)
            .expect("Event Invocation Error");
    }

    pub async fn withdrawal_of_values(&mut self, to: ActorId) {
        let storage = self.get_mut();
        let msg_source = msg::source();
        if msg_source != storage.admin {
            panic!("Access denied")
        }

        msg::send_with_gas(
            to,
            0,
            0,
            sails_rs::gstd::exec::value_available() - 1_000_000_000_000,
        )
        .expect("Error send value");

        self.emit_event(Event::ValuesHaveBeenWithdrawn)
            .expect("Event Invocation Error");
    }

    pub async fn change_config(&mut self, config: Config) {
        let storage = self.get_mut();
        let msg_source = msg::source();
        if msg_source != storage.admin {
            panic!("Access denied")
        }
        storage.config = config.clone();
        self.emit_event(Event::ConfigChanged(config))
            .expect("Event Invocation Error");
    }

    pub async fn change_admin(&mut self, new_admin: ActorId) {
        let storage = self.get_mut();
        let msg_source = msg::source();
        if msg_source != storage.admin {
            panic!("Access denied")
        }
        storage.admin = new_admin;
        self.emit_event(Event::AdminChanged(new_admin))
            .expect("Event Invocation Error");
    }

    pub fn config(&self) -> &'static Config {
        &self.get().config
    }
    pub fn player_info(&self, player: ActorId) -> &'static PlayerInfo {
        self.get().players_info.get(&player).expect("No player")
    }
    pub fn all_players_info(&self) -> Vec<(ActorId, PlayerInfo)> {
        self.get().players_info.clone().into_iter().collect()
    }
    pub fn time_to_free_attempts(&self, player: ActorId) -> u64 {
        let timestamp = sails_rs::gstd::exec::block_timestamp();
        let storage = self.get();
        let info = match storage.players_info.get(&player) {
            Some(info) => info,
            None => return 0,
        };

        let last_game_day =
            (info.attempt_timestamp - storage.config.daily_reset_offset_ms) / DAY_MS;
        let next_day_start = ((last_game_day + 1) * DAY_MS) + storage.config.daily_reset_offset_ms;

        if timestamp >= next_day_start {
            0
        } else {
            next_day_start.saturating_sub(timestamp)
        }
    }
    pub fn number_of_attempts(&self, player: ActorId) -> u16 {
        let storage = self.get();
        let cfg = &storage.config;

        let info = match storage.players_info.get(&player) {
            Some(i) => i,
            None => return cfg.default_free_attempts,
        };

        let now = sails_rs::gstd::exec::block_timestamp();

        let current_game_day =
            now.saturating_sub(cfg.daily_reset_offset_ms) / DAY_MS;
        let last_game_day =
            info.attempt_timestamp.saturating_sub(cfg.daily_reset_offset_ms) / DAY_MS;

        let day_passed = info.attempt_timestamp == 0 || current_game_day != last_game_day;

        if day_passed {
            core::cmp::max(info.number_of_attempts, cfg.default_free_attempts)
        } else {
            info.number_of_attempts
        }
    }

}

pub async fn mint(nft_contract: ActorId, to: ActorId, img_link_id: Option<u64>) {
    let request = nft_io::Mint::encode_call(to, img_link_id);

    msg::send_bytes_with_gas_for_reply(nft_contract, request, 5_000_000_000, 0, 0)
        .expect("Error in sending a message")
        .await
        .expect("Error in mint Non Fungible Token");
}

pub struct StarshipProgram(());

#[sails_rs::program]
impl StarshipProgram {
    // Program's constructor
    pub fn new(config: Config) -> Self {
        StarshipService::init(config);
        Self(())
    }

    // Exposed service
    pub fn starship(&self) -> StarshipService {
        StarshipService::new()
    }
}
