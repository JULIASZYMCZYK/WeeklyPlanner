const mongoose = require("mongoose");

// połączenie z bazą danych
module.exports = async () => {
  try {
    // próba połączenia z MongoDB
    await mongoose.connect(process.env.DB, {
      dbName: "plannerDB", // nazwa bazy danych
    });

    console.log("Connected to database successfully");
  } catch (error) {
    // błąd połączenia z bazą
    console.error("Could not connect database!", error.message);

    // zakończenie procesu, żeby aplikacja nie działała bez bazy
    process.exit(1);
  }
};
