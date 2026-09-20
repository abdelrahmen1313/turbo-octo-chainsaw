import { TaskRuntime } from "..";

const events = [];
const runtime = new TaskRuntime(2);

runtime.addTask({
    id: "ticket",
    description: "getting a ticket",
    run: async () => { events.push("ticket"); }
});

runtime.addTask({
    id: "birthcert",
    description: "receive a birthcert",
    run: async () => { events.push("birthcert"); }
});

runtime.addTask({
    id: "sign",
    description: "sign a doc",
    dependsOn: ["ticket"],
    run: async () => { events.push("sign"); }
});

runtime.addTask({
    id: "home",
    description: "go back home",
    dependsOn: ["birthcert", "sign"],
    run: async () => { events.push("home"); }
});

runtime.pause();
const run = runtime.run();

if (events.length !== 0) throw new Error("paused runtime started working");

console.log(runtime.snapshot());
runtime.resume();
const result = await run;

if (events.join(",") !== "ticket,birthcert,sign,home") throw new Error(events.join(","));
if (result.some(task => task.status !== "completed")) throw new Error(JSON.stringify(result));
console.log("runtime check passed", events.join(" -> "));
console.log(runtime.snapshot());