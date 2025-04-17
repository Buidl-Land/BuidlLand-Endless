export const MODULE_ADDRESS = "DeVxevTavnPSMhDRfngXHipjNUMAWW7cBb2JHrtnRDM1" // 替换为实际部署地址

export const MockCrowdfundingModule = {
  MODULE_NAME: "mock_crowfunding",
  
  FUNCTIONS: {
    // 核心功能
    CONTRIBUTE_FUNDING: "contribute_funding",
    DEPOSIT_FUNDING: "deposit_funding",
    CREATE_TASK: "create_task",
    ASSIGN_TASK: "assign_task",
    START_TASK: "start_task",

    // 视图函数
    GET_TASK_STATE: "get_task_state",
    GET_CROWD_FUNDING: "get_crowd_funding",
    GET_CROWD_FUNDING_V2: "get_crowd_funding_v2",
    GET_USER_ASSIGN_TASK: "get_user_assign_task",
    GET_TASK_INFO: "get_task_info"
  },
  
  EVENTS: {
    // 注意：代码中实际只有两个事件类型
    TASK_CREATED: "TaskCreatedEvent",
    TASK_STARTED: "TaskStartedEvent" // 同时用于 ASSIGNED/IN_PROGRESS 状态变更
  },
  
  STRUCT: {
    CROWD_FUNDING: "CrowdFunding",
    TASK: "Task",
    TASK_VIEW: "TaskView" // get_task_info 返回的结构
  }
} as const;

export const TaskStatus = {
  OPEN: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2
} as const;

export const Errors = {
  TASK_NOT_ASSIGNED: 0 // 对应 ERR_TASK_NOT_ASSIGNED
} as const;

export const CoinType = {
  // 需要根据实际使用的代币元数据替换
  USDC: "9pJLjGhNicW46u71LGX8q1MFGY2bFtfKTnmARU5z5Gvo" // 示例占位符
} as const;