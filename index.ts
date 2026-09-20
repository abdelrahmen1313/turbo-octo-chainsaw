import { PauseController } from "./PauseController.js";

export const im_tasks = [
    "getting a ticket",
    "receive a birthcert",
    "sign a doc",
    "go back home",
    "clean the house"
];

const s_tasks: t_g_TaskDef[] = [
    {
        id: "ticket",
        r_type: 'string',
        run: () => { return "ticket" }
    }, {
        id: "birthcert",
        r_type: "string",
        run: async () => { return "birthcert" }
    }, {
        id: "sign",
        dependsOn: ["ticket"],
        run: async () => { return "signed" }
    },
    {
        id: "home",
        dependsOn: ["birthcert", "sign"],
        run: async () => { return "home" }
    }
]

export type TaskStatus = "pending" | "running" | "completed" | "failed" | "blocked";

export type TaskContext = {
    signal: AbortSignal;
    pause: PauseController;
    waitUntilResumed: () => Promise<void>;
};

export type genericTaskHandler<T> = () => void | Promise<void> | T
export type TaskHandler = (context?: TaskContext) => void | Promise<void> | any;

export type t_g_TaskDef = {
    id: string,
    r_type?: string, // add more types later
    dependsOn?: string[],
    run: Function
}

export type TaskDefinition = {
    id: string;
    description?: string;
    dependsOn?: string[];
    run: TaskHandler;
};

export type TaskSnapshot = {
    id: string;
    description?: string;
    status: TaskStatus;
    error?: unknown;
};




