module buidlland::project {

    use std::error;
    use std::signer;
    use std::string::String;
    use endless_std::smart_table::{Self, SmartTable};
    use endless_std::smart_vector::{Self, SmartVector};
    use endless_framework::event;
    use endless_framework::timestamp;
    use endless_framework::transaction_context::generate_auid_address;

    use buidlland::access_control::{is_project_creator, is_admin_external};
    use buidlland::init_resource_account::{get_resource_signer, get_resource_signer_address};

    friend buidlland::task_market;

    // Error codes
    const ERR_MISSING_PROJECT_CREATOR_ROLE: u64 = 1;
    const ERR_NOT_PROJECT_CREATOR_OR_ADMIN: u64 = 2;
    const ERR_NOT_PROJECT_CREATOR: u64 = 3;
    const ERR_PROJECT_NOT_IN_DRAFT: u64 = 4;
    const ERR_PROJECT_NOT_FOUND: u64 = 5;

    // ====== Project Status ======
    const DRAFT: u8 = 0;
    const ACTIVE: u8 = 1;
    const FUNDED: u8 = 2;
    const COMPLETED: u8 = 3;
    const FAILED: u8 = 4;
    const CANCELLED: u8 = 5;

    // Project structure
    struct Project has key, store {
        id: address,
        creator: address,
        title: String,
        description: String,
        tags: vector<String>,
        metadata: ProjectMetadata,
        status: u8,
        created_at: u64,
        updated_at: u64
    }

    // Project view structure
    struct ProjectView has copy, store {
        project_id: address,
        creator: address,
        title: String,
        description: String,
        tags: vector<String>,
        metadata: ProjectMetadataView,
        status: u8,
        created_at: u64,
        updated_at: u64
    }

    // Project metadata
    struct ProjectMetadata has store {
        ai_evaluation: String,
        market_score: u64,
        tech_feashibility: u64,
        min_valuation: u64,
        max_valuation: u64
    }

    struct ProjectMetadataView has copy, store {
        ai_evaluation: String,
        market_score: u64,
        tech_feashibility: u64,
        min_valuation: u64,
        max_valuation: u64
    }

    // Global storage structure for projects
    struct ProjectStorage has key {
        projects: SmartTable<address, Project>, // Key is the Project ID, value is the detailed Project information
        users_created_projects: SmartTable<address, SmartVector<address>> // Key is the user address, value is the list of project IDs created by the user
    }

    // Project creation event structure
    #[event]
    struct ProjectCreatedEvent has store, drop {
        project_id: address,
        creator: address,
        title: String,
        created_at: u64
    }

    // Project update event structure
    #[event]
    struct ProjectUpdatedEvent has store, drop {
        project_id: address,
        title: String,
        status: u8,
        updated_at: u64
    }

    // Project status update event structure
    #[event]
    struct ProjectStatusUpdatedEvent has store, drop {
        project_id: address,
        old_status: u8,
        new_status: u8
    }

    // Initialization function
    fun init_moduel() {
        // Initialize the main storage structure for projects
        let project_storage = ProjectStorage {
            projects: smart_table::new(),
            users_created_projects: smart_table::new()
        };
        // Move the main storage structure to global storage
        move_to(&get_resource_signer(), project_storage);
    }

    // Function to create a project
    public entry fun create_project(
        account: &signer,
        title: String,
        description: String,
        tags: vector<String>,
        ai_evaluation: String,
        market_score: u64,
        tech_feashibility: u64,
        min_valuation: u64,
        max_valuation: u64,
    ) acquires ProjectStorage  {
        // Check if the caller has the project creator role
        assert!(is_project_creator(account), error::permission_denied(ERR_MISSING_PROJECT_CREATOR_ROLE));
        // Get the global storage for projects
        let project_storage = borrow_global_mut<ProjectStorage>(get_resource_signer_address());
        // Create a new project
        let project = Project {
            id: generate_auid_address(),
            creator: signer::address_of(account),
            title,
            description,
            tags,
            metadata: ProjectMetadata {
                ai_evaluation,
                market_score,
                tech_feashibility,
                min_valuation,
                max_valuation
            },
            status: DRAFT,
            created_at: timestamp::now_microseconds(),
            updated_at: timestamp::now_microseconds()
        };
        // Emit the project creation event
        event::emit(ProjectCreatedEvent {
            project_id: project.id,
            creator: project.creator,
            title: project.title,
            created_at: project.created_at
        });
        // Store the project in the global project storage
        let project_id = project.id;
        smart_table::add(&mut project_storage.projects, project_id, project);
        // Is this the first time you create a project
        if (!smart_table::contains(&project_storage.users_created_projects, signer::address_of(account))) {
            let project_list = smart_vector::new<address>();
            smart_vector::push_back(&mut project_list, project_id);
            smart_table::add(&mut project_storage.users_created_projects, signer::address_of(account), project_list);
        } else {
            // This is not the first time you create a project
            let project_list = smart_table::borrow_mut(&mut project_storage.users_created_projects, signer::address_of(account));
            smart_vector::push_back(project_list, project_id);
        }
    }

    // Update project information
    public entry fun update_project(
        account: &signer,
        project_id: address,
        title: String,
        description: String,
        tags: vector<String>,
    ) acquires ProjectStorage {
        // Retrieve project storage
        let project_storage = borrow_global_mut<ProjectStorage>(get_resource_signer_address());
        // Check if the project exists
        assert!(project_exists(project_storage, project_id), error::not_found(ERR_PROJECT_NOT_FOUND));
        // Retrieve the project
        let project = smart_table::borrow_mut(&mut project_storage.projects, project_id);
        // Check if the caller is the project creator or an admin
        assert!(project.creator != signer::address_of(account) || is_admin_external(account), error::permission_denied(ERR_NOT_PROJECT_CREATOR_OR_ADMIN));
        // Check if the current project is in Draft status
        assert!(project.status == DRAFT, error::invalid_state(ERR_PROJECT_NOT_IN_DRAFT));
        // Update the project
        project.title = title;
        project.description = description;
        project.tags = tags;
        project.updated_at = timestamp::now_microseconds();
        // Emit a project update event
        event::emit(ProjectUpdatedEvent {
            project_id,
            title: project.title,
            status: project.status,
            updated_at: project.updated_at
        });
    }

    // Update project metadata
    public entry fun update_project_metadata(
        account: &signer,
        project_id: address,
        ai_evaluation: String,
        market_score: u64,
        tech_feashibility: u64,
        min_valuation: u64,
        max_valuation: u64
    ) acquires ProjectStorage {
        // Retrieve the global project storage
        let project_storage = borrow_global_mut<ProjectStorage>(get_resource_signer_address());
        // Check if the current project exists
        assert!(project_exists(project_storage, project_id), error::not_found(ERR_PROJECT_NOT_FOUND));
        // Check if the caller is the project creator
        let project = smart_table::borrow_mut(&mut project_storage.projects, project_id);
        assert!(project.creator == signer::address_of(account), error::permission_denied(ERR_MISSING_PROJECT_CREATOR_ROLE));
        // Update the project metadata
        project.metadata.ai_evaluation = ai_evaluation;
        project.metadata.market_score = market_score;
        project.metadata.tech_feashibility = tech_feashibility;
        project.metadata.min_valuation = min_valuation;
        project.metadata.max_valuation = max_valuation;
        project.updated_at = timestamp::now_microseconds();
    }

    // Check if a project exists
    fun project_exists(
        project_storage: &ProjectStorage,
        project_id: address
    ): bool {
        smart_table::contains(&project_storage.projects, project_id)
    }

    // Check if the caller is the project creator
    public(friend) fun is_project_creator_external(
        account: &signer,
        project_id: address
    ): bool acquires ProjectStorage {
        let project_storage = borrow_global<ProjectStorage>(get_resource_signer_address());
        let project_creators = smart_table::borrow(&project_storage.users_created_projects, signer::address_of(account));
        smart_vector::contains(project_creators, &project_id)
    }

    // Check if a project exists (external)
    public(friend) fun project_exists_external(
        project_id: address
    ): bool acquires ProjectStorage {
        let project_storage = borrow_global<ProjectStorage>(get_resource_signer_address());
            smart_table::contains(&project_storage.projects, project_id)
    }

    // Method to update project status
    public entry fun update_project_status(
        account: &signer,
        project_id: address,
        new_status: u8,
    ) acquires ProjectStorage {
        // Retrieve the global project storage
        let project_storage = borrow_global_mut<ProjectStorage>(get_resource_signer_address());
        // Check if the current project exists
        assert!(project_exists(project_storage, project_id), error::not_found(ERR_PROJECT_NOT_FOUND));
        // Check if the caller is the project creator
        let project = smart_table::borrow_mut(&mut project_storage.projects, project_id);
        assert!(project.creator == signer::address_of(account), error::permission_denied(ERR_MISSING_PROJECT_CREATOR_ROLE));
        // Update the project status
        let old_status = project.status;
        if (new_status == DRAFT) {
            project.status = DRAFT;
        } else if (new_status == ACTIVE) {
            project.status = ACTIVE;
        } else if (new_status == FUNDED) {
            project.status = FUNDED;
        } else if (new_status == COMPLETED) {
            project.status = COMPLETED;
        } else if (new_status == FAILED) {
            project.status = FAILED;
        } else if (new_status == CANCELLED) {
            project.status = CANCELLED;
        };
        // Emit a project status update event
        event::emit(ProjectStatusUpdatedEvent {
            project_id,
            old_status,
            new_status: project.status
        });
    }

    /*====== view function ======*/
    #[view]
    public fun get_project(
        project_id: address
    ): ProjectView acquires ProjectStorage  {
        // Get the global project storage
        let project_storage = borrow_global<ProjectStorage>(get_resource_signer_address());
        // Check if the item exists
        assert!(project_exists(project_storage, project_id), error::not_found(ERR_PROJECT_NOT_FOUND));
        // Get a project from the project store
        let project = smart_table::borrow(&project_storage.projects, project_id);
        // Constructs and returns an item view
        ProjectView {
            project_id: project.id,
            creator: project.creator,
            title: project.title,
            description: project.description,
            tags: project.tags,
            metadata: ProjectMetadataView {
                ai_evaluation: project.metadata.ai_evaluation,
                market_score: project.metadata.market_score,
                tech_feashibility: project.metadata.tech_feashibility,
                min_valuation: project.metadata.min_valuation,
                max_valuation: project.metadata.max_valuation
            },
            status: project.status,
            created_at: project.created_at,
            updated_at: project.updated_at
        }
    }

    // Get list of projects created by user
    #[view]
    public fun get_user_created_projects(
        user: address
    ): vector<address> acquires ProjectStorage {
        // Access global project storage
        let project_storage = borrow_global<ProjectStorage>(get_resource_signer_address());
        // Retrieve list of project IDs created by the user
        let project_ids = smart_table::borrow(&project_storage.users_created_projects, user);
        // Convert SmartVector to regular vector
        let user_created_projects_id = smart_vector::to_vector(project_ids);
        user_created_projects_id
    }

    // Get total count of created projects
    #[view]
    public fun get_total_projects_count(): u64 acquires ProjectStorage {
        // Access global project storage
        let project_storage = borrow_global<ProjectStorage>(get_resource_signer_address());
        // Retrieve number of projects in project storage
        smart_table::length(&project_storage.projects)
    }
}