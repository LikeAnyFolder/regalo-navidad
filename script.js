// ============================================
// PÁGINA ROMÁNTICA NAVIDEÑA - JAVASCRIPT
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

function startBackgroundMusic() {
    if (musicStarted) return; // Evitar iniciar múltiples veces
    
    const backgroundMusic = document.getElementById('background-music');
    if (!backgroundMusic) {
        console.log('Elemento de audio no encontrado');
        return;
    }
    
    // Configurar volumen suave (0.3 = 30% del volumen)
    backgroundMusic.volume = 0.3;
    
    // Función para intentar reproducir
    const tryPlay = () => {
        const playPromise = backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicStarted = true;
                console.log('Música de fondo iniciada correctamente');
            }).catch(error => {
                console.log('Error al reproducir música:', error);
                // Si el audio no está listo, esperar a que se cargue
                if (backgroundMusic.readyState < 2) {
                    backgroundMusic.addEventListener('canplay', function playWhenReady() {
                        backgroundMusic.play().then(() => {
                            musicStarted = true;
                            console.log('Música iniciada después de cargar');
                        }).catch(err => {
                            console.log('No se pudo reproducir después de cargar:', err);
                        });
                        backgroundMusic.removeEventListener('canplay', playWhenReady);
                    }, { once: true });
                }
            });
        } else {
            // Fallback para navegadores antiguos
            try {
                backgroundMusic.play();
                musicStarted = true;
            } catch (e) {
                console.log('Error en fallback de reproducción:', e);
            }
        }
    };
    
    // Intentar reproducir inmediatamente
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
    
    // Evento de click/touch en el regalo
    giftBox.addEventListener('click', openGift);
    giftBox.addEventListener('touchstart', openGift, { passive: true });
    
    function openGift(e) {
        if (giftOpened) return;
        
        e.preventDefault();
        giftOpened = true;
        
        // Agregar clase para animar la tapa
        giftLid.classList.add('opened');
        giftBox.classList.add('opened');
        
        // Iniciar música de fondo inmediatamente después de la interacción del usuario
        setTimeout(() => {
            startBackgroundMusic();
        }, 100);
        
        // Crear partículas de brillo
        createSparkles(giftBox);
        
        // Crear corazones al abrir
        createOpeningHearts(giftBox);
        
        // Después de la animación, mostrar el contenido
        setTimeout(() => {
            giftScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Iniciar corazones flotantes continuos
            startFloatingHearts();
            
            // Iniciar copos de nieve en el contenido
            startContentSnowflakes();
        }, 1500);
    }
}

// ============================================
// PARTÍCULAS DE BRILLO AL ABRIR EL REGALO
// ============================================

function createSparkles(container) {
    const sparkleCount = 30;
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const centerY = containerRect.top + containerRect.height / 2;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Ángulo aleatorio
        const angle = (Math.PI * 2 * i) / sparkleCount;
        const distance = 100 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        sparkle.style.left = centerX + 'px';
        sparkle.style.top = centerY + 'px';
        sparkle.style.setProperty('--tx', tx + 'px');
        sparkle.style.setProperty('--ty', ty + 'px');
        
        document.body.appendChild(sparkle);
        
        // Remover después de la animación
        setTimeout(() => {
            sparkle.remove();
        }, 1500);
    }
}

// ============================================
// CORAZONES AL ABRIR EL REGALO
// ============================================

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
            heart.style.animationDelay = (Math.random() * 0.5) + 's';
            
            document.body.appendChild(heart);
            
            setTimeout(() => {
                heart.remove();
            }, 4000);
        }, i * 50);
    }
}

// ============================================
// CORAZONES FLOTANTES CONTINUOS
// ============================================

function startFloatingHearts() {
    const heartsContainer = document.querySelector('.floating-hearts');
    
    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = ['💕', '❤️', '💖', '💗'][Math.floor(Math.random() * 4)];
        
        // Posición inicial aleatoria en la parte inferior
        heart.style.left = Math.random() * 100 + '%';
        heart.style.bottom = '-50px';
        heart.style.animationDuration = (10 + Math.random() * 10) + 's';
        heart.style.animationDelay = Math.random() * 2 + 's';
        
        heartsContainer.appendChild(heart);
        
        // Remover después de la animación
        setTimeout(() => {
            if (heart.parentNode) {
                heart.remove();
            }
        }, 25000);
    }
    
    // Crear un corazón cada 3-5 segundos
    heartsInterval = setInterval(() => {
        createHeart();
    }, 3000 + Math.random() * 2000);
    
    // Crear algunos corazones iniciales
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createHeart(), i * 1000);
    }
}

// ============================================
// COPOS DE NIEVE
// ============================================

function initializeSnowflakes() {
    const snowflakesContainer = document.querySelector('.snowflakes');
    createSnowflake(snowflakesContainer);
    
    // Crear copos continuamente
    snowflakesInterval = setInterval(() => {
        createSnowflake(snowflakesContainer);
    }, 500);
}

function startContentSnowflakes() {
    const snowflakesContainer = document.querySelector('.snowflakes-content');
    
    function createContentSnowflake() {
        createSnowflake(snowflakesContainer);
    }
    
    // Crear copos más espaciados en el contenido
    setInterval(() => {
        createContentSnowflake();
    }, 800);
    
    // Crear algunos iniciales
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createContentSnowflake(), i * 200);
    }
}

function createSnowflake(container) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
    
    // Posición inicial aleatoria en la parte superior
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.top = '-20px';
    snowflake.style.animationDuration = (8 + Math.random() * 7) + 's';
    snowflake.style.animationDelay = Math.random() * 2 + 's';
    snowflake.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
    
    container.appendChild(snowflake);
    
    // Remover después de la animación
    setTimeout(() => {
        if (snowflake.parentNode) {
            snowflake.remove();
        }
    }, 20000);
}

// ============================================
// ANIMACIONES AL HACER SCROLL
// ============================================

function initializeScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    // Función para verificar si una sección está visible
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Función para verificar si una sección está parcialmente visible
    function isElementPartiallyVisible(el) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top < windowHeight * 0.8 &&
            rect.bottom > windowHeight * 0.2
        );
    }
    
    // Función para animar secciones visibles
    function animateSections() {
        sections.forEach((section, index) => {
            if (isElementPartiallyVisible(section) && !section.classList.contains('visible')) {
                // Agregar delay escalonado para efecto cascada
                setTimeout(() => {
                    section.classList.add('visible');
                }, index * 100);
            }
        });
    }
    
    // Verificar al cargar
    animateSections();
    
    // Verificar al hacer scroll (con throttling para mejor rendimiento)
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
    
    // Verificar periódicamente (por si acaso)
    setInterval(animateSections, 500);
}

// ============================================
// EFECTOS ADICIONALES
// ============================================

// Agregar efecto de brillo sutil a los textos destacados
document.addEventListener('DOMContentLoaded', function() {
    const highlightBlocks = document.querySelectorAll('.text-block.highlight');
    
    highlightBlocks.forEach(block => {
        block.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        block.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// Prevenir scroll durante la animación del regalo
document.addEventListener('DOMContentLoaded', function() {
    const giftScreen = document.getElementById('gift-screen');
    
    // Prevenir scroll en la pantalla del regalo
    giftScreen.addEventListener('touchmove', function(e) {
        if (!giftOpened) {
            e.preventDefault();
        }
    }, { passive: false });
    
    giftScreen.addEventListener('wheel', function(e) {
        if (!giftOpened) {
            e.preventDefault();
        }
    }, { passive: false });
});

// ============================================
// LIMPIEZA AL SALIR
// ============================================

window.addEventListener('beforeunload', function() {
    if (heartsInterval) {
        clearInterval(heartsInterval);
    }
    if (snowflakesInterval) {
        clearInterval(snowflakesInterval);
    }
});

// ============================================
// MEJORAS DE RENDIMIENTO
// ============================================

// Optimización: usar requestAnimationFrame para animaciones
function optimizedAnimation(callback) {
    let lastTime = 0;
    const fps = 60;
    const frameInterval = 1000 / fps;
    
    function animate(currentTime) {
        if (currentTime - lastTime >= frameInterval) {
            callback();
            lastTime = currentTime;
        }
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
}

// Detectar si el dispositivo es móvil
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Ajustar animaciones según el dispositivo
if (isMobileDevice()) {
    // Reducir número de partículas en móviles para mejor rendimiento
    document.addEventListener('DOMContentLoaded', function() {
        const style = document.createElement('style');
        style.textContent = `
            .heart {
                font-size: 1.2rem;
            }
            .snowflake {
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
    });
}

