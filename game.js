// ========================================
// 캐릭터 게임 시스템 (게임 데이터베이스, 가차, 컬렉션)
// ========================================

// 캐릭터 데이터베이스
const characterDatabase = {
    pokota: {
        id: 'pokota',
        name: '포코타',
        image: './images/character/pokota.png',
        silhouette: './images/silhouette/pokota.png',
        color: '#FF6B6B',
        rarity: 'common',
        description: '귀여운 기본 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/pokota/default.png',
                rarity: 'common'
            },
            summer: {
                id: 'summer', 
                name: '여름',
                image: './images/costumes/pokota/summer.png',
                rarity: 'rare'
            },
            flowers: {
                id: 'flowers',
                name: '꽃',
                image: './images/costumes/pokota/pokota_flowers.png',
                rarity: 'rare'
            }
        }
    },
    bray: {
        id: 'bray',
        name: '브레이',
        image: './images/character/bray.png',
        silhouette: './images/silhouette/bray.png',
        color: '#4ECDC4',
        rarity: 'common',
        description: '활발한 에너지의 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/bray/default.png',
                rarity: 'common'
            },
            summer: {
                id: 'summer',
                name: '여름',
                image: './images/costumes/bray/bray_ summer.png',
                rarity: 'rare'
            },
            flowers: {
                id: 'flowers',
                name: '꽃',
                image: './images/costumes/bray/bray_flowers.png',
                rarity: 'rare'
            }
        }
    },
    coco: {
        id: 'coco',
        name: '코코',
        image: './images/character/coco.png',
        silhouette: './images/silhouette/coco.png',
        color: '#45B7D1',
        rarity: 'common',
        description: '차분한 성격의 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/coco/default.png',
                rarity: 'common'
            },
            flowers: {
                id: 'flowers',
                name: '꽃',
                image: './images/costumes/coco/coco_ flowers.png',
                rarity: 'rare'
            },
            halloween: {
                id: 'halloween',
                name: '할로윈',
                image: './images/costumes/coco/coco_ halloween.png',
                rarity: 'epic'
            },
            summer: {
                id: 'summer',
                name: '여름',
                image: './images/costumes/coco/coco_summer.png',
                rarity: 'rare'
            }
        }
    },
    grifo: {
        id: 'grifo',
        name: '그리포',
        image: './images/character/grifo.png',
        silhouette: './images/silhouette/grifo.png',
        color: '#F7CA88',
        rarity: 'rare',
        description: '우아한 매력의 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/grifo/default.png',
                rarity: 'common'
            },
            formal: {
                id: 'formal',
                name: '정장',
                image: './images/costumes/grifo/formal.png',
                rarity: 'epic'
            }
        }
    },
    kiri: {
        id: 'kiri',
        name: '키리',
        image: './images/character/kiri.png',
        silhouette: './images/silhouette/kiri.png',
        color: '#A8E6CF',
        rarity: 'common',
        description: '순수한 마음의 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/kiri/default.png',
                rarity: 'common'
            }
        }
    },
    midori: {
        id: 'midori',
        name: '미도리',
        image: './images/character/midori.png',
        silhouette: './images/silhouette/midori.png',
        color: '#88D8A3',
        rarity: 'rare',
        description: '자연을 사랑하는 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/midori/default.png',
                rarity: 'common'
            }
        }
    },
    noy: {
        id: 'noy',
        name: '노이',
        image: './images/character/noy.png',
        silhouette: './images/silhouette/noy.png',
        color: '#FFB6C1',
        rarity: 'rare',
        description: '신비로운 매력의 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/noy/default.png',
                rarity: 'common'
            }
        }
    },
    obis: {
        id: 'obis',
        name: '오비스',
        image: './images/character/obis.png',
        silhouette: './images/silhouette/obis.png',
        color: '#DDA0DD',
        rarity: 'epic',
        description: '지혜로운 고대의 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/obis/default.png',
                rarity: 'common'
            },
            halloween: {
                id: 'halloween',
                name: '할로윈',
                image: './images/costumes/obis/obis_ halloween .png',
                rarity: 'epic'
            },
            flowers: {
                id: 'flowers',
                name: '꽃',
                image: './images/costumes/obis/obis_flowers.png',
                rarity: 'rare'
            },
            summer: {
                id: 'summer',
                name: '여름',
                image: './images/costumes/obis/obis_summer.png',
                rarity: 'rare'
            }
        }
    },
    peng: {
        id: 'peng',
        name: '펭',
        image: './images/character/peng.png',
        silhouette: './images/silhouette/peng.png',
        color: '#87CEEB',
        rarity: 'rare',
        description: '시원한 북극의 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/peng/default.png',
                rarity: 'common'
            }
        }
    },
    viva: {
        id: 'viva',
        name: '비바',
        image: './images/character/viva.png',
        silhouette: './images/silhouette/viva.png',
        color: '#FFA07A',
        rarity: 'epic',
        description: '열정적인 모험의 파트너',
        costumes: {
            default: {
                id: 'default',
                name: '기본',
                image: './images/costumes/viva/default.png',
                rarity: 'common'
            }
        }
    }
};

// 희귀도별 확률
const GACHA_RATES = {
    common: 0.60,    // 60%
    rare: 0.30,      // 30%  
    epic: 0.10       // 10%
};

// 앱 상태 전역 객체
let appState = {
    timer: {
        points: 0
    },
    gacha: {
        characters: [],        // 보유 캐릭터들 (중복 포함)
        selectedCharacter: null, // 현재 선택된 캐릭터 타입
        selectedCostumes: {},   // 캐릭터별 선택된 코스튬
        ownedCostumes: {}       // 보유 코스튬들
    }
};

// ========================================
// 게임 데이터 로드/저장
// ========================================

// 게임 데이터 로드
async function loadGameData() {
    try {
        console.log('🎮 게임 데이터 로드 시작');
        let loadedFromIndexedDB = false;
        
        if (window.DailytDB && typeof window.DailytDB.getAllGameData === 'function') {
            try {
                const gameData = await window.DailytDB.getAllGameData();
                
                if (gameData && Object.keys(gameData).length > 0) {
                    // 캐릭터 데이터 로드
                    appState.gacha.characters = gameData.userCharacters || [];
                    appState.gacha.selectedCharacter = gameData.selectedCharacter || null;
                    appState.gacha.selectedCostumes = gameData.selectedCostumes || {};
                    appState.gacha.ownedCostumes = gameData.ownedCostumes || {};
                    loadedFromIndexedDB = true;
                    
                    console.log('✅ IndexedDB에서 게임 데이터 로드 완료:', {
                        characters: appState.gacha.characters.length,
                        selectedCharacter: appState.gacha.selectedCharacter,
                        costumes: Object.keys(appState.gacha.ownedCostumes).length
                    });
                }
            } catch (dbError) {
                console.warn('⚠️ IndexedDB 로드 실패, localStorage로 폴백:', dbError);
            }
        }
        
        // IndexedDB에서 로드 실패하거나 데이터가 없으면 localStorage에서 로드
        if (!loadedFromIndexedDB) {
            console.log('📦 localStorage에서 게임 데이터 로드 시도');
            
            // 먼저 백업 데이터 확인
            const backupData = localStorage.getItem('gameDataBackup');
            if (backupData) {
                try {
                    const backup = JSON.parse(backupData);
                    appState.gacha.characters = backup.characters || [];
                    appState.gacha.selectedCharacter = backup.selectedCharacter || null;
                    appState.gacha.selectedCostumes = backup.selectedCostumes || {};
                    appState.gacha.ownedCostumes = backup.ownedCostumes || {};
                    console.log('✅ 백업 데이터에서 로드 완료');
                } catch (backupError) {
                    console.warn('⚠️ 백업 데이터 파싱 실패:', backupError);
                    // 개별 localStorage 아이템에서 로드
                    loadFromIndividualLocalStorage();
                }
            } else {
                // 개별 localStorage 아이템에서 로드
                loadFromIndividualLocalStorage();
            }
        }
    } catch (error) {
        console.error('❌ 게임 데이터 로드 완전 실패:', error);
        
        // 비상 데이터 확인
        try {
            const emergencyData = localStorage.getItem('emergencyGameData');
            if (emergencyData) {
                const emergency = JSON.parse(emergencyData);
                appState.gacha.characters = emergency.characters || [];
                appState.gacha.selectedCharacter = emergency.selectedCharacter || null;
                console.log('🚨 비상 데이터에서 복구 완료');
            }
        } catch (emergencyError) {
            console.error('❌ 비상 데이터 복구도 실패:', emergencyError);
        }
        
        // 모든 복구 실패 시 기본값으로 초기화
        if (!appState.gacha.characters) {
            appState.gacha.characters = [];
            appState.gacha.selectedCharacter = null;
            appState.gacha.selectedCostumes = {};
            appState.gacha.ownedCostumes = {};
            console.log('🔄 기본값으로 초기화');
        }
    }
}

function loadFromIndividualLocalStorage() {
    try {
        appState.gacha.characters = JSON.parse(localStorage.getItem('userCharacters') || '[]');
        appState.gacha.selectedCharacter = localStorage.getItem('selectedCharacter');
        appState.gacha.selectedCostumes = JSON.parse(localStorage.getItem('selectedCostumes') || '{}');
        appState.gacha.ownedCostumes = JSON.parse(localStorage.getItem('ownedCostumes') || '{}');
        console.log('✅ 개별 localStorage에서 로드 완료');
    } catch (error) {
        console.error('❌ localStorage 개별 로드 실패:', error);
        appState.gacha.characters = [];
        appState.gacha.selectedCharacter = null;
        appState.gacha.selectedCostumes = {};
        appState.gacha.ownedCostumes = {};
    }
}

// 게임 데이터 저장
async function saveGameData() {
    try {
        console.log('🎮 게임 데이터 저장 시작:', {
            characters: appState.gacha.characters.length,
            selectedCharacter: appState.gacha.selectedCharacter,
            costumes: Object.keys(appState.gacha.ownedCostumes).length
        });

        let savedToIndexedDB = false;
        
        if (window.DailytDB && typeof window.DailytDB.setGameData === 'function') {
            try {
                // IndexedDB에 저장
                await Promise.all([
                    window.DailytDB.setGameData('userCharacters', appState.gacha.characters),
                    window.DailytDB.setGameData('selectedCharacter', appState.gacha.selectedCharacter),
                    window.DailytDB.setGameData('selectedCostumes', appState.gacha.selectedCostumes),
                    window.DailytDB.setGameData('ownedCostumes', appState.gacha.ownedCostumes)
                ]);
                savedToIndexedDB = true;
                console.log('✅ IndexedDB에 게임 데이터 저장 완료');
            } catch (dbError) {
                console.warn('⚠️ IndexedDB 저장 실패, localStorage로 폴백:', dbError);
            }
        }
        
        // IndexedDB 저장 실패 시 또는 DailytDB가 없을 때 localStorage 사용
        if (!savedToIndexedDB) {
            localStorage.setItem('userCharacters', JSON.stringify(appState.gacha.characters));
            localStorage.setItem('selectedCharacter', appState.gacha.selectedCharacter || '');
            localStorage.setItem('selectedCostumes', JSON.stringify(appState.gacha.selectedCostumes));
            localStorage.setItem('ownedCostumes', JSON.stringify(appState.gacha.ownedCostumes));
            console.log('✅ localStorage에 게임 데이터 저장 완료');
        }
        
        // 항상 localStorage에도 백업으로 저장
        const backupData = {
            characters: appState.gacha.characters,
            selectedCharacter: appState.gacha.selectedCharacter,
            selectedCostumes: appState.gacha.selectedCostumes,
            ownedCostumes: appState.gacha.ownedCostumes,
            timestamp: Date.now()
        };
        localStorage.setItem('gameDataBackup', JSON.stringify(backupData));
        
    } catch (error) {
        console.error('❌ 게임 데이터 저장 완전 실패:', error);
        
        // 마지막 수단으로 간단한 형태로 저장
        try {
            localStorage.setItem('emergencyGameData', JSON.stringify({
                characters: appState.gacha.characters,
                selectedCharacter: appState.gacha.selectedCharacter,
                timestamp: Date.now()
            }));
        } catch (emergencyError) {
            console.error('❌ 비상 데이터 저장도 실패:', emergencyError);
        }
    }
}

// ========================================
// 캐릭터 초기화
// ========================================

// 캐릭터 DB 완전 재설정 (개발자 도구용)
async function resetCharacterDB() {
    try {
        if (window.DailytDB) {
            // 게임 데이터 초기화
            await window.DailytDB.setGameData('userCharacters', []);
            await window.DailytDB.setGameData('selectedCharacter', null);
            await window.DailytDB.setGameData('selectedCostumes', {});
            await window.DailytDB.setGameData('ownedCostumes', {});
        } else {
            // localStorage 초기화
            localStorage.removeItem('userCharacters');
            localStorage.removeItem('selectedCharacter');
            localStorage.removeItem('selectedCostumes');
            localStorage.removeItem('ownedCostumes');
        }
        
        // 앱 상태 초기화
        appState.gacha.characters = [];
        appState.gacha.selectedCharacter = null;
        appState.gacha.selectedCostumes = {};
        appState.gacha.ownedCostumes = {};
        
        console.log('🎮 캐릭터 DB 초기화 완료');
    } catch (error) {
        console.error('캐릭터 DB 초기화 실패:', error);
    }
}

// 포코타 기본 보유 설정
async function ensurePokotaOwned() {
    console.log('🔍 포코타 보유 확인 시작 - 현재 캐릭터 수:', appState.gacha.characters.length);
    
    // 포코타를 보유하지 않았다면 기본으로 추가
    const hasPokota = appState.gacha.characters.some(char => char.type === 'pokota');
    console.log('🎯 포코타 보유 여부:', hasPokota);
    
    if (!hasPokota) {
        // 포코타 기본 캐릭터 추가
        const pokotaCharacter = {
            id: Date.now().toString(),
            type: 'pokota',
            name: characterDatabase.pokota.name,
            rarity: 'common',
            acquiredAt: Date.now(),
            costume: 'default'
        };
        
        appState.gacha.characters.push(pokotaCharacter);
        
        // 포코타 기본 코스튬 추가
        if (!appState.gacha.ownedCostumes.pokota) {
            appState.gacha.ownedCostumes.pokota = ['default'];
        } else if (!appState.gacha.ownedCostumes.pokota.includes('default')) {
            appState.gacha.ownedCostumes.pokota.push('default');
        }
        
        // 포코타를 기본 선택 캐릭터로 설정
        appState.gacha.selectedCharacter = 'pokota';
        appState.gacha.selectedCostumes.pokota = characterDatabase.pokota.costumes.default;
        
        await saveGameData();
        console.log('🎯 포코타 기본 캐릭터 설정 완료');
    }
    
    // 선택된 캐릭터가 없으면 포코타로 설정
    if (!appState.gacha.selectedCharacter) {
        appState.gacha.selectedCharacter = 'pokota';
        appState.gacha.selectedCostumes.pokota = characterDatabase.pokota.costumes.default;
        await saveGameData();
    }
}

// 기존 보유 캐릭터에게 모든 코스튬 자동 해금
async function unlockAllCostumesForOwnedCharacters() {
    console.log('🎨 기존 캐릭터들의 모든 코스튬 해금 시작');
    
    // 보유중인 캐릭터 타입들 추출
    const ownedCharacterTypes = [...new Set(appState.gacha.characters.map(char => char.type))];
    
    let unlocked = false;
    for (const characterType of ownedCharacterTypes) {
        const character = characterDatabase[characterType];
        if (!character) continue;
        
        // 해당 캐릭터의 ownedCostumes 초기화
        if (!appState.gacha.ownedCostumes[characterType]) {
            appState.gacha.ownedCostumes[characterType] = [];
        }
        
        // characterDatabase에 있는 모든 코스튬을 ownedCostumes에 추가
        const availableCostumes = Object.keys(character.costumes);
        for (const costumeId of availableCostumes) {
            if (!appState.gacha.ownedCostumes[characterType].includes(costumeId)) {
                appState.gacha.ownedCostumes[characterType].push(costumeId);
                console.log(`🎨 ${character.name}에게 ${character.costumes[costumeId].name} 코스튬 해금`);
                unlocked = true;
            }
        }
    }
    
    if (unlocked) {
        await saveGameData();
        console.log('🎨 코스튬 해금 완료 및 저장');
        
        // UI 업데이트
        updateCharacterCollectionMain();
        
        showToast('새로운 코스튬들이 해금되었습니다! 🎨');
    }
}

// ========================================
// 가차 시스템
// ========================================

// 가차 실행
async function performGachaPull() {
    console.log('🎲 가차 실행 시작');
    
    // 랜덤 캐릭터 뽑기
    const result = drawRandomCharacter();
    
    if (!result) {
        console.log('🎉 모든 캐릭터를 보유하여 더 이상 뽑을 수 없습니다');
        showToast('🎉 모든 캐릭터를 수집 완료했습니다!');
        return null;
    }
    
    console.log('🎯 뽑힌 캐릭터:', result.character.name, '레어도:', result.character.rarity);
    
    // 캐릭터 추가
    appState.gacha.characters.push(result.character);
    console.log('📊 현재 보유 캐릭터 수:', appState.gacha.characters.length);
    
    // 코스튬 추가 (기본 코스튬)
    if (!appState.gacha.ownedCostumes[result.character.type]) {
        appState.gacha.ownedCostumes[result.character.type] = [];
    }
    if (!appState.gacha.ownedCostumes[result.character.type].includes('default')) {
        appState.gacha.ownedCostumes[result.character.type].push('default');
    }
    
    // 희귀한 캐릭터의 경우 추가 코스튬도 얻을 수 있음
    if (result.character.rarity === 'epic' && Math.random() < 0.3) {
        const characterData = characterDatabase[result.character.type];
        const additionalCostumes = Object.keys(characterData.costumes).filter(id => id !== 'default');
        
        if (additionalCostumes.length > 0) {
            const bonusCostume = additionalCostumes[Math.floor(Math.random() * additionalCostumes.length)];
            if (!appState.gacha.ownedCostumes[result.character.type].includes(bonusCostume)) {
                appState.gacha.ownedCostumes[result.character.type].push(bonusCostume);
                result.bonusCostume = characterData.costumes[bonusCostume];
                console.log('🎁 보너스 코스튬 획득:', bonusCostume);
            }
        }
    }
    
    // 게임 데이터 저장
    console.log('💾 게임 데이터 저장 시작...');
    await saveGameData();
    console.log('💾 게임 데이터 저장 완료');
    
    // UI 업데이트
    updateCharacterCollectionAndOwnedCounts();
    updateCharacterCollectionMain();
    updateCharacterGachaPullButton();
    
    // 결과 모달 표시
    showGachaResultModal(result);
    
    // 폭죽 효과
    createFireworks();
    
    return result;
}

// 랜덤 캐릭터 뽑기 로직
function drawRandomCharacter() {
    // 이미 보유한 고유 캐릭터 타입 목록 (중복 제거)
    const ownedCharacterTypes = [...new Set(appState.gacha.characters.map(char => char.type))];
    console.log('🎯 현재 보유 고유 캐릭터 타입:', ownedCharacterTypes);
    
    // 보유하지 않은 캐릭터들만 필터링
    const unownedCharacters = Object.values(characterDatabase).filter(char => 
        !ownedCharacterTypes.includes(char.id)
    );
    
    console.log('🆕 뽑을 수 있는 캐릭터 수:', unownedCharacters.length);
    
    if (unownedCharacters.length === 0) {
        console.log('🎉 모든 캐릭터를 보유하고 있습니다!');
        return null; // 더 이상 뽑을 캐릭터가 없음
    }
    
    const random = Math.random();
    let selectedRarity = 'common';
    
    if (random < GACHA_RATES.epic) {
        selectedRarity = 'epic';
    } else if (random < GACHA_RATES.epic + GACHA_RATES.rare) {
        selectedRarity = 'rare';
    }
    
    // 해당 희귀도의 미보유 캐릭터들 필터링
    let charactersOfRarity = unownedCharacters.filter(char => char.rarity === selectedRarity);
    
    // 해당 희귀도에 미보유 캐릭터가 없으면 다른 희귀도에서 선택
    if (charactersOfRarity.length === 0) {
        console.log(`⚠️ ${selectedRarity} 등급에 미보유 캐릭터가 없어 전체 미보유 캐릭터에서 선택`);
        charactersOfRarity = unownedCharacters;
    }
    
    // 랜덤 선택
    const randomCharacter = charactersOfRarity[Math.floor(Math.random() * charactersOfRarity.length)];
    
    // 캐릭터 생성
    const character = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        type: randomCharacter.id,
        name: randomCharacter.name,
        rarity: randomCharacter.rarity,
        acquiredAt: Date.now(),
        costume: 'default'
    };
    
    return {
        character: character,
        characterData: randomCharacter,
        isNew: !appState.gacha.characters.some(char => char.type === character.type)
    };
}

// ========================================
// 가차 결과 모달
// ========================================

// 가차 결과 모달 표시
function showGachaResultModal(result) {
    const modal = document.getElementById('gachaResultModal');
    const content = document.getElementById('gachaResultContent');
    
    if (!modal || !content) return;
    
    const character = result.characterData;
    const isNew = result.isNew;
    
    let resultHTML = `
        <div class="gacha-result-card">
            <div class="result-message">
                ${isNew ? '🎉 새로운 캐릭터 발견!' : '🌟 캐릭터 재등장!'}
            </div>
            <div class="result-character">
                <div class="result-image">
                    <img src="${character.image}" alt="${character.name}">
                </div>
                <div class="result-name">${character.name}</div>
                <div class="result-rarity" style="color: ${getRarityColor(character.rarity)}">
                    ${getRarityText(character.rarity)}
                </div>
                <div class="result-description">${character.description}</div>
    `;
    
    // 보너스 코스튬 표시
    if (result.bonusCostume) {
        resultHTML += `
                <div class="bonus-costume">
                    <div class="bonus-title">✨ 보너스 코스튬!</div>
                    <div class="bonus-costume-name">${result.bonusCostume.name}</div>
                </div>
        `;
    }
    
    resultHTML += `
            </div>
        </div>
    `;
    
    content.innerHTML = resultHTML;
    
    modal.style.display = 'flex';
}

// 가차 결과 모달 닫기
function closeGachaResultModal() {
    const modal = document.getElementById('gachaResultModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 희귀도 색상
function getRarityColor(rarity) {
    switch (rarity) {
        case 'common': return '#4CAF50';
        case 'rare': return '#2196F3';
        case 'epic': return '#9C27B0';
        default: return '#666';
    }
}

// 희귀도 텍스트
function getRarityText(rarity) {
    switch (rarity) {
        case 'common': return '일반';
        case 'rare': return '희귀';
        case 'epic': return '전설';
        default: return '알 수 없음';
    }
}

// ========================================
// 컬렉션 UI 업데이트
// ========================================

// 메인 페이지 컬렉션 통계 업데이트
function updateCharacterCollectionAndOwnedCounts() {
    const collectionStats = document.getElementById('characterCollectionStats');
    
    if (collectionStats) {
        const userCharacters = appState.gacha.characters;
        const uniqueTypes = new Set(userCharacters.map(char => char.type));
        const totalTypes = Object.keys(characterDatabase).length;
        
        collectionStats.textContent = `${uniqueTypes.size}/${totalTypes}종 수집`;
    }
}

// 메인 페이지 캐릭터 컬렉션 그리드 업데이트
function updateCharacterCollectionMain() {
    const collectionGrid = document.getElementById('characterCollectionGrid');
    if (!collectionGrid) return;
    
    // 모든 캐릭터 타입 가져오기
    const allCharacterTypes = Object.keys(characterDatabase);
    const userCharacters = appState.gacha.characters;
    
    // 타입별 보유 캐릭터 맵 생성
    const ownedCharactersByType = {};
    userCharacters.forEach(char => {
        if (!ownedCharactersByType[char.type]) {
            ownedCharactersByType[char.type] = [];
        }
        ownedCharactersByType[char.type].push(char);
    });
    
    // 모든 캐릭터 표시
    collectionGrid.innerHTML = allCharacterTypes.map(type => {
        const character = characterDatabase[type];
        const owned = ownedCharactersByType[type] || [];
        const isOwned = owned.length > 0;
        
        // 표시 색상
        const displayColor = isOwned ? character.color : '#ccc';
        const isSelected = appState.gacha.selectedCharacter === type;
        
        // 선택된 코스튬 이미지
        const selectedCostume = appState.gacha.selectedCostumes[type];
        const displayImage = isOwned && selectedCostume ? selectedCostume.image : character.image;
        
        return `
            <div class="character-card-main ${isOwned ? 'owned' : 'unowned'} ${isSelected ? 'selected' : ''}" 
                 style="border-color: ${displayColor}" 
                 onclick="selectCharacterFromCollectionMain('${type}', ${isOwned})">
                <div class="character-image-main-container">
                    <div class="character-image-main ${!isOwned ? 'grayscale' : ''}">
                        <img src="${isOwned ? displayImage : character.silhouette}" alt="${character.name}" class="character-image">
                    </div>
                    ${!isOwned ? '<div class="character-locked-badge-main">🔒</div>' : ''}
                    ${isSelected && isOwned ? '<div class="character-locked-badge-main selected">✓</div>' : ''}
                </div>
                <div class="character-name-main ${!isOwned ? 'unowned-text-main' : ''}">${character.name}</div>
                <div class="character-count-main ${!isOwned ? 'unowned-text-main' : ''}">${isOwned ? '코스튬 선택' : '미보유'}</div>
            </div>
        `;
    }).join('');
}

// 모든 캐릭터를 보유했는지 확인
function isAllCharactersOwned() {
    const totalCharacters = Object.keys(characterDatabase).length;
    // 고유한 캐릭터 타입만 세기
    const uniqueOwnedTypes = [...new Set(appState.gacha.characters.map(char => char.type))];
    const ownedCharacterTypes = uniqueOwnedTypes.length;
    
    console.log(`🎯 캐릭터 수집 상태: ${ownedCharacterTypes}/${totalCharacters} (보유 타입: ${uniqueOwnedTypes.join(', ')})`);
    
    return ownedCharacterTypes >= totalCharacters;
}

// 메인 페이지 가차 버튼 업데이트
function updateCharacterGachaPullButton() {
    const gachaPullBtn = document.getElementById('characterGachaPull');
    const gachaBtnText = gachaPullBtn?.querySelector('.character-gacha-btn-text');
    
    // script.js의 userPoints 사용
    const points = typeof userPoints !== 'undefined' ? userPoints : 0;
    
    if (gachaBtnText && gachaPullBtn) {
        const allCharactersOwned = isAllCharactersOwned();
        
        if (allCharactersOwned) {
            // 모든 캐릭터를 보유한 경우
            gachaBtnText.textContent = '다음에 만나요';
            gachaPullBtn.classList.remove('active');
            gachaPullBtn.disabled = true;
            gachaPullBtn.style.opacity = '0.5';
            gachaPullBtn.style.cursor = 'not-allowed';
            console.log('🎉 모든 캐릭터 보유 완료 - 버튼 비활성화');
        } else if (points >= 10) {
            // 포인트가 충분한 경우
            gachaBtnText.textContent = '캐릭터 뽑기';
            gachaPullBtn.classList.add('active');
            gachaPullBtn.disabled = false;
            gachaPullBtn.style.opacity = '1';
            gachaPullBtn.style.cursor = 'pointer';
        } else {
            // 포인트가 부족한 경우
            gachaBtnText.textContent = '캐릭터 뽑기';
            gachaPullBtn.classList.remove('active');
            gachaPullBtn.disabled = false; // 클릭 가능하게 하여 부족 메시지 표시
            gachaPullBtn.style.opacity = '1';
            gachaPullBtn.style.cursor = 'pointer';
        }
    }
}

// ========================================
// 캐릭터 선택 및 코스튬
// ========================================

// 메인 페이지에서 캐릭터 선택
function selectCharacterFromCollectionMain(characterType, isOwned) {
    if (!isOwned) {
        if (typeof showToast === 'function') {
            showToast('아직 보유하지 않은 캐릭터입니다. 포인트를 모아 뽑기를 해보세요! 🎯');
        }
        return;
    }
    
    // 코스튬 선택 모달 열기
    openCostumeModal(characterType);
}

// 코스튬 선택 모달 열기
function openCostumeModal(characterType) {
    const modal = document.getElementById('costumeModal');
    const title = document.getElementById('costumeModalTitle');
    const costumeOptions = document.getElementById('costumeOptions');
    
    if (!modal || !costumeOptions) return;
    
    const character = characterDatabase[characterType];
    const ownedCostumes = appState.gacha.ownedCostumes[characterType] || [];
    
    // 모달 제목 설정
    if (title) title.textContent = `${character.name} 코스튬 선택`;
    
    // 코스튬 옵션 렌더링
    const costumesHTML = ownedCostumes.map(costumeId => {
        const costume = character.costumes[costumeId];
        const isSelected = appState.gacha.selectedCostumes[characterType]?.id === costumeId;
        
        return `
            <div class="costume-option ${isSelected ? 'selected' : ''}" onclick="selectCostume('${characterType}', '${costumeId}')">
                <div class="costume-image">
                    <img src="${costume.image}" alt="${costume.name}">
                </div>
                <div class="costume-name">${costume.name}</div>
                ${isSelected ? '<div class="costume-selected-badge">선택됨</div>' : ''}
            </div>
        `;
    }).join('');
    
    costumeOptions.innerHTML = `
        <div class="costume-options-grid" style="display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 15px; width: 100% !important; justify-items: center;">
            ${costumesHTML}
        </div>
    `;
    
    modal.style.display = 'flex';
}

// 코스튬 선택
async function selectCostume(characterType, costumeId) {
    const character = characterDatabase[characterType];
    const costume = character.costumes[costumeId];
    
    // 캐릭터 및 코스튬 선택
    appState.gacha.selectedCharacter = characterType;
    appState.gacha.selectedCostumes[characterType] = costume;
    
    // 데이터 저장
    await saveGameData();
    
    // UI 업데이트
    updateCharacterCollectionMain();
    
    // script.js의 updateUI 호출 (파트너 이름 업데이트)
    if (typeof updateUI === 'function') {
        updateUI();
    }
    
    // 모달 닫기
    closeCostumeModal();
    
    // 성공 메시지
    if (typeof showToast === 'function') {
        showToast(`${character.name}의 ${costume.name} 코스튬으로 변경되었습니다!`);
    }
}

// 코스튬 모달 닫기
function closeCostumeModal() {
    const modal = document.getElementById('costumeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ========================================
// 폭죽 효과
// ========================================

// 폭죽 효과 생성
function createFireworks() {
    const container = document.createElement('div');
    container.className = 'firework-container';
    document.body.appendChild(container);
    
    // 여러 개의 폭죽 생성
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createSingleFirework(container);
        }, i * 200);
    }
    
    // 3초 후 컨테이너 제거
    setTimeout(() => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }, 3000);
}

// 단일 폭죽 생성
function createSingleFirework(container) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7CA88', '#A8E6CF'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // 랜덤 위치
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight * 0.6 + Math.random() * window.innerHeight * 0.3;
    
    // 폭죽 런처 생성
    const launcher = document.createElement('div');
    launcher.className = 'firework-launcher';
    launcher.style.cssText = `
        left: ${x}px;
        top: ${window.innerHeight}px;
        background: ${color};
    `;
    container.appendChild(launcher);
    
    // 폭발 효과
    setTimeout(() => {
        // 런처 제거
        if (launcher.parentNode) {
            launcher.parentNode.removeChild(launcher);
        }
        
        // 폭발 생성
        createExplosion(container, x, y, color);
    }, 1000);
}

// 폭발 효과 생성
function createExplosion(container, x, y, color) {
    // 중앙 플래시
    const burst = document.createElement('div');
    burst.className = 'firework-burst';
    burst.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        background: ${color};
        box-shadow: 0 0 20px ${color};
    `;
    container.appendChild(burst);
    
    // 파티클들 생성
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            
            const angle = (Math.PI * 2 * i) / 12;
            const velocity = 50 + Math.random() * 30;
            const endX = x + Math.cos(angle) * velocity;
            const endY = y + Math.sin(angle) * velocity;
            
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                background: ${color};
                --end-x: ${endX}px;
                --end-y: ${endY}px;
            `;
            
            // CSS 애니메이션 대신 직접 애니메이션 적용
            particle.animate([
                { transform: 'translate(-50%, -50%) scale(1)', left: `${x}px`, top: `${y}px`, opacity: 1 },
                { transform: 'translate(-50%, -50%) scale(0)', left: `${endX}px`, top: `${endY}px`, opacity: 0 }
            ], {
                duration: 1500,
                easing: 'ease-out'
            });
            
            container.appendChild(particle);
            
            // 파티클 제거
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1500);
        }, i * 50);
    }
    
    // 버스트 제거
    setTimeout(() => {
        if (burst.parentNode) {
            burst.parentNode.removeChild(burst);
        }
    }, 300);
}

// ========================================
// 캐릭터 데이터 관련 함수들 (script.js 호환)
// ========================================

// script.js에서 호출하는 함수들
async function loadCharacterGameData() {
    await loadGameData();
    await ensurePokotaOwned(); // 포코타 보유 확인만 실행 (초기화 제거)
    await unlockAllCostumesForOwnedCharacters(); // 기존 캐릭터들의 코스튬 자동 해금
}

function updateCharacterPoints() {
    updateCharacterGachaPullButton();
}

// 메인 페이지용 가차 실행은 script.js에서 처리 (중복 제거됨)

// ========================================
// 전역 함수들
// ========================================

// 코스튬 관련 CSS 스타일 추가
const costumeStyles = `
<style>
.costume-options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 20px;
}

.costume-option {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.costume-option:hover {
    border-color: #4CAF50;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.costume-option.selected {
    border-color: #3b82f6;
    background: #eff6ff;
}

.costume-image {
    width: 60px;
    height: 60px;
    margin: 0 auto 8px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
}

.costume-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.costume-name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    font-family: 'NanumSquareRound', Arial, sans-serif;
}

.costume-selected-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    background: #3b82f6;
    color: white;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 600;
}

.costume-collection-summary {
    margin-bottom: 20px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
}

.costume-collection-stats {
    display: flex;
    gap: 20px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stat-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
}

.stat-value {
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
}

.gacha-result-card .result-rarity {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 8px;
}

.gacha-result-card .result-description {
    font-size: 14px;
    opacity: 0.9;
    margin-top: 8px;
}

.bonus-costume {
    margin-top: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.bonus-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
}

.bonus-costume-name {
    font-size: 14px;
    font-weight: 600;
}


.unowned-text-main {
    color: #9ca3af !important;
}
</style>
`;

// DOM이 로드된 후 스타일 추가
document.addEventListener('DOMContentLoaded', function() {
    // 코스튬 관련 스타일 추가
    document.head.insertAdjacentHTML('beforeend', costumeStyles);
});

// 전역 노출
window.characterDatabase = characterDatabase;
window.appState = appState;