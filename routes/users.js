const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    // walidacja danych przesłanych w żądaniu
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // sprawdzenie, czy użytkownik o takim e-mailu już istnieje
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(409).send({ message: "User with given email already exists" });
    }

    // utworzenie soli do haszowania hasła
    const salt = await bcrypt.genSalt(Number(process.env.SALT));

    // zahaszowanie hasła użytkownika
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // zapis nowego użytkownika w bazie danych
    await new User({
      ...req.body,
      password: hashPassword,
    }).save();

    // zwrócenie informacji o poprawnym utworzeniu konta
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    // obsługa błędu serwera
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// eksport routera
module.exports = router;