import express from "express";
import ViteExpress from "vite-express";
import { spawn } from "child_process";
import { isPi } from "./utils/is-pi";

const app = express();

if (isPi) {
  console.log("Running on Raspberry Pi, starting Python process...");

  // Function to spawn and manage the Python process
  function createPythonProcess(filename: string) {
    // if (pipeAll)
    const pp = spawn("python", [filename], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    pp.on("spawn", () => {
      console.log("Python process started");
    });

    pp.stdout.on("data", (data) => {
      console.log(`Python stdout: ${data}`);
    });

    pp.stderr.on("data", (data) => {
      console.error(`Python stderr: ${data}`);
    });

    pp.on("error", (err) => {
      console.error("Failed to start Python process:", err);
    });

    pp.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
      // Restart the process if it closes unexpectedly
      if (code !== 0) {
        console.log("Restarting Python process...");
        pythonProcess = createPythonProcess(filename);
      }
    });

    return pp;
  }

  // Initialize the Python process once when the server starts
  let pythonProcess = createPythonProcess("show.py");

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("Gracefully shutting down...");
    if (pythonProcess && !pythonProcess.killed) {
      pythonProcess.kill();
    }
    process.exit(0);
  });
} else {
  console.log("Not running on Raspberry Pi, skipping Python process.");
}

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
