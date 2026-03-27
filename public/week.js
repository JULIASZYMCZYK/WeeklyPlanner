// pobranie przycisku, pola daty i kontenera na tygodnie
const btn = document.getElementById('setWeekBtn');
const mondayPicker = document.getElementById('mondayPicker');
const weeksContainer = document.getElementById('weeksContainer');

// tablica z kluczami dni tygodnia
const dayKeys = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

// skrócone nazwy dni do wyświetlania
const days = ['PON','WT','ŚR','CZW','PT','SOB','ND']; 

// pobranie tokenu i przycisku wylogowania
const token = localStorage.getItem("token");
const logoutBtn = document.getElementById("logoutBtn");

// jeśli nie ma tokenu, użytkownik wraca do logowania
if (!token) {
  window.location.href = "/login.html";
}

// obsługa wylogowania
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}

// funkcja formatująca datę do postaci dd.mm.rrrr
function formatDate(date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

// funkcja wyświetlająca jeden tydzień
function renderWeek(week, weekData) {
  const weekDiv = document.createElement('div');
  weekDiv.className = 'week-block';

  // utworzenie nagłówka tygodnia i przycisku usuwania
  weekDiv.innerHTML = `
  <div class="week-header">
      <h2 class="week-title">Tydzień: ${week}</h2>
      <button class="delete-week-btn">Usuń cały tydzień</button>
  </div>
  <div class="days-grid"></div>
`;

  // obsługa usuwania całego tygodnia
  weekDiv.querySelector('.delete-week-btn').onclick = async () => {
    if (!confirm(`Czy na pewno chcesz usunąć cały tydzień ${week}?`)) return;
    try {
      const res = await fetch(`/api/weeks/${week}`, {
        method: 'DELETE',
        headers: { "x-access-token": token }
      });
      if (res.status === 204) weekDiv.remove();
    } catch {
      alert('Błąd sieci.');
    }
  };

  const grid = weekDiv.querySelector('.days-grid');

  // tworzenie kolumn dla kolejnych dni
  dayKeys.forEach((dayKey, index) => {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'day-column';

    // nagłówek dnia tygodnia
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.textContent = days[index];
    dayColumn.appendChild(dayHeader);

    // pobranie danych dla danego dnia
    const dayData = weekData[dayKey];

    // wyświetlanie wydarzeń danego dnia
    if (dayData && dayData.events && dayData.events.length > 0) {
      dayData.events.forEach(ev => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-preview';

        // podgląd pojedynczego wydarzenia
        eventDiv.innerHTML = `
            <small style="color: #888; font-size: 10px; display: block;">Wydarzenie</small>
            <strong>${ev.title}</strong>
        `;
        dayColumn.appendChild(eventDiv);
      });
    }

    // przycisk przejścia do widoku danego dnia
    const addBtn = document.createElement('a');
    addBtn.href = `/day.html?day=${dayKey}&week=${week}`;
    addBtn.className = 'add-btn';
    addBtn.textContent = '+';
    
    dayColumn.appendChild(addBtn);
    grid.appendChild(dayColumn);
  });

  // dodanie tygodnia do kontenera
  weeksContainer.appendChild(weekDiv);
}

// funkcja pobierająca wszystkie tygodnie z serwera
async function loadWeeks() {
  try {
    const res = await fetch('/api/weeks', { headers: { "x-access-token": token } });
    const data = await res.json();
    weeksContainer.innerHTML = '';

    // sortowanie tygodni po dacie początkowej
    Object.keys(data)
      .sort((a, b) => {
        const [startA] = a.split('-');
        const [startB] = b.split('-');
        const [dA, mA, yA] = startA.split('.').map(Number);
        const [dB, mB, yB] = startB.split('.').map(Number);
        return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
      })

      // renderowanie każdego tygodnia
      .forEach(week => renderWeek(week, data[week]));
  } catch (e) {
    console.error('Błąd wczytywania', e);
  }
}

// obsługa przycisku tworzenia tygodnia
btn.addEventListener('click', async () => {
  const selectedDate = mondayPicker.value;

  // sprawdzenie, czy wybrano datę
  if (!selectedDate) {
    alert('Wybierz datę!');
    return;
  }

  // obliczenie daty poniedziałku i niedzieli dla wybranego tygodnia
  const date = new Date(selectedDate);
  const dayOfWeek = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // utworzenie klucza tygodnia
  const week = `${formatDate(monday)}-${formatDate(sunday)}`;

  try {
    // wysłanie żądania utworzenia tygodnia
    const res = await fetch(`/api/weeks/${week}`, {
      method: 'POST',
      headers: {
        "x-access-token": token,
        "Content-Type": "application/json"
      }
    });

    // odczyt odpowiedzi z serwera
    const data = await res.json(); 

    // jeśli operacja się udała, odśwież listę tygodni
    if (res.ok) {
      await loadWeeks();
    } else {
      // wyświetlenie błędu z backendu
      alert(data.error || 'Nie udało się utworzyć tygodnia.');
    }

  } catch (e) {
    console.error('Błąd sieci:', e);
    alert('Wystąpił błąd podczas łączenia z serwerem.');
  }

  // wyczyszczenie pola daty po zakończeniu
  mondayPicker.value = '';
});

// wczytanie tygodni po uruchomieniu strony
loadWeeks();