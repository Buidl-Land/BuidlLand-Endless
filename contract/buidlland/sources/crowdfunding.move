module buidlland::crowdfunding  {

    use std::error;
    use std::signer;
    use endless_std::smart_table::{Self, SmartTable};
    use endless_std::smart_vector::{Self, SmartVector};
    use endless_framework::event;
    use endless_framework::fungible_asset::{Self, FungibleStore, Metadata, create_store};
    use endless_framework::object;
    use endless_framework::object::Object;
    use endless_framework::primary_fungible_store;
    use endless_framework::timestamp;

    use buidlland::access_control::{is_funding_manager};
    use buidlland::init_resource_account::{get_resource_signer, get_resource_signer_address};

    friend buidlland::project_token;



    // Error codes
    const ERR_MISSING_FUNDING_MANAGER_ROLE:u64 = 1;
    const ERR_FUNDING_ALREADY_INITIALIZED:u64 = 2;
    const ERR_INVALID_FUNDING_GOAL:u64 = 3;
    const ERR_INVALID_DURATION:u64 = 4;
    const ERR_CROWDFUNDING_NOT_STARTED:u64 = 5;
    const ERR_CROWDFUNDING_ENDED:u64 = 6;
    const ERR_FUNDING_GOAL_MET:u64 = 7;
    const ERR_CROWDFUNDING_NOT_END:u64 = 8;
    const ERR_FUNDING_NOT_GOAL_MET:u64 = 9;
    const ERR_USER_NOT_CONTRIBUTED:u64 = 10;

    // Global storage structure for crowdfunding module
    struct CrowdfundingStorage has key {
        project_fundings: SmartTable<address, CrowdfundingInfo>, // Key: project ID, Value: crowdfunding info object
        user_contributed_fundings: SmartTable<address, SmartVector<address>> // Key: user address, Value: list of project IDs user contributed to
    }

    struct CrowdfundingInfo has store {
        id: address,
        funding_goal: u64,
        raised_amount: u64,
        start_time: u64,
        end_time: u64,
        has_met_funding_goal: bool,
        contributors: SmartTable<address, u64>, // Key: user address, Value: contribution amount
        crowdfunding_pool_balance: Object<FungibleStore>, // Crowdfunding pool balance
        token_created: bool,
    }


    struct CrowdfundingInfoView has copy, drop {
        id: address,
        funding_goal: u64,
        raised_amount: u64,
        start_time: u64,
        end_time: u64,
        has_met_funding_goal: bool,
        crowdfunding_pool_balance_value: u64,
        token_created: bool,
    }

    #[event]
    struct FundingSuccessfulEvent has store, drop {
        project_id: address,
        total_raised_amount: u64,
    }

    #[event]
    struct RefundClaimedEvent has store, drop {
        project_id: address,
        contributor: address,
        amount: u64
    }

    // Initialization method
    fun init_module() {
        // Initialize global storage structure
        let crowdfunding_storage = CrowdfundingStorage {
            project_fundings: smart_table::new(),
            user_contributed_fundings: smart_table::new()
        };
        // Write global storage structure to resuorce account
        move_to(&get_resource_signer(), crowdfunding_storage);
    }

    // Initialize a crowdfunding campaign
    public entry fun initialize_funding(
        account: &signer,
        project_id: address,
        funding_goal: u64,
        duration: u64,
        token: Object<Metadata>,
    ) acquires CrowdfundingStorage {
        // Verify caller has funding manager role
        assert!(is_funding_manager(account), error::permission_denied(ERR_MISSING_FUNDING_MANAGER_ROLE));
        // Check if campaign already exists
        let crowdfunding_storage = borrow_global_mut<CrowdfundingStorage>(get_resource_signer_address());
        let project_fundings = &mut crowdfunding_storage.project_fundings;
        assert!(!smart_table::contains(project_fundings, project_id), error::already_exists(ERR_FUNDING_ALREADY_INITIALIZED));
        // Validate funding goal
        assert!(funding_goal > 0, error::invalid_argument(ERR_INVALID_FUNDING_GOAL));
        // Validate duration
        assert!(duration > 0, error::invalid_argument(ERR_INVALID_DURATION));
        // Initialize crowdfunding info
        let construct_ref = object::create_object(get_resource_signer_address());
        let crowdfunding_info = CrowdfundingInfo {
            id: project_id,
            funding_goal,
            raised_amount: 0,
            start_time: timestamp::now_microseconds(),
            end_time: timestamp::now_microseconds() + duration,
            has_met_funding_goal: false,
            contributors: smart_table::new(),
            crowdfunding_pool_balance: create_store(&construct_ref, token),
            token_created: false,
        };
        // Add to global storage
        smart_table::add(project_fundings, project_id, crowdfunding_info);
    }

    // Participate in crowdfunding
    public entry fun contribute_funding(
        account: &signer,
        project_id: address,
        amount: u64
    ) acquires CrowdfundingStorage {
        let crowdfunding_storage = borrow_global_mut<CrowdfundingStorage>(get_resource_signer_address());
        let project_fundings = &mut crowdfunding_storage.project_fundings;
        let crowdfunding_info = smart_table::borrow_mut(project_fundings, project_id);
        // Verify campaign is active
        assert!(timestamp::now_microseconds() >= crowdfunding_info.start_time, error::aborted(ERR_CROWDFUNDING_NOT_STARTED));
        assert!(timestamp::now_microseconds() <= crowdfunding_info.end_time, error::aborted(ERR_CROWDFUNDING_ENDED));
        // Check funding goal not yet met
        assert!(!crowdfunding_info.has_met_funding_goal, error::not_implemented(ERR_FUNDING_GOAL_MET));
        // Process contribution
        let fa_metadata = fungible_asset::store_metadata(crowdfunding_info.crowdfunding_pool_balance);
        let user_fa_balance = primary_fungible_store::withdraw(
            account,
            fa_metadata,
            (amount as u128)
        );
        fungible_asset::deposit(
            crowdfunding_info.crowdfunding_pool_balance,
            user_fa_balance
        );
        // Update raised amount
        crowdfunding_info.raised_amount = crowdfunding_info.raised_amount + amount;
        // Update contributor records
        if (smart_table::contains(&crowdfunding_info.contributors, signer::address_of(account))) {
            let user_contribution = smart_table::borrow_mut(&mut crowdfunding_info.contributors, signer::address_of(account));
            *user_contribution = *user_contribution + amount;
        } else {
            smart_table::add(&mut crowdfunding_info.contributors, signer::address_of(account), amount);
        };
        // Update global contribution tracking
        if (smart_table::contains(&crowdfunding_storage.user_contributed_fundings, signer::address_of(account))) {
            let user_contributed_fundings = smart_table::borrow_mut(&mut crowdfunding_storage.user_contributed_fundings, signer::address_of(account));
            smart_vector::push_back(user_contributed_fundings, project_id);
        } else {
            let user_contributed_fundings = smart_vector::new<address>();
            smart_vector::push_back(&mut user_contributed_fundings, project_id);
            smart_table::add(&mut crowdfunding_storage.user_contributed_fundings, signer::address_of(account), user_contributed_fundings);
        }
        // TODO: Check if funding goal met (requires completion of project_token module)
    }

    // Claim refund for failed campaign
    public entry fun claim_refund(
        account: &signer,
        project_id: address
    ) acquires CrowdfundingStorage {
        let crowdfunding_storage = borrow_global_mut<CrowdfundingStorage>(get_resource_signer_address());
        let project_fundings = &mut crowdfunding_storage.project_fundings;
        let crowdfunding_info = smart_table::borrow_mut(project_fundings, project_id);
        // Verify campaign ended
        assert!(timestamp::now_microseconds() > crowdfunding_info.end_time, error::aborted(ERR_CROWDFUNDING_NOT_END));
        // Verify goal not met
        assert!(!crowdfunding_info.has_met_funding_goal, error::aborted(ERR_FUNDING_NOT_GOAL_MET));
        // Verify user contribution
        assert!(smart_table::contains(&crowdfunding_info.contributors, signer::address_of(account)), error::not_found(ERR_USER_NOT_CONTRIBUTED));
        // Process refund
        let user_contribution = smart_table::borrow(&crowdfunding_info.contributors, signer::address_of(account));
        let fa_refund = fungible_asset::withdraw(&get_resource_signer(), crowdfunding_info.crowdfunding_pool_balance, (*user_contribution as u128));
        primary_fungible_store::deposit(
            signer::address_of(account),
            fa_refund
        );
        // Emit event
        event::emit(RefundClaimedEvent {
            project_id,
            contributor: signer::address_of(account),
            amount: *user_contribution
        });
        // Cleanup records
        // Remove user contribution from project
        smart_table::remove(&mut crowdfunding_info.contributors, signer::address_of(account));
        // Remove project ID from user's contribution list
        let user_contributed_fundings = smart_table::borrow_mut(&mut crowdfunding_storage.user_contributed_fundings, signer::address_of(account));
        let (exists, index) = smart_vector::index_of(user_contributed_fundings, &project_id);
        if (exists) {
            smart_vector::swap_remove(user_contributed_fundings, index);
        }
    }

    // Check if user contributed to campaign
    public(friend) fun has_contributed(
        account: &signer,
        project_id: address
    ): bool acquires CrowdfundingStorage {
        let crowdfunding_storage = borrow_global<CrowdfundingStorage>(get_resource_signer_address());
        let user_contributed_fundings = smart_table::borrow(&crowdfunding_storage.user_contributed_fundings, signer::address_of(account));
        smart_vector::contains(user_contributed_fundings, &project_id)
    }


    /*====== View functions ======*/

    // Get crowdfunding campaign details
    #[view]
    public fun get_crowdfunding_info(
        project_id: address
    ): CrowdfundingInfoView acquires CrowdfundingStorage {
        let crowdfunding_storage = borrow_global<CrowdfundingStorage>(get_resource_signer_address());
        let project_fundings = &crowdfunding_storage.project_fundings;
        let crowdfunding_info = smart_table::borrow(project_fundings, project_id);
        CrowdfundingInfoView {
            id: crowdfunding_info.id,
            funding_goal: crowdfunding_info.funding_goal,
            raised_amount: crowdfunding_info.raised_amount,
            start_time: crowdfunding_info.start_time,
            end_time: crowdfunding_info.end_time,
            has_met_funding_goal: crowdfunding_info.has_met_funding_goal,
            crowdfunding_pool_balance_value: (fungible_asset::balance(crowdfunding_info.crowdfunding_pool_balance) as u64),
            token_created: crowdfunding_info.token_created,
        }
    }

    // Get user contribution amount for project
    #[view]
    public fun get_user_contribution(
        project_id: address,
        contributor: address,
    ): u64 acquires CrowdfundingStorage {
        let crowdfunding_storage = borrow_global<CrowdfundingStorage>(get_resource_signer_address());
        let project_fundings = &crowdfunding_storage.project_fundings;
        let crowdfunding_info = smart_table::borrow(project_fundings, project_id);
        *smart_table::borrow(&crowdfunding_info.contributors, contributor)
    }

    // Get all projects user contributed to
    #[view]
    public fun get_user_contributed_fundings(
        contributor: address,
    ): vector<address> acquires CrowdfundingStorage {
        let crowdfunding_storage = borrow_global<CrowdfundingStorage>(get_resource_signer_address());
        let user_contributed_fundings = smart_table::borrow(&crowdfunding_storage.user_contributed_fundings, contributor);
        smart_vector::to_vector(user_contributed_fundings)
    }

    // Get total raised amount for project
    #[view]
    public fun get_funding_raised_amount(
        project_id: address,
    ): u64 acquires CrowdfundingStorage {
        let crowdfunding_storage = borrow_global<CrowdfundingStorage>(get_resource_signer_address());
        let project_fundings = &crowdfunding_storage.project_fundings;
        let crowdfunding_info = smart_table::borrow(project_fundings, project_id);
        crowdfunding_info.raised_amount
    }
}