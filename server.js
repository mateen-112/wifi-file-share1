const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const uploadDir = "uploads";
const DELETE_PASSWORD = "WDD"; // 🔐 CHANGE THIS

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.use("/files", express.static(uploadDir));

/* -------- UPLOAD -------- */
app.post("/upload", upload.single("file"), (req, res) => {
  res.redirect("/");
});

/* -------- DELETE (PASSWORD PROTECTED) -------- */
app.delete("/delete/:file", (req, res) => {
  const { password } = req.body;

  if (password !== DELETE_PASSWORD) {
    return res.status(403).json({ message: "Wrong password" });
  }

  const filePath = path.join(uploadDir, path.basename(req.params.file));

  fs.unlink(filePath, err => {
    if (err) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json({ message: "File deleted successfully" });
  });
});

/* -------- GALLERY -------- */
app.get("/", (req, res) => {
  const files = fs.readdirSync(uploadDir);

  let html = `
  <h1>Uploaded Files Gallery</h1>

  <ul style="list-style:none;display:flex;gap:15px;flex-wrap:wrap;">
  `;

  files.forEach(file => {
    const ext = file.split(".").pop().toLowerCase();
    const isImg = ["jpg","jpeg","png","gif"].includes(ext);

    html += `
    <li style="border:1px solid #ccc;padding:10px;width:180px;text-align:center;">
      <a href="/files/${file}" target="_blank">
        ${isImg ? `<img src="/files/${file}" style="max-width:100%;max-height:100px;">` : ""}
        <div style="font-size:12px;word-break:break-all;">${file}</div>
      </a>
      <button style="margin-top:5px;color:red"
        onclick="deleteFile('${file}')">Delete</button>
    </li>`;
  });

  html += `
  </ul>

  <h2>Upload a new file</h2>
  <form method="POST" enctype="multipart/form-data" action="/upload">
    <input type="file" name="file" required>
    <button type="submit">Upload</button>
  </form>

  <script>
    function deleteFile(file) {
      const password = prompt("Enter delete password:");
      if (!password) return;

      fetch("/delete/" + file, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        if (data.message.includes("success")) {
          location.reload();
        }
      });
    }
  </script>
  `;

  res.send(html);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running");
});
