module buidlland::task_market {

    use std::error;
    use std::signer;
    use std::string::String;
    use std::vector;
    use endless_std::smart_table::{Self, SmartTable};
    use endless_std::smart_vector::{Self, SmartVector};
    use endless_framework::event;
    use endless_framework::fungible_asset::{Self, FungibleStore, create_store, Metadata};
    use endless_framework::object;
    use endless_framework::object::Object;
    use endless_framework::primary_fungible_store;
    use endless_framework::timestamp;
    use endless_framework::transaction_context::generate_auid_address;

    use buidlland::access_control::{is_task_creator, is_ai_agent};
    use buidlland::project::{project_exists_external, is_project_creator_external};
    use buidlland::init_resource_account::{get_resource_signer, get_resource_signer_address};

    const ERR_MISSING_TASK_CREATOR_ROLE: u64 = 1;
    const ERR_PROJECT_NOT_EXISTS: u64 = 2;
    const ERR_TASK_NOT_OPEN: u64 = 3;
    const ERR_ALREADY_APPLIED: u64 = 4;
    const ERR_TASK_NOT_ASSIGNED: u64 = 5;
    const ERR_NOT_PROJECT_CREATOR: u64 = 6;
    const ERR_TASK_ALREADY_ASSIGNED: u64 = 7;
    const ERR_TASK_NOT_IN_PROGRESS: u64 = 8;
    const ERR_APPLICANT_ADDRESS_NOT_IN_LIST: u64 = 9;
    const ERR_NOT_EXECUTOR: u64 = 10;
    const ERR_TASK_NOT_IN_COMPLETED: u64 = 8;

    const OPEN: u8 = 0;
    const ASSIGNED: u8 = 1;
    const IN_PROGRESS: u8 = 2;
    const COMPLETED: u8 = 3;
    const VERIFIED: u8 = 4;
    const CANCELLED: u8 = 5;

    // TODO: May need to add a new field --> TransferRef in create_task function
    struct Task has store {
        id: address,
        title: String,
        description: String,
        reward: Object<FungibleStore>,
        deadline: u64,
        status: u8,
        estimated_times: u64,
        assignee: address,
        applicants: SmartVector<address>,
        required_skills: vector<String>,
        created_at: u64,
        completed_at: u64,
    }


    struct TaskMarketStorage has key {
        project_tasks: SmartTable<address, SmartTable<address, Task>>, // Mapping: project id addresses -> tasks
        users_created_tasks: SmartTable<address, SmartVector<address>>, // Mapping: user addresses -> tasks created by them
        users_applied_tasks: SmartTable<address, SmartVector<address>>, // Mapping: user addresses -> tasks applied by them
    }

    #[event]
    struct TaskCreatedEvent has store, drop {
        project_id: address,
        task_id: address,
        title: String,
        reward: u64,
        required_skills: vector<String>
    }

    #[event]
    struct TaskAppliedEvent has store, drop {
        project_id: address,
        task_id: address,
        applicant: address
    }

    #[event]
    struct TaskAssignedEvent has store, drop {
        project_id: address,
        task_id: address,
        assignee: address
    }

    #[event]
    struct TaskStartedEvent has store, drop {
        project_id: address,
        task_id: address,
        task_status: u8
    }

    #[event]
    struct TaskCompletedEvent has store, drop {
        project_id: address,
        task_id: address,
        task_status: u8
    }

    #[event]
    struct TaskVerifiedEvent has store, drop {
        project_id: address,
        task_id: address,
        task_reward: u64
    }

    // Initialization method
    fun init_module() {
        // Initialize global storage structure
        let task_storage = TaskMarketStorage {
            project_tasks: smart_table::new(),
            users_created_tasks: smart_table::new(),
            users_applied_tasks: smart_table::new(),
        };
        // Write global storage structure to admin address
        move_to(&get_resource_signer(), task_storage);
    }

    // Create a task
    // TODO: Need to confirm if current project has received sponsorship (requires integration with crowdfunding module)
    public entry fun create_task(
        account: &signer,
        project_id: address,
        title: String,
        description: String,
        reward_amount: u64,
        token: Object<Metadata>,
        required_skills: vector<String>,
        deadline: u64,
        estimated_times: u64,
    )acquires TaskMarketStorage {
        let construct_ref = object::create_object(get_resource_signer_address());
        // Check if project exists
        assert!(project_exists_external(project_id), error::not_found(ERR_PROJECT_NOT_EXISTS));
        // Check if caller has permission to create tasks || or if caller's address is AI agent
        assert!(is_task_creator(account) || is_ai_agent(account), error::permission_denied(ERR_MISSING_TASK_CREATOR_ROLE));
        let fa_balance = primary_fungible_store::withdraw(
            account,
            token,
            (reward_amount as u128)
        );
        // Create task
        let task = Task {
            id: generate_auid_address(),
            title,
            description,
            reward: create_store(&construct_ref, fungible_asset::metadata_from_asset(&fa_balance)),
            deadline,
            status: OPEN,
            estimated_times,
            assignee: @0x0,
            applicants: smart_vector::new<address>(),
            required_skills,
            created_at: timestamp::now_microseconds(),
            completed_at: 0
        };
        //

        // Check if task reward is valid
        fungible_asset::deposit(
            task.reward,
            fa_balance
        );
        let reward_balance = fungible_asset::balance(task.reward);
        // Get tasks storage field from global storage
        let task_storage = borrow_global_mut<TaskMarketStorage>(get_resource_signer_address());
        // Emit task creation event
        event::emit(TaskCreatedEvent {
            project_id,
            task_id: task.id,
            title,
            reward: (reward_balance as u64),
            required_skills
        });
        // Check if this is first task creation for project
        let task_id = task.id;
        if (!smart_table::contains(&task_storage.project_tasks, project_id)) {
            let task_list = smart_table::new<address, Task>();
            smart_table::add(&mut task_list, task_id, task);
            smart_table::add(&mut task_storage.project_tasks, project_id, task_list);
        } else {
            // Not first task creation
            let task_list = smart_table::borrow_mut(&mut task_storage.project_tasks, project_id);
            smart_table::add(task_list, task_id, task);
        };
        // Check if user is creating task for first time
        if (!smart_table::contains(&task_storage.users_created_tasks, signer::address_of(account))) {
            let user_task_list = smart_vector::new<address>();
            smart_vector::push_back(&mut user_task_list, task_id);
            smart_table::add(&mut task_storage.users_created_tasks, signer::address_of(account), user_task_list);
        } else {
            // Not first task creation
            let user_task_list = smart_table::borrow_mut(&mut task_storage.users_created_tasks, signer::address_of(account));
            smart_vector::push_back(user_task_list, task_id);
        };
    }

    // Apply for a task
    public entry fun apply_task(
        account: &signer,
        project_id: address,
        task_id: address,
    ) acquires TaskMarketStorage {
        // Check if project exists
        assert!(project_exists_external(project_id), error::not_found(ERR_PROJECT_NOT_EXISTS));
        // Get tasks storage field from global storage
        let task_storage = borrow_global_mut<TaskMarketStorage>(get_resource_signer_address());
        // Get current task being applied for
        let tasks = smart_table::borrow_mut(&mut task_storage.project_tasks, project_id);
        let task = smart_table::borrow_mut(tasks, task_id);
        // Check if status is Open
        assert!(task.status == OPEN, error::invalid_state(ERR_TASK_NOT_OPEN));
        // Check if applicant already applied
        assert!(!smart_vector::contains(&task.applicants, &signer::address_of(account)), error::already_exists(ERR_ALREADY_APPLIED));
        // Add user to task's applicant list
        smart_vector::push_back(&mut task.applicants, signer::address_of(account));
        // Emit task application event
        event::emit(TaskAppliedEvent {
            project_id,
            task_id: task.id,
            applicant: signer::address_of(account)
        });
        // Check if user is applying for first task
        if (!smart_table::contains(&task_storage.users_applied_tasks, signer::address_of(account))) {
            let user_task_list = smart_vector::new<address>();
            smart_vector::push_back(&mut user_task_list, task.id);
            smart_table::add(&mut task_storage.users_applied_tasks, signer::address_of(account), user_task_list);
        } else {
            // Not first application
            let user_task_list = smart_table::borrow_mut(&mut task_storage.users_applied_tasks, signer::address_of(account));
            smart_vector::push_back(user_task_list, task.id);
        };
    }

    // Project creator assigns task
    public entry fun assign_task(
        account: &signer,
        project_id: address,
        task_id: address,
        assignee: address
    ) acquires TaskMarketStorage  {
        // Check if project exists
        assert!(project_exists_external(project_id), error::not_found(ERR_PROJECT_NOT_EXISTS));
        // Check if caller is project creator
        assert!(is_project_creator_external(account, project_id), error::permission_denied(ERR_NOT_PROJECT_CREATOR));
        // Get tasks storage field from global storage
        let task_storage = borrow_global_mut<TaskMarketStorage>(get_resource_signer_address());
        // Get current task
        let tasks = smart_table::borrow_mut(&mut task_storage.project_tasks, project_id);
        let task = smart_table::borrow_mut(tasks, task_id);
        // Check if status is Open
        assert!(task.status == OPEN, error::invalid_state(ERR_TASK_NOT_OPEN));
        // Check if selected applicant exists in task's applicant list
        assert!(smart_vector::contains(&task.applicants, &signer::address_of(account)), error::not_found(ERR_APPLICANT_ADDRESS_NOT_IN_LIST));
        // Check if task already assigned
        assert!(task.assignee == @0x0, error::already_exists(ERR_TASK_ALREADY_ASSIGNED));
        // Set task status to Assigned
        task.status = ASSIGNED;
        // Set task assignee
        task.assignee = assignee;
        // Emit task assignment event
        event::emit(TaskAssignedEvent {
            project_id,
            task_id: task.id,
            assignee
        });
    }

    // Start working on task
    public entry fun start_task(
        account: &signer,
        project_id: address,
        task_id: address,
    ) acquires TaskMarketStorage {
        // Check if project exists
        assert!(project_exists_external(project_id), error::not_found(ERR_PROJECT_NOT_EXISTS));
        // Get tasks storage field from global storage
        let task_storage = borrow_global_mut<TaskMarketStorage>(get_resource_signer_address());
        // Get current task
        let tasks = smart_table::borrow_mut(&mut task_storage.project_tasks, project_id);
        let task = smart_table::borrow_mut(tasks, task_id);
        // Check if caller is task executor
        assert!(signer::address_of(account) == task.assignee, error::permission_denied(ERR_NOT_EXECUTOR));
        // Check if task status is Assigned
        assert!(task.status == ASSIGNED, error::invalid_state(ERR_TASK_NOT_ASSIGNED));
        // Set task status to InProgress
        task.status = IN_PROGRESS;
        // Emit task start event
        event::emit(TaskStartedEvent {
            project_id,
            task_id: task.id,
            task_status: task.status
        });
    }

    // Complete a task
    public entry fun complete_task(
        account: &signer,
        project_id: address,
        task_id: address,
    ) acquires TaskMarketStorage  {
        // Check if project exists
        assert!(project_exists_external(project_id), error::not_found(ERR_PROJECT_NOT_EXISTS));
        // Get tasks storage field from global storage
        let task_storage = borrow_global_mut<TaskMarketStorage>(get_resource_signer_address());
        // Get current task
        let tasks = smart_table::borrow_mut(&mut task_storage.project_tasks, project_id);
        let task = smart_table::borrow_mut(tasks, task_id);
        // Check if status is InProgress
        assert!(task.status == IN_PROGRESS, error::invalid_state(ERR_TASK_NOT_IN_PROGRESS));
        // Check if caller is task executor
        assert!(signer::address_of(account) == task.assignee, error::permission_denied(ERR_NOT_EXECUTOR));
        // Set task status to Completed
        task.status = COMPLETED;
        // Record task completion time
        task.completed_at = timestamp::now_microseconds();
        // Emit task completion event
        event::emit(TaskCompletedEvent {
            project_id,
            task_id: task.id,
            task_status: task.status
        });
    }

    // Verify task completion
    public entry fun verify_task(
        account: &signer,
        project_id: address,
        task_id: address,
    ) acquires TaskMarketStorage  {
        // Check if project exists
        assert!(project_exists_external(project_id), error::not_found(ERR_PROJECT_NOT_EXISTS));
        // Check if caller is project creator
        assert!(is_project_creator_external(account, project_id), error::permission_denied(ERR_NOT_PROJECT_CREATOR));
        // Get tasks storage field from global storage
        let task_storage = borrow_global_mut<TaskMarketStorage>(get_resource_signer_address());
        // Get current task
        let tasks = smart_table::borrow_mut(&mut task_storage.project_tasks, project_id);
        let task = smart_table::borrow_mut(tasks, task_id);
        // Check if status is Completed
        assert!(task.status == COMPLETED, error::invalid_state(ERR_TASK_NOT_IN_COMPLETED));
        // Set task status to Verified
        task.status = VERIFIED;
        // Emit task verification event
        let reward_balance = fungible_asset::balance(task.reward);
        event::emit(TaskVerifiedEvent {
            project_id,
            task_id: task.id,
            task_reward: (reward_balance as u64)
        });
        // Transfer task reward to executor
        // TODO: something wrong here, need to check
        let fa_reward = fungible_asset::withdraw(&get_resource_signer(), task.reward, reward_balance);
        primary_fungible_store::deposit(
            signer::address_of(account),
            fa_reward
        )
    }

    /*====== view function ======*/

    // Get the task list requested by the current user
    #[view]
    public fun get_user_applied_tasks(user: address): vector<address> acquires TaskMarketStorage {
        let task_storage = borrow_global<TaskMarketStorage>(get_resource_signer_address());
        // Check whether the user has applied for the task
        if (smart_table::contains(&task_storage.users_applied_tasks, user)) {
            let user_task_list = smart_table::borrow(&task_storage.users_applied_tasks, user);
            smart_vector::to_vector(user_task_list)
        } else {
            vector::empty<address>()
        }
    }
}