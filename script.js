const YEAR = 2027;
const STORAGE_KEY = "todo-calendar-2027";
const monthNames = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

const holidays = {
  "2027-01-01": "신정",
  "2027-02-06": "설날 연휴",
  "2027-02-07": "설날",
  "2027-02-08": "설날 연휴",
  "2027-02-09": "설날 대체공휴일",
  "2027-03-01": "삼일절",
  "2027-05-01": "노동절",
  "2027-05-03": "노동절 대체공휴일",
  "2027-05-05": "어린이날",
  "2027-05-13": "부처님오신날",
  "2027-06-06": "현충일",
  "2027-07-17": "제헌절",
  "2027-07-19": "제헌절 대체공휴일",
  "2027-08-15": "광복절",
  "2027-08-16": "광복절 대체공휴일",
  "2027-09-14": "추석 연휴",
  "2027-09-15": "추석",
  "2027-09-16": "추석 연휴",
  "2027-10-03": "개천절",
  "2027-10-04": "개천절 대체공휴일",
  "2027-10-09": "한글날",
  "2027-10-11": "한글날 대체공휴일",
  "2027-12-25": "크리스마스",
  "2027-12-27": "크리스마스 대체공휴일",
};

const calendarGrid = document.querySelector("#calendarGrid");
const monthTitle = document.querySelector("#monthTitle");
const selectedDateTitle = document.querySelector("#selectedDateTitle");
const todoForm = document.querySelector("#todoForm");
const todoInput = document.querySelector("#todoInput");
const todoList = document.querySelector("#todoList");
const todoSummary = document.querySelector("#todoSummary");
const prevMonthButton = document.querySelector("#prevMonth");
const nextMonthButton = document.querySelector("#nextMonth");

let currentMonth = 0;
let selectedDateKey = formatDateKey(YEAR, 0, 1);
let todosByDate = loadTodos();

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todosByDate));
}

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month: month - 1, day };
}

function getTodosForDate(dateKey) {
  return todosByDate[dateKey] || [];
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  monthTitle.textContent = monthNames[currentMonth];

  const firstDay = new Date(YEAR, currentMonth, 1).getDay();
  const daysInMonth = new Date(YEAR, currentMonth + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let index = 0; index < totalCells; index += 1) {
    const day = index - firstDay + 1;
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day-cell";

    if (day < 1 || day > daysInMonth) {
      cell.classList.add("is-empty");
      cell.tabIndex = -1;
      cell.setAttribute("aria-hidden", "true");
      calendarGrid.appendChild(cell);
      continue;
    }

    const dateKey = formatDateKey(YEAR, currentMonth, day);
    const todos = getTodosForDate(dateKey);
    const activeTodos = todos.filter((todo) => !todo.done).length;
    const dayOfWeek = new Date(YEAR, currentMonth, day).getDay();
    const holidayName = holidays[dateKey];
    cell.dataset.date = dateKey;
    cell.setAttribute(
      "aria-label",
      holidayName
        ? `${YEAR}년 ${currentMonth + 1}월 ${day}일 ${holidayName}`
        : `${YEAR}년 ${currentMonth + 1}월 ${day}일`
    );

    if (dateKey === selectedDateKey) {
      cell.classList.add("is-selected");
    }

    if (dayOfWeek === 0) {
      cell.classList.add("is-sunday");
    }

    if (dayOfWeek === 6) {
      cell.classList.add("is-saturday");
    }

    if (holidayName) {
      cell.classList.add("is-holiday");
    }

    const dayNumber = document.createElement("span");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    if (holidayName) {
      const holiday = document.createElement("span");
      holiday.className = "holiday-name";
      holiday.textContent = holidayName;
      cell.appendChild(holiday);
    }

    if (todos.length > 0) {
      const count = document.createElement("span");
      count.className = "todo-count";
      count.textContent = activeTodos === 0 ? "완료" : activeTodos;
      cell.appendChild(count);

      const preview = document.createElement("span");
      preview.className = "todo-preview";
      preview.textContent = todos[0].text;
      cell.appendChild(preview);
    }

    cell.addEventListener("click", () => {
      selectedDateKey = dateKey;
      render();
      todoInput.focus();
    });

    calendarGrid.appendChild(cell);
  }
}

function renderTodos() {
  const { month, day } = parseDateKey(selectedDateKey);
  const todos = getTodosForDate(selectedDateKey);
  const doneCount = todos.filter((todo) => todo.done).length;
  const holidayName = holidays[selectedDateKey];

  selectedDateTitle.textContent = holidayName
    ? `${YEAR}년 ${month + 1}월 ${day}일 · ${holidayName}`
    : `${YEAR}년 ${month + 1}월 ${day}일`;
  todoList.innerHTML = "";

  if (todos.length === 0) {
    todoSummary.textContent = "등록된 할 일이 없습니다.";
    return;
  }

  todoSummary.textContent = `전체 ${todos.length}개 중 ${doneCount}개 완료`;

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = "todo-item";
    if (todo.done) {
      item.classList.add("is-done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", "완료 상태 변경");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "삭제";
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    item.append(checkbox, text, deleteButton);
    todoList.appendChild(item);
  });
}

function addTodo(text) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return;
  }

  const todo = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    text: trimmedText,
    done: false,
  };

  todosByDate[selectedDateKey] = [...getTodosForDate(selectedDateKey), todo];
  saveTodos();
  render();
}

function toggleTodo(todoId) {
  todosByDate[selectedDateKey] = getTodosForDate(selectedDateKey).map((todo) =>
    todo.id === todoId ? { ...todo, done: !todo.done } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(todoId) {
  const nextTodos = getTodosForDate(selectedDateKey).filter((todo) => todo.id !== todoId);

  if (nextTodos.length === 0) {
    delete todosByDate[selectedDateKey];
  } else {
    todosByDate[selectedDateKey] = nextTodos;
  }

  saveTodos();
  render();
}

function moveMonth(direction) {
  currentMonth = Math.min(11, Math.max(0, currentMonth + direction));
  const { day } = parseDateKey(selectedDateKey);
  const daysInMonth = new Date(YEAR, currentMonth + 1, 0).getDate();
  selectedDateKey = formatDateKey(YEAR, currentMonth, Math.min(day, daysInMonth));
  render();
}

function render() {
  renderCalendar();
  renderTodos();
  prevMonthButton.disabled = currentMonth === 0;
  nextMonthButton.disabled = currentMonth === 11;
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = "";
});

prevMonthButton.addEventListener("click", () => moveMonth(-1));
nextMonthButton.addEventListener("click", () => moveMonth(1));

render();
