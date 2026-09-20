import { TaskSnapshot, t_g_TaskDef } from "./index.js";

export class TaskRuntime {
    private readonly tasks = new Map<string, t_g_TaskDef>();
    private readonly states = new Map<string, TaskSnapshot>();
    private readonly abortController = new AbortController();
    private readonly maxConcurrency: number;

    constructor(maxConcurrency = 1) {
        if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
            throw new RangeError("maxConcurrency must be a positive integer");
        }
        this.maxConcurrency = maxConcurrency;
    }

    addTask(task: t_g_TaskDef) {
        if (this.tasks.has(task.id)) {
            throw new Error(`Task already exists: ${task.id}`);
        };

        this.tasks.set(task.id, task);
        this.states.set(task.id, {
            id: task.id,
            status: "pending"
        })
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
    private isReady(task: t_g_TaskDef): boolean {
        const state = this.states.get(task.id);
        return state?.status === "pending" && (task.dependsOn ?? []).every(id => this.states.get(id)?.status === "completed");
    }

    private async execute(task: t_g_TaskDef): Promise<void> {
        this.states.set(task.id, { ...this.states.get(task.id)!, status: "running" });
        try {
            await task.run({ signal: this.abortController.signal });
            this.states.set(task.id, { ...this.states.get(task.id)!, status: "completed" });
        } catch (error) {
            this.states.set(task.id, { ...this.states.get(task.id)!, status: "failed", error });
        }
    }

    /** @brief runtime function, */
    private blockTasksWithFailedDependencies(): void {
        for (const task of this.tasks.values()) {
            const state = this.states.get(task.id)!;
            const dependencies = (task.dependsOn ?? []).map(id => this.states.get(id)!);
            if (state.status === "pending" && dependencies.some(dep => dep.status === "failed" || dep.status === "blocked")) {
                this.states.set(task.id, { ...state, status: "blocked" });
            }
        }
    }
    async run(): Promise<TaskSnapshot[]> {
        this.validateDependencies();
        const running = new Set<Promise<void>>();

        while([...this.states.values()].some(s => 
            s.status === "pending" || s.status === "running"))
        {
            this.blockTasksWithFailedDependencies();
            for (const task of this.tasks.values()) {
                if (running.size >= this.maxConcurrency || !this.isReady(task)) continue;
                const execution = this.execute(task);
                running.add(execution);
                execution.finally(() => running.delete(execution));
            }

            if (running.size === 0) {
                throw new Error("No runnable tasks remain; check task dependencies");
            }
            await Promise.race(running);
        }

        return this.snapshots();
    }
}