// elementy DOM dla zadań
const itemsList = document.getElementById('items');
const form = document.getElementById('addForm');
const textInput = document.getElementById('textInput');
const message = document.getElementById('message');

// pobranie zapisanych checkboxów z localStorage
const checkedTasks = JSON.parse(
  localStorage.getItem('checkedTasks') || '{}'
);

// pobranie tokenu i przycisku wylogowania
const token = localStorage.getItem("token");
const logoutBtn = document.getElementById("logoutBtn");

// jeśli nie ma tokenu, użytkownik wraca do logowania
if (!token) {
  window.location.href = "/login.html";
}

// obsługa przycisku wylogowania
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
}

// elementy DOM dla wydarzeń
const eventsList = document.getElementById('events');
const eventForm = document.getElementById('eventForm');
const eventInput = document.getElementById('eventInput');
const eventMessage = document.getElementById('eventMessage');

// nazwy dni tygodnia po polsku
const dayNames = {
  monday: 'Poniedziałek',
  tuesday: 'Wtorek',
  wednesday: 'Środa',
  thursday: 'Czwartek',
  friday: 'Piątek',
  saturday: 'Sobota',
  sunday: 'Niedziela'
};

// pobranie parametrów z adresu URL
const params = new URLSearchParams(window.location.search);
const day = params.get('day');
const week = params.get('week');

// sprawdzenie, czy wybrano dzień i tydzień
if (!day || !week) {
  alert('Nie wybrano dnia lub tygodnia. Wróć do strony głównej i wybierz tydzień.');
  throw new Error('Brak day lub week w URL');
}

// ustawienie tytułu strony i nagłówka
document.title = 'Plan - ' + dayNames[day];
document.getElementById('dayTitle').textContent = `${dayNames[day]}`;

// obsługa zadań
// pobieranie zadań z serwera
async function fetchItems() {
  try {
    const res = await fetch(`/api/weeks/${week}/days/${day}`, {
  headers: {
    "x-access-token": token
  }
});
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderItems(data);
  } catch {
    message.textContent = 'Błąd pobierania danych.';
  }
}

// wyświetlanie zadań na stronie
function renderItems(items) {
  itemsList.innerHTML = '';
  if (!items.length) {
    itemsList.innerHTML = '<li>(brak elementów)</li>';
    return;
  }
 
  // przejście po wszystkich zadaniach
  items.forEach(it => {
    const li = document.createElement('li');

    // utworzenie checkboxa
    const checkbox = document.createElement('input');
checkbox.type = 'checkbox';

// utworzenie tekstu zadania
const span = document.createElement('span');
span.textContent = it.text;

// klucz dla localStorage
const taskKey = `${week}_${day}_${it.id}`;

// ustawienie stanu checkboxa
checkbox.checked = !!checkedTasks[taskKey];

// dodanie lub usunięcie klasy po zaznaczeniu
if (checkbox.checked) {
  span.classList.add('task-done');
} else {
  span.classList.remove('task-done');
}

// zapisanie stanu checkboxa po zmianie
checkbox.addEventListener('change', () => {
  checkedTasks[taskKey] = checkbox.checked;
  localStorage.setItem('checkedTasks', JSON.stringify(checkedTasks));
  span.classList.toggle('task-done', checkbox.checked);
});

    // przycisk edycji
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edytuj';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => editItem(it.id, it.text);

    // przycisk usuwania
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Usuń';
    delBtn.className = 'delete-btn';
    delBtn.onclick = () => deleteItem(it.id);

    // kontener na przyciski
    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '0.5rem';
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(delBtn);

    // lewa część z checkboxem i tekstem
    const left = document.createElement('div');
left.style.display = 'flex';
left.style.alignItems = 'center';
left.style.gap = '0.5rem';

left.appendChild(checkbox);
left.appendChild(span);

li.appendChild(left);
li.appendChild(btnGroup);

    // dodanie elementu do listy
    itemsList.appendChild(li);
  });
}

// usuwanie zadania
async function deleteItem(id) {
  if (!confirm('Czy na pewno chcesz usunąć ten element?')) return;
  try {
    const res = await fetch(`/api/weeks/${week}/days/${day}/${id}`, {
  method: 'DELETE',
  headers: {
    "x-access-token": token
  }
});
    if (res.status === 204) {
  const taskKey = `${week}_${day}_${id}`;
  delete checkedTasks[taskKey];
  localStorage.setItem('checkedTasks', JSON.stringify(checkedTasks));
  fetchItems();
    } else {
      const err = await res.json();
      message.textContent = err.error || 'Błąd usuwania.';
    }
  } catch {
    message.textContent = 'Błąd sieci.';
  }

}

// edycja zadania
async function editItem(id, oldText) {
  const newText = prompt('Edytuj tekst:', oldText);
  if (!newText || newText.trim() === '' || newText === oldText) return;
  try {
    const res = await fetch(`/api/weeks/${week}/days/${day}/${id}`, {
    method: 'PUT',
    headers: {
  'Content-Type': 'application/json',
  'x-access-token': token
},
    body: JSON.stringify({ text: newText.trim() }),
});

    if (res.status === 200) {
      fetchItems();
    } else {
      const err = await res.json();
      message.textContent = err.error || 'Błąd edycji.';
    }
  } catch {
    message.textContent = 'Błąd sieci.';
  }
}

// dodawanie nowego zadania
form.addEventListener('submit', async e => {
  e.preventDefault();
  const text = textInput.value.trim();
  if (!text) return;
  message.textContent = '';
  try {
    const res = await fetch(`/api/weeks/${week}/days/${day}`, {
      method: 'POST',
      headers: {
  'Content-Type': 'application/json',
  'x-access-token': token
},
      body: JSON.stringify({ text }),
    });
    if (res.status === 201) {
      textInput.value = '';
      fetchItems();
    } else {
      const err = await res.json();
      message.textContent = err.error || 'Błąd dodawania.';
    }
  } catch {
    message.textContent = 'Błąd sieci.';
  }
});

// obsługa wydarzeń
// pobieranie wydarzeń z serwera
async function fetchEvents() {
  try {
    const res = await fetch(`/api/weeks/${week}/days/${day}/events`, {
  headers: {
    "x-access-token": token
  }
});
    if (!res.ok) throw new Error();
    const events = await res.json();
    renderEvents(events);
  } catch {
    eventMessage.textContent = 'Błąd pobierania wydarzeń.';
  }
}

// wyświetlanie wydarzeń na stronie
function renderEvents(events) {
  eventsList.innerHTML = '';
  if (!events.length) {
    eventsList.innerHTML = '<li>(brak wydarzeń)</li>';
    return;
  }

  // przejście po wszystkich wydarzeniach
  events.forEach(ev => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = `+ ${ev.title}`;

    // przycisk edycji wydarzenia
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edytuj';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => editEvent(ev.id, ev.title);

    // przycisk usuwania wydarzenia
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Usuń';
    delBtn.className = 'delete-btn';
    delBtn.onclick = () => deleteEvent(ev.id);

    // kontener na przyciski
    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '0.5rem';
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(delBtn);

    li.appendChild(span);
    li.appendChild(btnGroup);
    eventsList.appendChild(li);

  });
}

// usuwanie wydarzenia
async function deleteEvent(id) {
  if (!confirm('Czy na pewno chcesz usunąć ten element?')) return;
  try {
    const res = await fetch(`/api/weeks/${week}/days/${day}/events/${id}`, {
  method: 'DELETE',
  headers: {
    "x-access-token": token
  }
});
    if (res.status === 204) {
      fetchEvents();
    } else {
      const err = await res.json();
      eventMessage.textContent = err.error || 'Błąd usuwania.';
    }
  } catch {
    eventMessage.textContent = 'Błąd sieci.';
  }
}

// edycja wydarzenia
async function editEvent(id, oldTitle) {
  const newTitle = prompt('Edytuj nazwę wydarzenia:', oldTitle);
  if (!newTitle || newTitle.trim() === '' || newTitle === oldTitle) return;

  const res = await fetch(`/api/weeks/${week}/days/${day}/events/${id}`, {
    method: 'PUT',
    headers: {
  'Content-Type': 'application/json',
  'x-access-token': token
},
    body: JSON.stringify({ title: newTitle.trim() })
  });

  if (res.status === 200) fetchEvents();
}

// dodawanie nowego wydarzenia
eventForm.addEventListener('submit', async e => {
  e.preventDefault();
  const title = eventInput.value.trim();
  if (!title) return;

  const res = await fetch(`/api/weeks/${week}/days/${day}/events`, {
    method: 'POST',
    headers: {
  'Content-Type': 'application/json',
  'x-access-token': token
},
    body: JSON.stringify({ title })
  });

  if (res.status === 201) {
    eventInput.value = '';
    fetchEvents();
  }
});

// pobranie danych po uruchomieniu strony
fetchItems();
fetchEvents();

// obsługa przycisku powrotu
document.getElementById('backBtn').onclick = () => {
  window.location.href = '/week.html';
};