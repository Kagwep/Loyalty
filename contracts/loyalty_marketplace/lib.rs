#![cfg_attr(not(feature = "std"), no_std, no_main)]


#[ink::contract]
mod loyalty_marketplace {

    use ink::codegen::TraitCallBuilder;
    use erc721::Erc721Ref;
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    #[derive(Debug, PartialEq, Eq,  Clone)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub struct Listing {
        id: u32,
        token_id: u32,
        owner: AccountId,
        seller:AccountId,
        price: u128,
        currently_listed: bool,
        token_uri:String,
        title: String,

    }
    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct LoyaltyMarketplace {
        /// Stores a single `bool` value on the storage.
        listings: Vec<Listing>,
        erc721:Erc721Ref,
        next_listing_id: u32,
        token_id_to_listing_id: Mapping<u32, u32>,
        total_listings: u32,
    }

    #[derive(Debug, PartialEq, Eq, Copy, Clone)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum MarketPlaceError {
            TokenAlreadyListed,
            MintingFailed,
            Unauthorized,
            ListingNotFound,
            InsufficientFunds,
            TransferFailed,
            TransferTokenFailed,
            ArithmeticError,
            ListingNotAvailable,
            Overflow,
            InvalidListingId,

        }


    impl LoyaltyMarketplace {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(erc721_code_hash:Hash) -> Self {

            let erc721 = Erc721Ref::new()
            .code_hash(erc721_code_hash)
            .endowment(0)
            .salt_bytes([0xDE, 0xAD, 0xBE, 0xEF])
            .instantiate();

            Self { listings: Vec::new(), erc721, next_listing_id: 1 ,token_id_to_listing_id:Mapping::new(),total_listings: 0}
        }

        /// Constructor that initializes the `bool` value to `false`.
        ///
        /// Constructors can delegate to other constructors.
        #[ink(constructor)]
        pub fn default(code_hash:Hash) -> Self {
            Self::new(code_hash)
        }

        /// A message that can be called on instantiated contracts.
        /// This one flips the value of the stored `bool` from `true`
        /// to `false` and vice versa.
        #[ink(message)]
        pub fn create_listing(&mut self, token_id: u32, price: u128, token_uri: String, title:String) -> Result<(), MarketPlaceError> {

            let caller = self.env().caller();

            let owner = self.env().account_id();
        
            // Mint the token first
            let result = self.erc721.mint(token_id);
            
            match result {
                Ok(_) => {
                      // Check if the token is already listed
                    if self.token_id_to_listing_id.get(token_id).is_some() {
                        return Err(MarketPlaceError::TokenAlreadyListed);
                    }
                
                    // Generate a unique ID for the listing
                    let new_listing_id = self.next_listing_id;
                  
                    // Create and store the new listing
                    let new_listing = Listing {
                        id: new_listing_id,
                        token_id,
                        owner,
                        seller:caller,
                        price,
                        currently_listed: true,
                        token_uri,
                        title,
                    };
                    self.listings.push(new_listing);
                    self.token_id_to_listing_id.insert(token_id, &new_listing_id); // Mark the token as listed

                    if let Some(new_id) = self.next_listing_id.checked_add(1) {
                        self.next_listing_id = new_id;
                    } else {
                        // Handle the overflow case by returning an error
                        return Err(MarketPlaceError::Overflow);
                    }

                    
                    if let Some(new_total_listing) = self.total_listings.checked_add(1) {
                        self.total_listings = new_total_listing;
                    } else {
                        // Handle the overflow case by returning an error
                        return Err(MarketPlaceError::Overflow);
                    }
                    
                    
                    

                },
                Err(_) => {
                    // General error handling
                    return Err(MarketPlaceError::MintingFailed);
                }
            }

        
            Ok(())
        }

        #[ink(message)]
        pub fn get_listing_by_token_id(&self, token_id: u32) -> Option<Listing> {

            // Retrieve the listing ID mapped from the token ID
            if let Some(listing_id) = self.token_id_to_listing_id.get(token_id) {
                // Adjust for zero-based index, check it's within bounds
                if listing_id == 0 {
                    return None;  // Handle the case where listing_id is 0 and would underflow
                }

                let index = listing_id.checked_sub(1);
                
                if let Some(idx) = index {
                    if idx < self.listings.len().try_into().unwrap() {
                        // Safely access the listing and return a clone
                        return Some(self.listings[idx as usize].clone());
                    }
                }
            }
            None
        }
        
        
        #[ink(message)]
        pub fn number_of_listings(&self) -> u32 {
            self.total_listings
        }

        #[ink(message)]
        pub fn update_list_price(&mut self, listing_id: u32, new_price: u128) -> Result<(), MarketPlaceError> {
            let caller = self.env().caller();
        
            // Safely calculate the index from the listing_id, handling potential underflow
            let index = listing_id.checked_sub(1).ok_or(MarketPlaceError::InvalidListingId)?;
        
            // Verify the index is within bounds
            if index >= self.listings.len().try_into().unwrap() {
                return Err(MarketPlaceError::ListingNotFound);
            }
        
            // Access the listing directly by its index
            let listing = &mut self.listings[index as usize];
        
            // Check if the caller is the seller of the listing
            if listing.seller != caller {
                return Err(MarketPlaceError::Unauthorized);
            }
        
            // Update the price of the listing
            listing.price = new_price;
        
            Ok(())
        }

        #[ink(message)]
        pub fn update_listing(&mut self, listing_id: u32) -> Result<(), MarketPlaceError> {
            let caller = self.env().caller();
        
            // Safely calculate the index from the listing_id, handling potential underflow
            let index = listing_id.checked_sub(1).ok_or(MarketPlaceError::InvalidListingId)?;
        
            // Verify the index is within bounds
            if index >= self.listings.len().try_into().unwrap() {
                return Err(MarketPlaceError::ListingNotFound);
            }
        
            // Access the listing directly by its index
            let listing = &mut self.listings[index as usize];
        
            // Check if the caller is the seller of the listing
            if listing.seller != caller {
                return Err(MarketPlaceError::Unauthorized);
            }
        
            // Update the price of the listing
            listing.currently_listed = true;
        
            Ok(())
        }


        #[ink(message)]
        pub fn get_all_listings(&self) -> Vec<Listing> {
            self.listings.clone()
        }
        

        #[ink(message, payable)]
        pub fn execute_sale(&mut self, token_id: u32) -> Result<(), MarketPlaceError> {
            let caller = self.env().caller();
            let transferred_value = self.env().transferred_value();
        
            // Retrieve and check listing_id, ensuring it's valid
            let listing_id = self.token_id_to_listing_id.get(token_id)
                .ok_or(MarketPlaceError::ListingNotFound)?;
            let index = listing_id.checked_sub(1)
                .ok_or(MarketPlaceError::InvalidListingId)? as usize;
        
            if index >= self.listings.len() {
                return Err(MarketPlaceError::ListingNotFound);
            }
        
            let seller;
            let amount_to_seller;
        
            {
                // Temporarily borrow listing mutably to update it
                let listing = &mut self.listings[index];
        
                // Ensure the listing is currently available
                if !listing.currently_listed {
                    return Err(MarketPlaceError::ListingNotAvailable);
                }
        
                // Check if the transferred amount is sufficient
                if transferred_value < listing.price {
                    return Err(MarketPlaceError::InsufficientFunds);
                }
        
                // Calculate the fee and the amount to transfer to the seller
                let fee = listing.price / 100;  // 1%
                amount_to_seller = listing.price.checked_sub(fee)
                    .ok_or(MarketPlaceError::ArithmeticError)?;
        
                // Store seller to use later for transfer
                seller = listing.seller;
        
                // Mark the listing as no longer available
                listing.currently_listed = false;
                listing.seller = caller;
            } // Mutable borrow of listing ends here
        
            // Transfer the token ownership
            self.erc721.transfer(caller, token_id)
                .map_err(|_| MarketPlaceError::TransferTokenFailed)?;
        
            // Transfer the amount to the seller
            self.env().transfer(seller, amount_to_seller)
                .map_err(|_| MarketPlaceError::TransferFailed)?;
        
            Ok(())
        }
        
        
        
        
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        use ink_e2e::ContractsBackend;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;
        
        #[ink_e2e::test]
        async fn test_create_listing<Client: ContractsBackend>(mut client: Client) -> E2EResult<()> {
            // Given: Upload and instantiate the ERC-721 contract
            let erc721_contract_code = client
                .upload("erc721", &ink_e2e::alice())
                .submit()
                .await
                .expect("ERC-721 contract upload failed");
        
            let mut constructor = LoyaltyMarketplaceRef::new(erc721_contract_code.code_hash);
            let contract = client
                .instantiate("loyalty_marketplace", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("loyalty_marketplace instantiation failed");
        
        
            // When: Create a listing
            let mut call_builder = contract.call_builder::<LoyaltyMarketplace>();
            
            let call = call_builder.create_listing(1, 1000, "http://token-uri.com".into(),"Calvalry".into());
        
            // Then: Ensure the listing is created successfully
            let result = client
                .call(&ink_e2e::alice(), &call)
                .submit()
                .await
                .expect("Calling `create_listing` failed")
                .return_value();
        
            assert!(result.is_ok());

            let alice_account = ink_e2e::account_id(ink_e2e::AccountKeyring::Alice);

                        // Now retrieve the listing to check its details
            let get_listing_call = call_builder.get_listing_by_token_id(1); // Assuming this method exists
            let listing = client
                .call(&ink_e2e::alice(), &get_listing_call)
                .submit()
                .await
                .expect("Calling `get_listing_by_token_id` failed")
                .return_value()
                .expect("Failed to get listing");

            assert_eq!(listing.price, 1000, "The listing price should be 1000");
            assert_eq!(listing.seller, alice_account, "The listing price should be 1000");

            let call_two = call_builder.create_listing(2, 2000, "http://token-uri.com".into(),"Calvalry".into());
        
            // Then: Ensure the listing is created successfully
            let result_two = client
                .call(&ink_e2e::alice(), &call_two)
                .submit()
                .await
                .expect("Calling `create_listing` failed")
                .return_value();
        
            assert!(result_two.is_ok());

            let all_listings =  call_builder.get_all_listings();

            let listings_result = client
                .call(&ink_e2e::alice(), &all_listings)
                .submit()
                .await
                .expect("Calling `get_all_listings` failed")
                .return_value();

            assert_eq!(listings_result[1].price, 2000, "The listing price should be 2000");


            Ok(())
        }


        #[ink_e2e::test]
        async fn test_marketplace_listings_count<Client: ContractsBackend>(mut client: Client) -> E2EResult<()> {
            // Given: Upload and instantiate the ERC-721 contract
            let erc721_contract_code = client
                .upload("erc721", &ink_e2e::alice())
                .submit()
                .await
                .expect("ERC-721 contract upload failed");
        
            let mut constructor = LoyaltyMarketplaceRef::new(erc721_contract_code.code_hash);
            let contract = client
                .instantiate("loyalty_marketplace", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("loyalty_marketplace instantiation failed");
        
        
            // When: Create a listing
            let mut call_builder = contract.call_builder::<LoyaltyMarketplace>();
            
            let call = call_builder.create_listing(1, 1000, "http://token-uri.com".into(),"Calvalry".into());
        
            // Then: Ensure the listing is created successfully
            let result = client
                .call(&ink_e2e::alice(), &call)
                .submit()
                .await
                .expect("Calling `create_listing` failed")
                .return_value();
        
            assert!(result.is_ok());



            // Now check the balance of the creator (Alice)
            let number_call = call_builder.number_of_listings();
            let listings_number = client
                .call(&ink_e2e::alice(), &number_call)
                .submit()
                .await
                .expect("Calling `balance_of` failed")
                .return_value();
    

            // Assuming the test involves balance changing, check if it's as expected
            assert_eq!(listings_number, 1, "Listing should match the expected value after transactions");


            Ok(())
        }

        #[ink_e2e::test]
        async fn test_updating_listing_price<Client: ContractsBackend>(mut client: Client) -> E2EResult<()> {
            // Given: Upload and instantiate the ERC-721 contract
            let erc721_contract_code = client
                .upload("erc721", &ink_e2e::alice())
                .submit()
                .await
                .expect("ERC-721 contract upload failed");
        
            let mut constructor = LoyaltyMarketplaceRef::new(erc721_contract_code.code_hash);
            let contract = client
                .instantiate("loyalty_marketplace", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("loyalty_marketplace instantiation failed");
        
        
            // When: Create a listing
            let mut call_builder = contract.call_builder::<LoyaltyMarketplace>();
            
            let call = call_builder.create_listing(1, 1000, "http://token-uri.com".into(),"Calvalry".into());
        
            // Then: Ensure the listing is created successfully
            let result = client
                .call(&ink_e2e::alice(), &call)
                .submit()
                .await
                .expect("Calling `create_listing` failed")
                .return_value();
        
            assert!(result.is_ok());




            let update_price_call = call_builder.update_list_price(1,10);
            let update_price = client
                .call(&ink_e2e::alice(), &update_price_call)
                .submit()
                .await
                .expect("Calling `update_list_price` failed")
                .return_value();

            assert!(update_price.is_ok());
    

            let get_listing_call = call_builder.get_listing_by_token_id(1); 
            let listing = client
                .call(&ink_e2e::alice(), &get_listing_call)
                .submit()
                .await
                .expect("Calling `get_listing_by_token_id` failed")
                .return_value()
                .expect("Failed to get listing");

            assert_eq!(listing.price, 10, "The listing price should be 1000");


            Ok(())
        }
        
        #[ink_e2e::test]
        async fn test_executing_a_sale<Client: ContractsBackend>(mut client: Client) -> E2EResult<()> {
            // Given: Upload and instantiate the ERC-721 contract
            let erc721_contract_code = client
                .upload("erc721", &ink_e2e::alice())
                .submit()
                .await
                .expect("ERC-721 contract upload failed");
        
            let mut constructor = LoyaltyMarketplaceRef::new(erc721_contract_code.code_hash);
            let contract = client
                .instantiate("loyalty_marketplace", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("loyalty_marketplace instantiation failed");
        
        
            // When: Create a listing
            let mut call_builder = contract.call_builder::<LoyaltyMarketplace>();
            
            let call = call_builder.create_listing(1, 10, "http://token-uri.com".into(),"Calvalry".into());
        
            // Then: Ensure the listing is created successfully
            let result = client
                .call(&ink_e2e::alice(), &call)
                .submit()
                .await
                .expect("Calling `create_listing` failed")
                .return_value();
        
            assert!(result.is_ok());


    

            let execute_sale_call= call_builder.execute_sale(1); 
            let sale = client
                .call(&ink_e2e::alice(), &execute_sale_call)
                .value(11)
                .submit()
                .await
                .expect("Calling `execute_sale` failed")
                .return_value();
      

                assert!(sale.is_ok());


            let update_listing_call = call_builder.update_listing(1);
            let listing_update = client
                    .call(&ink_e2e::alice(), &update_listing_call)
                    .submit()
                    .await
                    .expect("Calling `update_listing` failed")
                    .return_value();

            assert!(listing_update.is_ok());


            Ok(())
        }
    }
   
}
