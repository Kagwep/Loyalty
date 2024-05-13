#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod leaderboard {

    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;
    

    #[derive(Debug,PartialEq,Eq,Clone)]
    #[ink::scale_derive(Encode,Decode,TypeInfo)]
    pub struct Leader {
        id: u32,
        leader_account:AccountId,
        points:u128,
        games:u32,
        number_crowned:u32,
        loyals:u128,
        minutes:u128,
        
    }

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct Leaderboard {
        /// Stores a single `bool` value on the storage.
        leaders: Vec<Leader>,
        leader_to_id: Mapping<AccountId,u32>
    }

    #[derive(Debug, PartialEq, Eq, Copy, Clone)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        InvalidLeaderId,
        LeaderNotFound,
        Unauthorized,
        InvalidId

        }

    impl Leaderboard {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { leaders: Vec::new(),leader_to_id: Mapping::new() }
        }

        /// Constructor that initializes the `bool` value to `false`.
        ///
        /// Constructors can delegate to other constructors.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new()
        }

        /// A message that can be called on instantiated contracts.
        /// This one flips the value of the stored `bool` from `true`
        /// to `false` and vice versa.
        #[ink(message)]
        pub fn create_leader(&mut self,minutes:u128) -> Result<(), Error> {
            let caller = self.env().caller();
            let points: u128 = 50;
            self.create_or_update_leader(caller,minutes,points)
 
        }

        #[ink(message)]
        pub fn create_leader_two(&mut self,minutes:u128) -> Result<(), Error> {
            let caller = self.env().caller();
            let points: u128 = 10;
            self.create_or_update_leader(caller,minutes,points)
        }

        fn create_or_update_leader(&mut self, caller: AccountId, minutes:u128,points:u128) -> Result<(), Error>{
            if let Some(leader_board_id) = self.leader_to_id.get(caller){
                
                let index = leader_board_id.checked_sub(1).ok_or(Error::InvalidLeaderId)?;

                if index >= self.leaders.len().try_into().unwrap() {
                    return Err(Error::LeaderNotFound);
                }

                            // Access the listing directly by its index
                let leader = &mut self.leaders[index as usize];
            
                // Check if the caller is the seller of the listing
                if leader.leader_account != caller {
                    return Err(Error::Unauthorized);
                }

                leader.points += points;
                leader.minutes += minutes;
                leader.games += 1;
                leader.number_crowned +=1;
                leader.loyals += 1;


        
                Ok(())


            }else{

                let new_id = (self.leaders.len() as u32).checked_add(1).ok_or(Error::InvalidId)?; 

                let new_leader = Leader {
                    id: new_id,
                    leader_account:caller,
                    points,
                    games:1,
                    number_crowned:1,
                    loyals:1,
                    minutes,
                };

                self.leaders.push(new_leader);
                self.leader_to_id.insert(caller, &new_id);

                Ok(())
            }
        }



        /// Simply returns the current value of our `bool`.
        #[ink(message)]
        pub fn get_leader(&self, leader_id: AccountId) -> Option<Leader> {
            let leader_board_id = self.leader_to_id.get(&leader_id)?;
            self.leaders.iter().find(|leader| leader.id == leader_board_id).cloned()
        }
        

        #[ink(message)]
        pub fn get_all_leaders(&self) -> Vec<Leader> {
            self.leaders.clone()
        }
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {


        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn create_leader_works() {
            let mut leaderboard = Leaderboard::new();
           
            let initial_leaders = leaderboard.get_all_leaders();
            assert_eq!(initial_leaders.len(), 0);

            // Creating a new room with the creator as the first participant
            let result = leaderboard.create_leader(200);

            assert!(result.is_ok());
        
            let leaders = leaderboard.get_all_leaders();
            assert_eq!(leaders.len(), 1);
            assert_eq!(leaders[0].points, 50);
            assert_eq!(leaders[0].minutes, 200 );
            assert_eq!(leaders[0].loyals, 1); // Creator is counted as a player
            assert_eq!(leaders[0].games, 1);

            // Creating a new room with the creator as the first participant
            let result_two = leaderboard.create_leader_two(300);

            assert!(result_two.is_ok());

            let leaders = leaderboard.get_all_leaders();
            assert_eq!(leaders.len(), 1);
            assert_eq!(leaders[0].points, 60);
            assert_eq!(leaders[0].minutes, 500 );
            assert_eq!(leaders[0].loyals, 2); // Creator is counted as a player
            assert_eq!(leaders[0].games, 2);

        }

        /// We test if the default constructor does its job.
        #[ink::test]
        fn get_leader_works() {
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            let callee = ink::env::account_id::<ink::env::DefaultEnvironment>();
            ink::env::test::set_callee::<ink::env::DefaultEnvironment>(callee);

            let mut leaderboard = Leaderboard::new();
            
            let initial_leaders = leaderboard.get_all_leaders();
            assert_eq!(initial_leaders.len(), 0);

            // Creating a new room with the creator as the first participant
            let result = leaderboard.create_leader(200);

            assert!(result.is_ok());
    
            let leaders = leaderboard.get_all_leaders();
            assert_eq!(leaders.len(), 1);
            assert_eq!(leaders[0].points, 50);
            assert_eq!(leaders[0].minutes, 200 );
            assert_eq!(leaders[0].loyals, 1); // Creator is counted as a player
            assert_eq!(leaders[0].games, 1);

            // Creating a new room with the creator as the first participant
        
            let result_two = leaderboard.get_leader(callee).unwrap();
            
            assert_eq!(result_two.leader_account, accounts.alice);
            assert_eq!(result_two.points, 50);
            assert_eq!(result_two.minutes, 200 );

        }
    }


    // /// This is how you'd write end-to-end (E2E) or integration tests for ink! contracts.
    // ///
    // /// When running these you need to make sure that you:
    // /// - Compile the tests with the `e2e-tests` feature flag enabled (`--features e2e-tests`)
    // /// - Are running a Substrate node which contains `pallet-contracts` in the background
    // #[cfg(all(test, feature = "e2e-tests"))]
    // mod e2e_tests {
    //     /// Imports all the definitions from the outer scope so we can use them here.
    //     use super::*;

    //     /// A helper function used for calling contract messages.
    //     use ink_e2e::ContractsBackend;

    //     /// The End-to-End test `Result` type.
    //     type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

    //     /// We test that we can upload and instantiate the contract using its default constructor.
    //     #[ink_e2e::test]
    //     async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
    //         // Given
    //         let mut constructor = LeaderboardRef::default();

    //         // When
    //         let contract = client
    //             .instantiate("leaderboard", &ink_e2e::alice(), &mut constructor)
    //             .submit()
    //             .await
    //             .expect("instantiate failed");
    //         let call_builder = contract.call_builder::<Leaderboard>();

    //         // Then
    //         let get = call_builder.get();
    //         let get_result = client.call(&ink_e2e::alice(), &get).dry_run().await?;
    //         assert!(matches!(get_result.return_value(), false));

    //         Ok(())
    //     }

    //     /// We test that we can read and write a value from the on-chain contract.
    //     #[ink_e2e::test]
    //     async fn it_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
    //         // Given
    //         let mut constructor = LeaderboardRef::new(false);
    //         let contract = client
    //             .instantiate("leaderboard", &ink_e2e::bob(), &mut constructor)
    //             .submit()
    //             .await
    //             .expect("instantiate failed");
    //         let mut call_builder = contract.call_builder::<Leaderboard>();

    //         let get = call_builder.get();
    //         let get_result = client.call(&ink_e2e::bob(), &get).dry_run().await?;
    //         assert!(matches!(get_result.return_value(), false));

    //         // When
    //         let flip = call_builder.flip();
    //         let _flip_result = client
    //             .call(&ink_e2e::bob(), &flip)
    //             .submit()
    //             .await
    //             .expect("flip failed");

    //         // Then
    //         let get = call_builder.get();
    //         let get_result = client.call(&ink_e2e::bob(), &get).dry_run().await?;
    //         assert!(matches!(get_result.return_value(), true));

    //         Ok(())
    //     }
    // }
}
