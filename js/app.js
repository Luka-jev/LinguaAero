/**
 * LinguaAero - Application Logic
 */

// --- State Management ---
let state = {
    langue_active: "italien",
    niveau_actif: "A1",
    historique: [],
    statistiques: {
        italien: { A1: { total: 0, bonnes: 0 }, A2: { total: 0, bonnes: 0 }, B1: { total: 0, bonnes: 0 }, B2: { total: 0, bonnes: 0 }, C1: { total: 0, bonnes: 0 } },
        portugais: { A1: { total: 0, bonnes: 0 }, A2: { total: 0, bonnes: 0 }, B1: { total: 0, bonnes: 0 }, B2: { total: 0, bonnes: 0 }, C1: { total: 0, bonnes: 0 } },
        turc: { A1: { total: 0, bonnes: 0 }, A2: { total: 0, bonnes: 0 }, B1: { total: 0, bonnes: 0 }, B2: { total: 0, bonnes: 0 }, C1: { total: 0, bonnes: 0 } }
    },
    current_streak: 0,
    session_answered: [] // Words answered in this session to avoid repetition
};

// --- Initialization ---
function init() {
    const savedState = localStorage.getItem('linguaAeroState');
    if (savedState) {
        const loaded = JSON.parse(savedState);
        state = { ...state, ...loaded };
        
        // Ensure statistics structure exists for all languages and levels in banqueQuestions
        for (let lang in banqueQuestions) {
            if (!state.statistiques[lang]) {
                state.statistiques[lang] = {};
            }
            for (let level in banqueQuestions[lang]) {
                if (!state.statistiques[lang][level]) {
                    state.statistiques[lang][level] = { total: 0, bonnes: 0 };
                }
            }
        }
        
        // Ensure session_answered is reset on init
        state.session_answered = [];
    }

    updateUIFromState();
    setupEventListeners();
    showView('quiz');
    loadNewQuestion();
}

function saveState() {
    localStorage.setItem('linguaAeroState', JSON.stringify(state));
}

// --- UI Updates ---
function updateUIFromState() {
    document.getElementById('language-select').value = state.langue_active;
    document.getElementById('level-select').value = state.niveau_actif;
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${viewId}-view`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    if (viewId === 'history') renderHistory();
    if (viewId === 'stats') renderStats();
}

// --- Quiz Engine ---
let currentQuestion = null;

function loadNewQuestion() {
    const bank = banqueQuestions[state.langue_active][state.niveau_actif];
    
    if (!bank || bank.length === 0) {
        document.getElementById('question-word').textContent = "Bientôt disponible !";
        document.getElementById('options-container').innerHTML = "";
        return;
    }

    // Filter out words already seen in this session
    let available = bank.filter(q => !state.session_answered.includes(q.mot));
    
    // If all words seen, reset session list
    if (available.length === 0) {
        state.session_answered = [];
        available = bank;
    }

    // Prioritize words NOT in history if possible
    const historyWords = state.historique
        .filter(h => h.langue === state.langue_active && h.niveau === state.niveau_actif)
        .map(h => h.mot_original);
    
    let freshWords = available.filter(q => !historyWords.includes(q.mot));
    let pool = freshWords.length > 0 ? freshWords : available;

    currentQuestion = pool[Math.floor(Math.random() * pool.length)];
    
    renderQuestion(currentQuestion, bank);
}

function renderQuestion(question, bank) {
    document.getElementById('current-language-label').textContent = state.langue_active.charAt(0).toUpperCase() + state.langue_active.slice(1);
    document.getElementById('current-level-label').textContent = state.niveau_actif;
    document.getElementById('question-word').textContent = question.mot;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = "";
    
    // Generate distractors
    let distractors = bank
        .filter(q => q.mot !== question.mot)
        .map(q => q.traduction);
    
    // Shuffle and pick 3
    distractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Combine with correct answer and shuffle
    let options = [...distractors, question.traduction].sort(() => 0.5 - Math.random());
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "glossy-btn option-btn";
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(opt, btn);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('feedback-container').classList.add('hidden');
}

function handleAnswer(selected, btn) {
    if (document.getElementById('feedback-container').classList.contains('hidden') === false) return;

    const isCorrect = selected === currentQuestion.traduction;
    const feedbackMsg = document.getElementById('feedback-message');
    
    // Update State
    state.historique.unshift({
        date: new Date().toISOString().split('T')[0],
        langue: state.langue_active,
        niveau: state.niveau_actif,
        mot_original: currentQuestion.mot,
        traduction_correcte: currentQuestion.traduction,
        reponse_utilisateur: selected,
        correct: isCorrect
    });

    state.statistiques[state.langue_active][state.niveau_actif].total++;
    if (isCorrect) {
        state.statistiques[state.langue_active][state.niveau_actif].bonnes++;
        state.current_streak++;
        btn.classList.add('correct');
        feedbackMsg.textContent = "Excellent ! ✅";
        feedbackMsg.style.color = "var(--success)";
    } else {
        state.current_streak = 0;
        btn.classList.add('wrong');
        feedbackMsg.textContent = `Oups ! La réponse était : ${currentQuestion.traduction} ❌`;
        feedbackMsg.style.color = "var(--error)";
        
        // Highlight correct answer
        document.querySelectorAll('.option-btn').forEach(b => {
            if (b.textContent === currentQuestion.traduction) b.classList.add('correct');
        });
    }

    state.session_answered.push(currentQuestion.mot);
    saveState();

    document.getElementById('feedback-container').classList.remove('hidden');
}

// --- History View ---
function renderHistory() {
    const langFilter = document.getElementById('filter-lang').value;
    const levelFilter = document.getElementById('filter-level').value;
    const tbody = document.getElementById('history-body');
    
    tbody.innerHTML = "";
    
    const filtered = state.historique.filter(h => {
        const matchLang = langFilter === 'all' || h.langue === langFilter;
        const matchLevel = levelFilter === 'all' || h.niveau === levelFilter;
        return matchLang && matchLevel;
    });

    filtered.forEach(h => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${h.mot_original}</strong> (${h.langue})</td>
            <td>${h.traduction_correcte}</td>
            <td>${h.correct ? '✅' : '❌'}</td>
        `;
        tbody.appendChild(row);
    });
}

// --- Stats View ---
function renderStats() {
    let totalQ = 0;
    let totalC = 0;
    
    for (let lang in state.statistiques) {
        for (let level in state.statistiques[lang]) {
            totalQ += state.statistiques[lang][level].total;
            totalC += state.statistiques[lang][level].bonnes;
        }
    }

    document.getElementById('total-questions').textContent = totalQ;
    document.getElementById('correct-answers').textContent = totalC;
    document.getElementById('current-streak').textContent = state.current_streak;

    const progressContainer = document.getElementById('language-progress');
    progressContainer.innerHTML = `<h3>Progression par langue (${state.niveau_actif})</h3>`;

    Object.keys(state.statistiques).forEach(lang => {
        const data = state.statistiques[lang][state.niveau_actif] || { total: 0, bonnes: 0 };
        const percent = data.total > 0 ? Math.round((data.bonnes / data.total) * 100) : 0;
        
        const item = document.createElement('div');
        item.className = "lang-progress-item";
        item.innerHTML = `
            <div class="progress-info">
                <span>${lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                <span>${percent}% (${data.bonnes}/${data.total})</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${percent}%"></div>
            </div>
        `;
        progressContainer.appendChild(item);
    });
}

// --- Event Listeners ---
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => showView(btn.dataset.view);
    });

    // Selectors
    document.getElementById('language-select').onchange = (e) => {
        state.langue_active = e.target.value;
        saveState();
        loadNewQuestion();
    };

    document.getElementById('level-select').onchange = (e) => {
        state.niveau_actif = e.target.value;
        saveState();
        loadNewQuestion();
    };

    // Filters
    document.getElementById('filter-lang').onchange = renderHistory;
    document.getElementById('filter-level').onchange = renderHistory;

    // Actions
    document.getElementById('next-btn').onclick = loadNewQuestion;
    
    document.getElementById('clear-history-btn').onclick = () => {
        if (confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
            state.historique = [];
            saveState();
            renderHistory();
        }
    };

    document.getElementById('reset-all-btn').onclick = () => {
        if (confirm("Voulez-vous vraiment réinitialiser TOUTES vos données (historique ET statistiques) ?")) {
            state.historique = [];
            state.current_streak = 0;
            
            // Dynamic reset of stats for all languages and levels in state
            for (let lang in state.statistiques) {
                for (let level in state.statistiques[lang]) {
                    state.statistiques[lang][level] = { total: 0, bonnes: 0 };
                }
            }
            
            saveState();
            renderHistory();
            if (!document.getElementById('stats-view').classList.contains('hidden')) {
                renderStats();
            }
            alert("Toutes les données ont été réinitialisées !");
        }
    };
}

// Start the app
init();
