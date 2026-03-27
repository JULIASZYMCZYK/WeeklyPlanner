require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const weeksRoutes = require("./routes/week");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Połączenie z MongoDB
mongoose.connect(process.env.DB)
  .then(() => console.log("Połączono z bazą MongoDB Atlas"))
  .catch(err => console.log("Nie można połączyć się z MongoDB Atlas. Błąd: " + err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pliki statyczne
app.use(express.static(path.join(__dirname, "public")));

// Trasy API
app.use("/api/weeks", weeksRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);

// Strona startowa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa: http://localhost:${PORT}`);
});