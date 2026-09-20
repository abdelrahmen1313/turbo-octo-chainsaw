export const im_tasks = [
    "getting a ticket",
    "receive a birthcert",
    "sign a doc",
    "go back home",
    "clean the house"
];

export type PreloadedFunction<TArgs extends readonly unknown[] = any[]> = {
    id: string;
    r_type: string;
    args: TArgs;
    body: (...args: TArgs) => unknown;
    dependsOn?: string[];
};

export type t_fn = PreloadedFunction<any[]>;

export type WorkflowFactory<TResources> = (
    resources: TResources
) => Record<string, PreloadedFunction>;

export function createRuntimeTasks<TResources>(
    services: Record<string, Record<string, WorkflowFactory<TResources>>>,
    service: string,
    context: string,
    resources: TResources
): t_g_TaskDef[] {
    const workflowFactory = services[service]?.[context];
    if (!workflowFactory) {
        throw new Error(`Unknown workflow '${service}.${context}'`);
    }

    return Object.values(workflowFactory(resources)).map(action => ({
        id: action.id,
        r_type: action.r_type,
        dependsOn: action.dependsOn,
        run: () => action.body(...action.args),
        status: "pending" as const
    }));
}

let loadedActions: Record<string, t_fn> = {

    "getting_a_ticket": {
        id: "get_a_ticket",
        r_type: "string",
        args : [],
        body: function () { return "ticket" }
    },

    "sum_of_numbers": {
        id: "sum_of_numbers",
        r_type: "number",
        args : [],
        body: function (...nums: number[]) {
            return nums.reduce((total, current) => {
                return total + current;
            }, 0);
        }
    }
}



const s_tasks: t_g_TaskDef[] = [
    {
        id: "ticket",
        r_type: 'string',
        status: 'pending',
        run: () => { return "ticket" }
    }, {
        id: "birthcert",
        r_type: "string",
        status: 'pending',
        run: async () => { return "birthcert" }
    }, {
        id: "sign",
        dependsOn: ["ticket"],
        status: 'pending',
        run: async () => { return "signed" }
    },
    {
        id: "home",
        dependsOn: ["birthcert", "sign"],
        status: 'pending',

        run: async () => { return "home" }
    }
]

export type TaskStatus = "pending" | "running" | "completed" | "failed" | "blocked";

export type TaskContext = {
    signal: AbortSignal;
};

export type genericTaskHandler<T> = (context: TaskContext) => void | Promise<void> | T;
export type TaskHandler = (context: TaskContext) => void | Promise<void> | unknown;

export type t_g_TaskDef = {
    id: string,
    r_type?: string, // add more types later
    dependsOn?: string[],
    run: TaskHandler,
    status?: TaskStatus
}



export type TaskSnapshot = {
    id: string;
    description?: string;
    status: TaskStatus;
    error?: unknown;
};




