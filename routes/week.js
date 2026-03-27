// utworzenie routera express
const router = require("express").Router();

// import modelu tygodnia
const Week = require("../models/week");

// import middleware sprawdzającego token
const auth = require("../middleware/auth");

// funkcje pomocnicze
// sprawdzenie poprawnego formatu tygodnia
function isValidWeekFormat(week) {
  return /^\d{2}\.\d{2}\.\d{4}-\d{2}\.\d{2}\.\d{4}$/.test(week);
}

// lista poprawnych nazw dni tygodnia
const validDays = [
  "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday", "sunday"
];

// sprawdzenie poprawności tekstu zadania
function isValidText(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 200;
}

// sprawdzenie poprawności nazwy wydarzenia
function isValidTitle(value) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 200;
}

// użycie middleware autoryzacji dla wszystkich tras
router.use(auth);

// pobieranie wszystkich tygodni użytkownika
router.get("/", async (req, res) => {
  try {
    // pobranie tygodni przypisanych do zalogowanego użytkownika
    const weeksFromDb = await Week.find({ userId: req.user._id });
    const result = {};

    // zapisanie tygodni do obiektu wynikowego
    weeksFromDb.forEach(w => {
      result[w.weekKey] = w.days;
    });

    // zwrócenie tygodni
    res.status(200).json(result);
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd pobierania tygodni" });
  }
});

// tworzenie nowego tygodnia
router.post("/:week", async (req, res) => {
  try {
    // pobranie klucza tygodnia z adresu
    const weekKey = req.params.week;

    // sprawdzenie formatu tygodnia
    if (!isValidWeekFormat(weekKey)) {
      return res.status(400).end();
    }

    // sprawdzenie, czy tydzień już istnieje
    const exists = await Week.findOne({ weekKey, userId: req.user._id });
    if (exists) {
      return res.status(409).json({ error: "Tydzień już istnieje" });
    }

    // utworzenie pustych dni tygodnia
    const days = {};
    validDays.forEach(d => {
      days[d] = { tasks: [], events: [] };
    });

    // zapisanie nowego tygodnia w bazie
    await Week.create({ userId: req.user._id, weekKey, days });

    // zwrócenie informacji o utworzeniu tygodnia
    res.status(201).json({ message: "Tydzień utworzony" });
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd tworzenia tygodnia" });
  }
});

// usuwanie tygodnia
router.delete("/:week", async (req, res) => {
  try {
    // pobranie klucza tygodnia z adresu
    const weekKey = req.params.week;

    // usunięcie tygodnia użytkownika
    const result = await Week.deleteOne({ weekKey, userId: req.user._id });

    // jeśli nie znaleziono tygodnia, zwracany jest błąd
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Nie znaleziono tygodnia" });
    }

    // zwrócenie informacji o usunięciu
    res.status(204).end();
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd usuwania tygodnia" });
  }
});

// pobieranie zadań z wybranego dnia
router.get("/:week/days/:day", async (req, res) => {
  try {
    // pobranie parametrów z adresu
    const { week, day } = req.params;

    // sprawdzenie poprawności dnia
    if (!validDays.includes(day)) {
      return res.status(400).end();
    }

    // wyszukanie tygodnia użytkownika
    const weekDoc = await Week.findOne({ weekKey: week, userId: req.user._id });
    if (!weekDoc) {
      return res.status(404).end();
    }

    // zwrócenie listy zadań
    res.status(200).json(weekDoc.days[day].tasks);
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd pobierania zadań" });
  }
});

// dodawanie nowego zadania
router.post("/:week/days/:day", async (req, res) => {
  try {
    // pobranie parametrów z adresu
    const { week, day } = req.params;

    // sprawdzenie poprawności dnia
    if (!validDays.includes(day)) {
      return res.status(400).end();
    }

    // sprawdzenie poprawności treści zadania
    if (!isValidText(req.body.text)) {
      return res.status(400).json({ error: "Niepoprawna treść zadania" });
    }

    // wyszukanie tygodnia użytkownika
    const weekDoc = await Week.findOne({ weekKey: week, userId: req.user._id });
    if (!weekDoc) {
      return res.status(404).end();
    }

    // pobranie listy zadań z wybranego dnia
    const tasks = weekDoc.days[day].tasks;

    // nadanie nowego id zadaniu
    const id = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

    // dodanie zadania do listy
    tasks.push({ id, text: req.body.text.trim() });
    await weekDoc.save();

    // zwrócenie informacji o dodaniu
    res.status(201).end();
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd dodawania zadania" });
  }
});

// edycja zadania
router.put("/:week/days/:day/:taskId", async (req, res) => {
  try {
    // pobranie parametrów z adresu
    const { week, day, taskId } = req.params;

    // sprawdzenie poprawności dnia
    if (!validDays.includes(day)) {
      return res.status(400).end();
    }

    // sprawdzenie poprawności treści zadania
    if (!isValidText(req.body.text)) {
      return res.status(400).json({ error: "Niepoprawna treść zadania" });
    }

    // wyszukanie tygodnia użytkownika
    const weekDoc = await Week.findOne({ weekKey: week, userId: req.user._id });
    if (!weekDoc) {
      return res.status(404).end();
    }

    // wyszukanie zadania po id
    const task = weekDoc.days[day].tasks.find(t => t.id === Number(taskId));
    if (!task) {
      return res.status(404).end();
    }

    // aktualizacja treści zadania
    task.text = req.body.text.trim();
    await weekDoc.save();

    // zwrócenie informacji o edycji
    res.status(200).end();
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd edycji zadania" });
  }
});

// usuwanie zadania
router.delete("/:week/days/:day/:taskId", async (req, res) => {
  try {
    // pobranie parametrów z adresu
    const { week, day, taskId } = req.params;

    // sprawdzenie poprawności dnia
    if (!validDays.includes(day)) {
      return res.status(400).end();
    }

    // wyszukanie tygodnia użytkownika
    const weekDoc = await Week.findOne({ weekKey: week, userId: req.user._id });
    if (!weekDoc) {
      return res.status(404).end();
    }

    // usunięcie zadania z listy
    weekDoc.days[day].tasks = weekDoc.days[day].tasks.filter(
      t => t.id !== Number(taskId)
    );
    await weekDoc.save();

    // zwrócenie informacji o usunięciu
    res.status(204).end();
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd usuwania zadania" });
  }
});

// pobieranie wydarzeń z wybranego dnia
router.get("/:week/days/:day/events", async (req, res) => {
  try {
    // pobranie parametrów z adresu
    const { week, day } = req.params;

    // sprawdzenie poprawności dnia
    if (!validDays.includes(day)) {
      return res.status(400).end();
    }

    // wyszukanie tygodnia użytkownika
    const weekDoc = await Week.findOne({ weekKey: week, userId: req.user._id });
    if (!weekDoc) {
      return res.status(404).end();
    }

    // zwrócenie listy wydarzeń
    res.status(200).json(weekDoc.days[day].events);
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd pobierania wydarzeń" });
  }
});

// dodawanie nowego wydarzenia
router.post("/:week/days/:day/events", async (req, res) => {
  try {
    // pobranie parametrów z adresu
    const { week, day } = req.params;

    // sprawdzenie poprawności dnia
    if (!validDays.includes(day)) {
      return res.status(400).end();
    }

    // sprawdzenie poprawności nazwy wydarzenia
    if (!isValidTitle(req.body.title)) {
      return res.status(400).json({ error: "Niepoprawna nazwa wydarzenia" });
    }

    // wyszukanie tygodnia użytkownika
    const weekDoc = await Week.findOne({ weekKey: week, userId: req.user._id });
    if (!weekDoc) {
      return res.status(404).end();
    }

    // pobranie listy wydarzeń z wybranego dnia
    const events = weekDoc.days[day].events;

    // nadanie nowego id wydarzeniu
    const id = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;

    // dodanie wydarzenia do listy
    events.push({ id, title: req.body.title.trim() });
    await weekDoc.save();

    // zwrócenie informacji o dodaniu
    res.status(201).end();
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd dodawania wydarzenia" });
  }
});

// edycja wydarzenia
router.put("/:week/days/:day/events/:eventId", async (req, res) => {
  try {
    // pobranie parametrów z adresu
    const { week, day, eventId } = req.params;

    // sprawdzenie poprawności dnia
    if (!validDays.includes(day)) {
      return res.status(400).end();
    }

    // sprawdzenie poprawności nazwy wydarzenia
    if (!isValidTitle(req.body.title)) {
      return res.status(400).json({ error: "Niepoprawna nazwa wydarzenia" });
    }

    // wyszukanie tygodnia użytkownika
    const weekDoc = await Week.findOne({ weekKey: week, userId: req.user._id });
    if (!weekDoc) {
      return res.status(404).end();
    }

    // wyszukanie wydarzenia po id
    const event = weekDoc.days[day].events.find(e => e.id === Number(eventId));
    if (!event) {
      return res.status(404).end();
    }

    // aktualizacja nazwy wydarzenia
    event.title = req.body.title.trim();
    await weekDoc.save();

    // zwrócenie informacji o edycji
    res.status(200).end();
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd edycji wydarzenia" });
  }
});

// usuwanie wydarzenia
router.delete("/:week/days/:day/events/:eventId", async (req, res) => {
  try {
    // pobranie parametrów z adresu
    const { week, day, eventId } = req.params;

    // sprawdzenie poprawności dnia
    if (!validDays.includes(day)) {
      return res.status(400).end();
    }

    // wyszukanie tygodnia użytkownika
    const weekDoc = await Week.findOne({ weekKey: week, userId: req.user._id });
    if (!weekDoc) {
      return res.status(404).end();
    }

    // usunięcie wydarzenia z listy
    weekDoc.days[day].events = weekDoc.days[day].events.filter(
      e => e.id !== Number(eventId)
    );
    await weekDoc.save();

    // zwrócenie informacji o usunięciu
    res.status(204).end();
  } catch (error) {
    // zwrócenie błędu serwera
    res.status(500).json({ error: "Błąd usuwania wydarzenia" });
  }
});

// eksport routera
module.exports = router;