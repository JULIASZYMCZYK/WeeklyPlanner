const jwt = require("jsonwebtoken");

// middleware sprawdza, czy użytkownik przesłał poprawny token
module.exports = (req, res, next) => {
  try {
    // pobranie tokenu z nagłówka żądania
    const token = req.header("x-access-token");

    // jeśli token nie został przesłany, zwracany jest błąd
    if (!token) {
      return res.status(403).send({ message: "Access Denied: No token provided" });
    }

    // weryfikacja tokenu za pomocą tajnego klucza
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

    // zapisanie odkodowanych danych użytkownika w żądaniu
    req.user = decoded;

    // przejście do kolejnego middleware lub endpointu
    next();
  } catch (error) {
    // jeśli token jest niepoprawny, zwracany jest błąd
    res.status(401).send({ message: "Invalid Token" });
  }
};