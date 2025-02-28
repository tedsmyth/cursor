class Cursor {
    constructor(color, offsetX = 0, offsetY = 0) {
        this.element = document.createElement('div');
        this.element.className = 'cursor';
        this.element.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        document.body.appendChild(this.element);
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
        this.cursors = [new Cursor()]; // Start with one default cursor
        this.buttons = [];
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
            '#E74C3C', '#2ECC71'
        ];
        this.activeCursors = new Set(); // Track which buttons have active cursors
        this.setupGame();
        this.setupEventListeners();
    }

    setupGame() {
        const buttonGrid = document.querySelector('.button-grid');
        
        // Create 10 buttons with different colors
        for (let i = 0; i < 10; i++) {
            const button = document.createElement('button');
            button.className = 'game-button';
            button.style.backgroundColor = this.colors[i];
            button.dataset.index = i;
            this.buttons.push(button);
            buttonGrid.appendChild(button);
        }
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
                    const offsetX = (Math.random() - 0.5) * 300; // Random offset between -150 and 150
                    const offsetY = (Math.random() - 0.5) * 300;
                    this.cursors.push(new Cursor(this.colors[index], offsetX, offsetY));
                    button.classList.add('clicked');
                    this.activeCursors.add(index);
                }
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