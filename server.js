const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.static("public"));
app.use("/files", express.static(uploadDir));

app.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/");
});

app.get("/", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.send("Error reading upload directory");

    let html = `<h1>Uploaded Files Gallery</h1><ul style="list-style:none; padding:0; display:flex; flex-wrap:wrap; gap:15px;">`;

    files.forEach((file) => {
      const ext = file.split(".").pop().toLowerCase();
      if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
        html += `<li style="border:1px solid #ccc; padding:10px; text-align:center; width:150px;">
                  <a href="/files/${file}" target="_blank">
                    <img src="/files/${file}" style="max-width:100%; max-height:100px; display:block; margin-bottom:5px;" alt="${file}">
                    ${file}
                  </a>
                 </li>`;
      } else {
        html += `<li style="border:1px solid #ccc; padding:10px; text-align:center; width:150px;">
                  <a href="/files/${file}" target="_blank">${file}</a>
                 </li>`;
      }
    });

    html += `</ul>
      <h2>Upload a new file</h2>
      <form method="POST" enctype="multipart/form-data" action="/upload">
        <input type="file" name="file" required />
        <button type="submit">Upload</button>
      </form>`;

    res.send(html);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
