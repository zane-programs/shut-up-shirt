import express from "express";
import ViteExpress from "vite-express";
import multer from "multer";
import util from "node:util";
import { exec as _exec } from "child_process";

const exec = util.promisify(_exec);

const upload = multer({ dest: "temp_uploads/" });

const app = express();

app.post("/show", upload.single("pngFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  // Path to the uploaded file
  const filePath = req.file.path;
  console.log("File uploaded:", filePath);

  // Execute the Python script with the file path
  await exec(`python show.py ${filePath}${req.query.dark ? " dark" : ""}`);
  console.log("Python script executed");

  res.status(204).send();
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
