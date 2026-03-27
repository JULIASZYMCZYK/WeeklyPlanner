// pobranie formularza logowania i pola z komunikatem błędu
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

// pobranie tokenu z localStorage
const token = localStorage.getItem("token");

// jeśli użytkownik jest już zalogowany, przejście do strony tygodnia
if (token) {
  window.location.href = "/week.html";
}

// wyrażenie regularne sprawdzające poprawność adresu e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// obsługa wysłania formularza logowania
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // pobranie wartości z pól formularza
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // ukrycie poprzedniego komunikatu błędu
  errorMsg.style.display = "none";
  errorMsg.textContent = "";

  // sprawdzenie, czy e-mail został wpisany
  if (!email) {
    errorMsg.textContent = "Podaj adres e-mail.";
    errorMsg.style.display = "block";
    return;
  }

  // sprawdzenie poprawności formatu e-maila
  if (!emailRegex.test(email)) {
    errorMsg.textContent = "Podaj poprawny adres e-mail.";
    errorMsg.style.display = "block";
    return;
  }

  // sprawdzenie, czy hasło zostało wpisane
  if (!password) {
    errorMsg.textContent = "Podaj hasło.";
    errorMsg.style.display = "block";
    return;
  }

  try {
    // wysłanie danych logowania do backendu
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    // odczytanie odpowiedzi z serwera
    const res = await response.json();

    // jeśli logowanie się nie udało, zwracany jest błąd
    if (!response.ok) {
      throw new Error(res.message || "Błąd logowania");
    }

    // zapisanie tokenu po poprawnym logowaniu
    localStorage.setItem("token", res.data);

    // przejście do strony tygodnia
    window.location.href = "/week.html";
  } catch (error) {
    // wyświetlenie błędu logowania
    errorMsg.textContent = error.message;
    errorMsg.style.display = "block";
  }
});