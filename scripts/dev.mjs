import { spawn } from "node:child_process";

const jobs = [
  spawn("npm", ["run", "dev", "-w", "backend"], { stdio: "inherit" }),
  spawn("npm", ["run", "dev", "-w", "frontend"], { stdio: "inherit" }),
];

let stopping = false;
function stop(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  jobs.forEach((job) => job.kill(signal));
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));

jobs.forEach((job) =>
  job.on("exit", (code) => {
    if (!stopping) {
      stop();
      process.exitCode = code ?? 1;
    }
  }),
);
