// ============================================
// HERRAMIENTA DE ORGANIZACIÓN PERSONAL
// JavaScript completo para index.html
// ============================================

// Variables globales
let tasks = [];
let notes = [];
let habits = [];
let currentEditingTaskId = null;
let currentEditingNoteId = null;
let currentDate = new Date();
let selectedCalendarDate = null;
let focusTimer = null;
let focusTimerInterval = null;
let focusTimeLeft = 25 * 60; // 25 minutos en segundos

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    initializeNavigation();
    initializeDashboard();
    initializeTasks();
    initializeCalendar();
    initializeNotes();
    initializeHabits();
    initializeFocusMode();
    initializeNightMode();
    updateDateTime();
    checkDailyAchievements();
    setInterval(updateDateTime, 60000); // Actualizar cada minuto
});

// ============================================
// NAVEGACIÓN
// ============================================

function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // Actualizar botones activos
            navButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Actualizar datos según la sección
            if (targetSection === 'dashboard') {
                updateDashboard();
            } else if (targetSection === 'calendar') {
                renderCalendar();
            }
        });
    });
}

// ============================================
// DASHBOARD
// ============================================

function initializeDashboard() {
    updateGreeting();
    updateDashboard();
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Buenos días';
    
    if (hour >= 12 && hour < 18) {
        greeting = 'Buenas tardes';
    } else if (hour >= 18) {
        greeting = 'Buenas noches';
    }
    
    document.getElementById('greeting').textContent = `${greeting}, futura química farmacéutica 🧪`;
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('date-time').textContent = now.toLocaleDateString('es-ES', options);
}

function updateDashboard() {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const urgentTasks = tasks.filter(t => 
        t.priority === 'high' && 
        t.status !== 'completed' &&
        t.deadline && 
        new Date(t.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    const todayEvents = tasks.filter(t => 
        t.deadline && 
        new Date(t.deadline).toDateString() === new Date().toDateString()
    );

    document.getElementById('tasks-count').textContent = pendingTasks.length;
    document.getElementById('urgent-count').textContent = urgentTasks.length;
    document.getElementById('events-count').textContent = todayEvents.length;

    // Mensaje motivacional
    const messages = [
        '¡Tú puedes lograr todo lo que te propongas! 💪',
        'Cada paso cuenta, sigue adelante 🌟',
        'Estás haciendo un gran trabajo ✨',
        'Confía en tu proceso 🚀',
        'Pequeños pasos, grandes resultados 💫',
        'Tu dedicación a la química farmacéutica es admirable 🧪',
        'Cada fórmula que aprendes te acerca más a tu meta 💊',
        'Eres increíble estudiando, sigue así 🌟',
        'Tu esfuerzo en el laboratorio no pasa desapercibido 🔬',
        'Estás construyendo un futuro brillante, una molécula a la vez ⚗️'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('motivational-message').textContent = randomMessage;
}

// ============================================
// TAREAS
// ============================================

let viewTodayMode = true; // Vista "Hoy" activa por defecto

function initializeTasks() {
    // Botón agregar tarea
    document.getElementById('add-task-btn').addEventListener('click', () => {
        openTaskModal();
    });

    // Vista "Hoy" / "Todas"
    document.getElementById('view-today-btn').addEventListener('click', () => {
        viewTodayMode = true;
        document.getElementById('view-today-btn').classList.add('active');
        document.getElementById('view-all-btn').classList.remove('active');
        renderTasks();
    });

    document.getElementById('view-all-btn').addEventListener('click', () => {
        viewTodayMode = false;
        document.getElementById('view-all-btn').classList.add('active');
        document.getElementById('view-today-btn').classList.remove('active');
        renderTasks();
    });

    // Filtros
    document.getElementById('filter-priority').addEventListener('change', renderTasks);
    document.getElementById('filter-category').addEventListener('change', renderTasks);
    document.getElementById('filter-status').addEventListener('change', renderTasks);

    // Modal
    document.getElementById('close-task-modal').addEventListener('click', closeTaskModal);
    document.getElementById('cancel-task-btn').addEventListener('click', closeTaskModal);
    document.getElementById('task-form').addEventListener('submit', saveTask);

    renderTasks();
}

function openTaskModal(taskId = null) {
    currentEditingTaskId = taskId;
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    
    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        document.getElementById('modal-task-title').textContent = 'Editar Tarea';
        document.getElementById('task-title-input').value = task.title;
        document.getElementById('task-description-input').value = task.description || '';
        document.getElementById('task-deadline-input').value = task.deadline || '';
        document.getElementById('task-priority-input').value = task.priority;
        document.getElementById('task-category-input').value = task.category;
        document.getElementById('task-status-input').value = task.status;
    } else {
        document.getElementById('modal-task-title').textContent = 'Nueva Tarea';
        form.reset();
        document.getElementById('task-deadline-input').value = '';
    }
    
    modal.classList.add('active');
}

function closeTaskModal() {
    document.getElementById('task-modal').classList.remove('active');
    currentEditingTaskId = null;
    document.getElementById('task-form').reset();
}

function saveTask(e) {
    e.preventDefault();
    
    const taskData = {
        title: document.getElementById('task-title-input').value,
        description: document.getElementById('task-description-input').value,
        deadline: document.getElementById('task-deadline-input').value,
        priority: document.getElementById('task-priority-input').value,
        category: document.getElementById('task-category-input').value,
        status: document.getElementById('task-status-input').value
    };

    if (currentEditingTaskId) {
        // Editar tarea existente
        const index = tasks.findIndex(t => t.id === currentEditingTaskId);
        tasks[index] = { ...tasks[index], ...taskData };
    } else {
        // Nueva tarea
        tasks.push({
            id: Date.now(),
            ...taskData,
            createdAt: new Date().toISOString()
        });
    }

    saveAllData();
    renderTasks();
    updateDashboard();
    checkDailyAchievements();
    closeTaskModal();
}

function deleteTask(taskId) {
    if (confirm('¿Estás segura de que quieres eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveAllData();
        renderTasks();
        updateDashboard();
        renderCalendar();
    }
}

function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task.status === 'completed') {
        task.status = 'pending';
    } else if (task.status === 'pending') {
        task.status = 'in-progress';
    } else {
        task.status = 'completed';
    }
    saveAllData();
    renderTasks();
    updateDashboard();
    checkDailyAchievements();
}

function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    const priorityFilter = document.getElementById('filter-priority').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const statusFilter = document.getElementById('filter-status').value;

    let filteredTasks = [...tasks];

    // Filtrar por vista "Hoy" si está activa
    if (viewTodayMode) {
        const today = new Date().toDateString();
        filteredTasks = filteredTasks.filter(t => {
            if (!t.deadline) return false;
            return new Date(t.deadline).toDateString() === today;
        });
    }

    // Aplicar filtros
    if (priorityFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);
    }
    if (categoryFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
    }

    // Ordenar por urgencia y fecha
    filteredTasks.sort((a, b) => {
        // Primero por prioridad
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        // Luego por fecha
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        }
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return 0;
    });

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No hay tareas que mostrar</p>';
        return;
    }

    tasksList.innerHTML = filteredTasks.map(task => {
        const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' };
        const statusLabels = { pending: 'Pendiente', 'in-progress': 'En progreso', completed: 'Completada' };
        const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString('es-ES') : 'Sin fecha';
        
        return `
            <div class="task-item ${task.priority}-priority ${task.status === 'completed' ? 'completed' : ''}">
                <div class="task-header">
                    <div class="task-title">${escapeHtml(task.title)}</div>
                    <div class="task-actions">
                        <button class="task-action-btn" onclick="toggleTaskStatus(${task.id})" title="Cambiar estado">
                            ${task.status === 'completed' ? '✓' : task.status === 'in-progress' ? '⟳' : '○'}
                        </button>
                        <button class="task-action-btn" onclick="openTaskModal(${task.id})" title="Editar">✎</button>
                        <button class="task-action-btn" onclick="deleteTask(${task.id})" title="Eliminar">×</button>
                    </div>
                </div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="task-badge">${priorityLabels[task.priority]}</span>
                    <span class="task-badge">${task.category}</span>
                    <span class="task-badge">${statusLabels[task.status]}</span>
                    <span class="task-badge">📅 ${deadline}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// CALENDARIO
// ============================================

function initializeCalendar() {
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Actualizar título
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('current-month-year').textContent = `${monthNames[month]} ${year}`;

    // Primer día del mes y cuántos días tiene
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';

    // Días del mes anterior
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = prevMonthDays - i;
        calendarDays.appendChild(day);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Marcar hoy
        if (isCurrentMonth && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Marcar días con eventos
        const hasEvents = tasks.some(t => 
            t.deadline && 
            new Date(t.deadline).toDateString() === new Date(dateStr).toDateString()
        );
        if (hasEvents) {
            dayElement.classList.add('has-events');
        }
        
        dayElement.addEventListener('click', () => {
            selectedCalendarDate = dateStr;
            showDayEvents(dateStr);
        });
        
        calendarDays.appendChild(dayElement);
    }

    // Días del mes siguiente para completar la cuadrícula
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 semanas * 7 días
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarDays.appendChild(dayElement);
    }
}

function showDayEvents(dateStr) {
    const dayEvents = tasks.filter(t => 
        t.deadline && 
        new Date(t.deadline).toDateString() === new Date(dateStr).toDateString()
    );

    const eventsList = document.getElementById('day-events-list');
    if (dayEvents.length === 0) {
        eventsList.innerHTML = '<p style="color: #999; text-align: center;">No hay eventos este día</p>';
    } else {
        eventsList.innerHTML = dayEvents.map(task => `
            <div class="event-item">
                <strong>${escapeHtml(task.title)}</strong>
                ${task.description ? `<br><small>${escapeHtml(task.description)}</small>` : ''}
            </div>
        `).join('');
    }
}

// ============================================
// NOTAS
// ============================================

function initializeNotes() {
    document.getElementById('add-note-btn').addEventListener('click', () => {
        openNoteModal();
    });

    document.getElementById('close-note-modal').addEventListener('click', closeNoteModal);
    document.getElementById('cancel-note-btn').addEventListener('click', closeNoteModal);
    document.getElementById('note-form').addEventListener('submit', saveNote);
    document.getElementById('notes-search').addEventListener('input', renderNotes);

    renderNotes();
}

function openNoteModal(noteId = null) {
    currentEditingNoteId = noteId;
    const modal = document.getElementById('note-modal');
    
    if (noteId) {
        const note = notes.find(n => n.id === noteId);
        document.getElementById('modal-note-title').textContent = 'Editar Nota';
        document.getElementById('note-title-input').value = note.title;
        document.getElementById('note-content-input').value = note.content;
        document.getElementById('note-tags-input').value = note.tags ? note.tags.join(', ') : '';
        document.getElementById('note-category-input').value = note.category || 'General';
    } else {
        document.getElementById('modal-note-title').textContent = 'Nueva Nota';
        document.getElementById('note-form').reset();
    }
    
    modal.classList.add('active');
}

function closeNoteModal() {
    document.getElementById('note-modal').classList.remove('active');
    currentEditingNoteId = null;
    document.getElementById('note-form').reset();
}

function saveNote(e) {
    e.preventDefault();
    
    const noteData = {
        title: document.getElementById('note-title-input').value,
        content: document.getElementById('note-content-input').value,
        tags: document.getElementById('note-tags-input').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t),
        category: document.getElementById('note-category-input').value
    };

    if (currentEditingNoteId) {
        const index = notes.findIndex(n => n.id === currentEditingNoteId);
        notes[index] = { ...notes[index], ...noteData };
    } else {
        notes.push({
            id: Date.now(),
            ...noteData,
            createdAt: new Date().toISOString()
        });
    }

    saveAllData();
    renderNotes();
    closeNoteModal();
}

function deleteNote(noteId) {
    if (confirm('¿Estás segura de que quieres eliminar esta nota?')) {
        notes = notes.filter(n => n.id !== noteId);
        saveAllData();
        renderNotes();
    }
}

function renderNotes() {
    const notesGrid = document.getElementById('notes-grid');
    const searchTerm = document.getElementById('notes-search').value.toLowerCase();

    let filteredNotes = notes;

    if (searchTerm) {
        filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    if (filteredNotes.length === 0) {
        notesGrid.innerHTML = '<p style="text-align: center; color: #999; padding: 40px; grid-column: 1/-1;">No hay notas que mostrar</p>';
        return;
    }

    notesGrid.innerHTML = filteredNotes.map(note => {
        const preview = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
        return `
            <div class="note-card" onclick="openNoteModal(${note.id})">
                <div class="note-title">${escapeHtml(note.title)}</div>
                <div class="note-preview">${escapeHtml(preview)}</div>
                ${note.tags.length > 0 ? `
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="note-tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    // Agregar botón eliminar a cada nota
    filteredNotes.forEach(note => {
        const noteCard = notesGrid.querySelector(`[onclick="openNoteModal(${note.id})"]`);
        if (noteCard) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'task-action-btn';
            deleteBtn.textContent = '×';
            deleteBtn.style.position = 'absolute';
            deleteBtn.style.top = '10px';
            deleteBtn.style.right = '10px';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteNote(note.id);
            };
            noteCard.style.position = 'relative';
            noteCard.appendChild(deleteBtn);
        }
    });
}

// ============================================
// HÁBITOS
// ============================================

function initializeHabits() {
    // Hábitos por defecto
    if (habits.length === 0) {
        habits = [
            { id: 1, name: 'Dormir bien (8 horas)', type: 'sleep', target: 8, current: 0 },
            { id: 2, name: 'Estudiar química farmacéutica', type: 'study', target: 120, current: 0 }, // minutos
            { id: 3, name: 'Repasar fórmulas', type: 'formulas', target: 1, current: 0 },
            { id: 4, name: 'Beber agua', type: 'water', target: 8, current: 0 }, // vasos
            { id: 5, name: 'Preparar material de laboratorio', type: 'lab', target: 1, current: 0 }
        ];
        saveAllData();
    }

    document.getElementById('add-habit-btn').addEventListener('click', addCustomHabit);
    document.getElementById('weekly-goals-text').addEventListener('input', saveWeeklyGoals);

    // Cargar metas semanales
    const savedGoals = localStorage.getItem('weeklyGoals');
    if (savedGoals) {
        document.getElementById('weekly-goals-text').value = savedGoals;
    }

    renderHabits();
}

function addCustomHabit() {
    const habitName = prompt('Nombre del nuevo hábito:');
    if (habitName) {
        habits.push({
            id: Date.now(),
            name: habitName,
            type: 'custom',
            target: 1,
            current: 0
        });
        saveAllData();
        renderHabits();
    }
}

function toggleHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    const today = new Date().toDateString();
    const habitKey = `habit_${habitId}_${today}`;
    
    if (localStorage.getItem(habitKey)) {
        localStorage.removeItem(habitKey);
        habit.current = Math.max(0, habit.current - 1);
    } else {
        localStorage.setItem(habitKey, '1');
        habit.current = Math.min(habit.target, habit.current + 1);
    }
    
    saveAllData();
    renderHabits();
}

function renderHabits() {
    const habitsContainer = document.getElementById('habits-container');
    const today = new Date().toDateString();

    habitsContainer.innerHTML = habits.map(habit => {
        const habitKey = `habit_${habit.id}_${today}`;
        const isChecked = localStorage.getItem(habitKey) !== null;
        const progress = (habit.current / habit.target) * 100;

        return `
            <div class="habit-card">
                <div class="habit-header">
                    <div class="habit-name">${escapeHtml(habit.name)}</div>
                    <div class="habit-checkbox ${isChecked ? 'checked' : ''}" 
                         onclick="toggleHabit(${habit.id})">
                        ${isChecked ? '✓' : ''}
                    </div>
                </div>
                <div class="habit-progress">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #666; margin-bottom: 5px;">
                        <span>${habit.current} / ${habit.target}</span>
                        <span>${Math.round(progress)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function saveWeeklyGoals() {
    const goals = document.getElementById('weekly-goals-text').value;
    localStorage.setItem('weeklyGoals', goals);
}

// ============================================
// MODO FOCUS
// ============================================

function initializeFocusMode() {
    document.getElementById('focus-mode-trigger').addEventListener('click', () => {
        document.getElementById('focus-mode').classList.remove('hidden');
        updateFocusTasksList();
    });

    document.getElementById('exit-focus-btn').addEventListener('click', () => {
        document.getElementById('focus-mode').classList.add('hidden');
        stopFocusTimer();
    });

    document.getElementById('start-timer').addEventListener('click', startFocusTimer);
    document.getElementById('pause-timer').addEventListener('click', pauseFocusTimer);
    document.getElementById('reset-timer').addEventListener('click', resetFocusTimer);
    document.getElementById('focus-duration').addEventListener('change', function() {
        focusTimeLeft = parseInt(this.value) * 60;
        updateTimerDisplay();
    });
}

// ============================================
// LOGROS DEL DÍA
// ============================================

function checkDailyAchievements() {
    const today = new Date().toDateString();
    const todayCompleted = tasks.filter(t => 
        t.status === 'completed' && 
        t.deadline && 
        new Date(t.deadline).toDateString() === today
    ).length;

    const todayTotal = tasks.filter(t => 
        t.deadline && 
        new Date(t.deadline).toDateString() === today
    ).length;

    // Ocultar logros anteriores
    document.getElementById('daily-achievements').style.display = 'none';
    document.getElementById('dashboard-achievements').style.display = 'none';

    if (todayCompleted > 0) {
        let message = '';
        if (todayCompleted === 1) {
            message = `¡Completaste 1 tarea hoy! 💊`;
        } else if (todayCompleted < 5) {
            message = `¡Completaste ${todayCompleted} tareas hoy! 🎉`;
        } else {
            message = `¡Increíble! Completaste ${todayCompleted} tareas hoy! 🌟`;
        }

        document.getElementById('achievement-text').textContent = message;
        document.getElementById('dashboard-achievement-text').textContent = message;
        
        document.getElementById('daily-achievements').style.display = 'block';
        document.getElementById('dashboard-achievements').style.display = 'block';

        // Ocultar después de 5 segundos
        setTimeout(() => {
            document.getElementById('daily-achievements').style.display = 'none';
        }, 5000);
    }
}

// ============================================
// MODO NOCHE
// ============================================

function initializeNightMode() {
    const nightModeToggle = document.getElementById('night-mode-toggle');
    const isNightMode = localStorage.getItem('nightMode') === 'true';

    if (isNightMode) {
        document.body.classList.add('night-mode');
        nightModeToggle.textContent = '☀️';
    }

    nightModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('night-mode');
        const isActive = document.body.classList.contains('night-mode');
        
        if (isActive) {
            localStorage.setItem('nightMode', 'true');
            nightModeToggle.textContent = '☀️';
        } else {
            localStorage.setItem('nightMode', 'false');
            nightModeToggle.textContent = '🌙';
        }
    });

    // Detectar hora y activar automáticamente si es de noche
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 6) {
        if (!isNightMode) {
            document.body.classList.add('night-mode');
            localStorage.setItem('nightMode', 'true');
            nightModeToggle.textContent = '☀️';
        }
    }
}

function updateFocusTasksList() {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const focusTasksList = document.getElementById('focus-tasks-list');
    
    if (pendingTasks.length === 0) {
        focusTasksList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No hay tareas pendientes</p>';
        return;
    }

    focusTasksList.innerHTML = pendingTasks.map(task => `
        <div class="focus-task-item" onclick="selectFocusTask(${task.id})">
            ${escapeHtml(task.title)}
        </div>
    `).join('');
}

function selectFocusTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    document.getElementById('focus-task-name').textContent = task.title;
    document.getElementById('focus-task-display').style.display = 'block';
}

function startFocusTimer() {
    if (focusTimerInterval) return;
    
    focusTimerInterval = setInterval(() => {
        focusTimeLeft--;
        updateTimerDisplay();
        
        if (focusTimeLeft <= 0) {
            stopFocusTimer();
            alert('¡Tiempo completado! 🎉');
        }
    }, 1000);
}

function pauseFocusTimer() {
    if (focusTimerInterval) {
        clearInterval(focusTimerInterval);
        focusTimerInterval = null;
    }
}

function resetFocusTimer() {
    pauseFocusTimer();
    const duration = parseInt(document.getElementById('focus-duration').value);
    focusTimeLeft = duration * 60;
    updateTimerDisplay();
}

function stopFocusTimer() {
    pauseFocusTimer();
}

function updateTimerDisplay() {
    const minutes = Math.floor(focusTimeLeft / 60);
    const seconds = focusTimeLeft % 60;
    document.getElementById('timer-display').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ============================================
// LOCALSTORAGE
// ============================================

function loadAllData() {
    const savedTasks = localStorage.getItem('tasks');
    const savedNotes = localStorage.getItem('notes');
    const savedHabits = localStorage.getItem('habits');

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
    }
}

function saveAllData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('habits', JSON.stringify(habits));
}

// ============================================
// UTILIDADES
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Funciones globales para onclick
window.toggleTaskStatus = toggleTaskStatus;
window.openTaskModal = openTaskModal;
window.deleteTask = deleteTask;
window.openNoteModal = openNoteModal;
window.deleteNote = deleteNote;
window.toggleHabit = toggleHabit;
window.selectFocusTask = selectFocusTask;
