/**
 * pause and resume the execution of a Runtime
 */
export class PauseController {
    private resumePromise: Promise<void> | null = null;
    private resolveResume: (() => void) | null = null;

    get isPaused(): boolean {
        
    }

    pause(): Promise<void> {
       
    }

    waitUntilResumed(): Promise<void> {
        return this.resumePromise ?? Promise.resolve();
    }

    resume(): void {
        
    }
}
