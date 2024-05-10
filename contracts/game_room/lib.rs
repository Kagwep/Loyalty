#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod game_room {

    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;

  

    #[derive(Debug, PartialEq, Eq,  Clone)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub struct Room {
        id: u32,
        name: String,
        status: String,
        players: u32,
        max_players: u32,
        description: String,
        room_id: String,
        participants: Vec<String>,
    }

    #[ink(storage)]
    pub struct GameRoom {
        ///Game room contract
        rooms: Vec<Room>,
        
    }

    impl GameRoom {
       
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                rooms: Default::default(),
            }
        }

        #[ink(message)]
        pub fn create_room(
            &mut self, 
            name: String, 
            status: String, 
            max_players: u32, 
            description: String, 
            room_id: String,
            creator_name: String,
        ) {
            
            let new_room = Room {
                id: (self.rooms.len() as u32) + 1,
                name,
                status,
                players: 1, // Start with 1 because the creator is automatically a participant
                max_players,
                description,
                room_id,
                participants: vec![creator_name],  // Automatically add the creator
            };
            self.rooms.push(new_room);
        }
        
        #[ink(message)]
        pub fn add_participant(&mut self, room_id: String, participant_name: String) -> bool {
            let room_opt = self.rooms.iter_mut().find(|room| room.room_id == room_id);
            if let Some(room) = room_opt {
                if room.players < room.max_players {
                    room.participants.push(participant_name);
                    room.players += 1;
                    true
                } else {
                    false
                }
            } else {
                false
            }
        }

        /// A message that can be called on instantiated contracts.
        /// This one flips the value of the stored `bool` from `true`
        /// to `false` and vice versa.
        #[ink(message)]
        pub fn get_room_by_index(&self, index: u32) -> Room {
            assert!(index < self.rooms.len() as u32, "Room index out of bounds");
            self.rooms.get(index as usize).cloned().unwrap()
        }
        /// Simply returns the current value of our `bool`.
        #[ink(message)]
        pub fn get_room_by_id(&self, room_id: String) -> Room {
            let found_room = self.rooms.iter().find(|room| room.room_id == room_id);
            match found_room {
                Some(room) => room.clone(),
                None => panic!("Room with given ID not found"),
            }
        }
        
        #[ink(message)]
        pub fn get_all_rooms(&self) -> Vec<Room> {
            self.rooms.clone()
        }

    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        #[ink::test]
        fn create_room_works_with_creator_added() {
            let mut game_room = GameRoom::new();
            let initial_rooms = game_room.get_all_rooms();
            assert_eq!(initial_rooms.len(), 0);
            
            // Creating a new room with the creator as the first participant
            game_room.create_room(
                "Adventure Room".to_string(),
                "Open".to_string(),
                4,
                "Room for adventure games".to_string(),
                "007".to_string(),
                "Eve".to_string(),
            );
        
            let rooms = game_room.get_all_rooms();
            assert_eq!(rooms.len(), 1);
            assert_eq!(rooms[0].name, "Adventure Room");
            assert_eq!(rooms[0].status, "Open");
            assert_eq!(rooms[0].players, 1); // Creator is counted as a player
            assert_eq!(rooms[0].max_players, 4);
            assert_eq!(rooms[0].description, "Room for adventure games");
            assert_eq!(rooms[0].participants.len(), 1);
            assert_eq!(rooms[0].participants[0], "Eve"); // Check the creator is added
        }
        
        #[ink::test]
        fn get_room_by_index_works() {
            let mut game_room = GameRoom::new();
            game_room.create_room(
                "Strategy Room".to_string(),
                "Closed".to_string(),
                4,
                "A room for strategy games".to_string(),
                "002".to_string(),
                "Jums".to_string(),
            );
        
            let room = game_room.get_room_by_index(0);
            assert_eq!(room.name, "Strategy Room");
            assert_eq!(room.status, "Closed");
            assert_eq!(room.players, 1);  // Adjusted for the creator
            assert_eq!(room.max_players, 4);
            assert_eq!(room.description, "A room for strategy games");
            assert_eq!(room.room_id, "002");
        }

        #[ink::test]
        #[should_panic(expected = "Room index out of bounds")]
        fn get_room_by_index_fails() {
            let game_room = GameRoom::new();
            // This should panic because there are no rooms yet
            let _room = game_room.get_room_by_index(0);
        }
        
        #[ink::test]
        fn get_room_by_id_works() {
            let mut game_room = GameRoom::new();
            game_room.create_room(
                "VR Room".to_string(),
                "Open".to_string(),
                2,
                "A room for VR experiences".to_string(),
                "003".to_string(),
                "Eve".to_string(),
            );
        
            let room = game_room.get_room_by_id("003".to_string());
            assert_eq!(room.name, "VR Room");
            assert_eq!(room.status, "Open");
            assert_eq!(room.players, 1);  // Adjusted for the creator
            assert_eq!(room.max_players, 2);
            assert_eq!(room.description, "A room for VR experiences");
        }

        #[ink::test]
        #[should_panic(expected = "Room with given ID not found")]
        fn get_room_by_id_fails() {
            let game_room = GameRoom::new();
            // This should panic because no room with ID "004" exists
            let _room = game_room.get_room_by_id("004".to_string());
        }


        #[ink::test]
        fn adding_participant_works() {
            let mut game_room = GameRoom::new();
            game_room.create_room(
                "Fun Room".to_string(),
                "Open".to_string(),
                2,
                "A room for all fun activities".to_string(),
                "005".to_string(),
                "Eve".to_string(),
            );
        
            // Adding another participant
            assert!(game_room.add_participant("005".to_string(), "Alice".to_string()));
            let room = game_room.get_room_by_id("005".to_string());
            assert_eq!(room.players, 2);
            assert_eq!(room.participants.len(), 2);
            assert_eq!(room.participants[1], "Alice");
        }

        #[ink::test]
        fn adding_participant_fails_when_full() {
            let mut game_room = GameRoom::new();
            game_room.create_room(
                "Limited Room".to_string(),
                "Open".to_string(),
                1, // Maximum capacity is 1, and it's already filled by the creator "Eve"
                "A room with limited space".to_string(),
                "006".to_string(),
                "Eve".to_string(),
            );
        
            // Attempting to add another participant should fail since room is already at full capacity
            assert!(!game_room.add_participant("006".to_string(), "Charlie".to_string()));
        }
        

    }



}
