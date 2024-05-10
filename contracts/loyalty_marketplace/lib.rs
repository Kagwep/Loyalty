#![cfg_attr(not(feature = "std"), no_std, no_main)]


#[ink::contract]
mod loyalty_marketplace {


    use ink::codegen::TraitCallBuilder;
    use erc721::Erc721Ref;
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;


    #[derive(Debug, PartialEq, Eq,  Clone)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub struct Listing {
        id: u32,
        token_id: u32,
        owner: AccountId,
        price: u128,
        currently_listed: bool,
        token_uri:String,
    }
    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct LoyaltyMarketplace {
        /// Stores a single `bool` value on the storage.
        listings: Vec<Listing>,
        erc721:Erc721Ref,
    }

    #[derive(Debug, PartialEq, Eq, Copy, Clone)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
            TokenAlreadyListed,
            MintingFailed,
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

            Self { listings: Vec::new(), erc721 }
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
        pub fn create_listing(&mut self, token_id: u32, price: u128, token_uri: String) -> Result<(), Error> {
            let caller = self.env().caller();
        
            // Mint the token first
            self.erc721.mint(token_id).map_err(|_err| {
                Error::MintingFailed  // Custom error type for minting failures
            })?;
        
            // Check if the token is already listed
            if self.listings.iter().any(|x| x.token_id == token_id && x.currently_listed) {
                return Err(Error::TokenAlreadyListed);
            }
        
            // Generate a unique ID for the listing
            let new_listing_id = self.listings.len().wrapping_add(1) as u32;
          
        
            // Create and store the new listing
            let new_listing = Listing {
                id: new_listing_id,
                token_id,
                owner: caller,
                price,
                currently_listed: true,
                token_uri,
            };
            self.listings.push(new_listing);
        
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
            
            let call = call_builder.create_listing(1, 1000, "http://token-uri.com".into());
        
            // Then: Ensure the listing is created successfully
            let result = client
                .call(&ink_e2e::alice(), &call)
                .submit()
                .await
                .expect("Calling `create_listing` failed")
                .return_value();
        
            assert!(result.is_ok());
        
            Ok(())
        }
        
    }
   
}
