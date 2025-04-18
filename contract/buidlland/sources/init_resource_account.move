module buidlland::init_resource_account {

    use std::signer;
    use endless_framework::account;
    use endless_framework::account::SignerCapability;

    friend buidlland::project;
    friend buidlland::project_token;
    friend buidlland::access_control;
    friend buidlland::task_market;
    friend buidlland::crowdfunding;

    struct PermissionConfig has key {
        signer_cap: SignerCapability
    }

    // Initialization method
    fun init_module(admin: &signer) {
        let (_res_signer, signer_cap) = account::create_resource_account(admin, b"buidlland");
        let permission_config = PermissionConfig {
            signer_cap
        };
        move_to(admin, permission_config);
    }

    // private function
    public(friend) fun get_resource_signer(): signer acquires PermissionConfig {
        let permission_config = borrow_global<PermissionConfig>(get_resource_signer_address());
        account::create_signer_with_capability(&permission_config.signer_cap)
    }

    public(friend) fun get_resource_signer_address(): address acquires PermissionConfig {
        signer::address_of(&get_resource_signer())
    }

}
