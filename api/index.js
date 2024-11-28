const express = require("express");
const multer = require("multer");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { v4 } = require("uuid");
const { exec } = require("child_process");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_KEY_SECRET,
  },
});

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

let _filename = "";

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    _filename = `${Date.now()}-${file.originalname}`;
    cb(null, _filename);
  },
});

const upload = multer({ storage });

// Middleware to parse JSON
app.use(express.json());

async function uploadFilesInDirectory(dirPath, baseDir = "converted") {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(baseDir, fullPath);

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await uploadFilesInDirectory(fullPath, baseDir); // Make sure to wait for the directory upload
    } else {
      // Upload the content
      console.log(`Uploading ${relativePath}`);
      const fileStream = fs.createReadStream(fullPath);

      try {
        const command = new PutObjectCommand({
          Bucket: "mytestingvideostorage",
          Key: `videos/${relativePath}`,
          Body: fileStream,
        });
        const data = await client.send(command);
        console.log("Upload successful:", data);
      } catch (e) {
        console.error("Upload error:", e);
      } finally {
        console.log("Finished processing:", relativePath);
      }
    }
  }
}

const convertAndUpload = async (_path, uid) => {
  // execute the bash script and then upload the content
  console.log("Converting the video");
  fs.mkdirSync(path.join(__dirname, "converted", uid));
  exec(`bash convert.sh ${_path} converted/${uid} `, (err, stdout, stderr) => {
    if (err) {
      console.error("Cannot convert", err);
      return;
    }
    console.log("Sucessfully converted the video");
    // Adding to the database
    axios.post(
      "http://localhost:9999/videos/",
      {
        id: uid,
        path: `streams/${uid}/master.m3u8`,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    // Uploading to the AWS Buckets.
    uploadFilesInDirectory(path.join(__dirname, "converted", uid));
  });
};

// Route to handle video upload
app.post("/upload", upload.single("video"), (req, res) => {
  try {
    res.status(200).json({
      message: "Video uploaded successfully!",
      filePath: req.file.path,
    });
    // if OKAY
    convertAndUpload(path.join(__dirname, "uploads", _filename), v4());
  } catch (error) {
    res.status(500).json({ message: "Failed to upload video." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
