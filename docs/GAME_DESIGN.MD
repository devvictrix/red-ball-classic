# Game Design Document: Red Ball Classic - Arcade Escalator

## 1. Introduction / Vision Statement

"Red Ball Classic" is an electrifying arcade game that reimagines the timeless brick-breaker formula with a core focus on **relentless, escalating challenge.** It lures players with its deceptively simple "paddle and ball" premise, then progressively intensifies the experience by increasing ball speed, fortifying bricks, and densifying layouts—all dynamically tied to the player's score.

The game is designed to be **easy to learn, yet incredibly difficult to master**, fostering an addictive "just one more try" loop. The thrill comes from the player's ability to adapt, react, and strategize against ever-increasing odds, turning simple mechanics into a high-stakes dance of precision and survival.

## 2. Core Gameplay Loop

The addictive cycle of "Red Ball Classic" is:

1.  **LAUNCH/CONTROL:** Player manages the paddle to intercept the ball.
2.  **IMPACT & BREAK:** Ball hits bricks, destroying them (or damaging multi-hit bricks).
3.  **SCORE & ESCALATE:** Points are awarded. With higher scores:
    *   The **ball gets faster**.
    *   **Bricks get harder** (requiring more hits).
    *   **Brick layouts become denser** in new waves.
    *   (Phase 2+) **Items may drop**, offering temporary boons or banes.
4.  **ADAPT OR LOSE:** Player must constantly elevate their reflexes and strategy to survive the mounting pressure.
5.  **GAME OVER / LEVEL CLEARED:** If the ball is missed, it's game over (unless lives are implemented). If all bricks are cleared, a new, more challenging wave begins.
6.  **RETRY & IMPROVE:** Driven by the escalating challenge and the desire to beat their high score, the player dives back in.

The difficulty increase itself is a core part of the rewarding loop for skilled players.

## 3. Game Mechanics (Detailed)

### 3.1. Paddle Mechanics

*   **Control:** Smooth, responsive horizontal movement via touch drag, implemented with `react-native-gesture-handler` (`usePaddle`).
*   **Rebound Dynamics:** The point of impact on the paddle significantly influences the ball's rebound angle (`useBall` -> `updateVelocityOnPaddleHit`). This allows for skillful angled shots.
*   **Visual Feedback:** Paddle briefly "pops" (scales) on ball impact (`triggerPaddleHitAnimation` in `usePaddle`).
*   **(Phase 2+) Power-Up Effects:**
    *   `Wide Paddle`: Temporarily increases `PADDLE_WIDTH`.
    *   `Shrink Paddle (Hazard)`: Temporarily decreases `PADDLE_WIDTH`.

### 3.2. Ball Mechanics

*   **Physics:** Consistent and predictable wall bounces. Game area boundaries defined by `useGameDimensions`.
*   **Primary Escalation: Speed (`useBall` & `gameConstants.ts`)**
    *   **Starting Speed:** Begins at `INITIAL_BALL_SPEED_X`, `INITIAL_BALL_SPEED_Y`.
    *   **Relentless Acceleration:** The ball's base speed (X and Y components) permanently increases by `SPEED_INCREMENT` every `SCORE_THRESHOLD_FOR_SPEED_INCREASE` points.
    *   **Speed Cap:** Maximum speed for each component is limited by `MAX_BALL_SPEED_COMPONENT`.
    *   **Player Impact:** This is the core driver of escalating tension. Players feel the game quicken, demanding faster reactions and more precise paddle placement. Visual cues (e.g., more pronounced trail at higher speeds) will amplify this.
*   **Secondary Escalation (Phase 3 - Very High Score): Subtle Erratic Bounces**
    *   At extreme scores, a very low, fixed probability for the ball to rebound off a brick at a *slightly* (+/- a few degrees) unexpected angle.
    *   **Player Impact:** Designed to challenge elite players by subtly disrupting ingrained muscle memory, ensuring no run feels perfectly "solved."
*   **(Phase 2+) Power-Up/Hazard Effects:**
    *   `Slow Ball`: Briefly reduces the ball's current speed.
    *   `Piercing Ball`: Ball passes through multiple bricks for a short duration.
    *   `Multi-Ball (Simple)`: Spawns ONE additional ball, operating at current game speed.
    *   `Speed Burst (Hazard)`: Brief, uncontrollable *additional* speed surge for the ball(s).
    *   `Heavy Ball (Paddle Effect - Hazard)`: Ball rebounds with less horizontal influence from paddle hits, making angled shots harder.

### 3.3. Brick Mechanics (`useBricks`)

*   **Destruction:** Bricks are the primary targets. Destroying them awards `BRICK_SCORE_VALUE`.
*   **Primary Escalation: Hardness (Phase 2+)**
    *   **Evolution:** Bricks will evolve from standard 1-hit to requiring 2, 3, or even more hits to destroy.
    *   **Implementation:**
        *   The `Brick` interface will include `hitsRequired` and `currentHits`.
        *   `initializeBricks` will assign `hitsRequired` based on score-driven difficulty tiers. Example Tiers:
            *   Score 0-499: All bricks 1-hit.
            *   Score 500-999: 70% 1-hit, 30% 2-hit.
            *   Score 1000-1999: 40% 1-hit, 50% 2-hit, 10% 3-hit. (Values illustrative, needs tuning).
        *   `handleBrickHit` decrements `currentHits`. Brick `isActive` becomes `false` only when `currentHits` >= `hitsRequired`.
    *   **Visuals:** `BrickView` will show clear visual degradation (cracks, color changes) with each hit.
    *   **Player Impact:** Forces players to focus fire, strategize clearing paths, and manage a faster ball against increasingly resilient targets.
*   **Secondary Escalation: Density & Formations (Phase 2+)**
    *   **Waves:** After `allBricksCleared()` is true, `resetBricks` (via `initializeBricks`) repopulates the screen.
    *   **Escalation:** Each new wave, driven by score, will feature:
        *   **Increased Density:** More bricks filling the playfield. Potentially making `BRICK_ROW_COUNT` and `BRICK_COLUMN_COUNT` dynamic or using tighter `BRICK_PADDING`.
        *   **Challenging Formations:** Evolving from simple grids to layered structures, configurations protecting key bricks, or patterns requiring precise multi-ricochet shots.
    *   **Player Impact:** Reduces easy shots, makes the ball harder to control and recover, and demands more foresight and skillful shot placement.
*   **(Phase 2+) Item Bricks:**
    *   Rare, visually distinct bricks that guarantee an item drop when destroyed.

### 3.4. Item System (Phase 2+ - New System)

*   **Philosophy:** Items are simple, instantly understandable, and provide temporary but significant shifts in gameplay. Power-ups offer brief respite or a surge of power; hazards inject sudden chaos. Their appearance is a notable event, adding a layer of exciting unpredictability.
*   **Drop Mechanism:**
    *   Randomly from any destroyed brick (higher chance from harder bricks).
    *   Guaranteed from special "Item Bricks."
    *   Item appears as a falling collectible that the paddle must touch.
*   **Power-Ups (Temporary):**
    *   `Wide Paddle`: Increases `PADDLE_WIDTH`.
    *   `Slow Ball`: Briefly reduces current ball speed (affects `ballVelocity` in `useBall`).
    *   `Piercing Ball`: Ball ignores brick collisions for its duration, destroying all bricks it passes through.
    *   `Multi-Ball (Simple)`: Adds one extra ball. Game loop in `paddle-game.tsx` will need to manage an array of balls.
*   **Hazards (Temporary):**
    *   `Shrink Paddle`: Decreases `PADDLE_WIDTH`.
    *   `Speed Burst (Ball)`: Uncontrollable additional speed surge for all active balls.
    *   `Heavy Ball (Paddle Effect)`: Modifies how `updateVelocityOnPaddleHit` calculates `dx` from paddle impact.
*   **Visual/Audio:** Clear cues for item collection, activation, and duration.

### 3.5. Scoring & Progression

*   **Core Scoring:** Points awarded for hitting bricks (`BRICK_SCORE_VALUE`). Score also incremented by 1 for successful paddle hits.
*   **High Score:** Persisted locally using `AsyncStorage` (`useScore`).
*   **Progression Driver:** Score is the SOLE driver of difficulty escalation (ball speed, brick hardness/density, item drop rates if applicable). This creates a direct feedback loop: better play leads to higher scores, which leads to greater challenges.

## 4. Difficulty Scaling & Progression (The "Arcade Escalator")

The game's soul lies in its **dynamic, score-driven difficulty curve.** This is not a pre-set level system but a continuous, relentless ramp designed to push players to their limits.

*   **Key Parameters Affected by Score:**
    1.  **Ball Speed:** Increases via `SPEED_INCREMENT` at `SCORE_THRESHOLD_FOR_SPEED_INCREASE` intervals (managed in `useBall`). This is the most immediate and noticeable escalation.
    2.  **Brick Hardness (Phase 2+):** The `hitsRequired` for new bricks and the proportion of multi-hit bricks in new waves increase at defined score milestones (logic to be added to `useBricks`).
    3.  **Brick Density/Formation Complexity (Phase 2+):** New waves of bricks become denser and arranged in more challenging patterns as score increases (logic to be added to `useBricks` `initializeBricks`).
    4.  **(Phase 2+) Item Drop Rates (Optional Tuning):** Positive power-ups might become slightly rarer, or hazards slightly more common, at very high scores to intensify pressure.

*   **Target Player Feeling:**
    *   **Early Game (Low Score):** Accessible, learning the feel.
    *   **Mid-Game (Moderate Score):** Engaging, requiring skill and focus as ball speed and brick resilience pick up.
    *   **Late-Game (High Score):** Intense and thrilling, demanding peak reflexes, precision, and strategic item use (if available) to survive the overwhelming (but fair) onslaught. Each lost ball should feel like a consequence of the escalating challenge, spurring "one more try."

## 5. Player Experience (PX) / Game Feel ("Juice")

To make the escalating challenge exciting rather than just frustrating, tactile and clear feedback is paramount.

*   **Ball Speed:**
    *   Visual: Ball trail becomes more pronounced or intense at higher speeds. Subtle screen effects (minor vignette, faint motion lines) could hint at extreme speeds.
    *   Audio: (If sound enabled) Pitch/intensity of ball bounce sound subtly correlates with speed.
*   **Brick Interaction:**
    *   Visual: Multi-hit bricks show clear stages of damage. Destruction of hard bricks or multiple bricks at once (e.g., via Piercing Ball) triggers more impactful particle effects and possibly a slight, satisfying screen shake.
    *   Audio: (If sound enabled) Distinct hit sounds for 1-hit vs. multi-hit bricks. Crunchy, satisfying destruction sounds.
*   **Paddle Interaction:**
    *   Visual: Clear "pop" animation on ball contact. Visual changes when power-ups like "Wide Paddle" are active.
    *   Haptics: `useGameSettings` provides feedback for paddle hits, wall hits, brick breaks, game over.
*   **Item Interaction (Phase 2+):**
    *   Visual: Items are distinct and noticeable. Clear activation effect. Timer/visual cue for duration.
    *   Audio: (If sound enabled) Unique collect, activate, and deactivate sounds for items.
*   **Overall Pacing:** The game should feel like it's constantly pushing the player, with brief moments of respite offered by power-ups or wave clears, before ramping up again.

## 6. Game States & UI Flow

*   **Initial State:** "Tap to Start" overlay (`GameOverlay`) with settings (Haptics, Sound). Game is inactive.
*   **Game Active:** Overlay disappears. Ball is in play. Game loop in `paddle-game.tsx` is running.
*   **Level Cleared:** `allBricksCleared()` is true. `GameOverlay` shows "Level Cleared!", score. Options to start next wave/level. Game loop paused. Ball/paddle reset. New, harder bricks spawn on start.
*   **Game Over:** Ball missed. `GameOverlay` shows "Game Over," final score, high score. Option to "Play Again?". Haptics/sound trigger. High score saved if beaten. Game loop stopped.
*   **Pause (App Background):** If app goes to background, `isGameActive` set to false, pausing game loop.

## 7. Monetization (If Applicable)

*   Currently N/A. Focus is on pure arcade experience.
*   If ads were considered: Non-intrusive (e.g., optional rewarded ad for a continue once per game, or banner on game over screen). Core gameplay must remain uninterrupted.

## 8. Target Audience

*   Players who enjoy classic arcade games (e.g., Arkanoid, Breakout).
*   Players looking for a quick, engaging session with a high skill ceiling.
*   Mobile gamers appreciating simple controls and challenging, score-attack gameplay.
*   Ages: Likely 8+ due to escalating difficulty and required reflexes.