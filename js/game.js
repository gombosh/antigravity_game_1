/**
 * Nature Guardians (שומרי הטבע) - Main Game Brain
 * Controls all screen state transitions, score accumulation, drag-and-drop swiping, 
 * snapping mechanics, touch interactions, active grid spawning, and certificate generation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // Game State Configurations
    // -------------------------------------------------------------------------
    const state = {
        playerName: 'שומר טבע צעיר',
        score: 0,
        currentScreen: 'screen-start',
        briefingIndex: 0,
        mute: false,
        
        // Stage 1 (True/False)
        g1Cards: [],
        g1CurrentIndex: 0,
        g1Timer: null,
        g1TimeRemaining: 15,
        
        // Stage 2 (Cause & Effect)
        g2Matches: {}, // causeId: effectId
        g2Completed: false,
        
        // Stage 3 (Action Grid)
        g3Timer: null,
        g3TimeRemaining: 30,
        g3Health: 100,
        g3SavedCount: 0,
        g3SpawnTimer: null,
        g3AnimalTimer: null,
        g3ActiveSprites: [],
        
        // Final Quiz
        quizIndex: 0
    };

    // -------------------------------------------------------------------------
    // Content Data (from PDF)
    // -------------------------------------------------------------------------
    const briefingSlides = [
        {
            tag: 'ההיסטוריה שלנו 📜',
            title: 'פעם בארץ ישראל...',
            text: 'פעם היה אפשר לראות בארץ ישראל <span class="highlight-keyword">דובים</span>, <span class="highlight-keyword">ברדלסים</span> ואפילו <span class="highlight-keyword">תנינים</span>! לצערנו, עם השנים החיות הללו <span class="highlight-keyword">נכחדו</span> (נעלמו לגמרי) מן הארץ בגלל פעילות בני האדם.',
            emoji: '🐻'
        },
        {
            tag: 'אזהרה חמורה ⚠️',
            title: 'המספרים יורדים!',
            text: 'בשנים האחרונות מספר חיות הבר בארץ יורד <span class="highlight-keyword">בקצב מדאיג</span> (במהירות גדולה ומפחידה). אם לא נשים לב ונתחיל לשמור עליהן, יכחדו עוד חיות בר רבות מהטבע שלנו!',
            emoji: '🐆'
        },
        {
            tag: 'בנייה ועיור 🏗️',
            title: 'השטח הפתוח נעלם',
            text: 'מספר התושבים בישראל הולך וגדל. יש צורך בבנייה של בתים, כבישים ומפעלים. כתוצאה מכך יש <span class="highlight-keyword">פחות שטחים פתוחים</span>, וקשה יותר לבעלי החיים למצוא מקום בטוח לחיות בו.',
            emoji: '🏠'
        },
        {
            tag: 'זיהום וציד 🌊',
            title: 'פוגעים בסביבה',
            text: 'בני האדם גורמים ל<span class="highlight-keyword">זיהום המים והאוויר</span>, ובעלי החיים סובלים מכך מאוד. בנוסף, ישנם <span class="highlight-keyword">ציידים</span> שצדים חיות בר באופן לא חוקי ופוגעים במשפחות שלהן.',
            emoji: '🏹'
        },
        {
            tag: 'סכנת הדברה 🧪',
            title: 'רעל בשדות',
            text: 'חקלאים מפזרים בשדות <span class="highlight-keyword">חומרי הדברה (רעל)</span> נגד מזיקים. בעלי חיים אחרים שאוכלים את המזיקים המורעלים הללו סופגים את הרעל בגופם ומתים מהרעלות קשות.',
            emoji: '☠️'
        },
        {
            tag: 'תאונות דרכים 🚗',
            title: 'זהירות בכביש!',
            text: 'בניית כבישים מהירים בתוך שטחי המחיה של בעלי החיים גורמת לכך ש<span class="highlight-keyword">חיות בר רבות נדרסות</span> על ידי מכוניות חולפות כשהן מנסות לחצות את הכביש.',
            emoji: '🦌'
        }
    ];

    const trueFalseDeck = [
        { text: 'בעבר היה אפשר לראות בארץ דובים, ברדלסים ותנינים.', isTrue: true },
        { text: 'מספר חיות הבר בישראל עולה בקצב מהיר בשנים האחרונות.', isTrue: false },
        { text: 'צמצום השטחים הפתוחים בגלל כבישים ובתים מקשה על בעלי החיים.', isTrue: true },
        { text: 'רוב האנשים מתכוונים להזיק לבעלי החיים ומרוצים מכך.', isTrue: false },
        { text: 'זיהום המים והאוויר פוגע בבעלי החיים וגורם להם לסבל.', isTrue: true },
        { text: 'חיות הבר רבות מתות בגלל הרעלות נגד מזיקים בשדות.', isTrue: true },
        { text: 'בעלי חיים רבים נדרסים בגלל נהיגה מהירה וחוסר זהירות בכביש.', isTrue: true },
        { text: 'חיות הבר מתות רק בגלל שהן מזדקנות.', isTrue: false }
    ];

    const causePairs = [
        { id: 'c1', text: 'בני האדם גורמים לזיהום מים ואוויר', matchId: 'e1' },
        { id: 'c2', text: 'החקלאים מפזרים חומרי הדברה בשדות', matchId: 'e2' },
        { id: 'c3', text: 'מספר התושבים הולך וגדל במהירות', matchId: 'e3' }
    ];

    const effectPairs = [
        { id: 'e1', text: 'ובעלי החיים סובלים מכך מאוד בסביבתם' },
        { id: 'e2', text: 'ובעלי חיים רבים מתים בשדות מהרעלות קשות' },
        { id: 'e3', text: 'ויש הרבה פחות שטחים פתוחים לחיות' }
    ];

    const quizQuestions = [
        {
            q: 'מה פירוש המילה "יכחדו"?',
            opts: ['ייוולדו מחדש', 'ייעלמו מן הארץ וייעלמו כליל', 'יישארו באותו מספר', 'יעברו למדינה אחרת'],
            correct: 1
        },
        {
            q: 'מה פירוש הצירוף "בקצב מדאיג"?',
            opts: ['במהירות גדולה ומפחידה', 'לאט מאוד ובשלווה', 'באופן שווה ורגיל', 'ללא שינוי בכלל'],
            correct: 0
        },
        {
            q: 'מהי המטרה העיקרית של הטקסט שקראנו?',
            opts: ['לספר סיפור דמיוני על חיות', 'לתת הוראות איך לאלף חיות בר', 'למסור מידע על מה שפוגע בחיות הבר', 'לשכנע אותנו לגדל חיות בתוך הבית'],
            correct: 2
        },
        {
            q: 'איזה סוג טקסט הוא "מי יציל את חיות הבר"?',
            opts: ['טקסט סיפורי', 'טקסט מידעי', 'שיר בחרוזים ומנגינה', 'מתכון להכנת מאכלים'],
            correct: 1
        }
    ];

    // -------------------------------------------------------------------------
    // DOM Selectors
    // -------------------------------------------------------------------------
    const dom = {
        viewport: document.getElementById('game-viewport'),
        screens: document.querySelectorAll('.screen'),
        
        // HUD Overlay
        muteBtn: document.getElementById('toggle-mute'),
        soundOnIcon: document.getElementById('sound-on-icon'),
        soundOffIcon: document.getElementById('sound-off-icon'),
        hudStats: document.getElementById('hud-stats'),
        hudScore: document.getElementById('hud-score'),
        hudLevelName: document.getElementById('hud-level-name'),
        
        // Screen 1: Start
        startBtn: document.getElementById('start-play-btn'),
        nameField: document.getElementById('player-name-field'),
        
        // Screen 2: Briefing
        slideCard: document.getElementById('briefing-slide'),
        briefingPrev: document.getElementById('briefing-prev'),
        briefingNext: document.getElementById('briefing-next'),
        briefingDots: document.getElementById('briefing-dots'),
        
        // Screen 3: Game 1 (Swiper)
        g1CardContainer: document.getElementById('g1-card-container'),
        g1ProgressBar: document.getElementById('g1-progress-bar'),
        g1ProgressText: document.getElementById('g1-progress-text'),
        g1TimerVal: document.getElementById('g1-timer-val'),
        binTrue: document.getElementById('bin-true'),
        binFalse: document.getElementById('bin-false'),
        
        // Screen 4: Game 2 (Puzzle)
        causesContainer: document.getElementById('puzzle-causes-container'),
        effectsContainer: document.getElementById('puzzle-effects-container'),
        game2SubmitBtn: document.getElementById('game2-submit-btn'),
        
        // Screen 5: Game 3 (Ecosystem Action)
        g3HealthFill: document.getElementById('g3-health-fill'),
        g3HealthVal: document.getElementById('g3-health-val'),
        g3SavedVal: document.getElementById('g3-saved-val'),
        g3TimerVal: document.getElementById('g3-timer-val'),
        g3Battleground: document.getElementById('g3-battleground'),
        
        // Screen 6: Quiz
        quizProgressFill: document.getElementById('quiz-progress-fill'),
        quizProgressText: document.getElementById('quiz-progress-text'),
        quizQuestionText: document.getElementById('quiz-question-text'),
        quizOptionsList: document.getElementById('quiz-options-list'),
        
        // Screen 7: Victory
        certPlayerName: document.getElementById('cert-player-name'),
        btnPrintCert: document.getElementById('btn-print-cert'),
        btnRestartGame: document.getElementById('btn-restart-game')
    };

    // Initialize particle overlay canvas
    window.Particles.init('particle-canvas');

    // Unlock audio context on initial pointer tap
    dom.viewport.addEventListener('pointerdown', () => {
        window.GameAudio.init();
    }, { once: true });

    // -------------------------------------------------------------------------
    // HUD & Navigation Handlers
    // -------------------------------------------------------------------------
    function changeScreen(screenId) {
        window.GameAudio.playClick();
        
        // Clear active screen class
        dom.screens.forEach(scr => scr.classList.remove('active'));
        
        // Make new screen active
        const newScreen = document.getElementById(screenId);
        if (newScreen) {
            newScreen.classList.add('active');
            state.currentScreen = screenId;
        }

        // Show/hide statistics hud depending on screen
        if (screenId === 'screen-start' || screenId === 'screen-victory' || screenId === 'screen-briefing') {
            dom.hudStats.classList.add('hidden');
        } else {
            dom.hudStats.classList.remove('hidden');
            updateHUDStats();
        }

        // Clean stage actions if leaving them
        if (screenId !== 'screen-game1') clearInterval(state.g1Timer);
        if (screenId !== 'screen-game3') {
            clearInterval(state.g3Timer);
            clearInterval(state.g3SpawnTimer);
            clearInterval(state.g3AnimalTimer);
            clearG3Battleground();
        }

        // Run screen init triggers
        if (screenId === 'screen-briefing') initBriefing();
        if (screenId === 'screen-game1') initGame1();
        if (screenId === 'screen-game2') initGame2();
        if (screenId === 'screen-game3') initGame3();
        if (screenId === 'screen-quiz') initQuiz();
        if (screenId === 'screen-victory') initVictory();
    }

    function updateScore(amount) {
        state.score = Math.max(0, state.score + amount);
        dom.hudScore.textContent = state.score;
        
        // Create sparkle points floating bubbles
        if (amount > 0) {
            const rect = dom.hudScore.getBoundingClientRect();
            const viewportRect = dom.viewport.getBoundingClientRect();
            window.Particles.spawn(
                rect.left - viewportRect.left + rect.width / 2, 
                rect.top - viewportRect.top + rect.height / 2, 
                6, 
                'stars'
            );
        }
    }

    function updateHUDStats() {
        let levelName = '1/4';
        if (state.currentScreen === 'screen-game2') levelName = '2/4';
        if (state.currentScreen === 'screen-game3') levelName = '3/4';
        if (state.currentScreen === 'screen-quiz') levelName = '4/4';
        
        dom.hudLevelName.textContent = levelName;
        dom.hudScore.textContent = state.score;
    }

    // Sound toggle mute
    dom.muteBtn.addEventListener('click', () => {
        const isMuted = window.GameAudio.toggleMute();
        state.mute = isMuted;
        if (isMuted) {
            dom.soundOnIcon.classList.add('hidden');
            dom.soundOffIcon.classList.remove('hidden');
        } else {
            dom.soundOnIcon.classList.remove('hidden');
            dom.soundOffIcon.classList.add('hidden');
        }
    });

    // -------------------------------------------------------------------------
    // Screen 1: Start Game Trigger
    // -------------------------------------------------------------------------
    dom.startBtn.addEventListener('click', () => {
        const nameVal = dom.nameField.value.trim();
        if (nameVal.length > 0) {
            state.playerName = nameVal;
        } else {
            state.playerName = 'שומר טבע צעיר';
        }
        changeScreen('screen-briefing');
    });

    // -------------------------------------------------------------------------
    // Screen 2: Illustrated Briefing (Slideshow)
    // -------------------------------------------------------------------------
    function initBriefing() {
        state.briefingIndex = 0;
        renderSlide();
        renderDots();
    }

    function renderSlide() {
        const slide = briefingSlides[state.briefingIndex];
        
        // Remove active-slide to force fade transitions
        dom.slideCard.classList.remove('active-slide');
        
        setTimeout(() => {
            dom.slideCard.innerHTML = `
                <div class="slide-graphic-box animate-bounce-slow">${slide.emoji}</div>
                <div class="slide-content-box">
                    <span class="slide-tag">${slide.tag}</span>
                    <h3 class="slide-title">${slide.title}</h3>
                    <p class="slide-text">${slide.text}</p>
                </div>
            `;
            dom.slideCard.classList.add('active-slide');
        }, 150);

        // Manage navigation disable buttons
        dom.briefingPrev.disabled = state.briefingIndex === 0;
        
        // Update DOT active states
        const dots = dom.briefingDots.querySelectorAll('.slide-dot');
        dots.forEach((dot, idx) => {
            if (idx === state.briefingIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function renderDots() {
        dom.briefingDots.innerHTML = '';
        briefingSlides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `slide-dot ${idx === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                window.GameAudio.playClick();
                state.briefingIndex = idx;
                renderSlide();
            });
            dom.briefingDots.appendChild(dot);
        });
    }

    dom.briefingPrev.addEventListener('click', () => {
        if (state.briefingIndex > 0) {
            state.briefingIndex--;
            renderSlide();
        }
    });

    dom.briefingNext.addEventListener('click', () => {
        if (state.briefingIndex < briefingSlides.length - 1) {
            state.briefingIndex++;
            renderSlide();
        } else {
            // End of Slideshow -> Go to Game Stage 1
            changeScreen('screen-game1');
        }
    });

    // -------------------------------------------------------------------------
    // Screen 3: Game Stage 1 (True / False sorting drag-swiper)
    // -------------------------------------------------------------------------
    function initGame1() {
        // Shuffle trueFalseDeck and select 5 cards
        state.g1Cards = trueFalseDeck.sort(() => 0.5 - Math.random()).slice(0, 5);
        state.g1CurrentIndex = 0;
        spawnGame1Card();
    }

    function spawnGame1Card() {
        if (state.g1CurrentIndex >= state.g1Cards.length) {
            // Level completed!
            window.GameAudio.playLevelUp();
            window.Particles.shower();
            setTimeout(() => {
                changeScreen('screen-game2');
            }, 1200);
            return;
        }

        // Update progress bar
        const progressPercentage = (state.g1CurrentIndex / state.g1Cards.length) * 100;
        dom.g1ProgressBar.style.width = `${progressPercentage}%`;
        dom.g1ProgressText.textContent = `קלף ${state.g1CurrentIndex + 1} מתוך ${state.g1Cards.length}`;

        // Create card element
        dom.g1CardContainer.innerHTML = '';
        const cardData = state.g1Cards[state.g1CurrentIndex];
        
        const card = document.createElement('div');
        card.className = 'swipe-card';
        card.id = 'active-swipe-card';
        card.innerHTML = `<span class="card-text">${cardData.text}</span>`;
        
        dom.g1CardContainer.appendChild(card);
        
        // Start card specific timer countdown
        state.g1TimeRemaining = 15;
        dom.g1TimerVal.textContent = state.g1TimeRemaining;
        
        clearInterval(state.g1Timer);
        state.g1Timer = setInterval(() => {
            state.g1TimeRemaining--;
            dom.g1TimerVal.textContent = state.g1TimeRemaining;
            if (state.g1TimeRemaining <= 0) {
                // Time's up! Treats as wrong answer
                handleGame1Answer(null);
            }
        }, 1000);

        setupDragAndSwipe(card);
    }

    // Drag-swiper logic
    function setupDragAndSwipe(card) {
        let activePointer = false;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;

        // Pointer down
        card.addEventListener('pointerdown', (e) => {
            activePointer = true;
            startX = e.clientX;
            startY = e.clientY;
            card.classList.add('dragging');
            card.setPointerCapture(e.pointerId);
        });

        // Pointer move
        card.addEventListener('pointermove', (e) => {
            if (!activePointer) return;
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;

            // Apply rotation and transform based on offsets
            const rotate = currentX * 0.08;
            card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;

            // Highlight bins depending on swipe directions (drag over effect)
            if (currentX > 60) {
                // Swipe Left -> "נכון" in RTL (positive clientX is rightward, which goes towards correct/green in RTL)
                dom.binTrue.classList.add('drag-over');
                dom.binFalse.classList.remove('drag-over');
            } else if (currentX < -60) {
                // Swipe Right -> "לא נכון" (negative clientX is leftward, towards false/red bin)
                dom.binFalse.classList.add('drag-over');
                dom.binTrue.classList.remove('drag-over');
            } else {
                dom.binTrue.classList.remove('drag-over');
                dom.binFalse.classList.remove('drag-over');
            }
        });

        // Pointer up/release
        card.addEventListener('pointerup', (e) => {
            if (!activePointer) return;
            activePointer = false;
            card.classList.remove('dragging');
            card.releasePointerCapture(e.pointerId);

            dom.binTrue.classList.remove('drag-over');
            dom.binFalse.classList.remove('drag-over');

            const threshold = 120;
            if (currentX > threshold) {
                // Swiped to "True" basket (Green/Right in RTL layout)
                handleGame1Answer(true);
            } else if (currentX < -threshold) {
                // Swiped to "False" basket (Red/Left)
                handleGame1Answer(false);
            } else {
                // Reset card position smoothly
                card.style.transform = 'translate(0, 0) rotate(0)';
            }
            
            startX = startY = currentX = currentY = 0;
        });

        // Click directly on bins as alternatives
        dom.binTrue.onclick = () => handleGame1Answer(true);
        dom.binFalse.onclick = () => handleGame1Answer(false);
    }

    function handleGame1Answer(userAnswer) {
        clearInterval(state.g1Timer);
        
        // Remove bin triggers to prevent double tap
        dom.binTrue.onclick = null;
        dom.binFalse.onclick = null;

        const cardData = state.g1Cards[state.g1CurrentIndex];
        const isCorrect = (userAnswer === cardData.isTrue);

        const card = document.getElementById('active-swipe-card');
        const binTarget = userAnswer === true ? dom.binTrue : dom.binFalse;

        if (isCorrect) {
            window.GameAudio.playCorrect();
            updateScore(20);
            
            if (binTarget) {
                binTarget.classList.add('bin-pop');
                setTimeout(() => binTarget.classList.remove('bin-pop'), 400);
            }

            // Explode sparkles around card center
            if (card) {
                const rect = card.getBoundingClientRect();
                const vRect = dom.viewport.getBoundingClientRect();
                window.Particles.spawn(
                    rect.left - vRect.left + rect.width / 2, 
                    rect.top - vRect.top + rect.height / 2, 
                    12, 
                    'stars'
                );
            }
        } else {
            window.GameAudio.playWrong();
            updateScore(-5);
        }

        // Animate card flying away
        if (card) {
            const flyDirectionX = userAnswer === null ? 0 : (userAnswer ? 600 : -600);
            card.style.transition = 'transform 0.4s ease-out, opacity 0.4s';
            card.style.transform = `translate(${flyDirectionX}px, 150px) rotate(${flyDirectionX * 0.1}deg)`;
            card.style.opacity = '0';
        }

        // Proceed to next card after delay
        setTimeout(() => {
            state.g1CurrentIndex++;
            spawnGame1Card();
        }, 400);
    }

    // -------------------------------------------------------------------------
    // Screen 4: Game Stage 2 (Cause & Effect Matcher)
    // -------------------------------------------------------------------------
    function initGame2() {
        state.g2Matches = {};
        state.g2Completed = false;
        
        dom.game2SubmitBtn.classList.add('disabled');
        dom.game2SubmitBtn.disabled = true;

        // Render shuffled columns
        const shuffledCauses = causePairs.sort(() => 0.5 - Math.random());
        const shuffledEffects = effectPairs.sort(() => 0.5 - Math.random());

        dom.causesContainer.innerHTML = '';
        dom.effectsContainer.innerHTML = '';

        // Spawn draggable Causes (Yellow)
        shuffledCauses.forEach(cause => {
            const el = document.createElement('div');
            el.className = 'puzzle-card puzzle-draggable';
            el.id = cause.id;
            el.innerHTML = `
                <span class="puzzle-card-text">${cause.text}</span>
                <span class="puzzle-card-icon">🧩</span>
            `;
            
            // Pointer dragging (supports both mouse and touch perfectly!)
            setupG2PointerDraggable(el);

            dom.causesContainer.appendChild(el);
        });

        // Spawn target Sockets Effects (Green)
        shuffledEffects.forEach(effect => {
            const el = document.createElement('div');
            el.className = 'puzzle-card puzzle-target';
            el.id = effect.id;
            el.dataset.effectId = effect.id;
            el.innerHTML = `
                <span class="puzzle-card-text">${effect.text}</span>
                <span class="puzzle-card-icon">🔒</span>
            `;

            dom.effectsContainer.appendChild(el);
        });
    }

    // Pointer-based dragging engine for Game 2 (replaces HTML5 drag completely)
    function setupG2PointerDraggable(el) {
        let dragging = false;
        let startX = 0;
        let startY = 0;

        el.style.touchAction = 'none'; // Prevent scroll interference

        el.addEventListener('pointerdown', (e) => {
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            el.classList.add('dragging');
            el.style.zIndex = '1000';
            el.setPointerCapture(e.pointerId);
            window.GameAudio.playClick();
        });

        el.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            el.style.transform = `translate(${dx}px, ${dy}px)`;

            // Hit test targets under cursor
            const targetEl = document.elementFromPoint(e.clientX, e.clientY);
            const dropTarget = targetEl ? targetEl.closest('.puzzle-target') : null;

            // Clear hovers on all targets
            const allTargets = dom.effectsContainer.querySelectorAll('.puzzle-target');
            allTargets.forEach(t => t.classList.remove('drag-hover'));

            if (dropTarget && !dropTarget.classList.contains('matched')) {
                dropTarget.classList.add('drag-hover');
            }
        });

        el.addEventListener('pointerup', (e) => {
            if (!dragging) return;
            dragging = false;
            el.classList.remove('dragging');
            el.style.zIndex = '';
            el.releasePointerCapture(e.pointerId);

            // Clear hovers on all targets
            const allTargets = dom.effectsContainer.querySelectorAll('.puzzle-target');
            allTargets.forEach(t => t.classList.remove('drag-hover'));

            const targetEl = document.elementFromPoint(e.clientX, e.clientY);
            const dropTarget = targetEl ? targetEl.closest('.puzzle-target') : null;

            if (dropTarget && !dropTarget.classList.contains('matched')) {
                verifyMatchG2(el.id, dropTarget.id);
            } else {
                // Bounce back
                el.style.transform = '';
            }
        });
    }

    // Snap Match logic
    function verifyMatchG2(causeId, effectId) {
        const pair = causePairs.find(p => p.id === causeId);
        const effectEl = document.getElementById(effectId);
        const causeEl = document.getElementById(causeId);

        if (pair && pair.matchId === effectId) {
            // Correct Match! Snap and lock it
            window.GameAudio.playCorrect();
            
            // Style locked effects
            effectEl.classList.add('matched');
            effectEl.classList.remove('drag-hover');
            
            const effectText = effectPairs.find(e => e.id === effectId).text;
            effectEl.innerHTML = `
                <span class="puzzle-card-text"><strong>${pair.text}</strong> ← ${effectText}</span>
                <span class="puzzle-card-icon">❇️</span>
            `;

            // Remove cause element
            causeEl.style.transform = 'scale(0)';
            setTimeout(() => causeEl.remove(), 250);

            // Record state match
            state.g2Matches[causeId] = effectId;
            updateScore(15);

            // Sparkle particles at drop point
            const rect = effectEl.getBoundingClientRect();
            const vRect = dom.viewport.getBoundingClientRect();
            window.Particles.spawn(
                rect.left - vRect.left + rect.width / 2, 
                rect.top - vRect.top + rect.height / 2, 
                10, 
                'stars'
            );

            // Check completion
            if (Object.keys(state.g2Matches).length === causePairs.length) {
                state.g2Completed = true;
                dom.game2SubmitBtn.classList.remove('disabled');
                dom.game2SubmitBtn.disabled = false;
                dom.game2SubmitBtn.classList.add('pulse-glow');
            }
        } else {
            // Dissonant match
            window.GameAudio.playWrong();
            updateScore(-3);
            
            // Gentle shake effect and snap back
            causeEl.classList.add('wrong-shake');
            setTimeout(() => {
                causeEl.classList.remove('wrong-shake');
                causeEl.style.transform = '';
            }, 400);
        }
    }

    dom.game2SubmitBtn.addEventListener('click', () => {
        if (state.g2Completed) {
            window.GameAudio.playLevelUp();
            window.Particles.shower();
            setTimeout(() => {
                changeScreen('screen-game3');
            }, 1200);
        }
    });

    // -------------------------------------------------------------------------
    // Screen 5: Game Stage 3 (Ecosystem Cleanup Mission)
    // -------------------------------------------------------------------------
    function initGame3() {
        state.g3TimeRemaining = 40;
        state.g3Health = 100;
        state.g3HazardsLeft = 10;
        state.g3ActiveSprites = [];

        // Dynamically update game labels for cleanup theme
        document.querySelector('#screen-game3 .subtitle').textContent = 
            'משימת ניקוי: לחצו על כל המפגעים (רעל, מלכודות, זבל ומכוניות) כדי להסיר אותם! היזהרו שלא ללחוץ על חיות הבר או על דברים המועילים לטבע (עצים, פרחים ומים) כדי לא לפגוע בבריאות היער!';
        document.querySelector('.stat-bubble span').textContent = 'מפגעים שנותרו:';

        dom.g3TimerVal.textContent = state.g3TimeRemaining;
        dom.g3HealthFill.style.width = '100%';
        dom.g3HealthVal.textContent = '100%';
        dom.g3SavedVal.textContent = state.g3HazardsLeft;

        clearG3Battleground();

        // Spacing coordinator to prevent overlap
        const placedPositions = [];
        const battleground = dom.g3Battleground;
        const rect = battleground.getBoundingClientRect();

        function getSafeRandomPosition() {
            let attempts = 0;
            const minDistance = 75; // Pre-calculate safe spacing limits
            const widthLimit = rect.width > 0 ? rect.width : 900;
            const heightLimit = rect.height > 0 ? rect.height : 350;

            while (attempts < 80) {
                const x = 50 + Math.random() * (widthLimit - 120);
                const y = 40 + Math.random() * (heightLimit - 100);

                let isSafe = true;
                for (let pos of placedPositions) {
                    const dist = Math.hypot(x - pos.x, y - pos.y);
                    if (dist < minDistance) {
                        isSafe = false;
                        break;
                    }
                }

                if (isSafe) {
                    placedPositions.push({ x, y });
                    return { x, y };
                }
                attempts++;
            }
            // Fallback coordinate
            return {
                x: 50 + Math.random() * 600,
                y: 40 + Math.random() * 250
            };
        }

        // 1. Spawning 10 Hazards (מפגעים)
        const hazardsList = [
            { icon: '🧪', typeClass: 'threat-poison', damage: -10 },
            { icon: '🕸️', typeClass: 'threat-trap', damage: -12 },
            { icon: '🗑️', typeClass: 'threat-trash', damage: -8 },
            { icon: '🚗', typeClass: 'threat-car', damage: -15 }
        ];

        for (let i = 0; i < state.g3HazardsLeft; i++) {
            const pos = getSafeRandomPosition();
            const hazardData = hazardsList[i % hazardsList.length];
            
            const el = document.createElement('div');
            el.className = `game-sprite sprite-threat ${hazardData.typeClass}`;
            el.style.left = `${pos.x}px`;
            el.style.top = `${pos.y}px`;
            el.innerHTML = hazardData.icon;

            let cleared = false;
            el.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                if (cleared) return;
                cleared = true;

                window.GameAudio.playClean();
                updateScore(15);
                window.Particles.spawn(pos.x + 30, pos.y + 30, 8, 'bubbles');
                el.style.transform = 'scale(0)';
                setTimeout(() => el.remove(), 200);

                state.g3HazardsLeft--;
                dom.g3SavedVal.textContent = state.g3HazardsLeft;

                if (state.g3HazardsLeft === 0) {
                    endG3(true);
                }
            });

            battleground.appendChild(el);
        }

        // 2. Spawning 8 Good items (דברים טובים וחיות)
        const goodIcons = ['🐆', '🦌', '🐊', '🐻', '🌳', '🌸', '💧'];
        const totalGoodItems = 8;

        for (let i = 0; i < totalGoodItems; i++) {
            const pos = getSafeRandomPosition();
            const icon = goodIcons[i % goodIcons.length];

            const el = document.createElement('div');
            el.className = 'game-sprite sprite-good';
            el.style.left = `${pos.x}px`;
            el.style.top = `${pos.y}px`;
            el.innerHTML = icon;

            el.addEventListener('pointerdown', (e) => {
                e.stopPropagation();
                window.GameAudio.playWrong();
                updateScore(-5);
                changeG3Health(-15);

                // Strike penalty shake effect
                el.classList.add('wrong-shake');
                setTimeout(() => el.classList.remove('wrong-shake'), 400);
            });

            battleground.appendChild(el);
        }

        // 3. Start Level Countdown Timer
        clearInterval(state.g3Timer);
        state.g3Timer = setInterval(() => {
            state.g3TimeRemaining--;
            dom.g3TimerVal.textContent = state.g3TimeRemaining;

            if (state.g3TimeRemaining <= 0) {
                // Out of time
                endG3(false);
            }
        }, 1000);
    }

    function clearG3Battleground() {
        const battleground = dom.g3Battleground;
        const sprites = battleground.querySelectorAll('.game-sprite');
        sprites.forEach(s => s.remove());
    }

    function changeG3Health(amount) {
        state.g3Health = Math.min(100, Math.max(0, state.g3Health + amount));
        dom.g3HealthFill.style.width = `${state.g3Health}%`;
        dom.g3HealthVal.textContent = `${state.g3Health}%`;

        if (state.g3Health < 40) {
            dom.g3HealthFill.style.background = 'linear-gradient(90deg, #ef4444 0%, #f43f5e 100%)';
        } else {
            dom.g3HealthFill.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
        }

        if (state.g3Health <= 0) {
            endG3(false);
        }
    }

    function endG3(success) {
        clearInterval(state.g3Timer);
        clearG3Battleground();

        if (success) {
            window.GameAudio.playLevelUp();
            window.Particles.shower();
            setTimeout(() => {
                changeScreen('screen-quiz');
            }, 1200);
        } else {
            if (state.g3Health <= 0) {
                alert('אוי לא! בריאות הטבע ירדה לאפס בגלל פגיעה בחיות או בצמחים! בואו ננסה שוב לנקות את היער בזהירות!');
            } else {
                alert('הזמן נגמר! לא הספקתם להסיר את כל המפגעים בזמן. בואו ננסה שוב במהירות!');
            }
            initGame3();
        }
    }

    // -------------------------------------------------------------------------
    // Screen 6: Final Graduation Quiz
    // -------------------------------------------------------------------------
    function initQuiz() {
        state.quizIndex = 0;
        spawnQuizQuestion();
    }

    function spawnQuizQuestion() {
        if (state.quizIndex >= quizQuestions.length) {
            // Graduation complete! Go to victory screen
            window.GameAudio.playVictory();
            window.Particles.shower();
            setTimeout(() => {
                changeScreen('screen-victory');
            }, 1500);
            return;
        }

        // Update progress bar
        const progressVal = ((state.quizIndex + 1) / quizQuestions.length) * 100;
        dom.quizProgressFill.style.width = `${progressVal}%`;
        dom.quizProgressText.textContent = `שאלה ${state.quizIndex + 1} מתוך ${quizQuestions.length}`;

        const questionData = quizQuestions[state.quizIndex];
        
        // Render texts
        dom.quizQuestionText.textContent = questionData.q;
        dom.quizOptionsList.innerHTML = '';

        questionData.opts.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.textContent = opt;
            
            let answered = false;

            btn.addEventListener('click', () => {
                if (answered) return;
                
                // Block all buttons in grid from further clicks
                const allBtns = dom.quizOptionsList.querySelectorAll('.quiz-opt-btn');
                allBtns.forEach(b => b.disabled = true);
                
                answered = true;

                if (idx === questionData.correct) {
                    // Correct!
                    window.GameAudio.playCorrect();
                    btn.classList.add('correct-glow');
                    updateScore(25);
                    
                    // Star particles
                    const rect = btn.getBoundingClientRect();
                    const vRect = dom.viewport.getBoundingClientRect();
                    window.Particles.spawn(
                        rect.left - vRect.left + rect.width / 2,
                        rect.top - vRect.top + rect.height / 2,
                        10,
                        'stars'
                    );

                    setTimeout(() => {
                        state.quizIndex++;
                        spawnQuizQuestion();
                    }, 1200);
                } else {
                    // Incorrect Option
                    window.GameAudio.playWrong();
                    btn.classList.add('wrong-shake');
                    updateScore(-5);

                    // Show correct answer anyway after brief delay
                    setTimeout(() => {
                        allBtns[questionData.correct].classList.add('correct-glow');
                    }, 500);

                    setTimeout(() => {
                        state.quizIndex++;
                        spawnQuizQuestion();
                    }, 2000);
                }
            });

            dom.quizOptionsList.appendChild(btn);
        });
    }

    // -------------------------------------------------------------------------
    // Screen 7: Graduation & Victory Certificate Screen
    // -------------------------------------------------------------------------
    function initVictory() {
        // Render player name dynamically on on-screen SVG certificate
        dom.certPlayerName.textContent = state.playerName;
        
        // Continuous small confetti splash triggers
        let timer = 0;
        const certInterval = setInterval(() => {
            if (state.currentScreen !== 'screen-victory') {
                clearInterval(certInterval);
                return;
            }
            window.Particles.spawn(
                Math.random() * dom.viewport.clientWidth,
                dom.viewport.clientHeight * 0.1,
                5,
                'confetti'
            );
            timer++;
            if (timer > 25) clearInterval(certInterval);
        }, 300);
    }

    // Print certificate trigger
    dom.btnPrintCert.addEventListener('click', () => {
        window.print();
    });

    // Reset game completely
    dom.btnRestartGame.addEventListener('click', () => {
        state.score = 0;
        state.playerName = 'שומר טבע צעיר';
        dom.nameField.value = '';
        changeScreen('screen-start');
    });
});
