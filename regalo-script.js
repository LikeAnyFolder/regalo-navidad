// ============================================
// PÁGINA DEL REGALO - JavaScript
// Animaciones y efectos visuales
// ============================================

// Variables globales
let giftOpened = false;
let heartsInterval;
let snowflakesInterval;
let musicStarted = false;

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeGift();
    initializeSnowflakes();
    initializeScrollAnimations();
});

// ============================================
// MÚSICA DE FONDO
// ============================================

let currentTrack = 0; // 0 = Elvis, 1 = Te Amaré

function startBackgroundMusic() {
    if (musicStarted) return;

    const backgroundMusic = document.getElementById('background-music');
    if (!backgroundMusic) return;

    backgroundMusic.volume = 0.3;

    // Cuando termine una canción, cambiar a la otra
    backgroundMusic.addEventListener('ended', function() {
        currentTrack = (currentTrack + 1) % 2;
        // El navegador automáticamente intentará la siguiente fuente en el <source>
        backgroundMusic.load(); // Recargar para cambiar de fuente
        backgroundMusic.play().catch(() => {});
    });

    const tryPlay = () => {
        const playPromise = backgroundMusic.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicStarted = true;
            }).catch(error => {
                if (backgroundMusic.readyState < 2) {
                    backgroundMusic.addEventListener('canplay', function playWhenReady() {
                        backgroundMusic.play().then(() => {
                            musicStarted = true;
                        }).catch(() => {});
                        backgroundMusic.removeEventListener('canplay', playWhenReady);
                    }, { once: true });
                }
            });
        }
    };

    tryPlay();
}

// ============================================
// ANIMACIÓN DEL REGALO
// ============================================

function initializeGift() {
    const giftBox = document.getElementById('gift-box');
    const giftLid = giftBox.querySelector('.gift-lid');
    const giftScreen = document.getElementById('gift-screen');
    const mainContent = document.getElementById('main-content');

    giftBox.addEventListener('click', openGift);
    giftBox.addEventListener('touchstart', openGift, { passive: true });

    function openGift(e) {
        if (giftOpened) return;

        e.preventDefault();
        giftOpened = true;

        giftLid.classList.add('opened');
        giftBox.classList.add('opened');

        setTimeout(() => {
            startBackgroundMusic();
        }, 100);

        createSparkles(giftBox);
        createOpeningHearts(giftBox);

        setTimeout(() => {
            giftScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            startFloatingHearts();
            startContentSnowflakes();
        }, 1500);
    }
}

// ============================================
// EFECTOS VISUALES
// ============================================

function createSparkles(container) {
    const sparkleCount = 30;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;

    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: #C0C0C0;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(192, 192, 192, 0.8);
            left: ${centerX}px;
            top: ${centerY}px;
            animation: sparkleAnimation 1.5s ease-out forwards;
        `;

        const angle = (Math.PI * 2 * i) / sparkleCount;
        const distance = 100 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        sparkle.style.setProperty('--tx', tx + 'px');
        sparkle.style.setProperty('--ty', ty + 'px');

        document.body.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1500);
    }
}

function createOpeningHearts(container) {
    const heartCount = 15;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;

    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.textContent = '💕';
            heart.style.left = centerX + 'px';
            heart.style.top = centerY + 'px';
            heart.style.animationDuration = (2 + Math.random() * 2) + 's';
            document.body.appendChild(heart);
            setTimeout(() => heart.remove(), 4000);
        }, i * 50);
    }
}

function startFloatingHearts() {
    const heartsContainer = document.querySelector('.floating-hearts');

    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = ['💕', '❤️', '💖', '💗'][Math.floor(Math.random() * 4)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.bottom = '-50px';
        heart.style.animationDuration = (10 + Math.random() * 10) + 's';
        heartsContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 25000);
    }

    heartsInterval = setInterval(() => createHeart(), 3000 + Math.random() * 2000);
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createHeart(), i * 1000);
    }
}

function initializeSnowflakes() {
    const snowflakesContainer = document.querySelector('.snowflakes');
    createSnowflake(snowflakesContainer);
    snowflakesInterval = setInterval(() => {
        createSnowflake(snowflakesContainer);
    }, 500);
}

function startContentSnowflakes() {
    const snowflakesContainer = document.querySelector('.snowflakes-content');
    setInterval(() => createSnowflake(snowflakesContainer), 800);
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createSnowflake(snowflakesContainer), i * 200);
    }
}

function createSnowflake(container) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.top = '-20px';
    snowflake.style.animationDuration = (8 + Math.random() * 7) + 's';
    snowflake.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
    container.appendChild(snowflake);
    setTimeout(() => snowflake.remove(), 20000);
}

// ============================================
// ANIMACIONES AL SCROLL
// ============================================

function initializeScrollAnimations() {
    const sections = document.querySelectorAll('.section');

    function isElementPartiallyVisible(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2;
    }

    function animateSections() {
        sections.forEach((section, index) => {
            if (isElementPartiallyVisible(section) && !section.classList.contains('visible')) {
                setTimeout(() => {
                    section.classList.add('visible');
                }, index * 100);
            }
        });
    }

    animateSections();

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                animateSections();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    setInterval(animateSections, 500);
}



// ============================================
// LIMPIEZA
// ============================================

window.addEventListener('beforeunload', function() {
    if (heartsInterval) {
        clearInterval(heartsInterval);
    }
    if (snowflakesInterval) {
        clearInterval(snowflakesInterval);
    }
});

