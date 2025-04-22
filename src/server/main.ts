import express from "express";
import ViteExpress from "vite-express";
import multer from "multer";

const upload = multer({ dest: "temp_uploads/" }); // Set destination for uploaded files

const app = express();

app.post("/show", upload.single("pngFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  const filePath = req.file.path; // Path to the uploaded file
  console.log("File uploaded:", filePath);

  res.status(204).send(); // Send a 204 No Content response
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
