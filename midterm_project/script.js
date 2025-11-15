// script.js
// 迷你待辦清單：事件委派 + 表單驗證 + localStorage + 深色模式 + 自訂標籤

// --- DOM element 取得 ---
const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const categorySelect = document.getElementById('task-category');
const dueInput = document.getElementById('task-due');
const addBtn = document.getElementById('add-btn');
const resetFormBtn = document.getElementById('reset-form-btn');

const taskList = document.getElementById('task-list');
const taskCountLabel = document.getElementById('task-count');

const filterGroup = document.getElementById('filter-group');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

// 深色模式 & 自訂標籤相關
const themeToggleBtn = document.getElementById('theme-toggle');
const customTagInput = document.getElementById('custom-tag');
const customTagGroup = document.getElementById('custom-tag-group');

// --- 狀態 ---
let tasks = [];
let currentFilter = 'all';

// --- 工具：設定今天日期為截止日的最小值 ---
function setTodayAsMinDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dueInput.min = `${yyyy}-${mm}-${dd}`;
}

// --- 工具：顯示錯誤訊息 ---
function setFieldError(input, message) {
  const errorId = input.getAttribute('aria-describedby');
  if (!errorId) return;
  const errorElement = document.getElementById(errorId);
  input.setCustomValidity(message);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

// 個別欄位驗證邏輯
function validateTitle() {
  const value = titleInput.value.trim();
  let message = '';

  if (!value) {
    message = '請輸入待辦事項內容。';
  } else if (value.length < 2) {
    message = '內容至少需要 2 個字。';
  } else if (value.length > 50) {
    message = '內容請勿超過 50 個字。';
  }

  setFieldError(titleInput, message);
  return !message;
}

function validateCategory() {
  const value = categorySelect.value;
  let message = '';

  if (!value) {
    message = '請選擇一個類別。';
  }

  setFieldError(categorySelect, message);
  return !message;
}

function validateDueDate() {
  const value = dueInput.value;
  let message = '';

  if (!value) {
    message = '';
  } else {
    const selected = new Date(value);
    const today = new Date();
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selected < today) {
      message = '截止日期不可早於今天。';
    }
  }

  setFieldError(dueInput, message);
  return !message;
}

function validatePriority() {
  const radios = document.querySelectorAll('input[name="priority"]');
  const errorElement = document.getElementById('priority-error');
  let checked = false;

  radios.forEach((radio) => {
    if (radio.checked) {
      checked = true;
    }
  });

  if (!checked) {
    errorElement.textContent = '請選擇一個優先順序。';
  } else {
    errorElement.textContent = '';
  }

  if (radios[0]) {
    radios[0].setCustomValidity(checked ? '' : '請選擇優先順序');
  }
  return checked;
}

// --- 綜合驗證 ---
function validateForm() {
  const validators = [
    { fn: validateTitle, input: titleInput },
    { fn: validateCategory, input: categorySelect },
    { fn: validateDueDate, input: dueInput },
    { fn: validatePriority, input: document.querySelector('input[name="priority"]') }
  ];

  let firstInvalid = null;

  validators.forEach(({ fn, input }) => {
    const ok = fn();
    if (!ok && !firstInvalid) {
      firstInvalid = input;
    }
  });

  return { isValid: !firstInvalid, firstInvalid };
}

// --- 即時驗證設定 ---
function setupLiveValidation() {
  titleInput.addEventListener('blur', validateTitle);
  titleInput.addEventListener('input', () => {
    if (titleInput.validationMessage) {
      validateTitle();
    }
  });

  categorySelect.addEventListener('blur', validateCategory);
  categorySelect.addEventListener('change', validateCategory);

  dueInput.addEventListener('blur', validateDueDate);
  dueInput.addEventListener('input', () => {
    if (dueInput.validationMessage) {
      validateDueDate();
    }
  });

  const radios = document.querySelectorAll('input[name="priority"]');
  radios.forEach((radio) => {
    radio.addEventListener('change', validatePriority);
  });
}

// 類別為「其他」時顯示自訂標籤欄位
function setupCategoryWithCustomTag() {
  categorySelect.addEventListener('change', () => {
    validateCategory();
    if (categorySelect.value === 'other') {
      customTagGroup.classList.remove('d-none');
    } else {
      customTagGroup.classList.add('d-none');
      customTagInput.value = '';
    }
  });
}

// --- localStorage：task ---
const STORAGE_KEY = 'midterm_todo_tasks';

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      tasks = data;
    }
  } catch (error) {
    console.error('載入 localStorage 失敗：', error);
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --- 深色模式 ---
const THEME_KEY = 'midterm_theme';

function applyTheme(mode) {
  const isDark = mode === 'dark';
  document.body.classList.toggle('dark-mode', isDark);

  if (isDark) {
    themeToggleBtn.textContent = '☀️ 淺色模式';
    themeToggleBtn.classList.remove('btn-outline-dark');
    themeToggleBtn.classList.add('btn-outline-light');
  } else {
    themeToggleBtn.textContent = '🌙 深色模式';
    themeToggleBtn.classList.remove('btn-outline-light');
    themeToggleBtn.classList.add('btn-outline-dark');
  }
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
}

function toggleTheme() {
  const isDark = document.body.classList.contains('dark-mode');
  const next = isDark ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

themeToggleBtn.addEventListener('click', toggleTheme);

// --- 任務渲染 ---
function formatCategory(category, customTag = '') {
  if (category === 'other' && customTag) {
    return customTag;
  }
  switch (category) {
    case 'school':
      return '課業';
    case 'work':
      return '工作';
    case 'life':
      return '生活';
    default:
      return '其他';
  }
}

function formatPriority(priority) {
  switch (priority) {
    case 'high':
      return '高優先';
    case 'medium':
      return '中優先';
    default:
      return '低優先';
  }
}

function renderTasks() {
  taskList.innerHTML = '';

  const filtered = tasks.filter((task) => {
    if (currentFilter === 'active') {
      return !task.completed;
    }
    if (currentFilter === 'completed') {
      return task.completed;
    }
    return true;
  });

  filtered.forEach((task) => {
    const li = document.createElement('li');
    li.className =
      'list-group-item d-flex justify-content-between align-items-start';
    li.dataset.id = task.id;

    const priorityClass =
      task.priority === 'high'
        ? 'badge-priority-high'
        : task.priority === 'medium'
        ? 'badge-priority-medium'
        : 'badge-priority-low';

    li.innerHTML = `
      <div class="me-2 flex-grow-1">
        <div class="d-flex align-items-center gap-2">
          <input
            class="form-check-input mt-0"
            type="checkbox"
            data-action="toggle"
            ${task.completed ? 'checked' : ''}
            aria-label="標記完成"
          />
          <span class="task-title ${task.completed ? 'done' : ''}">
            ${task.title}
          </span>
          <span class="badge ${priorityClass}">${formatPriority(task.priority)}</span>
        </div>
        <div class="task-meta text-muted mt-1">
          <span class="me-2">
            類別：${formatCategory(task.category, task.customTag || '')}
          </span>
          ${
            task.dueDate
              ? `<span class="me-2">截止：${task.dueDate}</span>`
              : ''
          }
          <span>建立時間：${task.createdAt}</span>
        </div>
      </div>
      <div class="d-flex align-items-center gap-1">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary btn-icon"
          data-action="edit"
        >
          編輯
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-danger btn-icon"
          data-action="remove"
        >
          刪除
        </button>
      </div>
    `;

    taskList.appendChild(li);
  });

  taskCountLabel.textContent = tasks.length;
}

// --- 建立任務 ---
function createTaskFromForm() {
  const title = titleInput.value.trim();
  const category = categorySelect.value;
  const dueDate = dueInput.value || '';
  const priority = document.querySelector('input[name="priority"]:checked').value;
  const customTag = customTagInput.value.trim();
  const now = new Date();

  const createdAt = `${now.getFullYear()}/${
    now.getMonth() + 1
  }/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title,
    category,
    customTag,
    dueDate,
    priority,
    completed: false,
    createdAt
  };
}

// --- 表單送出 ---
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const { isValid, firstInvalid } = validateForm();
  if (!isValid && firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const task = createTaskFromForm();
  tasks.push(task);
  saveTasks();
  renderTasks();

  form.reset();
  setFieldError(titleInput, '');
  setFieldError(categorySelect, '');
  setFieldError(dueInput, '');
  document.getElementById('priority-error').textContent = '';
  customTagGroup.classList.add('d-none');
  customTagInput.value = '';
});

// 表單 reset 按鈕
resetFormBtn.addEventListener('click', () => {
  form.reset();
  setFieldError(titleInput, '');
  setFieldError(categorySelect, '');
  setFieldError(dueInput, '');
  document.getElementById('priority-error').textContent = '';
  customTagGroup.classList.add('d-none');
  customTagInput.value = '';
});

// --- 事件委派：清單操作 ---
taskList.addEventListener('click', (event) => {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  const item = actionEl.closest('li');
  if (!item) return;

  const id = item.dataset.id;
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return;

  if (action === 'toggle') {
    tasks[index].completed = !tasks[index].completed;
  } else if (action === 'remove') {
    if (confirm('確定要刪除這筆待辦事項嗎？')) {
      tasks.splice(index, 1);
    }
  } else if (action === 'edit') {
    const newTitle = prompt('請輸入新的待辦內容：', tasks[index].title);
    if (newTitle && newTitle.trim().length >= 2) {
      tasks[index].title = newTitle.trim();
    }
  }

  saveTasks();
  renderTasks();
});

// --- 篩選 ---
filterGroup.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;

  Array.from(filterGroup.children).forEach((btn) =>
    btn.classList.remove('active')
  );
  button.classList.add('active');
  currentFilter = button.dataset.filter;
  renderTasks();
});

// --- 清除已完成 / 全部 ---
clearCompletedBtn.addEventListener('click', () => {
  if (!tasks.some((task) => task.completed)) {
    alert('目前沒有已完成的事項。');
    return;
  }
  if (!confirm('確定要刪除所有已完成的事項嗎？')) return;

  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

clearAllBtn.addEventListener('click', () => {
  if (!tasks.length) {
    alert('目前沒有任何待辦事項。');
    return;
  }
  if (!confirm('確定要清除全部待辦事項嗎？')) return;

  tasks = [];
  saveTasks();
  renderTasks();
});

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
  setTodayAsMinDate();
  setupLiveValidation();
  setupCategoryWithCustomTag();
  loadTheme();
  loadTasks();
  renderTasks();
});
