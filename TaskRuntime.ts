import { TaskDefinition, TaskSnapshot, t_g_TaskDef } from ".";
import { PauseController } from "./PauseController";

export class TaskRuntime {
    private readonly tasks = new Map<string, t_g_TaskDef>();
    private readonly states = new Map<string, TaskSnapshot>();
   // private readonly pauseController = new PauseController();
    private readonly abortController = new AbortController();
    private readonly maxConcurrency: number;
    private active_tid: number | null = null;

    constructor(maxConcurrency = 1) {
        if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
            throw new RangeError("maxConcurrency must be a positive integer");
        }
        this.maxConcurrency = maxConcurrency;
    };

    addTask(task: t_g_TaskDef) {
        if (this.tasks.has(task.id)) {
            throw new Error(`Task already exists: ${task.id}`);
        };

        this.tasks.set(task.id, task);
        this.states.set(task.id, {
            id: task.id,
            status: "pending"
        })
    };

    pause(): void {
        // pause the execution of tasks
        // finish processing the actual idx, then pause()
    }

    resume(): void {
        // resume processing taks
    }

    snapshots(): TaskSnapshot[] {
        return [...this.states.values()]
            .map(s => ({ ...s }));
    }

    taskSnapshot(tid: string) {
        return this.states.get(tid);
    }

    /** check if dependencies needed are inside */
    private validateDependencies(): void {
        for (const task of this.tasks.values()) {
            for (const dep of task.dependsOn ?? []) {
                if (!this.tasks.has(dep)) {
                    throw new Error(`Unknown dependency '${dep}' for '${task}'`)
                }
            }
        }
    }

    /** checks if task is ready before execution */
    private isReady(task: TaskDefinition): boolean {
        const state = this.states.get(task.id);
        return state?.status === "pending" && (task.dependsOn ?? []).every(id => this.states.get(id)?.status === "completed");
    }

    /** execute a task using task.run() */
    private async execute(task : t_g_TaskDef) : Promise<void> {
        
        const state = this.states.get(task.id)!
        this.states.set(task.id, {...state, status : "running"})
        try {
            await task.run({
                signal : this.abortController.signal,
               
                
            })
            this.states.set(task.id, {... state, status : "completed"})
        } catch(err) {
          this.states.set(task.id, {... state, status : "completed"})
          state.error = err;
        }
    }

    /** @brief runtime function, */
    private blockTasksWithFailedDependencies(): void {

    }
    async run(): Promise<void> {
        this.validateDependencies();

        const running = null; // this should take a ref of the running pcess

        while([...this.states.values()].some(s => 
            s.status === "pending" || s.status === "running"))
        {

        }

    }
}