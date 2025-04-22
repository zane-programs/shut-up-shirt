import express from "express";
import ViteExpress from "vite-express";
import multer from "multer";
import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import { unlink } from "node:fs/promises";

const upload = multer({ dest: "temp_uploads/" });
const app = express();

// Function to spawn and manage the Python process
function createPythonProcess(filename: string) {
  // if (pipeAll)
  const process = spawn("python", [filename], {
    stdio: ["pipe", "pipe", "pipe"],
    shell: true,
  });

  process.stdout.on("data", (data) => {
    console.log(`Python stdout: ${data}`);
  });

  process.stderr.on("data", (data) => {
    console.error(`Python stderr: ${data}`);
  });

  process.on("error", (err) => {
    console.error("Failed to start Python process:", err);
  });

  process.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
    // Restart the process if it closes unexpectedly
    if (code !== 0) {
      console.log("Restarting Python process...");
      pythonProcess = createPythonProcess(filename);
    }
  });

  return process;
}

// Initialize the Python process once when the server starts
let pythonProcess = createPythonProcess("display/stdin.py");
let serverPythonProcess = createPythonProcess("display/server.py");

// Define a delay before deleting the file (in milliseconds)
const FILE_PROCESSING_DELAY = 5000; // 5 seconds, adjust as needed

app.post("/show", upload.single("pngFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  // Path to the uploaded file
  const filePath = req.file.path;
  console.log("File uploaded:", filePath);

  try {
    // Check if process is still running
    if (pythonProcess.killed) {
      console.log("Python process was killed, restarting...");
      pythonProcess = createPythonProcess("display/stdin.py");
    }

    // Send command to the Python process via stdin
    const command = req.query.dark ? `${filePath} dark` : filePath;
    pythonProcess.stdin.write(`${command}\n`, (err) => {
      if (err) {
        console.error("Error writing to Python process:", err);
        pythonProcess = createPythonProcess("display/stdin.py");
        res.status(500).send({ message: "Error processing image" });
        return;
      }

      // Respond to client
      res.status(204).send();

      // Delete the file after a delay to give Python time to process it
      setTimeout(async () => {
        try {
          await unlink(filePath);
          console.log("Temporary file deleted after delay");
        } catch (err) {
          console.error("Error deleting temporary file:", err);
        }
      }, FILE_PROCESSING_DELAY);
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send({ message: "Server error" });

    // Clean up the uploaded file
    try {
      await unlink(filePath);
    } catch (unlink_err) {
      console.error("Error deleting temporary file:", unlink_err);
    }
  }
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Gracefully shutting down...");
  if (pythonProcess && !pythonProcess.killed) {
    pythonProcess.kill();
  }
  process.exit(0);
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
