const mongoose = require("mongoose");

// schemat jednego dnia tygodnia
const daySchema = new mongoose.Schema({
  // lista zadań na dany dzień
  tasks: [{ id: Number, text: String }],

  // lista wydarzeń na dany dzień
  events: [{ id: Number, title: String }]
});

// schemat całego tygodnia
const weekSchema = new mongoose.Schema({
  // identyfikator użytkownika, do którego należy tydzień
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // klucz identyfikujący tydzień
  weekKey: String,

  // dni tygodnia
  days: {
    monday: daySchema,
    tuesday: daySchema,
    wednesday: daySchema,
    thursday: daySchema,
    friday: daySchema,
    saturday: daySchema,
    sunday: daySchema
  }
});

// utworzenie modelu tygodnia
const Week = mongoose.model("Week", weekSchema);

// eksport modelu
module.exports = Week;
