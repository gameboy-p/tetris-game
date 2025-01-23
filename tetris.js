class Tetris {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.startBtn = document.getElementById('start-btn');
        this.scoreElement = document.getElementById('score');
        this.grid = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.isPlaying = false;
        this.currentPiece = null;
        this.gameInterval = null;
        this.previewBoard = document.getElementById('preview-board');
        this.levelElement = document.getElementById('level');
        this.level = 1;
        this.nextPiece = null;
        this.speed = 1000;
        this.leftBtn = document.getElementById('left-btn');
        this.rightBtn = document.getElementById('right-btn');
        this.downBtn = document.getElementById('down-btn');
        this.rotateBtn = document.getElementById('rotate-btn');

        this.pieces = {
            'I': {
                shape: [[1, 1, 1, 1]],
                color: 'I'
            },
            'O': {
                shape: [[1, 1], [1, 1]],
                color: 'O'
            },
            'T': {
                shape: [[1, 1, 1], [0, 1, 0]],
                color: 'T'
            },
            'L': {
                shape: [[1, 1, 1], [1, 0, 0]],
                color: 'L'
            },
            'J': {
                shape: [[1, 1, 1], [0, 0, 1]],
                color: 'J'
            },
            'S': {
                shape: [[0, 1, 1], [1, 1, 0]],
                color: 'S'
            },
            'Z': {
                shape: [[1, 1, 0], [0, 1, 1]],
                color: 'Z'
            }
        };

        // 创建预览板网格
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            this.previewBoard.appendChild(cell);
        }

        this.init();
    }

    init() {
        // 创建网格
        for (let i = 0; i < 200; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            this.gameBoard.appendChild(cell);
        }

        // 事件监听
        this.startBtn.addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // 添加移动端控制按钮事件
        this.leftBtn.addEventListener('click', () => {
            if (this.isPlaying && this.canMove(this.currentPiece.x - 1, this.currentPiece.y)) {
                this.currentPiece.x--;
                this.updateDisplay();
            }
        });

        this.rightBtn.addEventListener('click', () => {
            if (this.isPlaying && this.canMove(this.currentPiece.x + 1, this.currentPiece.y)) {
                this.currentPiece.x++;
                this.updateDisplay();
            }
        });

        this.downBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.moveDown();
            }
        });

        this.rotateBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.rotatePiece();
                this.updateDisplay();
            }
        });

        // 禁用按钮的默认触摸行为，防止双击缩放
        document.querySelectorAll('.mobile-controls button').forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
        });
    }

    startGame() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.score = 0;
        this.level = 1;
        this.speed = 1000;
        this.scoreElement.textContent = '0';
        this.levelElement.textContent = '1';
        this.grid = Array(20).fill().map(() => Array(10).fill(0));
        this.updateDisplay();
        this.generateNewPiece();
        this.generateNextPiece();
        
        this.gameInterval = setInterval(() => {
            this.moveDown();
        }, this.speed);
    }

    generateNextPiece() {
        const pieces = Object.keys(this.pieces);
        const pieceType = pieces[Math.floor(Math.random() * pieces.length)];
        const piece = this.pieces[pieceType];
        
        this.nextPiece = {
            shape: piece.shape,
            color: piece.color
        };
        this.updatePreview();
    }

    generateNewPiece() {
        if (this.nextPiece) {
            this.currentPiece = {
                ...this.nextPiece,
                x: Math.floor((10 - this.nextPiece.shape[0].length) / 2),
                y: 0
            };
        } else {
            // 第一次生成时的逻辑
            const pieces = Object.keys(this.pieces);
            const pieceType = pieces[Math.floor(Math.random() * pieces.length)];
            const piece = this.pieces[pieceType];
            
            this.currentPiece = {
                shape: piece.shape,
                color: piece.color,
                x: Math.floor((10 - piece.shape[0].length) / 2),
                y: 0
            };
        }
        this.generateNextPiece();
    }

    moveDown() {
        if (this.canMove(this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
            this.updateDisplay();
        } else {
            this.freezePiece();
            this.clearLines();
            this.generateNewPiece();
            
            if (!this.canMove(this.currentPiece.x, this.currentPiece.y)) {
                this.gameOver();
            }
        }
    }

    canMove(newX, newY) {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    if (newY + y >= 20 || newX + x < 0 || newX + x >= 10 || 
                        (newY + y >= 0 && this.grid[newY + y][newX + x])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    freezePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    this.grid[this.currentPiece.y + y][this.currentPiece.x + x] = {
                        filled: 1,
                        color: this.currentPiece.color
                    };
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = 19; y >= 0; y--) {
            if (this.grid[y].every(cell => cell && cell.filled === 1)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(10).fill(0));
                linesCleared++;
                y++; // 检查同一行（因为上面的行下移了）
            }
        }
        
        if (linesCleared > 0) {
            const scores = [100, 300, 500, 800];
            const points = scores[linesCleared - 1];
            this.score += points * this.level; // 根据等级增加分数
            this.scoreElement.textContent = this.score;
            
            // 检查是否升级
            const newLevel = Math.floor(this.score / 1000) + 1;
            if (newLevel > this.level) {
                this.levelUp(newLevel);
            }
        }
    }

    levelUp(newLevel) {
        this.level = newLevel;
        this.levelElement.textContent = this.level;
        
        // 更新速度
        clearInterval(this.gameInterval);
        this.speed = Math.max(100, 1000 - (this.level - 1) * 100); // 每升一级加快100ms，最快100ms
        
        this.gameInterval = setInterval(() => {
            this.moveDown();
        }, this.speed);

        // 显示升级提示
        const message = `恭喜！升级到第 ${this.level} 关！`;
        this.showMessage(message);
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            animation: fadeOut 2s forwards;
        `;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 2000);
    }

    handleKeyPress(e) {
        if (!this.isPlaying) return;

        switch (e.key) {
            case 'ArrowLeft':
                if (this.canMove(this.currentPiece.x - 1, this.currentPiece.y)) {
                    this.currentPiece.x--;
                }
                break;
            case 'ArrowRight':
                if (this.canMove(this.currentPiece.x + 1, this.currentPiece.y)) {
                    this.currentPiece.x++;
                }
                break;
            case 'ArrowDown':
                this.moveDown();
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
        }
        this.updateDisplay();
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (!this.canMove(this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = originalShape;
        }
    }

    updateDisplay() {
        const cells = this.gameBoard.getElementsByClassName('cell');
        
        // 清除显示
        for (let i = 0; i < cells.length; i++) {
            cells[i].classList.remove('filled', 'I', 'O', 'T', 'L', 'J', 'S', 'Z');
        }
        
        // 显示固定的方块
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 10; x++) {
                if (this.grid[y][x] && this.grid[y][x].filled) {
                    const index = y * 10 + x;
                    cells[index].classList.add('filled', this.grid[y][x].color);
                }
            }
        }
        
        // 显示当前移动的方块
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x] && this.currentPiece.y + y >= 0) {
                        const index = (this.currentPiece.y + y) * 10 + (this.currentPiece.x + x);
                        cells[index].classList.add('filled', this.currentPiece.color);
                    }
                }
            }
        }
    }

    updatePreview() {
        const cells = this.previewBoard.getElementsByClassName('cell');
        
        // 清除预览显示
        for (let i = 0; i < cells.length; i++) {
            cells[i].classList.remove('filled', 'I', 'O', 'T', 'L', 'J', 'S', 'Z');
        }
        
        // 计算居中位置
        const offsetX = Math.floor((4 - this.nextPiece.shape[0].length) / 2);
        const offsetY = Math.floor((4 - this.nextPiece.shape.length) / 2);
        
        // 显示下一个方块
        for (let y = 0; y < this.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                if (this.nextPiece.shape[y][x]) {
                    const index = (y + offsetY) * 4 + (x + offsetX);
                    cells[index].classList.add('filled', this.nextPiece.color);
                }
            }
        }
    }

    gameOver() {
        this.isPlaying = false;
        clearInterval(this.gameInterval);
        const finalMessage = this.level >= 10 ? 
            `恭喜通关！最终得分：${this.score}` :
            `游戏结束！得分：${this.score}`;
        alert(finalMessage);
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// 初始化游戏
new Tetris(); 