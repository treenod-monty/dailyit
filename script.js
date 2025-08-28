// ========================================
// LOCAL DATABASE (IndexedDB)
// ========================================
class DailytDB {
    constructor() {
        this.dbName = 'DailytDB';
        this.dbVersion = 2;  // 버전 업그레이드로 캐릭터 데이터 추가
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Habits 테이블
                if (!db.objectStoreNames.contains('habits')) {
                    const habitsStore = db.createObjectStore('habits', { 
                        keyPath: 'id' 
                    });
                    habitsStore.createIndex('name', 'name', { unique: false });
                    habitsStore.createIndex('cadence', 'cadence', { unique: false });
                    habitsStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
                
                // User 설정 테이블
                if (!db.objectStoreNames.contains('user')) {
                    const userStore = db.createObjectStore('user', { 
                        keyPath: 'id' 
                    });
                }
                
                // Sessions 기록 테이블 (선택사항)
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionsStore = db.createObjectStore('sessions', { 
                        keyPath: 'id' 
                    });
                    sessionsStore.createIndex('habitId', 'habitId', { unique: false });
                    sessionsStore.createIndex('date', 'date', { unique: false });
                    sessionsStore.createIndex('completedAt', 'completedAt', { unique: false });
                }
                
                // Game Data 테이블 (캐릭터, 가차, 포인트 등)
                if (!db.objectStoreNames.contains('gameData')) {
                    const gameDataStore = db.createObjectStore('gameData', { 
                        keyPath: 'key' 
                    });
                }
            };
        });
    }

    // 습관 관련 메서드
    async addHabit(habit) {
        const transaction = this.db.transaction(['habits'], 'readwrite');
        const store = transaction.objectStore('habits');
        return store.add(habit);
    }

    async getHabits() {
        const transaction = this.db.transaction(['habits'], 'readonly');
        const store = transaction.objectStore('habits');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateHabit(habit) {
        const transaction = this.db.transaction(['habits'], 'readwrite');
        const store = transaction.objectStore('habits');
        return store.put(habit);
    }

    async deleteHabit(habitId) {
        const transaction = this.db.transaction(['habits'], 'readwrite');
        const store = transaction.objectStore('habits');
        return store.delete(habitId);
    }

    // 사용자 데이터 관련 메서드
    async saveUserData(userData) {
        const transaction = this.db.transaction(['user'], 'readwrite');
        const store = transaction.objectStore('user');
        const data = {
            id: 'main',
            points: userData.points,
            currentPartner: userData.currentPartner,
            updatedAt: Date.now()
        };
        return store.put(data);
    }

    async getUserData() {
        const transaction = this.db.transaction(['user'], 'readonly');
        const store = transaction.objectStore('user');
        return new Promise((resolve, reject) => {
            const request = store.get('main');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 세션 기록 관련 메서드
    async addSession(session) {
        const transaction = this.db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');
        return store.add({
            id: Date.now().toString(),
            habitId: session.habitId,
            goal: session.goal,
            duration: session.duration,
            completedAt: Date.now(),
            date: new Date().toDateString(),
            points: session.points || 50
        });
    }

    async getSessionsByHabit(habitId) {
        const transaction = this.db.transaction(['sessions'], 'readonly');
        const store = transaction.objectStore('sessions');
        const index = store.index('habitId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(habitId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 데이터베이스 백업 및 복구
    async exportData() {
        const [habits, userData, sessions] = await Promise.all([
            this.getHabits(),
            this.getUserData(),
            this.getAllSessions()
        ]);
        
        return {
            habits,
            userData,
            sessions,
            exportedAt: new Date().toISOString()
        };
    }

    async getAllSessions() {
        const transaction = this.db.transaction(['sessions'], 'readonly');
        const store = transaction.objectStore('sessions');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 모든 습관 데이터 삭제
    async clearAllHabits() {
        const transaction = this.db.transaction(['habits'], 'readwrite');
        const store = transaction.objectStore('habits');
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ========================================
    // 게임 데이터 관련 메서드
    // ========================================
    
    // 게임 데이터 저장 (key-value 형태)
    async setGameData(key, value) {
        const transaction = this.db.transaction(['gameData'], 'readwrite');
        const store = transaction.objectStore('gameData');
        const data = {
            key: key,
            value: value,
            updatedAt: Date.now()
        };
        return store.put(data);
    }

    // 게임 데이터 로드
    async getGameData(key) {
        const transaction = this.db.transaction(['gameData'], 'readonly');
        const store = transaction.objectStore('gameData');
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // 모든 게임 데이터 로드
    async getAllGameData() {
        const transaction = this.db.transaction(['gameData'], 'readonly');
        const store = transaction.objectStore('gameData');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const result = {};
                request.result.forEach(item => {
                    result[item.key] = item.value;
                });
                resolve(result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // localStorage에서 IndexedDB로 마이그레이션
    async migrateGameDataFromLocalStorage() {
        const gameDataKeys = [
            'userCharacters',
            'selectedCharacter',
            'selectedCostumes', 
            'ownedCostumes',
            'selectedAppearances',
            'points'
        ];

        const batch = [];
        for (const key of gameDataKeys) {
            const value = localStorage.getItem(key);
            if (value !== null) {
                try {
                    // JSON 파싱 시도
                    const parsedValue = key === 'points' ? parseInt(value) : JSON.parse(value);
                    batch.push(this.setGameData(key, parsedValue));
                } catch (error) {
                    // 파싱 실패 시 원본 값 저장
                    batch.push(this.setGameData(key, value));
                }
            }
        }

        if (batch.length > 0) {
            await Promise.all(batch);
            console.log('🎮 게임 데이터 마이그레이션 완료:', gameDataKeys.length + '개 항목');
        }
    }

    // 게임 데이터 백업에 포함
    async exportGameData() {
        return await this.getAllGameData();
    }

    // 모든 게임 데이터 삭제
    async clearAllGameData() {
        const transaction = this.db.transaction(['gameData'], 'readwrite');
        const store = transaction.objectStore('gameData');
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// 전역 데이터베이스 인스턴스
let dailytDB = null;

// 게임 페이지에서 사용할 수 있도록 전역 노출
window.DailytDB = null;

// ========================================
// GLOBAL VARIABLES AND CONSTANTS
// ========================================
let currentSession = null;
let userPoints = 0;
let currentPartner = null;
let timerInterval = null;
let focusState = 'idle'; // idle, setup, progress
let userHabits = [];

const PARTNERS_DATA = {
    fox: {
        name: 'Tempo Fox',
        avatar: '<i data-lucide="zap"></i>',
        description: '집중력 최적화 전문',
        cost: 200,
        messages: {
            motivation: ['파이팅! 좋아, 너도 잘 해낼 거야!', '집중력을 발휘해보자!', '지금 리듬이 아주 좋아!'],
            completion: ['훌륭한 집중 세션이었어! 계속 이런 식으로 해보자!', '완벽한 집중이었어!', '대단해! 목표를 완료했네!']
        }
    },
    owl: {
        name: 'Planner Owl',
        avatar: '<i data-lucide="moon"></i>',
        description: '생활 루틴 관리 전문',
        cost: 200,
        messages: {
            motivation: ['오늘도 계획대로 잘 진행하고 있어!', '체계적인 접근이 좋아!', '계획을 차근차근 실행해보자!'],
            completion: ['계획한 대로 완벽하게 해냈어!', '루틴이 잘 자리잡고 있어!', '오늘도 목표 달성 완료!']
        }
    },
    cat: {
        name: 'Empathy Cat',
        avatar: '<i data-lucide="heart"></i>',
        description: '정서적 지원 전문',
        cost: 300,
        messages: {
            motivation: ['괜찮아, 천천히 해도 돼', '너의 페이스대로 가자!', '힘들면 언제든 쉬어도 좋아'],
            completion: ['정말 고생 많았어! 잘했어!', '너무 잘해냈어, 자랑스러워!', '오늘도 최선을 다했구나!']
        }
    }
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await initializeApp();
        setupEventListeners();
        await loadUserData();
        updateUI();
        adjustContainerPadding();
    } catch (error) {
        console.error('앱 초기화 중 오류 발생:', error);
    }
});

// 윈도우 리사이즈 시 헤더 높이 재조정
window.addEventListener('resize', function() {
    adjustContainerPadding();
});

async function initializeApp() {
    try {
        dailytDB = new DailytDB();
        await dailytDB.init();
        await migrateFromLocalStorage();
        
        // 게임 페이지에서 접근 가능하도록 전역 설정
        window.DailytDB = dailytDB;
    } catch (error) {
        console.error('IndexedDB 초기화 실패:', error);
        dailytDB = null;
        window.DailytDB = null;
    }
    
    focusState = 'idle';
    await loadHabitsTab();
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Tab switching
    document.addEventListener('click', function(e) {
        if (e.target.matches('.tab-btn')) {
            switchTab(e.target.getAttribute('data-tab'));
        }
    });

    // Focus Circle interactions
    document.addEventListener('click', function(e) {
        if (e.target.matches('#mainCircle') || e.target.closest('#mainCircle')) {
            onCircleTap();
        }
    });

    // Time chip selection in circle setup
    document.addEventListener('click', function(e) {
        if (e.target.matches('.time-chip')) {
            selectTimeChip(e.target);
        }
    });

    // Circle goal input events
    const circleGoalInput = document.getElementById('circleGoalInput');
    const startTimerBtn = document.getElementById('startTimerBtn');
    
    if (circleGoalInput && startTimerBtn) {
        circleGoalInput.addEventListener('input', function() {
            updateCircleStartButton();
        });
    }
    
    // Circle timer start button
    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', startCircleTimer);
    }
    
    // Custom time input toggle
    document.getElementById('customTimeBtn')?.addEventListener('click', function() {
        toggleCustomTimeInput();
    });
    
    // Circle timer controls
    document.getElementById('pauseTimerBtn')?.addEventListener('click', pauseCircleTimer);
    document.getElementById('stopTimerBtn')?.addEventListener('click', stopCircleTimer);


    // Cadence toggle buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.cadence-btn')) {
            toggleCadence(e.target);
        }
    });


    // Habit start buttons
    document.addEventListener('click', function(e) {
        const startBtn = e.target.closest('.habit-start-btn');
        if (startBtn) {
            const habitItem = startBtn.closest('.habit-item');
            const habitId = habitItem?.getAttribute('data-habit-id');
            if (habitId) {
                startHabitFromList(habitId);
            }
        }
    });
    
    // 파트너 교환 버튼들
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-action="exchange"]')) {
            const partnerId = e.target.getAttribute('data-partner');
            showPartnerExchangeModal(partnerId);
        }
    });
    
    // 모달 관련 이벤트들
    setupModalEvents();
    
    // Custom minutes input change (for circle timer)
    document.getElementById('customMinutes')?.addEventListener('input', function() {
        updateCircleStartButton();
    });
    
    
    // 키보드 이벤트
    document.addEventListener('keydown', handleKeyboardEvents);
    
    // 편집 모달 이벤트 설정
    setupEditHabitEventListeners();
    
    // 습관 선택 버튼 이벤트
    document.getElementById('selectFromHabitsBtn')?.addEventListener('click', function() {
        openSelectHabitModal();
    });
    
    // 습관 선택 모달 취소 버튼
    document.getElementById('cancelSelectHabit')?.addEventListener('click', function() {
        hideModal('selectHabitModal');
    });
    
}

function setupModalEvents() {
    // 모달 닫기 버튼들
    document.addEventListener('click', function(e) {
        if (e.target.matches('.modal-close')) {
            const modalId = e.target.getAttribute('data-close');
            hideModal(modalId);
        }
        
        // 오버레이 클릭으로 모달 닫기
        if (e.target.classList.contains('modal') || e.target.classList.contains('modal-overlay')) {
            hideAllModals();
        }
    });
    
    
    // Partner Exchange 모달 버튼들
    document.getElementById('confirmExchange').addEventListener('click', confirmPartnerExchange);
    document.getElementById('cancelExchange').addEventListener('click', function() {
        hideModal('partnerExchangeModal');
    });
    
    // Confirmation 모달 버튼들
    document.getElementById('confirmYes').addEventListener('click', handleConfirmYes);
    document.getElementById('confirmNo').addEventListener('click', function() {
        console.log('❌ 취소 버튼 클릭됨');
        if (window.confirmResolve) {
            const resolve = window.confirmResolve;
            window.confirmResolve = null; // 먼저 null로 설정해서 hideModal에서 false 호출 방지
            resolve(false);
        }
        hideModal('confirmationModal');
    });
    
    // Alert 모달 버튼들
    document.getElementById('alertOk').addEventListener('click', function() {
        hideModal('alertModal');
        if (window.alertCallback) {
            window.alertCallback();
            window.alertCallback = null;
        }
    });
    
    // Session Complete 모달 버튼들
    document.getElementById('newSessionBtn').addEventListener('click', function() {
        hideModal('sessionCompleteModal');
        resetSession();
    });
    
    document.getElementById('closeCompleteModal').addEventListener('click', function() {
        hideModal('sessionCompleteModal');
    });
    
    // Add Habit 모달 버튼들
    document.getElementById('confirmAddHabit')?.addEventListener('click', function() {
        confirmAddHabit();
    });
    
    document.getElementById('skipAddHabit')?.addEventListener('click', function() {
        skipAddHabit();
    });
    
    // Create New Habit 버튼 및 모달
    document.getElementById('newHabitBtn')?.addEventListener('click', function() {
        showCreateHabitModal();
    });
    
    document.getElementById('confirmCreateHabit')?.addEventListener('click', function() {
        confirmCreateHabit();
    });
    
    document.getElementById('cancelCreateHabit')?.addEventListener('click', function() {
        hideModal('createHabitModal');
    });
    
    // Create Habit Modal - Time Select 이벤트
    document.getElementById('createHabitTime')?.addEventListener('change', function() {
        toggleCreateCustomTime();
    });
}

function handleKeyboardEvents(e) {
    if (e.key === 'Escape') {
        hideAllModals();
    }
    
    // Enter 키로 버튼 활성화
    if (e.key === 'Enter') {
        if (document.activeElement.classList.contains('modal-btn')) {
            document.activeElement.click();
        }
    }
}

// ========================================
// CUSTOM MODAL SYSTEM
// ========================================
function showConfirmModal(title, message) {
    return new Promise((resolve) => {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').innerHTML = message.replace(/\n/g, '<br>');
        
        // Promise 저장
        window.confirmResolve = resolve;
        
        showModal('confirmationModal');
    });
}

function showAlertModal(title, message, callback = null) {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    
    // 콜백 함수 저장
    window.alertCallback = callback;
    
    showModal('alertModal');
}

function handleConfirmYes() {
    console.log('✅ 확인 버튼 클릭됨');
    if (window.confirmResolve) {
        const resolve = window.confirmResolve;
        window.confirmResolve = null; // 먼저 null로 설정해서 hideModal에서 false 호출 방지
        resolve(true);
    }
    hideModal('confirmationModal');
}

// ========================================
// MODAL SYSTEM
// ========================================
function showModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        
        if (modal && overlay) {
            modal.style.display = 'flex';
            overlay.style.display = 'block';
            document.body.classList.add('modal-open');
            
            // 애니메이션 효과
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.add('slide-in');
            }
        }
    } catch (error) {
        console.error('모달 표시 중 오류:', error);
    }
}

function hideModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        
        if (modal) {
            modal.style.display = 'none';
        }
        
        // 커스텀 모달 콜백 정리
        if (modalId === 'confirmationModal') {
            if (window.confirmResolve) {
                window.confirmResolve(false); // 모달이 닫히면 취소로 처리
                window.confirmResolve = null;
            }
        } else if (modalId === 'alertModal') {
            if (window.alertCallback) {
                window.alertCallback();
                window.alertCallback = null;
            }
        }
        
        // 다른 모달이 열려있는지 확인
        const openModals = document.querySelectorAll('.modal[style*="flex"]');
        if (openModals.length <= 1) {
            if (overlay) overlay.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    } catch (error) {
        console.error('모달 숨김 중 오류:', error);
    }
}

function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    const overlay = document.getElementById('modalOverlay');
    
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('modal-open');
    
    // 커스텀 모달 콜백들 정리
    cleanupModalCallbacks();
}

function cleanupModalCallbacks() {
    window.confirmResolve = null;
    window.alertCallback = null;
}

// ========================================
// TAB MANAGEMENT
// ========================================
function switchTab(tabName) {
    // 타이머가 돌고 있으면 모든 탭 이동 차단
    if (currentSession && focusState === 'progress') {
        showToast('타이머가 돌아가는 중에는 다른 탭으로 이동할 수 없어요! 🕒');
        return;
    }
    
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Reset focus state when switching to focus tab
    if (tabName === 'focus') {
        resetFocusState();
    }
    
    // Load habits when switching to habits tab
    if (tabName === 'habits') {
        loadHabitsTab();
    }
    
    // Load characters when switching to characters tab
    if (tabName === 'characters') {
        loadCharactersTab();
    }
}

// ========================================
// FOCUS CIRCLE STATE MANAGEMENT
// ========================================
function setFocusState(newState) {
    // Hide all states
    document.querySelectorAll('.circle-state').forEach(state => {
        state.classList.remove('active');
    });
    
    // Show the target state
    const targetState = document.getElementById(`circle-${newState}`);
    if (targetState) {
        targetState.classList.add('active');
        focusState = newState;
    }
}

function resetFocusState() {
    setFocusState('idle');
    
    // Reset all inputs
    const circleGoalInput = document.getElementById('circleGoalInput');
    const customTimeInput = document.getElementById('customTimeInput');
    const customMinutes = document.getElementById('customMinutes');
    const startTimerBtn = document.getElementById('startTimerBtn');
    
    if (circleGoalInput) circleGoalInput.value = '';
    if (customTimeInput) customTimeInput.style.display = 'none';
    if (customMinutes) customMinutes.value = '';
    if (startTimerBtn) startTimerBtn.disabled = true;
    
    // Reset time chips
    document.querySelectorAll('.time-chip').forEach(chip => chip.classList.remove('active'));
    const defaultChip = document.querySelector('.time-chip[data-time="60"]');
    if (defaultChip) defaultChip.classList.add('active');
}

function onCircleTap() {
    if (focusState === 'idle') {
        setFocusState('setup');
        
        // Focus on goal input
        setTimeout(() => {
            const goalInput = document.getElementById('circleGoalInput');
            if (goalInput) goalInput.focus();
        }, 300);
    }
}

// ========================================
// CIRCLE SETUP FUNCTIONS
// ========================================
function selectTimeChip(chip) {
    // Remove active from all chips
    document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('active'));
    
    // Add active to clicked chip
    chip.classList.add('active');
    
    // Handle custom time input
    const customTimeInput = document.getElementById('customTimeInput');
    if (chip.getAttribute('data-time') === 'custom') {
        if (customTimeInput) customTimeInput.style.display = 'block';
        setTimeout(() => {
            const customMinutes = document.getElementById('customMinutes');
            if (customMinutes) customMinutes.focus();
        }, 100);
    } else {
        if (customTimeInput) customTimeInput.style.display = 'none';
    }
    
    updateCircleStartButton();
}

function toggleCustomTimeInput() {
    const customTimeInput = document.getElementById('customTimeInput');
    const customMinutes = document.getElementById('customMinutes');
    
    if (customTimeInput.style.display === 'none' || !customTimeInput.style.display) {
        customTimeInput.style.display = 'block';
        setTimeout(() => {
            if (customMinutes) customMinutes.focus();
        }, 100);
    } else {
        customTimeInput.style.display = 'none';
    }
    
    updateCircleStartButton();
}

function updateCircleStartButton() {
    const goalInput = document.getElementById('circleGoalInput');
    const startBtn = document.getElementById('startTimerBtn');
    const activeChip = document.querySelector('.time-chip.active');
    const customMinutes = document.getElementById('customMinutes');
    
    if (!goalInput || !startBtn) return;
    
    const hasGoal = goalInput.value.trim().length > 0;
    let hasValidTime = false;
    
    if (activeChip) {
        const timeValue = activeChip.getAttribute('data-time');
        if (timeValue === 'custom') {
            hasValidTime = customMinutes && customMinutes.value && parseInt(customMinutes.value) > 0;
        } else {
            hasValidTime = true;
        }
    }
    
    startBtn.disabled = !hasGoal || !hasValidTime;
}

function startCircleTimer() {
    const goalInput = document.getElementById('circleGoalInput');
    const activeChip = document.querySelector('.time-chip.active');
    const customMinutes = document.getElementById('customMinutes');
    
    if (!goalInput || !activeChip) return;
    
    const goal = goalInput.value.trim();
    let duration;
    
    const timeValue = activeChip.getAttribute('data-time');
    if (timeValue === 'custom') {
        duration = parseInt(customMinutes.value);
    } else {
        duration = parseFloat(timeValue);
    }
    
    if (!goal || !duration || duration <= 0) {
        showAlertModal('오류', '목표를 입력해줘 / 세션 시간을 선택해줘');
        return;
    }
    
    // Create session (duration is in minutes, convert to seconds)
    const durationInSeconds = Math.round(duration * 60);
    currentSession = {
        goal: goal,
        duration: durationInSeconds,
        remainingTime: durationInSeconds,
        startTime: Date.now(),
        isPaused: false,
        source: 'circle'
    };
    
    // Switch to progress state
    setFocusState('progress');
    
    // Update progress display
    updateProgressDisplay();
    
    // Start timer
    startProgressTimer();
    
    // Show success toast
    showToast('타이머 시작! 내가 중간에 챙겨줄게 🙌');
}

// ========================================
// CIRCLE PROGRESS FUNCTIONS
// ========================================
function updateProgressDisplay() {
    if (!currentSession) return;
    
    // Update goal label
    const goalLabel = document.getElementById('progressGoalLabel');
    if (goalLabel) goalLabel.textContent = currentSession.goal;
    
    // Update timer time
    const minutes = Math.floor(currentSession.remainingTime / 60);
    const seconds = currentSession.remainingTime % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerTime = document.getElementById('circleTimerTime');
    if (timerTime) timerTime.textContent = timeString;
    
    // Update progress ring
    updateProgressRing();
}

function updateProgressRing() {
    if (!currentSession) return;
    
    const progress = (currentSession.duration - currentSession.remainingTime) / currentSession.duration;
    const circumference = 2 * Math.PI * 120; // r=120, circumference = 753.98
    const offset = circumference - (circumference * progress);
    
    const progressRing = document.getElementById('progressRing');
    if (progressRing) {
        progressRing.style.strokeDasharray = circumference;
        progressRing.style.strokeDashoffset = offset;
    }
}

function startProgressTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        if (!currentSession || currentSession.isPaused) return;
        
        currentSession.remainingTime--;
        updateProgressDisplay();
        
        // Check for motivation moments
        checkMotivationMoments();
        
        // Check for completion
        if (currentSession.remainingTime <= 0) {
            completeCircleSession();
        }
    }, 1000);
}

function pauseCircleTimer() {
    if (!currentSession) return;
    
    currentSession.isPaused = !currentSession.isPaused;
    const pauseBtn = document.getElementById('pauseTimerBtn');
    
    if (pauseBtn) {
        pauseBtn.innerHTML = currentSession.isPaused ? '<i data-lucide="play"></i> 재개' : '<i data-lucide="pause"></i> 일시정지';
        if (window.lucide) window.lucide.createIcons();
    }
}

function stopCircleTimer() {
    if (!currentSession) return;
    
    showConfirmModal(
        '세션 종료',
        '정말로 세션을 종료하시겠습니까?\n진행된 내용은 저장되지 않습니다.'
    ).then((confirmed) => {
        if (confirmed) {
            resetCircleSession();
        }
    });
}

function completeCircleSession() {
    if (!currentSession) return;
    
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Award points
    const earnedPoints = 50; // 기본 완료 포인트
    userPoints += earnedPoints;
    saveUserData();
    updateUI();
    
    // Show completion modal
    showAddHabitModal();
}

function resetCircleSession() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    currentSession = null;
    resetFocusState();
}

function checkMotivationMoments() {
    if (!currentSession) return;
    
    const elapsed = currentSession.duration - currentSession.remainingTime;
    const halfTime = Math.floor(currentSession.duration / 2);
    const nearEnd = currentSession.duration - 300; // 5분 전
    
    // Show motivation at half time and 5 minutes before end
    if (elapsed === halfTime || elapsed === nearEnd) {
        showCharacterMessage();
    }
}

function showCharacterMessage() {
    const messages = [
        '절반 지났어! 좋아.',
        '거의 다 왔어, 끝까지!',
        '집중력을 발휘해보자!',
        '지금 리듬이 아주 좋아!'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const messageText = document.querySelector('.message-text');
    const characterAvatar = document.querySelector('.character-avatar');
    
    if (messageText) messageText.textContent = randomMessage;
    
    if (currentPartner && PARTNERS_DATA[currentPartner]) {
        const partner = PARTNERS_DATA[currentPartner];
        if (characterAvatar) characterAvatar.textContent = partner.avatar;
    }
}

// ========================================
// HABIT ADDITION MODAL
// ========================================
function showAddHabitModal() {
    if (!currentSession) return;
    
    // Pre-fill habit name based on goal
    const habitModalName = document.getElementById('habitModalName');
    if (habitModalName) {
        habitModalName.value = currentSession.goal;
    }
    
    showModal('addHabitModal');
}

async function confirmAddHabit() {
    const habitName = document.getElementById('habitModalName')?.value?.trim();
    const activeCadence = document.querySelector('#addHabitModal .cadence-btn.active');
    
    if (!habitName) {
        showAlertModal('오류', '습관 이름을 입력해주세요.');
        return;
    }
    
    const cadence = activeCadence?.getAttribute('data-cadence') || 'daily';
    const defaultTime = currentSession ? Math.floor(currentSession.duration / 60) : 60;
    
    // Create new habit
    const newHabit = {
        id: Date.now().toString(),
        name: habitName,
        cadence: cadence,
        defaultTime: defaultTime,
        createdAt: Date.now()
    };
    
    try {
        if (dailytDB) {
            // IndexedDB에 저장
            await dailytDB.addHabit(newHabit);
            // 세션 기록도 추가
            await dailytDB.addSession({
                habitId: newHabit.id,
                goal: currentSession.goal,
                duration: currentSession.duration,
                points: 50
            });
            console.log('집중 세션에서 습관 생성 완료');
        } else {
            // 폴백: DailytDB 없으면 습관 기능 비활성화
            console.warn('⚠️ DailytDB가 없어서 습관을 저장할 수 없습니다.');
            showAlertModal('오류', 'IndexedDB를 사용할 수 없어 습관을 저장할 수 없습니다.');
            return;
        }
        
        hideModal('addHabitModal');
        showToast('습관 추가 완료!');
        
        // Reset session and switch to habits tab
        resetCircleSession();
        switchTab('habits');
        
        // Refresh habits list
        await loadHabitsTab();
        
        // Highlight habits tab briefly
        highlightHabitsTab();
    } catch (error) {
        console.error('습관 추가 실패:', error);
        showAlertModal('오류', '습관 추가에 실패했습니다.');
    }
}

function skipAddHabit() {
    hideModal('addHabitModal');
    resetCircleSession();
}

function highlightHabitsTab() {
    const habitsTabBtn = document.querySelector('[data-tab="habits"]');
    if (habitsTabBtn) {
        habitsTabBtn.style.animation = 'pulse 0.6s ease-in-out 2';
        
        // Remove animation after completion
        setTimeout(() => {
            habitsTabBtn.style.animation = '';
        }, 1200);
    }
}

// ========================================
// NEW HABIT CREATION MODAL
// ========================================
function showCreateHabitModal() {
    // Reset form
    const nameInput = document.getElementById('createHabitName');
    const timeSelect = document.getElementById('createHabitTime');
    const customTimeDiv = document.getElementById('createCustomTime');
    const customMinutes = document.getElementById('createCustomMinutes');
    
    if (nameInput) nameInput.value = '';
    if (timeSelect) timeSelect.value = '30';
    if (customTimeDiv) customTimeDiv.style.display = 'none';
    if (customMinutes) customMinutes.value = '';
    
    // Reset cadence toggle
    const cadenceButtons = document.querySelectorAll('#createHabitModal .cadence-btn');
    cadenceButtons.forEach(btn => btn.classList.remove('active'));
    const dailyBtn = document.querySelector('#createHabitModal .cadence-btn[data-cadence="daily"]');
    if (dailyBtn) dailyBtn.classList.add('active');
    
    showModal('createHabitModal');
}

function toggleCreateCustomTime() {
    const timeSelect = document.getElementById('createHabitTime');
    const customTimeDiv = document.getElementById('createCustomTime');
    
    if (timeSelect && customTimeDiv) {
        if (timeSelect.value === 'custom') {
            customTimeDiv.style.display = 'block';
        } else {
            customTimeDiv.style.display = 'none';
        }
    }
}

async function confirmCreateHabit() {
    const nameInput = document.getElementById('createHabitName');
    const timeSelect = document.getElementById('createHabitTime');
    const customMinutes = document.getElementById('createCustomMinutes');
    const activeCadence = document.querySelector('#createHabitModal .cadence-btn.active');
    
    const habitName = nameInput?.value?.trim();
    
    if (!habitName) {
        showAlertModal('오류', '습관 이름을 입력해주세요.');
        return;
    }
    
    let defaultTime;
    if (timeSelect?.value === 'custom') {
        defaultTime = parseInt(customMinutes?.value);
        if (!defaultTime || defaultTime <= 0) {
            showAlertModal('오류', '올바른 시간을 입력해주세요.');
            return;
        }
    } else {
        defaultTime = parseInt(timeSelect?.value || '30');
    }
    
    const cadence = activeCadence?.getAttribute('data-cadence') || 'daily';
    
    // Create new habit
    const newHabit = {
        id: Date.now().toString(),
        name: habitName,
        cadence: cadence,
        defaultTime: defaultTime,
        createdAt: Date.now()
    };
    
    try {
        if (dailytDB) {
            await dailytDB.addHabit(newHabit);
        } else {
            showAlertModal('오류', 'IndexedDB를 사용할 수 없어 습관을 저장할 수 없습니다.');
            return;
        }
        
        hideModal('createHabitModal');
        await renderHabitsList();
        
        // 습관 탭이 비활성화 상태라면 활성화
        const habitsTab = document.getElementById('habits-tab');
        const focusTab = document.getElementById('focus-tab');
        const habitsTabBtn = document.querySelector('.tab-btn[data-tab="habits"]');
        const focusTabBtn = document.querySelector('.tab-btn[data-tab="focus"]');
        
        if (habitsTab && !habitsTab.classList.contains('active')) {
            // 습관 탭으로 전환
            focusTab?.classList.remove('active');
            habitsTab.classList.add('active');
            focusTabBtn?.classList.remove('active');
            habitsTabBtn?.classList.add('active');
        }
        
        // 알림
        showToast('습관 등록 완료!');
        
    } catch (error) {
        console.error('습관 등록 실패:', error);
        showAlertModal('오류', '습관 등록에 실패했습니다.');
    }
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 18px 60px;
        border-radius: 30px;
        font-size: 15px;
        font-weight: 700;
        font-family: 'NanumSquareRound', Arial, sans-serif;
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
        min-width: 360px;
        max-width: 85vw;
        text-align: center;
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ========================================
// HABIT MANAGEMENT
// ========================================
async function loadHabitsTab() {
    await renderHabitsList();
}

async function renderHabitsList() {
    // DOM 준비 대기
    if (document.readyState !== 'complete') {
        await new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve, { once: true });
            }
        });
    }
    
    const habitsList = document.getElementById('habitsList');
    
    if (!habitsList) {
        console.error('habitsList 엘리먼트를 찾을 수 없습니다!');
        return;
    }
    
    // emptyState는 동적으로 찾거나 생성
    let emptyState = habitsList.querySelector('#emptyHabits');
    if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.id = 'emptyHabits';
        emptyState.className = 'empty-habits';
        emptyState.innerHTML = `
            <div class="empty-icon">📋</div>
            <p class="empty-text">아직 습관이 없어요.</p>
            <p class="empty-subtext">위 버튼을 눌러 등록해보자!</p>
        `;
    }
    
    try {
        // IndexedDB에서 항상 최신 데이터 가져오기 (동기화 보장)
        if (dailytDB) {
            const dbHabits = await dailytDB.getHabits();
            userHabits = dbHabits;
        }
        
        // Clear existing habits
        habitsList.innerHTML = '';
        
        if (userHabits.length === 0) {
            habitsList.innerHTML = '';
            habitsList.appendChild(emptyState);
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // 최신 등록순으로 정렬 (createdAt 기준 내림차순)
        const sortedHabits = [...userHabits].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        // Render each habit
        sortedHabits.forEach(habit => {
            const habitItem = document.createElement('div');
            habitItem.className = 'habit-item';
            habitItem.setAttribute('data-habit-id', habit.id);
            
            habitItem.innerHTML = `
                <div class="habit-info">
                    <h4 class="habit-title">${habit.name}</h4>
                    <p class="habit-duration">${habit.cadence === 'daily' ? '일간' : '주간'} · 기본 시간: ${habit.defaultTime}분</p>
                </div>
                <div class="habit-actions">
                    <button class="habit-delete-btn" title="삭제"><i data-lucide="trash-2"></i></button>
                    <button class="habit-edit-btn" title="편집"><i data-lucide="edit"></i></button>
                    <button class="habit-start-btn" title="시작"><i data-lucide="play"></i></button>
                </div>
            `;
            
            // 편집 버튼 이벤트 리스너 추가
            const editBtn = habitItem.querySelector('.habit-edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditHabitModal(habit);
            });
            
            // 삭제 버튼 이벤트 리스너 추가
            const deleteBtn = habitItem.querySelector('.habit-delete-btn');
            deleteBtn.addEventListener('click', async (e) => {
                console.log('🖱️ 삭제 버튼 클릭됨 - 습관:', habit.name, '(ID:', habit.id, ')');
                e.stopPropagation();
                await deleteHabit(habit.id);
            });
            
            habitsList.appendChild(habitItem);
        });
        
        // Lucide 아이콘 초기화
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
    } catch (error) {
        console.error('습관 목록 렌더링 실패:', error);
        
        // 폴백으로 빈 상태 표시
        if (habitsList) {
            habitsList.innerHTML = '';
            if (emptyState) {
                habitsList.appendChild(emptyState);
                emptyState.style.display = 'block';
            }
        }
    }
}

// 습관 삭제 함수
async function deleteHabit(habitId) {
    console.log('🗑️ === 습관 삭제 프로세스 시작 ===');
    console.log('🆔 삭제할 습관 ID:', habitId);
    
    try {
        console.log('❓ 사용자 확인 모달 표시 중...');
        const confirmed = await showConfirmModal('습관 삭제', '정말로 이 습관을 삭제하시겠습니까?');
        console.log('📋 모달 결과:', confirmed);
        
        if (!confirmed) {
            console.log('❌ 사용자가 삭제를 취소함');
            return;
        }
        
        console.log('✅ 사용자가 삭제를 확인함');
        
        // 삭제 전 현재 상태 확인
        console.log('📊 삭제 전 상태 확인:');
        console.log('  - dailytDB 상태:', dailytDB ? '✅ 초기화됨' : '❌ 미초기화');
        console.log('  - 현재 메모리 습관 수:', userHabits.length);
        
        if (dailytDB) {
            console.log('💾 IndexedDB에서 습관 삭제 시작...');
            
            // DB 삭제 전 해당 습관이 존재하는지 확인
            const existingHabits = await dailytDB.getHabits();
            const targetHabit = existingHabits.find(h => h.id === habitId);
            console.log('🔍 삭제할 습관 DB 존재 여부:', targetHabit ? '✅ 존재' : '❌ 없음');
            if (targetHabit) {
                console.log('📝 삭제할 습관 정보:', targetHabit.name);
            }
            
            await dailytDB.deleteHabit(habitId);
            console.log('✅ DB에서 삭제 완료');
            
            // DB 삭제 후 확인
            const afterHabits = await dailytDB.getHabits();
            console.log('📊 삭제 후 DB 습관 수:', afterHabits.length);
        } else {
            console.error('❌ DailytDB가 초기화되지 않음');
            showAlertModal('오류', 'IndexedDB를 사용할 수 없어 습관을 삭제할 수 없습니다.');
            return;
        }
        
        console.log('🔄 UI 갱신 시작...');
        console.log('🎯 renderHabitsList 호출 전 메모리 상태:', userHabits.length);
        
        await renderHabitsList();
        
        console.log('🎯 renderHabitsList 호출 후 메모리 상태:', userHabits.length);
        console.log('✅ UI 갱신 완료');
        
        // DOM 확인
        const habitsList = document.getElementById('habitsList');
        const habitItems = habitsList ? habitsList.querySelectorAll('.habit-item') : [];
        console.log('🌐 DOM 상태: 화면에 표시된 습관 수:', habitItems.length);
        
        showToast('습관이 삭제되었습니다.');
        console.log('🎉 삭제 프로세스 완료');
        
    } catch (error) {
        console.error('❌ 습관 삭제 중 오류 발생:', error);
        console.error('❌ 오류 스택:', error.stack);
        showAlertModal('오류', '습관 삭제에 실패했습니다.');
    }
}

function toggleCadence(button) {
    const container = button.closest('.cadence-toggle');
    if (!container) return;
    
    // Remove active from all cadence buttons in this container
    container.querySelectorAll('.cadence-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active to clicked button
    button.classList.add('active');
}



function startHabitFromList(habitId) {
    const habit = userHabits.find(h => h.id === habitId);
    if (!habit) return;
    
    // Create session from habit
    currentSession = {
        goal: habit.name,
        duration: habit.defaultTime * 60, // Convert to seconds
        remainingTime: habit.defaultTime * 60,
        startTime: Date.now(),
        isPaused: false,
        source: 'habit',
        habitId: habitId
    };
    
    // Switch to focus tab and show progress
    switchTab('focus');
    setFocusState('progress');
    
    // Update progress display
    updateProgressDisplay();
    
    // Start timer
    startProgressTimer();
    
    // Show success toast
    showToast('타이머 시작! 내가 중간에 챙겨줄게 🙌');
}




// ========================================
// PARTNER SYSTEM
// ========================================
function showPartnerExchangeModal(partnerId) {
    const partner = PARTNERS_DATA[partnerId];
    if (!partner) return;
    
    // 모달 내용 업데이트
    document.getElementById('exchangePartnerAvatar').textContent = partner.avatar;
    document.getElementById('exchangePartnerName').textContent = partner.name;
    document.getElementById('exchangePartnerDesc').textContent = partner.description;
    document.getElementById('exchangeCost').textContent = partner.cost;
    document.getElementById('currentPoints').textContent = userPoints;
    
    // 교환 버튼 상태 설정
    const confirmBtn = document.getElementById('confirmExchange');
    confirmBtn.disabled = userPoints < partner.cost;
    confirmBtn.setAttribute('data-partner', partnerId);
    
    showModal('partnerExchangeModal');
}

function confirmPartnerExchange() {
    const confirmBtn = document.getElementById('confirmExchange');
    const partnerId = confirmBtn.getAttribute('data-partner');
    const partner = PARTNERS_DATA[partnerId];
    
    if (!partner || userPoints < partner.cost) return;
    
    // 포인트 차감 및 파트너 설정
    userPoints -= partner.cost;
    currentPartner = partnerId;
    
    saveUserData();
    updateUI();
    hideModal('partnerExchangeModal');
    
    // 성공 알림
    showAlertModal(
        '파트너 교환 완료',
        `${partner.name}이(가) 이제 당신의 파트너입니다!`
    );
}

// ========================================
// SESSION COMPLETE MODAL
// ========================================
function showSessionCompleteModal(earnedPoints) {
    // 완료된 목표 표시
    document.getElementById('completedGoal').textContent = currentSession.goal;
    
    // 보상 포인트 표시
    document.getElementById('focusReward').textContent = `+50pt`;
    
    // 생활 연계 보너스 숨김
    const habitBonus = document.querySelector('.habit-bonus');
    if (habitBonus) {
        habitBonus.style.display = 'none';
    }
    
    // 파트너 메시지
    if (currentPartner) {
        const partner = PARTNERS_DATA[currentPartner];
        const messages = partner.messages.completion;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        document.querySelector('.message-avatar').textContent = partner.avatar;
        document.querySelector('.message-text').textContent = randomMessage;
    }
    
    showModal('sessionCompleteModal');
}

// ========================================
// DATA MANAGEMENT
// ========================================
async function saveUserData() {
    try {
        if (dailytDB) {
            // IndexedDB에 저장
            await dailytDB.saveUserData({
                points: userPoints,
                currentPartner: currentPartner
            });
        } else {
            // 폴백: localStorage에 저장 (습관 제외, 포인트/파트너만)
            const userData = {
                points: userPoints,
                partner: currentPartner,
                lastSaved: Date.now()
            };
            localStorage.setItem('dailit_data', JSON.stringify(userData));
        }
    } catch (error) {
        console.error('데이터 저장 중 오류:', error);
    }
}

async function loadUserData() {
    try {
        if (dailytDB) {
            // IndexedDB에서 데이터 로드 (포인트/파트너만)
            const userData = await dailytDB.getUserData();
            userPoints = userData?.points || 100;
            currentPartner = userData?.currentPartner || null;
            
            // 습관은 별도로 DailytDB에서 로드
            const habits = await dailytDB.getHabits();
            userHabits = habits || [];
        } else {
            // 폴백: localStorage에서 로드 (포인트/파트너만)
            const saved = localStorage.getItem('dailit_data');
            if (saved) {
                const userData = JSON.parse(saved);
                userPoints = userData.points || 100;
                currentPartner = userData.partner || null;
            } else {
                // 기본값 설정
                userPoints = 100;
                currentPartner = null;
            }
            // 습관은 빈 배열로 초기화 (DailytDB 없으면 습관 기능 비활성화)
            userHabits = [];
        }
    } catch (error) {
        console.error('데이터 로드 중 오류:', error);
        // 기본값으로 초기화
        userPoints = 100;
        currentPartner = null;
        userHabits = [];
    }
}

// localStorage에서 IndexedDB로 마이그레이션
async function migrateFromLocalStorage() {
    if (!dailytDB) return;
    
    try {
        const savedData = localStorage.getItem('dailit_data');
        if (savedData) {
            console.log('기존 localStorage 데이터 발견, 마이그레이션 시작');
            const data = JSON.parse(savedData);
            
            // 사용자 데이터 마이그레이션
            if (data.points || data.partner) {
                await dailytDB.saveUserData({
                    points: data.points || 100,
                    currentPartner: data.partner
                });
            }
            
            // 습관 데이터 마이그레이션
            if (data.habits && data.habits.length > 0) {
                for (const habit of data.habits) {
                    try {
                        await dailytDB.addHabit(habit);
                    } catch (error) {
                        console.warn('습관 마이그레이션 실패:', habit.name, error);
                    }
                }
            }
            
            // 마이그레이션 완료 후 localStorage 데이터 삭제
            localStorage.removeItem('dailit_data');
            console.log('마이그레이션 완료, localStorage 데이터 삭제됨');
        }
        
        // 게임 데이터 마이그레이션 (localStorage의 개별 게임 키들)
        await dailytDB.migrateGameDataFromLocalStorage();
        
    } catch (error) {
        console.error('마이그레이션 실패:', error);
    }
}

// ========================================
// DATABASE BACKUP & RESTORE
// ========================================
async function exportDailytData() {
    try {
        if (dailytDB) {
            const data = await dailytDB.exportData();
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dailyt-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showToast('데이터 백업 완료!');
        } else {
            showAlertModal('오류', '데이터베이스가 초기화되지 않았습니다.');
        }
    } catch (error) {
        console.error('데이터 내보내기 실패:', error);
        showAlertModal('오류', '데이터 내보내기에 실패했습니다.');
    }
}

async function importDailytData(file) {
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.habits || !Array.isArray(data.habits)) {
            throw new Error('잘못된 백업 파일 형식입니다.');
        }
        
        if (dailytDB) {
            // 기존 데이터 삭제 확인
            const confirmed = await showConfirmModal(
                '데이터 복원', 
                '기존 데이터가 삭제되고 백업 데이터로 교체됩니다. 계속하시겠습니까?'
            );
            
            if (!confirmed) return;
            
            // 기존 습관 삭제
            const existingHabits = await dailytDB.getHabits();
            for (const habit of existingHabits) {
                await dailytDB.deleteHabit(habit.id);
            }
            
            // 새로운 습관 추가
            for (const habit of data.habits) {
                await dailytDB.addHabit(habit);
            }
            
            // 사용자 데이터 복원
            if (data.userData) {
                await dailytDB.saveUserData({
                    points: data.userData.points || 100,
                    currentPartner: data.userData.currentPartner
                });
            }
            
            // 세션 데이터 복원 (선택사항)
            if (data.sessions && Array.isArray(data.sessions)) {
                // 기존 세션들 삭제 후 새로운 세션들 추가
                // TODO: 세션 삭제 메서드가 필요하면 추가
            }
            
            // 데이터 다시 로드
            await loadUserData();
            await loadHabitsTab();
            updateUI();
            
            showToast('데이터 복원 완료!');
        } else {
            showAlertModal('오류', '데이터베이스가 초기화되지 않았습니다.');
        }
    } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        showAlertModal('오류', '데이터 가져오기에 실패했습니다. 올바른 백업 파일인지 확인해주세요.');
    }
}

// 파일 선택 및 가져오기 헬퍼
function selectBackupFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        if (e.target.files.length > 0) {
            importDailytData(e.target.files[0]);
        }
    };
    input.click();
}

// 개발자 도구용 - 브라우저 콘솔에서 사용 가능
window.DailytDB = {
    export: exportDailytData,
    import: selectBackupFile,
    clearAll: async () => {
        if (dailytDB && confirm('모든 데이터를 삭제하시겠습니까?')) {
            const habits = await dailytDB.getHabits();
            for (const habit of habits) {
                await dailytDB.deleteHabit(habit.id);
            }
            await loadUserData();
            await loadHabitsTab();
            updateUI();
            console.log('모든 데이터가 삭제되었습니다.');
        }
    },
    stats: async () => {
        if (dailytDB) {
            const data = await dailytDB.exportData();
            console.log('데이터베이스 통계:', {
                습관수: data.habits?.length || 0,
                포인트: data.userData?.points || 0,
                세션수: data.sessions?.length || 0,
                마지막백업: data.exportedAt
            });
        }
    }
};

// ========================================
// UI UPDATES
// ========================================
function updateUI() {
    // 포인트 표시 업데이트
    const pointsCount = document.querySelector('.points-count');
    if (pointsCount) {
        pointsCount.textContent = userPoints;
    }
    
    // 캐릭터 관련 UI 업데이트
    if (typeof updateCharacterPoints === 'function') {
        updateCharacterPoints();
    }
    if (typeof updateCharacterGachaPullButton === 'function') {
        updateCharacterGachaPullButton();
    }
    
    // 현재 선택된 캐릭터 표시 업데이트
    const partnerIcon = document.querySelector('.current-partner .partner-icon');
    const partnerName = document.querySelector('.partner-name');
    
    // 선택된 캐릭터 이름 표시 (game.js의 appState 사용)
    if (typeof appState !== 'undefined' && appState.gacha && appState.gacha.selectedCharacter && typeof characterDatabase !== 'undefined') {
        const selectedCharacterType = appState.gacha.selectedCharacter;
        const character = characterDatabase[selectedCharacterType];
        
        if (character && partnerName) {
            partnerName.textContent = character.name;
        }
    } else {
        // 기본값: 포코타
        if (partnerName) {
            partnerName.textContent = '포코타';
        }
    }
    
    // 아이콘은 숨기기
    if (partnerIcon) {
        partnerIcon.style.display = 'none';
    }
    
    // 파트너 카드 버튼 상태 업데이트
    updatePartnerButtons();
}

function updatePartnerButtons() {
    const partnerButtons = document.querySelectorAll('.partner-btn');
    partnerButtons.forEach(button => {
        const partnerId = button.getAttribute('data-partner');
        const partner = PARTNERS_DATA[partnerId];
        
        if (partner) {
            const canAfford = userPoints >= partner.cost;
            const isOwned = currentPartner === partnerId;
            
            if (isOwned) {
                button.textContent = '보유 중';
                button.disabled = true;
                button.style.background = '#27ae60';
            } else if (canAfford) {
                button.textContent = '교환하기';
                button.disabled = false;
                button.style.background = '';
            } else {
                button.textContent = '포인트 부족';
                button.disabled = true;
                button.style.background = '#bdc3c7';
            }
        }
    });
}

// ========================================
// ENVIRONMENT CONFIGURATION
// ========================================
class Config {
    static loadEnvironmentVariables() {
        // .env 파일 로딩은 브라우저에서는 제한적이므로
        // 실제 배포 시에는 서버사이드에서 처리하거나 빌드 타임에 주입
        try {
            // 개발 환경에서는 localStorage나 다른 방식으로 API 키 관리
            const apiKey = localStorage.getItem('OPENAI_API_KEY');
            if (apiKey) {
                return apiKey;
            }
        } catch (error) {
            console.warn('환경변수 로드 중 오류:', error);
        }
        return null;
    }
    
    static getApiKey() {
        return this.loadEnvironmentVariables();
    }
    
    static setApiKey(key) {
        try {
            localStorage.setItem('OPENAI_API_KEY', key);
        } catch (error) {
            console.error('API 키 저장 중 오류:', error);
        }
    }
}

// ========================================
// RESPONSIVE LAYOUT ADJUSTMENTS
// ========================================
function adjustContainerPadding() {
    try {
        const header = document.querySelector('.header');
        const container = document.querySelector('.container');
        
        if (header && container) {
            // 헤더의 실제 높이 측정
            const headerHeight = header.getBoundingClientRect().height;
            
            // 최소 패딩과 여유 공간을 고려한 패딩 계산
            const minPadding = 80;
            const padding = Math.max(minPadding, headerHeight + 20);
            
            // 컨테이너 패딩 조정
            container.style.paddingTop = `${padding}px`;
        }
    } catch (error) {
        console.error('컨테이너 패딩 조정 중 오류:', error);
    }
}

// ========================================
// DEVELOPER TOOLS (Global Functions)
// ========================================
window.DebugDB = {
    // DB 완전 초기화
    async clearAll() {
        console.log('🔧 DB 초기화 시작...');
        if (dailytDB) {
            await dailytDB.clearAllHabits();
            userHabits = []; // 메모리도 초기화
            console.log('DB에서 모든 습관 삭제 완료');
            
            // UI 갱신 시도
            try {
                await renderHabitsList();
                console.log('✅ 모든 습관 데이터가 삭제되고 UI 갱신 완료');
            } catch (error) {
                console.error('UI 갱신 실패:', error);
            }
        } else {
            console.warn('⚠️ 데이터베이스가 초기화되지 않았습니다. 앱을 새로고침해보세요.');
        }
    },
    
    // 습관 목록 출력
    async list() {
        console.log('📋 습관 목록 조회...');
        if (dailytDB) {
            const habits = await dailytDB.getHabits();
            console.table(habits);
            console.log(`총 ${habits.length}개의 습관`);
            return habits;
        }
        console.warn('⚠️ DB가 초기화되지 않았습니다.');
        return [];
    },
    
    // 통계 출력
    async stats() {
        console.log('📊 시스템 상태 조회...');
        console.log('dailytDB 상태:', dailytDB ? '✅ 초기화됨' : '❌ 초기화 안됨');
        console.log('현재 메모리 습관 수:', userHabits.length);
        
        if (dailytDB) {
            const dbHabits = await dailytDB.getHabits();
            console.log(`DB: ${dbHabits.length}개, 메모리: ${userHabits.length}개의 습관`);
            console.log('동기화 상태:', dbHabits.length === userHabits.length ? '✅' : '❌');
            return {
                db: dbHabits.length,
                memory: userHabits.length,
                synchronized: dbHabits.length === userHabits.length,
                dbHabits: dbHabits,
                memoryHabits: userHabits
            };
        }
        return { db: 0, memory: userHabits.length, synchronized: false, dbHabits: [], memoryHabits: userHabits };
    },
    
    // DB와 UI 강제 동기화
    async sync() {
        console.log('🔄 DB 동기화 시작...');
        if (dailytDB) {
            try {
                await renderHabitsList();
                console.log('🔄 DB와 UI 동기화 완료');
                return userHabits;
            } catch (error) {
                console.error('동기화 실패:', error);
            }
        } else {
            console.warn('⚠️ DB가 초기화되지 않았습니다.');
        }
        return [];
    },
    
    // 앱 상태 진단
    diagnose() {
        console.log('🔍 앱 상태 진단');
        console.log('1. dailytDB:', dailytDB ? '✅ 초기화됨' : '❌ 미초기화');
        console.log('2. userHabits 배열:', Array.isArray(userHabits) ? `✅ ${userHabits.length}개` : '❌ 잘못됨');
        
        // DOM 엘리먼트 확인
        const habitsList = document.getElementById('habitsList');
        const emptyHabits = document.getElementById('emptyHabits');
        console.log('3. habitsList DOM:', habitsList ? '✅ 존재' : '❌ 없음');
        console.log('4. emptyHabits DOM:', emptyHabits ? '✅ 존재' : '❌ 없음');
        
        // 현재 탭 확인
        const habitsTab = document.getElementById('habits-tab');
        const isActive = habitsTab?.classList.contains('active');
        console.log('5. 습관 탭 활성:', isActive ? '✅ 활성' : '❌ 비활성');
        
        return {
            db: !!dailytDB,
            habits: userHabits.length,
            dom: !!(habitsList && emptyHabits),
            tabActive: !!isActive
        };
    }
};

// ========================================
// HABIT EDIT FUNCTIONALITY
// ========================================

// 편집할 습관의 ID를 저장하는 변수
let editingHabitId = null;

// 편집 모달 열기
function openEditHabitModal(habit) {
    editingHabitId = habit.id;
    
    // 폼 필드에 기존 데이터 채우기
    document.getElementById('editHabitName').value = habit.name;
    document.getElementById('editHabitTime').value = habit.defaultTime === habit.defaultTime && ![10, 30, 60].includes(habit.defaultTime) ? 'custom' : habit.defaultTime;
    
    // 사용자 지정 시간 처리
    if (![10, 30, 60].includes(habit.defaultTime)) {
        document.getElementById('editCustomTime').style.display = 'block';
        document.getElementById('editCustomMinutes').value = habit.defaultTime;
    } else {
        document.getElementById('editCustomTime').style.display = 'none';
        document.getElementById('editCustomMinutes').value = '';
    }
    
    // 반복 주기 버튼 상태 설정
    const cadenceButtons = document.querySelectorAll('#editHabitModal .cadence-btn');
    cadenceButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.cadence === habit.cadence) {
            btn.classList.add('active');
        }
    });
    
    showModal('editHabitModal');
}

// 습관 업데이트
async function updateHabit(habitId, updatedData) {
    try {
        if (!dailytDB) {
            throw new Error('데이터베이스가 초기화되지 않았습니다.');
        }
        
        // 메모리에서 기존 습관 찾기
        const habitIndex = userHabits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) {
            throw new Error('습관을 찾을 수 없습니다.');
        }
        
        // 업데이트된 습관 객체 생성
        const updatedHabit = { ...userHabits[habitIndex], ...updatedData };
        
        // DB에서 습관 업데이트
        await dailytDB.updateHabit(updatedHabit);
        
        // 메모리에서 습관 업데이트
        userHabits[habitIndex] = updatedHabit;
        
        // UI 갱신
        await renderHabitsList();
        
        console.log('습관 업데이트 완료:', updatedData);
    } catch (error) {
        console.error('습관 업데이트 실패:', error);
        showAlert('습관 수정 실패', '습관을 수정하는 중 오류가 발생했습니다.');
    }
}

// 편집 모달 이벤트 리스너 설정
function setupEditHabitEventListeners() {
    // 시간 선택 변경 이벤트
    const editTimeSelect = document.getElementById('editHabitTime');
    const editCustomTimeDiv = document.getElementById('editCustomTime');
    
    editTimeSelect?.addEventListener('change', function() {
        if (this.value === 'custom') {
            editCustomTimeDiv.style.display = 'block';
        } else {
            editCustomTimeDiv.style.display = 'none';
        }
    });
    
    // 반복 주기 버튼 이벤트
    const editCadenceButtons = document.querySelectorAll('#editHabitModal .cadence-btn');
    editCadenceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            editCadenceButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 저장 버튼 이벤트
    document.getElementById('confirmEditHabit')?.addEventListener('click', async function() {
        const name = document.getElementById('editHabitName').value.trim();
        const timeSelect = document.getElementById('editHabitTime');
        const customMinutes = document.getElementById('editCustomMinutes').value;
        const activeCadenceBtn = document.querySelector('#editHabitModal .cadence-btn.active');
        
        // 유효성 검사
        if (!name) {
            showAlert('입력 오류', '습관 이름을 입력해주세요.');
            return;
        }
        
        if (!activeCadenceBtn) {
            showAlert('입력 오류', '반복 주기를 선택해주세요.');
            return;
        }
        
        let defaultTime;
        if (timeSelect.value === 'custom') {
            if (!customMinutes || customMinutes < 1 || customMinutes > 300) {
                showAlert('입력 오류', '시간을 1~300분 사이로 입력해주세요.');
                return;
            }
            defaultTime = parseInt(customMinutes);
        } else {
            defaultTime = parseInt(timeSelect.value);
        }
        
        const updatedData = {
            name: name,
            cadence: activeCadenceBtn.dataset.cadence,
            defaultTime: defaultTime
        };
        
        await updateHabit(editingHabitId, updatedData);
        hideModal('editHabitModal');
        editingHabitId = null;
    });
    
    // 취소 버튼 이벤트
    document.getElementById('cancelEditHabit')?.addEventListener('click', function() {
        hideModal('editHabitModal');
        editingHabitId = null;
    });
}

// ========================================
// CHARACTERS TAB MANAGEMENT
// ========================================

// 캐릭터 탭 로드
async function loadCharactersTab() {
    try {
        // game.js의 캐릭터 관련 함수들 호출
        if (typeof loadCharacterGameData === 'function') {
            await loadCharacterGameData();
        }
        if (typeof updateCharacterPoints === 'function') {
            updateCharacterPoints();
        }
        if (typeof updateCharacterGachaPullButton === 'function') {
            updateCharacterGachaPullButton();
        }
        if (typeof updateCharacterCollectionAndOwnedCounts === 'function') {
            updateCharacterCollectionAndOwnedCounts();
        }
        if (typeof updateCharacterCollectionMain === 'function') {
            updateCharacterCollectionMain();
        }
        
        // 가차 버튼 이벤트 리스너 설정
        setupCharacterGachaButton();
        
    } catch (error) {
        console.error('캐릭터 탭 로드 실패:', error);
    }
}

// 캐릭터 가차 버튼 설정
function setupCharacterGachaButton() {
    const gachaPullBtn = document.getElementById('characterGachaPull');
    if (gachaPullBtn) {
        // 기존 이벤트 리스너 제거
        gachaPullBtn.replaceWith(gachaPullBtn.cloneNode(true));
        
        // 새 이벤트 리스너 추가
        document.getElementById('characterGachaPull').addEventListener('click', async function() {
            const points = userPoints;
            
            if (points >= 150) {
                // 포인트가 충분하면 가차 실행
                if (typeof performCharacterGachaPull === 'function') {
                    await performCharacterGachaPull();
                }
            } else {
                // 포인트 부족하면 토스트 표시
                const needed = 150 - points;
                showToast(`${needed} 포인트가 부족해`);
            }
        });
    }
}

// 메인 페이지용 캐릭터 데이터 로드
async function loadCharacterGameData() {
    if (typeof loadGameData === 'function') {
        await loadGameData();
    }
    if (typeof ensurePokotaOwned === 'function') {
        await ensurePokotaOwned();
    }
}

// 메인 페이지용 캐릭터 포인트 업데이트 (현재는 버튼에서 처리)
function updateCharacterPoints() {
    // 포인트 표시는 버튼에서 처리하므로 빈 함수
}

// 메인 페이지용 가차 버튼 업데이트
function updateCharacterGachaPullButton() {
    const gachaPullBtn = document.getElementById('characterGachaPull');
    const gachaBtnText = gachaPullBtn?.querySelector('.character-gacha-btn-text');
    const points = userPoints;
    
    // Update button text and state
    if (gachaBtnText) {
        gachaBtnText.textContent = '캐릭터 뽑기';
        
        if (points >= 150) {
            gachaPullBtn.classList.add('active');
            gachaPullBtn.disabled = false;
        } else {
            gachaPullBtn.classList.remove('active');
            gachaPullBtn.disabled = true;
        }
    }
}

// 메인 페이지용 컬렉션 통계 업데이트
function updateCharacterCollectionAndOwnedCounts() {
    const collectionStats = document.getElementById('characterCollectionStats');
    
    if (typeof appState !== 'undefined' && appState.gacha && typeof characterDatabase !== 'undefined') {
        const userCharacters = appState.gacha.characters;
        const uniqueTypes = new Set(userCharacters.map(char => char.type));
        const totalTypes = Object.keys(characterDatabase).length;
        
        if (collectionStats) {
            collectionStats.textContent = `${uniqueTypes.size}/${totalTypes}종 수집`;
        }
    }
}

// 메인 페이지용 캐릭터 컬렉션 업데이트
function updateCharacterCollectionMain() {
    const collectionGrid = document.getElementById('characterCollectionGrid');
    if (!collectionGrid || typeof characterDatabase === 'undefined' || typeof appState === 'undefined') return;
    
    // Get all character types from database
    const allCharacterTypes = Object.keys(characterDatabase);
    const userCharacters = appState.gacha.characters;
    
    // Create a map of owned characters by type
    const ownedCharactersByType = {};
    userCharacters.forEach(char => {
        if (!ownedCharactersByType[char.type]) {
            ownedCharactersByType[char.type] = [];
        }
        ownedCharactersByType[char.type].push(char);
    });
    
    // Display all characters from database
    collectionGrid.innerHTML = allCharacterTypes.map(type => {
        const character = characterDatabase[type];
        const owned = ownedCharactersByType[type] || [];
        const isOwned = owned.length > 0;
        
        // Show character info
        const displayColor = isOwned ? character.color : '#ccc';
        const isSelected = appState.gacha.selectedCharacter === type;
        
        // Get selected costume for this character
        const selectedCostume = appState.gacha.selectedCostumes[type];
        const displayImage = isOwned && selectedCostume ? selectedCostume.image : character.image;
        
        return `
            <div class="character-card-main ${isOwned ? 'owned' : 'unowned'} ${isSelected ? 'selected' : ''}" style="border-color: ${displayColor}" onclick="selectCharacterFromCollectionMain('${type}', ${isOwned})">
                <div class="character-image-main-container">
                    <div class="character-image-main ${!isOwned ? 'grayscale' : ''}">
                        <img src="${displayImage}" alt="${character.name}" class="character-image">
                    </div>
                    ${!isOwned ? '<div class="character-locked-badge-main">🔒</div>' : ''}
                </div>
                <div class="character-name-main ${!isOwned ? 'unowned-text-main' : ''}">${character.name}</div>
                <div class="character-count-main ${!isOwned ? 'unowned-text-main' : ''}">${isOwned ? '스킨 변경' : '미보유'}</div>
            </div>
        `;
    }).join('');
}

// 메인 페이지용 캐릭터 선택 처리
function selectCharacterFromCollectionMain(characterType, isOwned) {
    if (!isOwned) {
        showToast('아직 보유하지 않은 캐릭터입니다. 포인트를 모아 뽑기를 해보세요! 🎯');
        return;
    }
    
    // 코스튬 선택 모달 열기 (game.js 함수 사용)
    if (typeof openCostumeModal === 'function') {
        openCostumeModal(characterType);
    }
}

// 메인 페이지용 가차 실행
async function performCharacterGachaPull() {
    if (userPoints < 150) {
        showToast('포인트가 부족해요! 더 많은 활동을 해보세요! 💪');
        return;
    }
    
    // 포인트 차감
    userPoints -= 150;
    await saveUserData(); // 메인 페이지의 사용자 데이터 저장
    
    // game.js의 performGachaPull 함수를 사용하되, 포인트는 메인 페이지에서 관리
    if (typeof performGachaPull === 'function') {
        // 임시로 appState.timer.points를 업데이트
        if (typeof appState !== 'undefined') {
            appState.timer.points = userPoints;
        }
        
        await performGachaPull();
        
        // UI 업데이트
        updateUI();
        updateCharacterPoints();
        updateCharacterGachaPullButton();
        updateCharacterCollectionAndOwnedCounts();
        updateCharacterCollectionMain();
    }
}

// ========================================
// HABIT SELECTION FOR FOCUS TIMER
// ========================================

// 집중 타이머용 습관 선택 모달 열기
function openSelectHabitModal() {
    renderSelectHabitList();
    showModal('selectHabitModal');
}

// 습관 선택 모달에 습관 목록 렌더링
function renderSelectHabitList() {
    const selectHabitList = document.getElementById('selectHabitList');
    const emptySelectHabits = document.getElementById('emptySelectHabits');
    
    if (!selectHabitList) return;
    
    // 기존 습관 아이템들 제거 (빈 상태 제외)
    const existingItems = selectHabitList.querySelectorAll('.select-habit-item');
    existingItems.forEach(item => item.remove());
    
    // 습관이 없는 경우
    if (!userHabits || userHabits.length === 0) {
        if (emptySelectHabits) {
            emptySelectHabits.style.display = 'block';
        }
        return;
    }
    
    // 빈 상태 숨기기
    if (emptySelectHabits) {
        emptySelectHabits.style.display = 'none';
    }
    
    // 습관 목록 렌더링
    const sortedHabits = [...userHabits].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    sortedHabits.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'select-habit-item';
        habitItem.setAttribute('data-habit-id', habit.id);
        
        habitItem.innerHTML = `
            <div class="select-habit-info">
                <div class="select-habit-name">${habit.name}</div>
                <div class="select-habit-details">${habit.cadence === 'daily' ? '일간' : '주간'} · 기본 시간: ${habit.defaultTime}분</div>
            </div>
            <div class="select-habit-icon">
                <i data-lucide="check"></i>
            </div>
        `;
        
        // 습관 선택 이벤트
        habitItem.addEventListener('click', function() {
            selectHabitForFocus(habit);
        });
        
        selectHabitList.appendChild(habitItem);
    });
    
    // Lucide 아이콘 초기화
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// 집중 타이머용 습관 선택 처리
function selectHabitForFocus(habit) {
    // 목표 입력 필드에 습관 이름 설정
    const goalInput = document.getElementById('circleGoalInput');
    if (goalInput) {
        goalInput.value = habit.name;
    }
    
    // 시간 설정
    const timeChips = document.querySelectorAll('.time-chip');
    let matchingTimeChip = null;
    
    // 기본 시간과 일치하는 시간 칩 찾기
    timeChips.forEach(chip => {
        chip.classList.remove('active');
        const chipTime = parseInt(chip.getAttribute('data-time'));
        if (chipTime === habit.defaultTime) {
            matchingTimeChip = chip;
        }
    });
    
    if (matchingTimeChip) {
        // 일치하는 시간 칩이 있으면 활성화
        matchingTimeChip.classList.add('active');
        // 사용자 지정 입력 숨기기
        const customTimeInput = document.getElementById('customTimeInput');
        if (customTimeInput) {
            customTimeInput.style.display = 'none';
        }
    } else {
        // 일치하는 시간 칩이 없으면 직접입력 사용
        const customTimeBtn = document.getElementById('customTimeBtn');
        const customTimeInput = document.getElementById('customTimeInput');
        const customMinutes = document.getElementById('customMinutes');
        
        if (customTimeBtn) {
            customTimeBtn.classList.add('active');
        }
        if (customTimeInput) {
            customTimeInput.style.display = 'block';
        }
        if (customMinutes) {
            customMinutes.value = habit.defaultTime;
        }
    }
    
    // 시작 버튼 활성화 상태 업데이트
    updateCircleStartButton();
    
    // 모달 닫기
    hideModal('selectHabitModal');
    
    // 토스트 메시지
    showToast(`"${habit.name}" 습관이 선택되었습니다!`);
}

// 앱 시작시 환경변수 로드
Config.loadEnvironmentVariables();