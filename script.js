class Cursor {
    constructor(color, offsetX = 0, offsetY = 0) {
        this.element = document.createElement('div');
        this.element.className = 'cursor';
        this.element.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.initialX = 0;
        this.initialY = 0;
        document.body.appendChild(this.element);
    }

    setInitialPosition(x, y) {
        this.initialX = x + this.offsetX;
        this.initialY = y + this.offsetY;
        this.update(x, y);
    }

    update(x, y) {
        // Calculate position with offset and containment
        const gameContainer = document.querySelector('.game-container');
        const rect = gameContainer.getBoundingClientRect();
        
        let newX = x + this.offsetX;
        let newY = y + this.offsetY;

        // Contain cursor within game container
        newX = Math.max(rect.left, Math.min(rect.right - 12, newX));
        newY = Math.max(rect.top, Math.min(rect.bottom - 20, newY));

        this.element.style.left = `${newX}px`;
        this.element.style.top = `${newY}px`;
    }

    remove() {
        this.element.remove();
    }
}

class Game {
    constructor() {
        this.cursors = [new Cursor()];
        this.buttons = [];
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
            '#E74C3C', '#2ECC71'
        ];
        this.activeCursors = new Set();
        this.totalButtons = 37;
        this.setupGame();
        this.setupEventListeners();
        this.updateScoreboard();
        this.ensureCursorHidden();
    }

    ensureCursorHidden() {
        const hideCursor = () => {
            document.body.style.cursor = 'none';
            document.querySelectorAll('button').forEach(btn => btn.style.cursor = 'none');
        };

        // Initial hide
        hideCursor();

        // Hide on window focus
        window.addEventListener('focus', hideCursor);

        // Hide on mouse enter
        document.body.addEventListener('mouseenter', hideCursor);

        // Hide on visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) hideCursor();
        });

        // Periodic check (every 1 second)
        setInterval(hideCursor, 1000);
    }

    createScoreboard() {
        const scoreboard = document.createElement('div');
        scoreboard.className = 'scoreboard';
        const container = document.querySelector('.game-container');
        container.insertBefore(scoreboard, container.firstChild);
        this.updateScoreboard();
    }

    updateScoreboard() {
        const scoreboard = document.querySelector('.scoreboard');
        if (scoreboard) {
            const remainingButtons = this.totalButtons - this.activeCursors.size;
            scoreboard.textContent = remainingButtons === 0 ? 'WINNER' : 
                remainingButtons.toString().padStart(2, '0');
            
            if (remainingButtons === 0) {
                scoreboard.classList.add('winner');
            } else {
                scoreboard.classList.remove('winner');
            }
        }
    }

    setupGame() {
        const buttonGrid = document.querySelector('.button-grid');
        buttonGrid.innerHTML = '';
        
        // Create symmetric pattern
        const pattern = [4, 5, 6, 7, 6, 5, 4]; // 37 buttons total
        let buttonCount = 0;

        pattern.forEach((buttonsInRow, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'button-row';
            
            // Calculate offset for perfect centering
            const maxButtons = 7;
            const offset = ((maxButtons - buttonsInRow) * 44) / 2; // 44px = button width + gap
            rowDiv.style.transform = `translateX(${offset}px)`;
            
            for (let col = 0; col < buttonsInRow; col++) {
                if (buttonCount < this.totalButtons) {
                    const button = document.createElement('button');
                    button.className = 'game-button';
                    button.style.backgroundColor = this.colors[buttonCount % this.colors.length];
                    button.dataset.index = buttonCount;
                    this.buttons.push(button);
                    rowDiv.appendChild(button);
                    buttonCount++;
                }
            }
            
            buttonGrid.appendChild(rowDiv);
        });

        this.createScoreboard();
    }

    setupEventListeners() {
        // Update all cursors on mouse move
        document.addEventListener('mousemove', (e) => {
            this.cursors.forEach(cursor => cursor.update(e.clientX, e.clientY));
        });

        // Handle button clicks
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                
                if (this.activeCursors.has(index)) {
                    // Remove the cursor associated with this button
                    this.removeCursor(index);
                    button.classList.remove('clicked');
                    this.activeCursors.delete(index);
                } else {
                    // Add a new cursor with random offset
                    const offsetX = (Math.random() - 0.5) * 300;
                    const offsetY = (Math.random() - 0.5) * 300;
                    const newCursor = new Cursor(this.colors[index], offsetX, offsetY);
                    newCursor.setInitialPosition(e.clientX, e.clientY);
                    this.cursors.push(newCursor);
                    button.classList.add('clicked');
                    this.activeCursors.add(index);
                }
                this.updateScoreboard();
            });
        });
    }

    removeCursor(index) {
        // Find the cursor associated with this button index
        const cursorIndex = this.cursors.findIndex((_, i) => 
            i > 0 && this.activeCursors.has(index));
        
        if (cursorIndex !== -1) {
            this.cursors[cursorIndex].remove();
            this.cursors.splice(cursorIndex, 1);
        }
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Game();
    // Hide the default cursor
    document.body.style.cursor = 'none';
}); 