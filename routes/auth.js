const router = require("express").Router();
const { User } = require("../models/user");
const Joi = require("joi");
const bcrypt = require("bcrypt");

// obsługa logowania użytkownika
router.post("/", async (req, res) => {
  try {
    // schemat walidacji danych logowania
    const schema = Joi.object({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string().required().label("Password"),
    });

    // sprawdzenie poprawności danych z formularza
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // wyszukanie użytkownika po adresie e-mail
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({ message: "Invalid Email or Password" });
    }

    // porównanie wpisanego hasła z hasłem zapisanym w bazie
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send({ message: "Invalid Email or Password" });
    }

    // wygenerowanie tokenu po poprawnym logowaniu
    const token = user.generateAuthToken();

    // zwrócenie tokenu do użytkownika
    res.status(200).send({ data: token, message: "logged in successfully" });
  } catch (error) {
    // obsługa błędu serwera
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// eksport routera
module.exports = router;