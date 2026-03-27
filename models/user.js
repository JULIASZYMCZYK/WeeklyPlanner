const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// schemat użytkownika w bazie danych
const userSchema = new mongoose.Schema(
  {
    // imię użytkownika
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    // nazwisko użytkownika
    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    // adres e-mail użytkownika
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // hasło użytkownika
    password: {
      type: String,
      required: true,
    },
  },
  // automatyczne dodawanie dat utworzenia i edycji
  { timestamps: true }
);

// metoda generująca token logowania
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    // do tokenu zapisywane jest id użytkownika
    { _id: this._id },
    process.env.JWTPRIVATEKEY,
    // token będzie ważny przez 7 dni
    { expiresIn: "7d" }
  );
};

// utworzenie modelu użytkownika
const User = mongoose.model("User", userSchema);

// funkcja walidująca dane użytkownika
const validate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),

    lastName: Joi.string().required().label("Last Name"),

    email: Joi.string().email().required().label("Email"),

    // walidacja hasła według zasad z joi-password-complexity
    password: passwordComplexity().required().label("Password"),
  });
  
  return schema.validate(data);
};

// eksport modelu i funkcji walidującej
module.exports = { User, validate };