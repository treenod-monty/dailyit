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
let completedSessionData = null; // 완료된 세션 데이터 저장용
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
        await loadCharacterGameData(); // 캐릭터 게임 데이터 로드 추가
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
    document.addEventListener('click', async function(e) {
        if (e.target.matches('.tab-btn')) {
            await switchTab(e.target.getAttribute('data-tab'));
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
    
    // Custom time input change (for circle timer)
    document.getElementById('customTimeValue')?.addEventListener('input', function() {
        updateCircleStartButton();
    });
    
    // Time unit toggle buttons
    document.addEventListener('click', function(e) {
        if (e.target.matches('.unit-btn')) {
            toggleTimeUnit(e.target);
        }
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
async function switchTab(tabName) {
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
        await loadCharactersTab();
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
        
        // 타이머 진행 상태일 때 초기 캐릭터 표시
        if (newState === 'progress') {
            initializeCharacterForTimer();
        }
    }
}

function resetFocusState() {
    setFocusState('idle');
    
    // Reset all inputs
    const circleGoalInput = document.getElementById('circleGoalInput');
    const customTimeInput = document.getElementById('customTimeInput');
    const customTimeValue = document.getElementById('customTimeValue');
    const startTimerBtn = document.getElementById('startTimerBtn');
    
    if (circleGoalInput) circleGoalInput.value = '';
    if (customTimeInput) customTimeInput.style.display = 'none';
    if (customTimeValue) customTimeValue.value = '';
    if (startTimerBtn) startTimerBtn.disabled = true;
    
    // Reset time chips
    document.querySelectorAll('.time-chip').forEach(chip => chip.classList.remove('active'));
    const defaultChip = document.querySelector('.time-chip[data-time="60"]');
    if (defaultChip) defaultChip.classList.add('active');
    
    // Reset unit toggle to minutes
    document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('active'));
    const minutesBtn = document.querySelector('.unit-btn[data-unit="minutes"]');
    if (minutesBtn) {
        minutesBtn.classList.add('active');
        const unitLabel = document.getElementById('customTimeUnit');
        const timeInput = document.getElementById('customTimeValue');
        if (unitLabel) unitLabel.textContent = '분';
        if (timeInput) {
            timeInput.setAttribute('max', '300');
            timeInput.setAttribute('placeholder', '분');
        }
    }
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
            const customTimeValue = document.getElementById('customTimeValue');
            if (customTimeValue) customTimeValue.focus();
        }, 100);
    } else {
        if (customTimeInput) customTimeInput.style.display = 'none';
    }
    
    updateCircleStartButton();
}

function toggleTimeUnit(button) {
    const container = button.closest('.time-unit-toggle');
    if (!container) return;
    
    // Remove active from all unit buttons
    container.querySelectorAll('.unit-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active to clicked button
    button.classList.add('active');
    
    // Update unit label and input constraints
    const unit = button.getAttribute('data-unit');
    const unitLabel = document.getElementById('customTimeUnit');
    const timeInput = document.getElementById('customTimeValue');
    
    if (unit === 'minutes') {
        if (unitLabel) unitLabel.textContent = '분';
        if (timeInput) {
            timeInput.setAttribute('max', '300'); // 5시간까지
            timeInput.setAttribute('placeholder', '분');
        }
    } else if (unit === 'seconds') {
        if (unitLabel) unitLabel.textContent = '초';
        if (timeInput) {
            timeInput.setAttribute('max', '3600'); // 1시간까지
            timeInput.setAttribute('placeholder', '초');
        }
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
    const customTimeValue = document.getElementById('customTimeValue');
    
    if (!goalInput || !startBtn) return;
    
    const hasGoal = goalInput.value.trim().length > 0;
    let hasValidTime = false;
    
    if (activeChip) {
        const timeValue = activeChip.getAttribute('data-time');
        if (timeValue === 'custom') {
            hasValidTime = customTimeValue && customTimeValue.value && parseInt(customTimeValue.value) > 0;
        } else {
            hasValidTime = true;
        }
    }
    
    startBtn.disabled = !hasGoal || !hasValidTime;
}

function startCircleTimer() {
    const goalInput = document.getElementById('circleGoalInput');
    const activeChip = document.querySelector('.time-chip.active');
    const customTimeValue = document.getElementById('customTimeValue');
    
    if (!goalInput || !activeChip) return;
    
    const goal = goalInput.value.trim();
    let durationInSeconds;
    
    const timeValue = activeChip.getAttribute('data-time');
    if (timeValue === 'custom') {
        const inputValue = parseInt(customTimeValue.value);
        const activeUnit = document.querySelector('.unit-btn.active');
        const unit = activeUnit ? activeUnit.getAttribute('data-unit') : 'minutes';
        
        if (unit === 'seconds') {
            durationInSeconds = inputValue;
        } else {
            durationInSeconds = inputValue * 60; // 분을 초로 변환
        }
    } else {
        durationInSeconds = parseFloat(timeValue) * 60; // 분을 초로 변환
    }
    
    if (!goal || !durationInSeconds || durationInSeconds <= 0) {
        showAlertModal('오류', '목표를 입력해줘 / 세션 시간을 선택해줘');
        return;
    }
    
    // Create session
    currentSession = {
        goal: goal,
        duration: durationInSeconds,
        remainingTime: durationInSeconds,
        startTime: Date.now(),
        isPaused: false,
        source: 'circle',
        stopAttempted: false
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
        console.log('⏰ 남은 시간:', currentSession.remainingTime);
        updateProgressDisplay();
        
        // Check for motivation moments
        checkMotivationMoments();
        
        // Check for completion
        if (currentSession.remainingTime <= 0) {
            console.log('🎯 타이머 완료 조건 만족! completeCircleSession 호출');
            completeCircleSession();
        }
    }, 1000);
}

async function pauseCircleTimer() {
    if (!currentSession) return;
    
    currentSession.isPaused = !currentSession.isPaused;
    const pauseBtn = document.getElementById('pauseTimerBtn');
    
    if (pauseBtn) {
        pauseBtn.innerHTML = currentSession.isPaused ? '<i data-lucide="play"></i> 재개' : '<i data-lucide="pause"></i> 일시정지';
        if (window.lucide) window.lucide.createIcons();
    }
    
    // 일시정지 시 캐릭터 메시지 표시
    if (currentSession.isPaused) {
        await showPauseMessage();
    }
}

async function stopCircleTimer() {
    if (!currentSession) return;
    
    // 첫 번째 정지 시도인지 확인
    if (!currentSession.stopAttempted) {
        // 첫 번째 시도: 포기 만류 메시지 표시
        currentSession.stopAttempted = true;
        await showStopAttemptMessage();
        
        // 정지 버튼 텍스트 변경
        const stopBtn = document.getElementById('stopTimerBtn');
        if (stopBtn) {
            stopBtn.innerHTML = '<i data-lucide="square"></i> 정말 정지';
            if (window.lucide) window.lucide.createIcons();
        }
        
        return; // 여기서 함수 종료, 실제 정지는 하지 않음
    }
    
    // 두 번째 시도: 실제 정지 확인 모달 표시
    showConfirmModal(
        '세션 종료',
        '정말로 세션을 종료하시겠습니까?\n진행된 내용은 저장되지 않습니다.'
    ).then((confirmed) => {
        if (confirmed) {
            resetCircleSession();
        } else {
            // 취소 시 stopAttempted 플래그 초기화하고 버튼 텍스트 복원
            if (currentSession) {
                currentSession.stopAttempted = false;
                const stopBtn = document.getElementById('stopTimerBtn');
                if (stopBtn) {
                    stopBtn.innerHTML = '<i data-lucide="square"></i> 정지';
                    if (window.lucide) window.lucide.createIcons();
                }
            }
        }
    });
}

async function completeCircleSession() {
    console.log('🎉 completeCircleSession 함수 시작');
    if (!currentSession) {
        console.log('❌ currentSession이 없어서 종료');
        return;
    }
    
    console.log('⏹️ 타이머 정지 중...');
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 완료 시 캐릭터 축하 메시지 표시
    await showCompleteMessage();
    
    // Award points
    const earnedPoints = 50; // 기본 완료 포인트
    userPoints += earnedPoints;
    saveUserData();
    updateUI();
    
    // 습관에서 시작한 경우 습관 등록 모달 생략
    if (currentSession.source === 'habit') {
        // 습관에서 시작한 경우 바로 완료 처리
        resetCircleSession();
        showToast('습관 완료! 50포인트 획득! 🎉');
    } else {
        // 집중 타이머에서 시작한 경우만 습관 등록 모달 표시
        // currentSession 정보를 미리 저장
        completedSessionData = {
            goal: currentSession.goal,
            duration: currentSession.duration,
            durationMinutes: Math.floor(currentSession.duration / 60)
        };
        
        console.log('📝 습관 등록 모달 표시를 위한 데이터 저장:', completedSessionData);
        
        // 완료 메시지 표시 후 약간의 딜레이를 두고 모달 표시
        setTimeout(() => {
            console.log('⏰ 1.5초 딜레이 후 습관 등록 모달 표시 시도');
            showAddHabitModalWithData(completedSessionData.goal, completedSessionData.durationMinutes);
        }, 1500); // 1.5초 후 모달 표시
    }
}

function resetCircleSession() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // 정지 버튼 텍스트 초기화
    const stopBtn = document.getElementById('stopTimerBtn');
    if (stopBtn) {
        stopBtn.innerHTML = '<i data-lucide="square"></i> 정지';
        if (window.lucide) window.lucide.createIcons();
    }
    
    currentSession = null;
    completedSessionData = null; // 완료된 세션 데이터도 초기화
    resetFocusState();
}

async function checkMotivationMoments() {
    if (!currentSession) return;
    
    const elapsed = currentSession.duration - currentSession.remainingTime;
    const progress = elapsed / currentSession.duration;
    
    const halfTime = Math.floor(currentSession.duration / 2);
    const nearEndTime = Math.floor(currentSession.duration * 0.9); // 90% 지점
    
    // 50% 시점 (절반 지점)
    if (elapsed === halfTime) {
        await showCharacterMessage();
    }
    
    // 90% 시점 (거의 완료)
    if (elapsed === nearEndTime) {
        await showCharacterMessage();
    }
}

async function initializeCharacterForTimer() {
    const messageTextElement = document.getElementById('messageText');
    const characterImageElement = document.getElementById('characterImage');
    
    // 현재 선택된 캐릭터 확인
    const selectedCharacterType = window.appState?.gacha?.selectedCharacter || 'pokota';
    
    // 응원 메시지 생성
    let encouragementMessage;
    
    if (currentSession) {
        // 모든 캐릭터에 대해 AI 메시지 생성 시도
        const context = {
            type: 'start',
            goal: currentSession.goal,
            duration: Math.floor(currentSession.duration / 60)
        };
        
        try {
            encouragementMessage = await generateCharacterEncouragement(selectedCharacterType, context);
            if (!encouragementMessage) {
                encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
            }
        } catch (error) {
            console.error('AI 메시지 생성 실패:', error);
            encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
        }
    } else {
        // 세션 정보가 없는 경우 기본 메시지 사용
        encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, { type: 'start' });
    }
    
    if (messageTextElement) {
        messageTextElement.textContent = encouragementMessage;
    }
    
    // 선택된 캐릭터 이미지 설정
    if (window.appState && window.appState.gacha && window.appState.gacha.selectedCharacter) {
        const characterData = window.CHARACTER_DATA[selectedCharacterType];
        
        if (characterData && characterImageElement) {
            // 선택된 코스튬이 있으면 해당 코스튬 이미지, 없으면 기본 캐릭터 이미지
            if (window.appState.gacha.selectedCostumes && window.appState.gacha.selectedCostumes[selectedCharacterType]) {
                const selectedCostume = window.appState.gacha.selectedCostumes[selectedCharacterType];
                characterImageElement.src = `./images/costumes/${selectedCharacterType}/${selectedCostume}.png`;
                characterImageElement.alt = `${characterData.name} - ${selectedCostume}`;
            } else {
                characterImageElement.src = `./images/character/${selectedCharacterType}.png`;
                characterImageElement.alt = characterData.name;
            }
        }
    } else {
        // 기본 캐릭터 (포코타)
        if (characterImageElement) {
            characterImageElement.src = './images/character/pokota.png';
            characterImageElement.alt = '포코타';
        }
    }
}

async function showCharacterMessage() {
    const messageTextElement = document.getElementById('messageText');
    const characterImageElement = document.getElementById('characterImage');
    
    // 현재 선택된 캐릭터 확인
    const selectedCharacterType = window.appState?.gacha?.selectedCharacter || 'pokota';
    
    // 타이머 진행 상황 파악
    let messageType = 'progress';
    if (currentSession) {
        const elapsed = (currentSession.duration - currentSession.remainingTime);
        const total = currentSession.duration;
        const remaining = Math.floor(currentSession.remainingTime / 60);
        const progress = elapsed / total;
        
        // 진행 상황에 따른 메시지 타입 결정
        if (progress >= 0.5 && progress < 0.9) {
            messageType = 'halfTime';
        } else if (progress >= 0.9) {
            messageType = 'nearEnd';
        }
    }
    
    // 응원 메시지 생성
    let encouragementMessage;
    
    if (currentSession) {
        // 모든 캐릭터에 대해 AI 메시지 생성 시도
        const context = {
            type: messageType,
            goal: currentSession.goal,
            elapsed: Math.floor((currentSession.duration - currentSession.remainingTime) / 60),
            remaining: Math.floor(currentSession.remainingTime / 60),
            duration: Math.floor(currentSession.duration / 60)
        };
        
        try {
            encouragementMessage = await generateCharacterEncouragement(selectedCharacterType, context);
            if (!encouragementMessage) {
                encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
            }
        } catch (error) {
            console.error('AI 메시지 생성 실패:', error);
            encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
        }
    } else {
        // 세션 정보가 없는 경우 기본 메시지 사용
        encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, { type: 'start' });
    }
    
    if (messageTextElement) {
        messageTextElement.textContent = encouragementMessage;
    }
    
    // 선택된 캐릭터 이미지 설정 (중간 응원 메시지에서도 이미지 업데이트)
    if (window.appState && window.appState.gacha && window.appState.gacha.selectedCharacter) {
        const characterData = window.CHARACTER_DATA[selectedCharacterType];
        
        if (characterData && characterImageElement) {
            // 선택된 코스튬이 있으면 해당 코스튬 이미지, 없으면 기본 캐릭터 이미지
            if (window.appState.gacha.selectedCostumes && window.appState.gacha.selectedCostumes[selectedCharacterType]) {
                const selectedCostume = window.appState.gacha.selectedCostumes[selectedCharacterType];
                characterImageElement.src = `./images/costumes/${selectedCharacterType}/${selectedCostume}.png`;
                characterImageElement.alt = `${characterData.name} - ${selectedCostume}`;
            } else {
                characterImageElement.src = `./images/character/${selectedCharacterType}.png`;
                characterImageElement.alt = characterData.name;
            }
        }
    } else {
        // 기본 캐릭터 (포코타)
        if (characterImageElement) {
            characterImageElement.src = './images/character/pokota.png';
            characterImageElement.alt = '포코타';
        }
    }
    
    // 말풍선 애니메이션 트리거
    const speechBubble = document.querySelector('.speech-bubble');
    if (speechBubble) {
        speechBubble.style.animation = 'none';
        speechBubble.offsetHeight; // 리플로우 강제 실행
        speechBubble.style.animation = 'bubbleAppear 0.5s ease-out';
    }
}

// 일시정지 시 캐릭터 메시지
async function showPauseMessage() {
    const messageTextElement = document.getElementById('messageText');
    const characterImageElement = document.getElementById('characterImage');
    const selectedCharacterType = window.appState?.gacha?.selectedCharacter || 'pokota';
    
    let encouragementMessage;
    
    if (currentSession) {
        const context = {
            type: 'pause',
            goal: currentSession.goal,
            remaining: Math.floor(currentSession.remainingTime / 60),
            duration: Math.floor(currentSession.duration / 60)
        };
        
        try {
            encouragementMessage = await generateCharacterEncouragement(selectedCharacterType, context);
            if (!encouragementMessage) {
                encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
            }
        } catch (error) {
            console.error('AI 메시지 생성 실패:', error);
            encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
        }
    } else {
        encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, { type: 'pause' });
    }
    
    if (messageTextElement) {
        messageTextElement.textContent = encouragementMessage;
    }
    
    // 캐릭터 이미지 설정
    updateCharacterImage(characterImageElement, selectedCharacterType);
    
    // 말풍선 애니메이션
    triggerSpeechBubbleAnimation();
}

// 정지 시도 시 캐릭터 메시지 (포기 만류)
async function showStopAttemptMessage() {
    const messageTextElement = document.getElementById('messageText');
    const characterImageElement = document.getElementById('characterImage');
    const selectedCharacterType = window.appState?.gacha?.selectedCharacter || 'pokota';
    
    let encouragementMessage;
    
    if (currentSession) {
        const context = {
            type: 'stopAttempt',
            goal: currentSession.goal,
            remaining: Math.floor(currentSession.remainingTime / 60),
            duration: Math.floor(currentSession.duration / 60)
        };
        
        try {
            encouragementMessage = await generateCharacterEncouragement(selectedCharacterType, context);
            if (!encouragementMessage) {
                encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
            }
        } catch (error) {
            console.error('AI 메시지 생성 실패:', error);
            encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
        }
    } else {
        encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, { type: 'stopAttempt' });
    }
    
    if (messageTextElement) {
        messageTextElement.textContent = encouragementMessage;
    }
    
    // 캐릭터 이미지 설정
    updateCharacterImage(characterImageElement, selectedCharacterType);
    
    // 말풍선 애니메이션
    triggerSpeechBubbleAnimation();
}

// 완료 시 캐릭터 메시지
async function showCompleteMessage() {
    const messageTextElement = document.getElementById('messageText');
    const characterImageElement = document.getElementById('characterImage');
    const selectedCharacterType = window.appState?.gacha?.selectedCharacter || 'pokota';
    
    let encouragementMessage;
    
    if (currentSession) {
        const context = {
            type: 'complete',
            goal: currentSession.goal,
            duration: Math.floor(currentSession.duration / 60)
        };
        
        try {
            encouragementMessage = await generateCharacterEncouragement(selectedCharacterType, context);
            if (!encouragementMessage) {
                encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
            }
        } catch (error) {
            console.error('AI 메시지 생성 실패:', error);
            encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, context);
        }
    } else {
        encouragementMessage = getDefaultEncouragementMessage(selectedCharacterType, { type: 'complete' });
    }
    
    if (messageTextElement) {
        messageTextElement.textContent = encouragementMessage;
    }
    
    // 캐릭터 이미지 설정
    updateCharacterImage(characterImageElement, selectedCharacterType);
    
    // 말풍선 애니메이션
    triggerSpeechBubbleAnimation();
}

// 캐릭터 이미지 업데이트 헬퍼 함수
function updateCharacterImage(characterImageElement, selectedCharacterType) {
    if (window.appState && window.appState.gacha && window.appState.gacha.selectedCharacter) {
        const characterData = window.CHARACTER_DATA[selectedCharacterType];
        
        if (characterData && characterImageElement) {
            // 선택된 코스튬이 있으면 해당 코스튬 이미지, 없으면 기본 캐릭터 이미지
            if (window.appState.gacha.selectedCostumes && window.appState.gacha.selectedCostumes[selectedCharacterType]) {
                const selectedCostume = window.appState.gacha.selectedCostumes[selectedCharacterType];
                characterImageElement.src = `./images/costumes/${selectedCharacterType}/${selectedCostume}.png`;
                characterImageElement.alt = `${characterData.name} - ${selectedCostume}`;
            } else {
                characterImageElement.src = `./images/character/${selectedCharacterType}.png`;
                characterImageElement.alt = characterData.name;
            }
        }
    } else {
        // 기본 캐릭터 (포코타)
        if (characterImageElement) {
            characterImageElement.src = './images/character/pokota.png';
            characterImageElement.alt = '포코타';
        }
    }
}

// 말풍선 애니메이션 트리거 헬퍼 함수
function triggerSpeechBubbleAnimation() {
    const speechBubble = document.querySelector('.speech-bubble');
    if (speechBubble) {
        speechBubble.style.animation = 'none';
        speechBubble.offsetHeight; // 리플로우 강제 실행
        speechBubble.style.animation = 'bubbleAppear 0.5s ease-out';
    }
}

// ========================================
// AI 응원 메시지 시스템 (포코타 전용)
// ========================================

// OpenAI API 호출 함수
async function callOpenAIAPI(prompt, systemMessage = null) {
    try {
        const apiKey = Config.getApiKey();
        if (!apiKey) {
            console.warn('OpenAI API 키가 설정되지 않았습니다. 기본 메시지를 사용합니다.');
            return null;
        }

        const messages = [];
        if (systemMessage) {
            messages.push({
                role: "system",
                content: systemMessage
            });
        }
        messages.push({
            role: "user", 
            content: prompt
        });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 100,
                temperature: 0.8,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            })
        });

        if (!response.ok) {
            console.error('OpenAI API 호출 실패:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        return data.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
        console.error('OpenAI API 호출 중 오류:', error);
        return null;
    }
}

// 캐릭터별 AI 페르소나 데이터
const CHARACTER_PERSONAS = {
    pokota: {
        name: '포코타',
        systemMessage: `당신은 '포코타'라는 이름의 의욕충만한 사고뭉치 토끼입니다.
사용자의 집중과 생산성을 도와주는 역할을 하며, 다음과 같은 특징을 가지고 있습니다:

- 매사 열정적이고 의욕충만한 성격
- 밝고 경쾌한 말투 (반말 사용)
- 감탄사와 의성어를 자주 사용 (오!, 우와!, 홧!, 쫄쫄쫄 등)
- 간결하고 동기부여가 되는 메시지 (15-25자 내외)
- 이모티콘은 사용하지 않음
- 낙천적이고 붙임성이 좋음

응답은 한국어로 하고, 포코타의 정체성을 유지하면서 상황에 맞는 응원 메시지를 생성해주세요.`
    },
    
    bray: {
        name: '브레이',
        systemMessage: `당신은 '브레이'라는 이름의 두더지입니다.
사용자의 집중을 도와주지만, 다음과 같은 특징을 가지고 있습니다:

- 층간 소음 때문에 항상 고생하고 있음
- 투덜거림이 섞인 느릿한 말투 (반말 사용)
- 약간 불만이 섞인 어조이지만 결국 도움을 주려고 함
- 간결한 메시지 (15-25자 내외)
- 이모티콘은 사용하지 않음
- "흠..." "그래도..." "뭐 어쩌겠어..." 같은 표현 자주 사용

응답은 한국어로 하고, 브레이의 정체성을 유지하면서 상황에 맞는 응원 메시지를 생성해주세요.`
    },
    
    coco: {
        name: '코코',
        systemMessage: `당신은 '코코'라는 이름의 친절하고 섬세한 캐릭터입니다.
사용자의 집중을 도와주며, 다음과 같은 특징을 가지고 있습니다:

- 매우 친절하고 섬세한 성격
- 차분하고 친절하며 문장 끝이 부드럽게 흐르는 말투 (반말 사용)
- 꼼꼼하고 배려심이 많음
- 감수성이 풍부하고 공감능력이 뛰어남
- 간결한 메시지 (15-25자 내외)
- 이모티콘은 사용하지 않음
- "그렇구나~" "좋겠어~" "힘내봐~" 같은 부드러운 표현

응답은 한국어로 하고, 코코의 정체성을 유지하면서 상황에 맞는 응원 메시지를 생성해주세요.`
    },
    
    grifo: {
        name: '그리포',
        systemMessage: `당신은 '그리포'라는 이름의 헬스광 아저씨입니다.
사용자의 집중을 도와주며, 다음과 같은 특징을 가지고 있습니다:

- 하루 종일 운동 중인 헬스광
- 호탕하고 크게 말하는 말투 (반말 사용)
- 근육과 운동에 대한 자부심이 높음
- 모든 것을 운동과 근육에 비유해서 설명
- "크하하!" "이것도 운동이야!" "근육이 최고지!" 같은 표현
- 간결한 메시지 (15-25자 내외)
- 이모티콘은 사용하지 않음

응답은 한국어로 하고, 그리포의 정체성을 유지하면서 상황에 맞는 응원 메시지를 생성해주세요.`
    },
    
    kiri: {
        name: '키리',
        systemMessage: `당신은 '키리'라는 이름의 목이 짧은 기린입니다.
사용자의 집중을 도와주지만, 다음과 같은 특징을 가지고 있습니다:

- 목이 짧다는 컴플렉스가 있음
- 퉁명스럽고 짧게 대답하는 말투 (반말 사용)
- 은근히 마음이 약하고 잘 어울리고 싶어함
- 겉으로는 무뚝뚝하지만 속으로는 따뜻함
- "뭐..." "그래..." "알겠어..." 같은 짧은 표현
- 간결한 메시지 (10-20자 내외)
- 이모티콘은 사용하지 않음

응답은 한국어로 하고, 키리의 정체성을 유지하면서 상황에 맞는 응원 메시지를 생성해주세요.`
    },
    
    midori: {
        name: '미도리',
        systemMessage: `당신은 '미도리'라는 이름의 소심한 개구리입니다.
사용자의 집중을 도와주려 하지만, 다음과 같은 특징을 가지고 있습니다:

- 소심 끝판왕의 유리멘탈
- 소심하고 더듬으며 작은 목소리 말투 (반말 사용)
- 자신감이 부족하지만 응원하고 싶은 마음은 큼
- "아, 아무튼..." "그, 그래도..." "혹, 혹시..." 같은 더듬는 표현
- 간결한 메시지 (15-25자 내외)
- 이모티콘은 사용하지 않음

응답은 한국어로 하고, 미도리의 정체성을 유지하면서 상황에 맞는 응원 메시지를 생성해주세요.`
    },
    
    noy: {
        name: '노이',
        systemMessage: `당신은 '노이'라는 이름의 꼬마 벼룩입니다.
사용자의 집중을 도와주며, 다음과 같은 특징을 가지고 있습니다:

- 고집이 세고 자기주장이 강한 꼬맹이
- 앙칼지고 빠르게 말하며 투덜거림이 많은 말투 (반말 사용)
- 온갖 말썽을 피우지만 나름 도움을 주려고 함
- "아! 정말!" "빨리빨리!" "내가 말했잖아!" 같은 급한 표현
- 간결한 메시지 (15-25자 내외)
- 이모티콘은 사용하지 않음

응답은 한국어로 하고, 노이의 정체성을 유지하면서 상황에 맞는 응원 메시지를 생성해주세요.`
    },
    
    obis: {
        name: '오비스',
        systemMessage: `당신은 '오비스'라는 이름의 양입니다.
사용자의 집중을 도와주지만, 다음과 같은 특별한 특징을 가지고 있습니다:

- 항상 포커페이스를 유지하며 멍한 상태
- 말은 절대 하지 않음
- 고개 끄덕임, 손짓, 표정으로만 의사소통
- 메시지는 행동이나 몸짓을 설명하는 형태로 표현
- "(고개를 끄덕임)" "(엄지를 들어올림)" "(살짝 미소)" 같은 행동 표현
- 매우 간결한 표현 (10-15자 내외)

응답은 한국어로 하고, 오비스의 정체성을 유지하면서 행동으로 응원을 표현해주세요.`
    },
    
    peng: {
        name: '펭',
        systemMessage: `당신은 '펭'이라는 이름의 시니컬한 펭귄입니다.
사용자의 집중을 도와주지만, 다음과 같은 특징을 가지고 있습니다:

- 평온한 얼굴로 싸늘하게 팩폭을 날리는 성격
- 무표정하고 담백하며 직설적인 말투 (반말 사용)
- 감정이 거의 실리지 않는 차가운 어조
- 하지만 은근히 도움이 되는 조언을 해줌
- "그래." "알겠어." "할 수 있으면 해." 같은 덤덤한 표현
- 간결한 메시지 (10-20자 내외)
- 이모티콘은 사용하지 않음

응답은 한국어로 하고, 펭의 정체성을 유지하면서 상황에 맞는 응원 메시지를 생성해주세요.`
    },
    
    viva: {
        name: '비바',
        systemMessage: `당신은 '비바'라는 이름의 해맑은 비버입니다.
사용자의 집중을 도와주며, 다음과 같은 특징을 가지고 있습니다:

- 해맑고 천진난만한 성격
- 별 생각 없이 말하는 순수한 말투 (반말 사용)
- 항상 긍정적이고 밝은 에너지
- 단순하지만 따뜻한 마음
- "우와!" "좋겠다!" "재밌겠어!" 같은 밝은 표현
- 간결한 메시지 (15-25자 내외)
- 이모티콘은 사용하지 않음

응답은 한국어로 하고, 비바의 정체성을 유지하면서 상황에 맞는 응원 메시지를 생성해주세요.`
    }
};

// 캐릭터별 AI 응원 메시지 생성
async function generateCharacterEncouragement(characterType, context) {
    const persona = CHARACTER_PERSONAS[characterType];
    if (!persona) {
        console.warn(`Unknown character type: ${characterType}`);
        return null;
    }

    let prompt = '';
    
    switch (context.type) {
        case 'start':
            prompt = `사용자가 "${context.goal}"라는 목표로 ${context.duration}분 동안 집중 타이머를 시작했어. "${context.goal} 시작! 호흡 잡고 천천히 가자" 느낌으로 시작을 응원하는 메시지를 해줘.`;
            break;
        case 'halfTime':
            prompt = `사용자가 "${context.goal}" 목표의 절반을 완성했어! 50% 지점이야. "절반 지났어—페이스 그대로, ${context.remaining}분만 더 가보자" 느낌으로 독려하는 메시지를 해줘.`;
            break;
        case 'pause':
            prompt = `사용자가 "${context.goal}" 타이머를 일시정지했어. "잠깐 쉬었네; 준비되면 이어가자" 느낌으로 재개를 응원하는 메시지를 해줘.`;
            break;
        case 'stopAttempt':
            prompt = `사용자가 "${context.goal}" 타이머를 중도에 정지하려고 해. ${context.remaining}분 남았어. "지금 멈추기 아까워—${context.remaining}분만 더 버텨보자" 느낌으로 포기를 만류하는 메시지를 해줘.`;
            break;
        case 'nearEnd':
            prompt = `사용자가 "${context.goal}" 목표를 거의 완성해가고 있어. 90% 지점이야. ${context.remaining}분 남았어. "거의 다 왔어! 라스트 ${context.remaining}분, 집중 유지" 느낌으로 마지막 독려 메시지를 해줘.`;
            break;
        case 'complete':
            prompt = `사용자가 "${context.goal}" 목표를 완전히 완성했어! "완료! ${context.goal} 끝—잘했어 👏" 느낌으로 축하하는 메시지를 해줘.`;
            break;
        default:
            prompt = `사용자가 "${context.goal}" 목표로 집중하고 있어. 응원 메시지를 해줘.`;
    }

    const aiMessage = await callOpenAIAPI(prompt, persona.systemMessage);
    return aiMessage;
}

// 캐릭터별 기본 응원 메시지 (AI 실패 시 백업)
const CHARACTER_DEFAULT_MESSAGES = {
    pokota: {
        start: ['오! 시작해보자! 홧홧!', '우와! 화이팅! 쫄쫄 가자!', '오케이! 호흡 잘 잡고!', '홧! 천천히 시작!', '쫄쫄! 집중 타임 시작!'],
        halfTime: ['오! 절반 넘었어!', '홧! 페이스 그대로!', '우와! 반 왔다!', '쫄쫄! 조금만 더!', '오케이! 계속 가자!'],
        pause: ['오! 잠깐 쉬었네!', '홧! 준비되면 다시!', '우와! 괜찮아!', '쫄쫄! 숨 고르고!', '오케이! 이어가자!'],
        stopAttempt: ['오! 아까워!', '홧! 조금만 더!', '우와! 버텨보자!', '쫄쫄! 포기 금지!', '오케이! 끝까지!'],
        nearEnd: ['오! 거의 다 왔어!', '홧! 라스트 스퍼트!', '우와! 집중 유지!', '쫄쫄! 마지막이야!', '오케이! 파이널!'],
        complete: ['오! 완료!', '홧! 잘했어!', '우와! 성공!', '쫄쫄! 대단해!', '오케이! 끝!']
    },
    bray: {
        start: ['흠... 시작하긴 해야지...', '투덜... 호흡이나 잡고...', '뭐 어쩌겠어... 천천히...', '하아... 시작해라...', '그래도... 해보자...'],
        halfTime: ['흠... 절반은 했네...', '투덜... 페이스는 괜찮고...', '뭐... 그래도 반...', '하아... 조금만 더...', '그래도... 계속해...'],
        pause: ['흠... 쉬었구나...', '투덜... 준비되면...', '뭐... 천천히...', '하아... 이어가...', '그래도... 다시 시작...'],
        stopAttempt: ['흠... 아까워...', '투덜... 여기서 멈춰?', '뭐... 조금만 더...', '하아... 버텨봐...', '그래도... 끝까지...'],
        nearEnd: ['흠... 거의...', '투덜... 라스트네...', '뭐... 집중해...', '하아... 마지막...', '그래도... 유지해...'],
        complete: ['흠... 끝났네...', '투덜... 잘했어...', '뭐... 완료...', '하아... 수고했어...', '그래도... 성공...']
    },
    coco: {
        start: ['좋겠어~ 시작해봐~', '화이팅해봐~ 천천히~', '마음 편히 해봐~', '차근차근 해봐~', '호흡 잘 잡고~'],
        halfTime: ['잘하고 있어~ 절반~', '좋구나~ 페이스 그대로~', '힘내봐~ 반 왔어~', '차근차근~ 계속~', '조금만 더 해봐~'],
        pause: ['괜찮아~ 쉬었구나~', '준비되면 해봐~', '천천히 이어가~', '마음 편히~', '다시 시작해봐~'],
        stopAttempt: ['아까워~ 조금만~', '힘내봐~ 버텨보자~', '거의 다 왔는데~', '끝까지 해봐~', '포기하지 마~'],
        nearEnd: ['거의 다 왔어~', '라스트야~ 힘내~', '집중 유지해봐~', '마지막이야~', '조금만 더~'],
        complete: ['완료~ 잘했어~', '성공이야~', '대단해~', '끝까지 했구나~', '수고했어~']
    },
    grifo: {
        start: ['크하하! 집중도 운동!', '근육처럼 집중해!', '호흡 잡고 시작!', '정신력 훈련이다!', '크하하! 파워 업!'],
        halfTime: ['크하하! 절반 완료!', '근육처럼 꾸준히!', '페이스 유지다!', '정신력 세트 반!', '크하하! 계속!'],
        pause: ['크하하! 휴식이다!', '근육도 쉬어야지!', '준비되면 다시!', '짧은 브레이크!', '크하하! 이어가자!'],
        stopAttempt: ['크하하! 아직이야!', '근육은 포기 안 해!', '조금만 더 버텨!', '정신력 훈련 중!', '크하하! 끝까지!'],
        nearEnd: ['크하하! 라스트 세트!', '근육 마지막 힘!', '집중 유지다!', '정신력 파이널!', '크하하! 거의!'],
        complete: ['크하하! 완료!', '근육처럼 완성!', '정신력 승리!', '훈련 성공!', '크하하! 끝!']
    },
    kiri: {
        start: ['뭐... 시작해...', '그래... 호흡이나...', '알겠어... 천천히...', '...집중해...', '뭐 어때...'],
        halfTime: ['...절반...', '뭐... 괜찮네...', '그래... 페이스...', '...계속...', '알겠어... 반...'],
        pause: ['...쉬었구나...', '뭐... 준비되면...', '그래... 천천히...', '...이어가...', '알겠어...'],
        stopAttempt: ['...아까워...', '뭐... 조금만...', '그래... 버텨...', '...끝까지...', '알겠어... 계속...'],
        nearEnd: ['...거의...', '뭐... 라스트...', '그래... 집중...', '...마지막...', '알겠어... 유지...'],
        complete: ['...끝...', '뭐... 잘했어...', '그래... 완료...', '...성공...', '알겠어...']
    },
    midori: {
        start: ['아, 아무튼... 시작...', '그, 그래도... 호흡...', '혹, 혹시... 천천히...', '아, 아마... 괜찮을거야...', '그, 그럼... 집중...'],
        halfTime: ['아, 아직... 절반...', '그, 그래도... 페이스...', '혹, 혹시... 괜찮네...', '아, 아마... 계속...', '그, 그럼... 조금만...'],
        pause: ['아, 아무튼... 쉬었네...', '그, 그래도... 준비되면...', '혹, 혹시... 괜찮아...', '아, 아마... 이어가...', '그, 그럼... 다시...'],
        stopAttempt: ['아, 아직... 아까워...', '그, 그래도... 조금만...', '혹, 혹시... 버텨...', '아, 아마... 끝까지...', '그, 그럼... 계속...'],
        nearEnd: ['아, 아직... 거의...', '그, 그래도... 라스트...', '혹, 혹시... 집중...', '아, 아마... 마지막...', '그, 그럼... 유지...'],
        complete: ['아, 아무튼... 끝...', '그, 그래도... 잘했어...', '혹, 혹시... 완료...', '아, 아마... 성공...', '그, 그럼... 수고...']
    },
    noy: {
        start: ['아! 빨리 시작해!', '정말! 집중하라고!', '내가 말했잖아! 호흡!', '빨리 해봐!', '아! 정말! 천천히!'],
        halfTime: ['빨리빨리! 절반!', '아! 페이스 유지!', '정말! 반 왔어!', '내가 말했잖아! 계속!', '빨리! 조금만 더!'],
        pause: ['아! 쉬었구나!', '정말! 준비되면!', '내가 말했잖아! 다시!', '빨리 이어가!', '아! 정말! 천천히!'],
        stopAttempt: ['아! 아까워!', '정말! 조금만 더!', '내가 말했잖아! 버텨!', '빨리! 끝까지!', '아! 정말! 포기 금지!'],
        nearEnd: ['아! 거의!', '정말! 라스트!', '내가 말했잖아! 집중!', '빨리! 마지막!', '아! 정말! 유지!'],
        complete: ['아! 끝!', '정말! 잘했어!', '내가 말했잖아! 완료!', '빨리! 성공!', '아! 정말! 대단해!']
    },
    obis: {
        start: ['(고개를 끄덕임)', '(깊게 숨쉬는 제스처)', '(살짝 미소)', '(파이팅 제스처)', '(시작 신호)'],
        halfTime: ['(엄지를 올림)', '(절반 표시)', '(고개를 끄덕임)', '(계속 가라는 손짓)', '(박수를 침)'],
        pause: ['(휴식 제스처)', '(괜찮다는 손짓)', '(준비되면 신호)', '(천천히 하라는 몸짓)', '(다시 시작 제스처)'],
        stopAttempt: ['(아쉬워하는 표정)', '(조금만 더 손짓)', '(버티라는 제스처)', '(끝까지 가라는 몸짓)', '(힘내라는 표정)'],
        nearEnd: ['(거의 다 왔다는 손짓)', '(라스트 제스처)', '(집중하라는 표정)', '(마지막 응원)', '(파이널 신호)'],
        complete: ['(박수를 침)', '(잘했다는 엄지)', '(완료 제스처)', '(성공 표정)', '(축하하는 몸짓)']
    },
    peng: {
        start: ['그래. 시작해.', '호흡 잡고.', '천천히.', '집중해.', '해봐.'],
        halfTime: ['절반.', '페이스 유지.', '그래.', '계속.', '조금 더.'],
        pause: ['쉬었구나.', '준비되면.', '천천히.', '이어가.', '괜찮아.'],
        stopAttempt: ['아까워.', '조금만 더.', '버텨.', '끝까지.', '그래.'],
        nearEnd: ['거의.', '라스트.', '집중.', '마지막.', '유지해.'],
        complete: ['끝.', '잘했어.', '완료.', '성공.', '그래.']
    },
    viva: {
        start: ['우와! 시작이다!', '좋겠다! 호흡!', '재밌겠어! 천천히!', '신난다!', '우와우와! 시작!'],
        halfTime: ['우와! 절반!', '좋겠다! 페이스!', '반 왔어!', '신나는데! 계속!', '우와우와! 조금 더!'],
        pause: ['우와! 쉬었다!', '좋겠다! 준비되면!', '괜찮아!', '신나게 이어가!', '우와우와! 다시!'],
        stopAttempt: ['우와! 아까워!', '좋겠다! 조금만!', '버텨보자!', '신나게 끝까지!', '우와우와! 포기 금지!'],
        nearEnd: ['우와! 거의!', '좋겠다! 라스트!', '집중해!', '신나는 마지막!', '우와우와! 유지!'],
        complete: ['우와! 끝!', '좋겠다! 완료!', '성공이야!', '신나는 결과!', '우와우와! 잘했어!']
    }
};

// 기본 응원 메시지 (AI 실패 시 백업)
function getDefaultEncouragementMessage(characterType, context) {
    const messages = CHARACTER_DEFAULT_MESSAGES[characterType];
    if (!messages) {
        // 알 수 없는 캐릭터의 경우 포코타 메시지 사용
        const pokotaMessages = CHARACTER_DEFAULT_MESSAGES.pokota;
        const messageArray = pokotaMessages[context.type] || pokotaMessages.start;
        return messageArray[Math.floor(Math.random() * messageArray.length)];
    }
    
    const messageArray = messages[context.type] || messages.start;
    return messageArray[Math.floor(Math.random() * messageArray.length)];
}

// ========================================
// HABIT ADDITION MODAL
// ========================================
function showAddHabitModal() {
    if (!currentSession) {
        return;
    }
    
    // Pre-fill habit name based on goal
    const habitModalName = document.getElementById('habitModalName');
    if (habitModalName) {
        habitModalName.value = currentSession.goal;
    }
    
    showModal('addHabitModal');
}

function showAddHabitModalWithData(goal, duration) {
    console.log('📋 showAddHabitModalWithData 호출됨:', { goal, duration });
    
    // Pre-fill habit name based on goal
    const habitModalName = document.getElementById('habitModalName');
    if (habitModalName) {
        habitModalName.value = goal;
        console.log('✅ 습관 이름 필드에 값 설정:', goal);
    } else {
        console.error('❌ habitModalName 엘리먼트를 찾을 수 없음');
    }
    
    console.log('🔄 addHabitModal 표시 시도');
    showModal('addHabitModal');
    console.log('✅ showModal 호출 완료');
}

async function confirmAddHabit() {
    const habitName = document.getElementById('habitModalName')?.value?.trim();
    const activeCadence = document.querySelector('#addHabitModal .cadence-btn.active');
    
    if (!habitName) {
        showAlertModal('오류', '습관 이름을 입력해주세요.');
        return;
    }
    
    const cadence = activeCadence?.getAttribute('data-cadence') || 'daily';
    const defaultTime = completedSessionData ? completedSessionData.durationMinutes : 60;
    
    // Create new habit
    const newHabit = {
        id: Date.now().toString(),
        name: habitName,
        cadence: cadence,
        defaultTime: defaultTime,
        createdAt: Date.now()
    };
    
    try {
        if (window.DailytDB) {
            // IndexedDB에 저장
            await window.DailytDB.addHabit(newHabit);
            // 세션 기록도 추가 (completedSessionData 사용)
            if (completedSessionData) {
                await window.DailytDB.addSession({
                    habitId: newHabit.id,
                    goal: completedSessionData.goal,
                    duration: completedSessionData.duration,
                    points: 50
                });
            }
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
        habitId: habitId,
        stopAttempted: false
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
        console.log('💾 사용자 데이터 저장 시작:', { points: userPoints, partner: currentPartner });
        
        let savedToIndexedDB = false;
        
        if (window.DailytDB && typeof window.DailytDB.saveUserData === 'function') {
            try {
                // IndexedDB에 저장
                await window.DailytDB.saveUserData({
                    points: userPoints,
                    currentPartner: currentPartner
                });
                savedToIndexedDB = true;
                console.log('✅ IndexedDB에 사용자 데이터 저장 완료');
            } catch (dbError) {
                console.warn('⚠️ IndexedDB 저장 실패, localStorage로 폴백:', dbError);
            }
        }
        
        // IndexedDB 저장 실패 시 또는 window.DailytDB가 없을 때 localStorage 사용
        if (!savedToIndexedDB) {
            const userData = {
                points: userPoints,
                partner: currentPartner,
                lastSaved: Date.now()
            };
            localStorage.setItem('dailit_data', JSON.stringify(userData));
            console.log('✅ localStorage에 사용자 데이터 저장 완료');
        }
        
        // 항상 백업으로도 저장
        const backupUserData = {
            points: userPoints,
            currentPartner: currentPartner,
            timestamp: Date.now()
        };
        localStorage.setItem('userDataBackup', JSON.stringify(backupUserData));
        
    } catch (error) {
        console.error('❌ 사용자 데이터 저장 완전 실패:', error);
        
        // 마지막 수단으로 간단한 형태로 저장
        try {
            localStorage.setItem('emergencyUserPoints', userPoints.toString());
            localStorage.setItem('emergencyCurrentPartner', currentPartner || '');
        } catch (emergencyError) {
            console.error('❌ 비상 사용자 데이터 저장도 실패:', emergencyError);
        }
    }
}

async function loadUserData() {
    console.log('💾 사용자 데이터 로드 시작');
    let dataLoaded = false;
    
    try {
        // 1차: IndexedDB에서 로드 시도
        if (window.DailytDB) {
            try {
                const userData = await window.DailytDB.getUserData();
                if (userData && userData.points !== undefined) {
                    userPoints = userData.points;
                    currentPartner = userData.currentPartner || null;
                    dataLoaded = true;
                    console.log('✅ IndexedDB에서 사용자 데이터 로드 완료:', { points: userPoints, partner: currentPartner });
                }
                
                // 습관은 별도로 로드
                const habits = await window.DailytDB.getHabits();
                userHabits = habits || [];
            } catch (dbError) {
                console.warn('⚠️ IndexedDB 로드 실패:', dbError);
            }
        }
        
        // 2차: localStorage 기본 데이터에서 로드 시도
        if (!dataLoaded) {
            const saved = localStorage.getItem('dailit_data');
            if (saved) {
                try {
                    const userData = JSON.parse(saved);
                    if (userData.points !== undefined) {
                        userPoints = userData.points;
                        currentPartner = userData.partner || null;
                        dataLoaded = true;
                        console.log('✅ localStorage에서 사용자 데이터 로드 완료:', { points: userPoints, partner: currentPartner });
                    }
                } catch (parseError) {
                    console.warn('⚠️ localStorage 데이터 파싱 실패:', parseError);
                }
            }
        }
        
        // 3차: localStorage 백업 데이터에서 로드 시도
        if (!dataLoaded) {
            const backupData = localStorage.getItem('userDataBackup');
            if (backupData) {
                try {
                    const userData = JSON.parse(backupData);
                    if (userData.points !== undefined) {
                        userPoints = userData.points;
                        currentPartner = userData.partner || null;
                        dataLoaded = true;
                        console.log('✅ localStorage 백업에서 사용자 데이터 로드 완료:', { points: userPoints, partner: currentPartner });
                    }
                } catch (parseError) {
                    console.warn('⚠️ localStorage 백업 데이터 파싱 실패:', parseError);
                }
            }
        }
        
        // 4차: localStorage 개별 항목에서 로드 시도
        if (!dataLoaded) {
            const pointsStr = localStorage.getItem('userPoints');
            const partnerStr = localStorage.getItem('currentPartner');
            if (pointsStr !== null) {
                try {
                    userPoints = parseInt(pointsStr, 10);
                    currentPartner = partnerStr !== 'null' && partnerStr !== 'undefined' ? partnerStr : null;
                    dataLoaded = true;
                    console.log('✅ localStorage 개별 항목에서 사용자 데이터 로드 완료:', { points: userPoints, partner: currentPartner });
                } catch (parseError) {
                    console.warn('⚠️ localStorage 개별 항목 파싱 실패:', parseError);
                }
            }
        }
        
        // 5차: localStorage 비상 데이터에서 로드 시도
        if (!dataLoaded) {
            const emergencyData = localStorage.getItem('emergencyUserData');
            if (emergencyData) {
                try {
                    const userData = JSON.parse(emergencyData);
                    if (userData.points !== undefined) {
                        userPoints = userData.points;
                        currentPartner = userData.partner || null;
                        dataLoaded = true;
                        console.log('✅ localStorage 비상 데이터에서 사용자 데이터 로드 완료:', { points: userPoints, partner: currentPartner });
                    }
                } catch (parseError) {
                    console.warn('⚠️ localStorage 비상 데이터 파싱 실패:', parseError);
                }
            }
        }
        
        // 최종: 기본값 설정
        if (!dataLoaded) {
            console.log('⚠️ 저장된 데이터를 찾을 수 없음, 기본값으로 초기화');
            userPoints = 100;
            currentPartner = null;
            userHabits = [];
        } else if (!window.DailytDB) {
            // DailytDB가 없으면 습관 기능 비활성화
            userHabits = [];
        }
        
    } catch (error) {
        console.error('❌ 데이터 로드 중 치명적 오류:', error);
        // 기본값으로 초기화
        userPoints = 100;
        currentPartner = null;
        userHabits = [];
    }
    
    console.log('💾 사용자 데이터 로드 완료:', { points: userPoints, partner: currentPartner, habits: userHabits.length });
}

// localStorage에서 IndexedDB로 마이그레이션
async function migrateFromLocalStorage() {
    if (!window.DailytDB) return;
    
    try {
        const savedData = localStorage.getItem('dailit_data');
        if (savedData) {
            console.log('기존 localStorage 데이터 발견, 마이그레이션 시작');
            const data = JSON.parse(savedData);
            
            // 사용자 데이터 마이그레이션
            if (data.points || data.partner) {
                await window.DailytDB.saveUserData({
                    points: data.points || 100,
                    currentPartner: data.partner
                });
            }
            
            // 습관 데이터 마이그레이션
            if (data.habits && data.habits.length > 0) {
                for (const habit of data.habits) {
                    try {
                        await window.DailytDB.addHabit(habit);
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
window.DailytDevTools = {
    export: exportDailytData,
    import: selectBackupFile,
    
    // 데이터베이스 상태 확인
    checkDB: async () => {
        console.log('🔍 데이터베이스 상태 검사');
        console.log('- window.DailytDB:', window.DailytDB ? '✅ 초기화됨' : '❌ null');
        
        if (window.DailytDB) {
            try {
                const userData = await window.DailytDB.getUserData();
                console.log('- 사용자 데이터:', userData || '없음');
                
                const gameData = await window.DailytDB.getAllGameData();
                console.log('- 게임 데이터:', gameData);
                
                const habits = await window.DailytDB.getHabits();
                console.log('- 습관 데이터:', habits.length + '개');
            } catch (error) {
                console.error('- DB 접근 오류:', error);
            }
        }
        
        console.log('- 현재 전역 변수');
        console.log('  * userPoints:', userPoints);
        console.log('  * currentPartner:', currentPartner);
        if (typeof appState !== 'undefined') {
            console.log('  * appState.gacha.characters:', appState.gacha.characters.length + '개');
        }
    },
    
    // 데이터 강제 저장
    forceSave: async () => {
        console.log('💾 강제 저장 시작');
        await saveUserData();
        if (typeof saveGameData === 'function') {
            await saveGameData();
        }
        console.log('💾 강제 저장 완료');
    },
    
    // 캐릭터 데이터 완전 재설정
    resetCharacters: async () => {
        if (typeof resetCharacterDB === 'function' && confirm('모든 캐릭터 데이터를 초기화하시겠습니까?')) {
            await resetCharacterDB();
            console.log('🎮 캐릭터 데이터 완전 초기화 완료');
        }
    },
    
    // 테스트용: 포인트 추가
    addPoints: (amount = 1500) => {
        userPoints += amount;
        saveUserData();
        updateUI();
        console.log(`💰 ${amount} 포인트 추가됨 (총: ${userPoints})`);
    },
    
    // 테스트용: 전체 캐릭터 수집 완료 상태 확인
    checkComplete: () => {
        if (typeof isAllCharactersOwned === 'function') {
            const isComplete = isAllCharactersOwned();
            const totalCharacters = typeof characterDatabase !== 'undefined' ? Object.keys(characterDatabase).length : 'unknown';
            const ownedInstances = typeof appState !== 'undefined' ? appState.gacha.characters.length : 'unknown';
            const uniqueTypes = typeof appState !== 'undefined' ? [...new Set(appState.gacha.characters.map(char => char.type))] : [];
            
            console.log('📊 수집 현황:');
            console.log(`- 보유 캐릭터 인스턴스: ${ownedInstances}개`);
            console.log(`- 보유 고유 타입: ${uniqueTypes.length}개 (${uniqueTypes.join(', ')})`);
            console.log(`- 전체 캐릭터 타입: ${totalCharacters}개`);
            console.log(`- 수집 완료: ${isComplete ? '✅' : '❌'}`);
            
            return isComplete;
        }
        return false;
    },
    
    clearAll: async () => {
        if (window.DailytDB && confirm('모든 데이터를 삭제하시겠습니까?')) {
            const habits = await window.DailytDB.getHabits();
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
    },
    
    // 코스튬 해금 (개발용)
    unlockCostumes: async () => {
        if (typeof unlockAllCostumesForOwnedCharacters === 'function') {
            await unlockAllCostumesForOwnedCharacters();
            console.log('✅ 모든 보유 캐릭터의 코스튬 해금 완료');
        } else {
            console.log('❌ unlockAllCostumesForOwnedCharacters 함수를 찾을 수 없습니다');
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
    
    // 타이머 캐릭터 이미지 업데이트
    updateTimerCharacterImage();
    
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

// 타이머 캐릭터 이미지 업데이트
function updateTimerCharacterImage() {
    const characterImage = document.getElementById('characterImage');
    const characterAvatar = document.getElementById('characterAvatar');
    
    if (!characterImage) return;
    
    // 선택된 캐릭터와 코스튬 정보 가져오기
    if (typeof appState !== 'undefined' && appState.gacha && appState.gacha.selectedCharacter && typeof characterDatabase !== 'undefined') {
        const selectedCharacterType = appState.gacha.selectedCharacter;
        const character = characterDatabase[selectedCharacterType];
        const selectedCostume = appState.gacha.selectedCostumes[selectedCharacterType];
        
        if (character) {
            let imageSource = character.image; // 기본 캐릭터 이미지
            let characterName = character.name;
            
            // 코스튬이 선택되어 있으면 코스튬 이미지 사용
            if (selectedCostume && selectedCostume.image) {
                imageSource = selectedCostume.image;
            }
            
            // 이미지 src와 alt 업데이트
            characterImage.src = imageSource;
            characterImage.alt = characterName;
            
            console.log(`🎭 타이머 캐릭터 이미지 업데이트: ${characterName} (${imageSource})`);
        }
    } else {
        // 기본값: 포코타
        characterImage.src = './images/character/pokota.png';
        characterImage.alt = '포코타';
        console.log('🎭 타이머 캐릭터 이미지: 기본값 포코타');
    }
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
    console.log('🎮 캐릭터 탭 로드 시작');
    try {
        // game.js의 캐릭터 관련 함수들 호출
        if (typeof loadCharacterGameData === 'function') {
            await loadCharacterGameData();
            console.log('📦 캐릭터 게임 데이터 로드 완료');
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
            console.log('🖱️ 캐릭터 뽑기 버튼 클릭됨');
            
            // 모든 캐릭터를 보유했는지 확인
            if (typeof isAllCharactersOwned === 'function' && isAllCharactersOwned()) {
                console.log('🎉 모든 캐릭터 보유 완료 - 클릭 무시');
                showToast('🎉 모든 캐릭터를 수집 완료했습니다!');
                return;
            }
            
            const points = userPoints;
            console.log('💰 현재 포인트:', points);
            
            if (points >= 10) {
                // 포인트가 충분하면 가차 실행
                console.log('✅ 포인트 충분, 가차 실행');
                if (typeof performCharacterGachaPull === 'function') {
                    await performCharacterGachaPull();
                } else {
                    console.error('❌ performCharacterGachaPull 함수를 찾을 수 없음');
                }
            } else {
                // 포인트 부족하면 토스트 표시
                const needed = 10 - points;
                console.log('❌ 포인트 부족:', needed, '포인트 필요');
                showToast(`${needed} 포인트가 부족해`);
            }
        });
    }
}

// 메인 페이지용 캐릭터 데이터 로드
async function loadCharacterGameData() {
    try {
        // 게임 데이터 로드
        if (typeof loadGameData === 'function') {
            await loadGameData();
        }
        if (typeof ensurePokotaOwned === 'function') {
            await ensurePokotaOwned();
        }
        
        // UI 업데이트
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
        console.error('캐릭터 게임 데이터 로드 실패:', error);
    }
}

// 메인 페이지용 캐릭터 포인트 업데이트
function updateCharacterPoints() {
    if (typeof updateCharacterGachaPullButton === 'function') {
        updateCharacterGachaPullButton();
    }
}

// 메인 페이지용 가차 버튼 업데이트는 game.js에서 처리

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
    console.log('🎯 캐릭터 뽑기 시작 - 현재 포인트:', userPoints);
    
    if (userPoints < 10) {
        showToast('포인트가 부족해요! 더 많은 활동을 해보세요! 💪');
        return;
    }
    
    // 포인트 차감 전 상태 로깅
    console.log('💰 포인트 차감 전:', userPoints);
    userPoints -= 10;
    console.log('💰 포인트 차감 후:', userPoints);
    
    // 사용자 데이터 저장
    console.log('💾 사용자 데이터 저장 시작...');
    await saveUserData();
    console.log('💾 사용자 데이터 저장 완료');
    
    // UI 업데이트 (포인트 표시)
    updateUI();
    console.log('🔄 UI 업데이트 완료');
    
    // game.js의 performGachaPull 함수를 사용하되, 포인트는 메인 페이지에서 관리
    if (typeof performGachaPull === 'function') {
        // 임시로 appState.timer.points를 업데이트
        if (typeof appState !== 'undefined') {
            appState.timer.points = userPoints;
        }
        
        const gachaResult = await performGachaPull();
        
        if (gachaResult === null) {
            // 모든 캐릭터를 보유한 경우 포인트 복구
            console.log('💰 모든 캐릭터 보유로 인한 포인트 복구');
            userPoints += 150;
            await saveUserData();
        }
        
        console.log('🎲 가차 실행 완료');
        
        // UI 업데이트
        console.log('🔄 최종 UI 업데이트 시작');
        updateUI();
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
        console.log('🔄 최종 UI 업데이트 완료');
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
        const customTimeChip = document.querySelector('.time-chip[data-time="custom"]');
        const customTimeInput = document.getElementById('customTimeInput');
        const customTimeValue = document.getElementById('customTimeValue');
        
        if (customTimeChip) {
            customTimeChip.classList.add('active');
        }
        if (customTimeInput) {
            customTimeInput.style.display = 'block';
        }
        if (customTimeValue) {
            customTimeValue.value = habit.defaultTime;
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