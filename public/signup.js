// pobranie formularza rejestracji i pola z komunikatem błędu
const signupForm = document.getElementById("signupForm");
const errorMsg = document.getElementById("errorMsg");

// wyrażenie regularne do sprawdzania poprawności adresu e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// obsługa wysłania formularza rejestracji
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // pobranie danych wpisanych przez użytkownika
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // ukrycie poprzedniego komunikatu błędu
  errorMsg.style.display = "none";
  errorMsg.textContent = "";

  // sprawdzenie, czy imię zostało wpisane
  if (!firstName) {
    errorMsg.textContent = "Podaj imię.";
    errorMsg.style.display = "block";
    return;
  }

  // sprawdzenie, czy nazwisko zostało wpisane
  if (!lastName) {
    errorMsg.textContent = "Podaj nazwisko.";
    errorMsg.style.display = "block";
    return;
  }

  // sprawdzenie, czy adres e-mail został wpisany
  if (!email) {
    errorMsg.textContent = "Podaj adres e-mail.";
    errorMsg.style.display = "block";
    return;
  }

  // sprawdzenie, czy adres e-mail ma poprawny format
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

  // sprawdzenie minimalnej długości hasła
  if (password.length < 6) {
    errorMsg.textContent = "Hasło musi mieć co najmniej 6 znaków.";
    errorMsg.style.display = "block";
    return;
  }

  try {
    // wysłanie danych rejestracyjnych do backendu
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password
      })
    });

    // odczytanie odpowiedzi z serwera
    const res = await response.json();

    // jeśli rejestracja się nie udała, zwracany jest błąd
    if (!response.ok) {
      throw new Error(res.message || "Błąd rejestracji");
    }

    // komunikat o poprawnym utworzeniu konta
    alert("Konto zostało utworzone.");

    // przejście do strony logowania
    window.location.href = "/login.html";
  } catch (error) {
    // wyświetlenie komunikatu błędu
    errorMsg.textContent = error.message;
    errorMsg.style.display = "block";
  }
});