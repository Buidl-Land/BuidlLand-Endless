module buidlland::project_token {

    use std::error;
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use endless_std::smart_table::{Self, SmartTable};
    use endless_framework::event;
    use endless_framework::fungible_asset;
    use endless_framework::fungible_asset::{FungibleStore, create_store, Metadata};
    use endless_framework::object;
    use endless_framework::object::Object;
    use endless_framework::primary_fungible_store;
    use endless_framework::timestamp;

    use buidlland::init_resource_account::{get_resource_signer, get_resource_signer_address};
    use buidlland::crowdfunding::{get_funding_raised_amount, get_user_contribution, has_contributed};

    // 1 day in milliseconds
    const ONE_DAY: u64 = 86400000000;

    // Error codes
    const ERR_TOKEN_ALREADY_EXISTS: u64 = 1;
    const ERR_TOKEN_DOES_NOT_EXIST: u64 = 2;
    const ERR_USER_NOT_CONTRIBUTED: u64 = 3;
    // Check if user has claimable tokens
    const ERR_USER_NOT_CLAIMABLE: u64 = 4;

    // Project token information
    struct TokenInfo has store {
        token_address: Object<Metadata>,
        tokens_pool: Object<FungibleStore>,         // Token storage pool
        total_supply: u64,                          // Total token supply
        crowdfunding_pool: u64,                    // 60% of total supply
        team_pool: u64,                             // 25% of total supply
        ecosystem_pool: u64,                        // 15% of total supply
        vesting_start: u64,                         // Vesting start timestamp in microseconds
        vesting_duration: u64,                      // Vesting duration in microseconds
        claimed: SmartTable<address, u64>           // Tracks claimed tokens per address
    }

    // Global storage structure for project tokens
    struct ProjectTokenStorage has key {
        project_tokens: SmartTable<address, TokenInfo>,          // project_id -> token_info_objectID
        project_token_implementations: SmartTable<address, Object<Metadata>>, // project_id -> token_Metadata
    }

    #[event]
    struct ProjectTokenCreatedEvent has store, drop {
        project_id: address,
        token_address: Object<Metadata>,
        name: String,
        symbol: String,
        created_at: u64
    }

    #[event]
    struct TokenClaimedEvent has store, drop {
        project_id: address,
        beneficiary: address,
        amount: u64
    }

    // Initialization method
    fun init_module() {
        // Initialize global storage structure
        let project_token_storage = ProjectTokenStorage {
            project_tokens: smart_table::new(),
            project_token_implementations: smart_table::new()
        };
        // Write global storage structure to admin address
        move_to(&get_resource_signer(), project_token_storage);
    }

    /// Create project token and mint it
    public(friend) fun create_token(
        account: &signer,
        project_id: address,
        name: String,
        symbol: String,
        total_supply: u64,
        icon_uri: String,
        project_uri: String,
    ) acquires ProjectTokenStorage  {
        // Check if project already has a token
        let project_token_storage = borrow_global_mut<ProjectTokenStorage>(get_resource_signer_address());
        assert!(!smart_table::contains(&project_token_storage.project_token_implementations, project_id), error::already_exists(ERR_TOKEN_ALREADY_EXISTS));

        // Create project token
        let primary_constructor_ref = &object::create_named_object(account, *string::bytes(&symbol));
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            primary_constructor_ref,
            option::some<u128>((total_supply as u128)),
            name,
            symbol,
            8,
            icon_uri,
            project_uri
        );

        // Create mint/burn/transfer refs for asset management
        let mint_ref = fungible_asset::generate_mint_ref(primary_constructor_ref);
        // Mint all tokens at once
        let prject_token_fa = fungible_asset::mint(&mint_ref, (total_supply as u128));
        let project_token_metadata = fungible_asset::metadata_from_asset(&prject_token_fa);

        // Create token info structure
        let constructor_ref = object::create_object(get_resource_signer_address());
        let token_info = TokenInfo {
            token_address: project_token_metadata,
            tokens_pool: create_store(&constructor_ref, project_token_metadata),
            total_supply,
            crowdfunding_pool: (total_supply * 60) / 100,
            team_pool: (total_supply * 25) / 100,
            ecosystem_pool: (total_supply * 15) / 100,
            vesting_start: timestamp::now_microseconds(),
            vesting_duration: ONE_DAY * 180,
            claimed: smart_table::new()
        };

        // Deposit all minted tokens into the token pool
        fungible_asset::deposit(token_info.tokens_pool, prject_token_fa);

        // Store token info in global storage
        let token_address = token_info.token_address;
        smart_table::add(&mut project_token_storage.project_tokens, project_id, token_info);
        smart_table::add(&mut project_token_storage.project_token_implementations, project_id, token_address);

        // Emit creation event
        event::emit(ProjectTokenCreatedEvent {
            project_id,
            token_address,
            name,
            symbol,
            created_at: timestamp::now_microseconds()
        })
    }

    /// Allow crowdfunding participants to claim tokens
    public entry fun claim_token(account: &signer, project_id: address) acquires ProjectTokenStorage  {
        // Verify token existence
        let project_token_storage = borrow_global_mut<ProjectTokenStorage>(get_resource_signer_address());
        let token_info = smart_table::borrow_mut(&mut project_token_storage.project_tokens, project_id);
        assert!(smart_table::contains(&project_token_storage.project_token_implementations, project_id), error::not_found(ERR_TOKEN_DOES_NOT_EXIST));

        // Verify user contribution
        assert!(has_contributed(account, project_id), error::not_found(ERR_USER_NOT_CONTRIBUTED));

        // Check claim eligibility
        let user_contribution = get_user_contribution(project_id, signer::address_of(account));
        assert!(user_contribution > 0, error::not_found(ERR_USER_NOT_CLAIMABLE));

        // Calculate vested amount
        let total_vesting_amount = (user_contribution * token_info.crowdfunding_pool) / get_funding_raised_amount(project_id);
        let vested_amount = calculate_vested_amount(
            total_vesting_amount,
            timestamp::now_microseconds(),
            token_info.vesting_start,
            token_info.vesting_duration
        );

        // Update claim records
        let claimed_amount = if (smart_table::contains(&token_info.claimed, signer::address_of(account))) {
            *smart_table::borrow(&token_info.claimed, signer::address_of(account))
        } else {
            0
        };

        let claimable_amount = vested_amount - claimed_amount;
        assert!(claimable_amount > 0, error::not_found(ERR_USER_NOT_CLAIMABLE));

        // Update claim tracking
        if (!smart_table::contains(&token_info.claimed, signer::address_of(account))) {
            smart_table::add(&mut token_info.claimed, signer::address_of(account), claimable_amount);
        } else {
            let claimed = smart_table::borrow_mut(&mut token_info.claimed, signer::address_of(account));
            *claimed = *claimed + claimable_amount;
        };

        // Transfer tokens to user
        let claimed_token = fungible_asset::withdraw(
            &get_resource_signer(),
            token_info.tokens_pool,
            (claimable_amount as u128)
        );
        primary_fungible_store::deposit(
            signer::address_of(account),
            claimed_token
        );

        // Emit claim event
        event::emit(TokenClaimedEvent {
            project_id,
            beneficiary: signer::address_of(account),
            amount: claimable_amount
        }
        )
    }

    // Calculate vested token amount at current time
    fun calculate_vested_amount(
        total: u64,
        current_time: u64,
        start_time: u64,
        vesting_duration: u64
    ): u64 {
        if (current_time < start_time) {
            return 0
        };
        if (current_time >= start_time + vesting_duration) {
            return total
        };
        (total * (current_time - start_time)) / vesting_duration
    }

    /*====== View Functions ======*/

    // Get claimed token amount of a user in a project
    #[view]
    public fun get_claimed_amount(project_id: address, user: address): u64 acquires ProjectTokenStorage {
        let project_token_storage = borrow_global<ProjectTokenStorage>(get_resource_signer_address());
        let token_info = smart_table::borrow(&project_token_storage.project_tokens, project_id);
        if (smart_table::contains(&token_info.claimed, user)) {
            *smart_table::borrow(&token_info.claimed, user)
        } else {
            0
        }
    }
}