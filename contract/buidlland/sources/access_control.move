module buidlland::access_control {
    use std::error;
    use std::signer;
    use std::signer::address_of;
    use std::vector;
    use endless_std::smart_table::{Self, SmartTable};
    use endless_std::smart_vector::{Self, SmartVector};
    use endless_framework::event;

    use buidlland::init_resource_account::{get_resource_signer, get_resource_signer_address};

    friend buidlland::project;
    friend buidlland::project_token;
    friend buidlland::crowdfunding;
    friend buidlland::task_market;

    // Role identifier constants
    const ADMIN_ROLE: u64 = 0;
    const PROJECT_CREATOR_ROLE: u64 = 1;
    const TASK_CREATOR_ROLE: u64 = 2;
    const FUNDING_MANAGER_ROLE: u64 = 3;
    const AI_AGENT_ROLE: u64 = 4;

    // Error codes
    const ERR_ROLE_DOES_NOT_EXIST: u64 = 0;
    const ERR_NOT_AUTHORIZED: u64 = 1;
    const ERR_ALREADY_HAS_ROLE: u64 = 2;
    const ERR_SELF_ADMIN_ASSIGNMENT: u64 = 3;
    const ERR_DOES_NOT_HAVE_ROLE: u64 = 4;

    // Main storage structure
    struct AccessControlStorage has key, store {
        // Mapping of roles to addresses
        roles: SmartTable<u64, RoleData>,
    }

    // Role data structure
    struct RoleData has store {
        members: SmartVector<address>,
        admin_role: u64
    }

    // Initialization function
    fun init_module(admin: &signer) {
        let access_control_storage = AccessControlStorage {
            roles: smart_table::new()
        };
        // Initialize admin role
        let admin_role = RoleData {
            members: smart_vector::new(),
            admin_role: ADMIN_ROLE
        };
        // Initialize project creator role
        let project_creator_role = RoleData {
            members: smart_vector::new(),
            admin_role: ADMIN_ROLE
        };
        // Initialize task creator role
        let task_creator_role = RoleData {
            members: smart_vector::new(),
            admin_role: ADMIN_ROLE
        };
        // Initialize funding manager role
        let funding_manager_role = RoleData {
            members: smart_vector::new(),
            admin_role: ADMIN_ROLE
        };
        // Initialize AI agent role
        let ai_agent_role = RoleData {
            members: smart_vector::new(),
            admin_role: ADMIN_ROLE
        };
        // Add the deployer to the admin role
        smart_vector::push_back(&mut admin_role.members, address_of(admin));
        // Initialize role data into the main storage structure
        smart_table::add(&mut access_control_storage.roles, ADMIN_ROLE, admin_role);
        smart_table::add(&mut access_control_storage.roles, PROJECT_CREATOR_ROLE, project_creator_role);
        smart_table::add(&mut access_control_storage.roles, TASK_CREATOR_ROLE, task_creator_role);
        smart_table::add(&mut access_control_storage.roles, FUNDING_MANAGER_ROLE, funding_manager_role);
        smart_table::add(&mut access_control_storage.roles, AI_AGENT_ROLE, ai_agent_role);
        // Write the main storage structure to the deployer's account
        move_to(
            &get_resource_signer(),
            access_control_storage
        )
    }

    // Grant a role to a user
    public entry fun grant_role(
        account: &signer,
        role: u64,
        member: address
    ) acquires AccessControlStorage  {
        // 1. Perform basic preparations and retrieve the roles from the main storage structure
        let signer_address = signer::address_of(account);
        let access_control_storage = borrow_global_mut<AccessControlStorage>(get_resource_signer_address());
        // 2. Check if the specified role exists
        assert!(!smart_table::contains(&access_control_storage.roles, role), error::not_found(ERR_ROLE_DOES_NOT_EXIST));
        // 3. Check if the caller is an admin
        assert!(is_admin(account, access_control_storage), error::permission_denied(ERR_NOT_AUTHORIZED));
        // 4. Check if the user already has the role
        assert!(!has_role(account, access_control_storage), error::already_exists(ERR_ALREADY_HAS_ROLE));
        // 5. Retrieve the specific role data
        let role_data = smart_table::borrow_mut(&mut access_control_storage.roles, role);
        // 6. Emit the role grant event
        event::emit(GrantRoleEvent {
            role,
            member,
            sender: signer_address
        });
        // 7. Add the user to the role
        smart_vector::push_back(&mut role_data.members, member);
    }

    // Role grant event
    #[event]
    struct GrantRoleEvent has store, drop {
        role: u64,
        member: address,
        sender: address
    }

    // Revoke a role from a user
    public entry fun revoke_role(
        account: &signer,
        role: u64,
        member: address
    ) acquires AccessControlStorage {
        // 1. Perform basic preparations and retrieve the roles from the main storage structure
        let signer_address = signer::address_of(account);
        let access_control_storage = borrow_global_mut<AccessControlStorage>(get_resource_signer_address());
        // 2. Check if the specified role exists
        assert!(!smart_table::contains(&access_control_storage.roles, role), error::not_found(ERR_ROLE_DOES_NOT_EXIST));
        // 3. Check if the caller is an admin
        assert!(is_admin(account, access_control_storage), error::permission_denied(ERR_NOT_AUTHORIZED));
        // 4. Retrieve the role data
        let role_data = smart_table::borrow_mut(&mut access_control_storage.roles, role);
        // 5. Check if the user currently has the role
        assert!(smart_vector::contains(&role_data.members, &member), error::not_found(ERR_DOES_NOT_HAVE_ROLE));
        // 6. Remove the user address from the role's member list
        let (exists, index) = smart_vector::index_of(&mut role_data.members, &member);
        if (exists) {
            smart_vector::swap_remove(&mut role_data.members, index);
        };
        // Emit the role revocation event
        event::emit(RevokeRoleEvent {
            role,
            member,
            sender: signer_address
        });
    }

    // Role revocation event
    #[event]
    struct RevokeRoleEvent has store, drop {
        role: u64,
        member: address,
        sender: address
    }

    // Add a new admin
    public entry fun add_admin(
        account: &signer,
        new_admin: address
    ) acquires AccessControlStorage {
        // 1. Perform basic preparations and retrieve the roles from the main storage structure
        let signer_address = signer::address_of(account);
        let access_control_storage = borrow_global_mut<AccessControlStorage>(get_resource_signer_address());
        // 2. Check if the caller is an admin
        assert!(is_admin(account, access_control_storage), error::permission_denied(ERR_NOT_AUTHORIZED));
        // 3. Check if the new admin address is the caller themselves
        assert!(new_admin == signer_address, error::invalid_argument(ERR_SELF_ADMIN_ASSIGNMENT));
        // 4. Retrieve the admin role data
        let admin_role_data = smart_table::borrow_mut(&mut access_control_storage.roles, ADMIN_ROLE);
        // 5. Emit the add admin event
        event::emit(AddAdminEvent {
            new_admin,
            sender: signer_address
        });
        // 6. Emit the add admin event (duplicate event emission, likely a mistake)
        event::emit(AddAdminEvent {
            new_admin,
            sender: signer_address
        });
        // 7. Add the new admin to the admin role data
        smart_vector::push_back(&mut admin_role_data.members, new_admin);
    }

    // Add admin event
    #[event]
    struct AddAdminEvent has store, drop {
        new_admin: address,
        sender: address,
    }

    // Remove an admin
    public entry fun remove_admin(
        account: &signer,
        admin: address
    ) acquires AccessControlStorage {
        // 1. Perform basic preparations and retrieve the roles from the main storage structure
        let signer_address = signer::address_of(account);
        let access_control_storage = borrow_global_mut<AccessControlStorage>(get_resource_signer_address());
        // 2. Check if the caller is an admin
        assert!(is_admin(account, access_control_storage), error::permission_denied(ERR_NOT_AUTHORIZED));
        // 3. Check if the admin to be removed is the caller themselves
        assert!(admin == signer_address, error::invalid_argument(ERR_SELF_ADMIN_ASSIGNMENT));
        // 4. Retrieve the admin role data
        let admin_role_data = smart_table::borrow_mut(&mut access_control_storage.roles, ADMIN_ROLE);
        // 5. Remove the address from the role member list
        let (exists, index) = smart_vector::index_of(&mut admin_role_data.members, &admin);
        if (exists) {
            smart_vector::swap_remove(&mut admin_role_data.members, index);
        };
        // 6. Emit the remove admin event
        event::emit(RemoveAdminEvent {
            former_admin: admin,
            sender: signer_address
        })
    }

    #[event]
    struct RemoveAdminEvent has store, drop {
        former_admin: address,
        sender: address
    }


    /*====== Permission Check Related ======*/

    // Check if the current user already has a role
    fun has_role(account: &signer, access_control_storage: &AccessControlStorage): bool {
        // 1. First check if the current user is an admin
        if (is_admin(account, access_control_storage)) {
            return true
        };
        // 2. Then check other roles sequentially
        let roles = vector[
            PROJECT_CREATOR_ROLE,
            TASK_CREATOR_ROLE,
            FUNDING_MANAGER_ROLE,
            AI_AGENT_ROLE
        ];

        // 3. Retrieve the corresponding role data
        let signer_address = signer::address_of(account);

        let i: u64 = 0;
        while (i < vector::length(&roles)) {
            let role_id = vector::pop_back(&mut roles);
            if (vector::contains(&roles, &role_id)) {
                let role_data = smart_table::borrow(&access_control_storage.roles, role_id);
                if (smart_vector::contains(&role_data.members, &signer_address)) {
                    return true
                };
            };
            i = i + 1;
        };
        false
    }

    // Check if the user is an admin
    fun is_admin(account: &signer, access_control_storage: &AccessControlStorage): bool {
        let signer_address = signer::address_of(account);
        let admin_role_data = smart_table::borrow(&access_control_storage.roles, ADMIN_ROLE);
        smart_vector::contains(&admin_role_data.members, &signer_address)
    }

    // Check if the user is an admin (External method)
    public(friend) fun is_admin_external(account: &signer): bool acquires AccessControlStorage {
        let access_control_storage = borrow_global<AccessControlStorage>(get_resource_signer_address());
        is_admin(account, access_control_storage)
    }

    // Check if the current user has the project creator role
    public(friend) fun is_project_creator(account: &signer): bool acquires AccessControlStorage {
        // 1. Perform basic preparations and retrieve the roles from the main storage structure
        let signer_address = signer::address_of(account);
        // 2. Check if the caller is an admin
        let access_control_storage = borrow_global<AccessControlStorage>(get_resource_signer_address());
        assert!(is_admin(account, access_control_storage), error::permission_denied(ERR_NOT_AUTHORIZED));
        // 3. Retrieve the project creator role data
        let project_creator_role_data = smart_table::borrow(&access_control_storage.roles, PROJECT_CREATOR_ROLE);
        // 4. Check if the current caller is a project creator
        smart_vector::contains(&project_creator_role_data.members, &signer_address)
    }

    // Check if the current user has the task creator role
    public(friend) fun is_task_creator(account: &signer): bool acquires AccessControlStorage {
        // 1. Perform basic preparations and retrieve the roles from the main storage structure
        let signer_address = signer::address_of(account);
        // 2. Check if the caller is an admin
        let access_control_storage = borrow_global<AccessControlStorage>(get_resource_signer_address());
        assert!(is_admin(account, access_control_storage), error::permission_denied(ERR_NOT_AUTHORIZED));
        // 3. Retrieve the task creator role data
        let task_creator_role_data = smart_table::borrow(&access_control_storage.roles, TASK_CREATOR_ROLE);
        // 4. Check if the current caller is a task creator
        smart_vector::contains(&task_creator_role_data.members, &signer_address)
    }

    // Check if the current user has the funding manager role
    public(friend) fun is_funding_manager(account: &signer): bool acquires AccessControlStorage {
        // 1. Perform basic preparations and retrieve the roles from the main storage structure
        let signer_address = signer::address_of(account);
        // 2. Check if the caller is an admin
        let access_control_storage = borrow_global<AccessControlStorage>(get_resource_signer_address());
        assert!(is_admin(account, access_control_storage), error::permission_denied(ERR_NOT_AUTHORIZED));
        // 3. Retrieve the funding manager role data
        let funding_manager_role_data = smart_table::borrow(&access_control_storage.roles, FUNDING_MANAGER_ROLE);
        // 4. Check if the current caller is a funding manager
        smart_vector::contains(&funding_manager_role_data.members, &signer_address)
    }

    // Check if the current user has the AI agent role
    public(friend) fun is_ai_agent(account: &signer): bool acquires AccessControlStorage {
        // 1. Perform basic preparations and retrieve the roles from the main storage structure
        let signer_address = signer::address_of(account);
        // 2. Check if the caller is an admin
        let access_control_storage = borrow_global<AccessControlStorage>(get_resource_signer_address());
        assert!(is_admin(account, access_control_storage), error::permission_denied(ERR_NOT_AUTHORIZED));
        // 3. Retrieve the AI agent role data
        let ai_agent_role_data = smart_table::borrow(&access_control_storage.roles, AI_AGENT_ROLE);
        // 4. Check if the current caller is an AI agent
        smart_vector::contains(&ai_agent_role_data.members, &signer_address)
    }
}