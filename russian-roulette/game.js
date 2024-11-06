// В начале game.js добавьте:
document.addEventListener('DOMContentLoaded', () => {
    const revolverImages = document.querySelectorAll('.revolver-img');
    revolverImages.forEach(img => {
        img.src = revolverImage;
    });
});

let playerHealth = 4;
let botHealth = 4;
let isPhase2 = false;
let gameState = {
    currentTurn: 'player'
};

const BOT_FACES = {
    normal: '😐',
    angry: '😠',
    hurt: '😫',
    phase2: '🤬',
    victory: '😈'
};

// Звуковые эффекты
const SOUNDS = {
    shot: document.getElementById('shotSound'),
    empty: document.getElementById('emptySound'),
    phase2: document.getElementById('phase2Sound'),
    victory: document.getElementById('victorySound'),
    medkit: document.getElementById('medkitSound')
};

function playSound(soundName) {
    if (SOUNDS[soundName]) {
        SOUNDS[soundName].currentTime = 0;
        SOUNDS[soundName].play().catch(err => console.log('Ошибка воспроизведения звука:', err));
    }
}

function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('botFace').textContent = BOT_FACES.normal;
    updateHealth();
    updateMessage('Ваш ход!');
}

function updateHealth() {
    document.getElementById('playerHealth').innerHTML = 
        Array(playerHealth).fill('<div class="health-point"></div>').join('');
    document.getElementById('botHealth').innerHTML = 
        Array(botHealth).fill('<div class="health-point"></div>').join('');
}

function updateMessage(text) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.classList.add('message-animation');
    setTimeout(() => message.classList.remove('message-animation'), 500);
}

function updateBotFace(state) {
    const face = document.getElementById('botFace');
    if (isPhase2) {
        face.textContent = BOT_FACES.phase2;
    } else if (state === 'hurt') {
        face.textContent = BOT_FACES.hurt;
        face.classList.add('shake-face');
        setTimeout(() => {
            face.textContent = isPhase2 ? BOT_FACES.phase2 : BOT_FACES.normal;
            face.classList.remove('shake-face');
        }, 1000);
    } else if (state === 'angry') {
        face.textContent = BOT_FACES.angry;
        face.classList.add('glow-red');
        setTimeout(() => {
            face.textContent = isPhase2 ? BOT_FACES.phase2 : BOT_FACES.normal;
            face.classList.remove('glow-red');
        }, 1000);
    }
}

function addScreenShake() {
    const game = document.getElementById('game');
    game.classList.add('screen-shake');
    setTimeout(() => game.classList.remove('screen-shake'), 500);
}

function spawnMedkit() {
    const medkit = document.createElement('div');
    medkit.className = 'medkit';
    medkit.innerHTML = `
        <div class="medkit-glow"></div>
        <span class="medkit-icon">🧰</span>
    `;
    
    // Случайная позиция по горизонтали
    medkit.style.left = `${Math.random() * 80 + 10}%`;
    
    // Случайная скорость падения
    const fallDuration = Math.random() * 1 + 2; // 2-3 секунды
    medkit.style.animation = `fall ${fallDuration}s linear`;
    
    medkit.onclick = () => {
        if (playerHealth < 4) {
            playerHealth = Math.min(4, playerHealth + 2);
            updateHealth();
            updateMessage('Вы подобрали аптечку! +2 HP');
            playSound('medkit');
            medkit.classList.add('medkit-collected');
            setTimeout(() => medkit.remove(), 300);
        }
    };
    
    document.body.appendChild(medkit);
    
    // Удаляем аптечку после падения
    setTimeout(() => {
        if (medkit.parentNode) {
            medkit.classList.add('medkit-fade');
            setTimeout(() => medkit.remove(), 300);
        }
    }, fallDuration * 1000);
}

function shoot() {
    if (gameState.currentTurn !== 'player') return;

    const revolver = document.querySelector('.revolver');
    revolver.classList.add('shoot-animation');
    setTimeout(() => revolver.classList.remove('shoot-animation'), 500);

    const isLoaded = Math.random() < (isPhase2 ? 0.6 : 0.4);
    
    if (isLoaded) {
        playerHealth--;
        updateMessage('БАХ! 💥 Вы получили урон!');
        playSound('shot');
        addScreenShake();
        updateBotFace('angry');
    } else {
        updateMessage('Клик... Повезло!');
        playSound('empty');
    }
    
    updateHealth();
    gameState.currentTurn = 'bot';
    
    if (playerHealth <= 0) {
        setTimeout(() => {
            updateBotFace('victory');
            document.getElementById('gameOver').style.display = 'flex';
        }, 500);
        return;
    }
    
    setTimeout(botTurn, 1000);
}

function botTurn() {
    const botThinkingTime = Math.random() * 1000 + 500;
    updateMessage('Бот думает...');
    
    setTimeout(() => {
        const isLoaded = Math.random() < (isPhase2 ? 0.3 : 0.4);
        
        if (isLoaded) {
            botHealth--;
            updateMessage('БАХ! 💥 Бот получил урон!');
            playSound('shot');
            addScreenShake();
            updateBotFace('hurt');
            spawnMedkit(); // Спавним аптечку при каждом попадании по боту
            
            if (botHealth <= 0) {
                if (!isPhase2) {
                    startPhase2();
                } else {
                    showVictoryScreen();
                }
                return;
            }
        } else {
            updateMessage('Клик... Боту повезло!');
            playSound('empty');
        }
        
        updateHealth();
        gameState.currentTurn = 'player';
    }, botThinkingTime);
}

function startPhase2() {
    isPhase2 = true;
    botHealth = 6;
    document.getElementById('game').classList.add('phase2');
    document.getElementById('phase2Transition').style.display = 'flex';
    playSound('phase2');
    
    setTimeout(() => {
        document.getElementById('phase2Transition').style.display = 'none';
        updateBotFace('phase2');
        updateHealth();
        gameState.currentTurn = 'player';
        updateMessage('НАЧИНАЕТСЯ ВТОРАЯ ФАЗА!');
    }, 2000);
    
    addScreenShake();
}

function showVictoryScreen() {
    document.getElementById('victory').style.display = 'flex';
    playSound('victory');
    createMoneyRain();
}

function createMoneyRain() {
    const moneyContainer = document.getElementById('money');
    const emojis = ['💵', '💰', '💎', '🪙'];
    
    for (let i = 0; i < 50; i++) {
        const money = document.createElement('div');
        money.className = 'money';
        money.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        money.style.left = `${Math.random() * 100}%`;
        money.style.animationDuration = `${Math.random() * 3 + 2}s`;
        money.style.animationDelay = `${Math.random() * 2}s`;
        moneyContainer.appendChild(money);
    }
}