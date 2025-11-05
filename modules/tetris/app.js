// 俄罗斯方块游戏实现

// 游戏配置
const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 30;
const COLORS = [
  null,
  '#FF0D72', // I
  '#0DC2FF', // O
  '#0DFF72', // T
  '#F538FF', // S
  '#FF8E0D', // Z
  '#FFE138', // J
  '#3877FF', // L
];

// 方块形状定义
const SHAPES = {
  I: [
    [[0,0,0,0],
     [1,1,1,1],
     [0,0,0,0],
     [0,0,0,0]],
    [[0,0,1,0],
     [0,0,1,0],
     [0,0,1,0],
     [0,0,1,0]]
  ],
  O: [
    [[1,1],
     [1,1]]
  ],
  T: [
    [[0,1,0],
     [1,1,1],
     [0,0,0]],
    [[0,1,0],
     [0,1,1],
     [0,1,0]],
    [[0,0,0],
     [1,1,1],
     [0,1,0]],
    [[0,1,0],
     [1,1,0],
     [0,1,0]]
  ],
  S: [
    [[0,1,1],
     [1,1,0],
     [0,0,0]],
    [[0,1,0],
     [0,1,1],
     [0,0,1]]
  ],
  Z: [
    [[1,1,0],
     [0,1,1],
     [0,0,0]],
    [[0,0,1],
     [0,1,1],
     [0,1,0]]
  ],
  J: [
    [[1,0,0],
     [1,1,1],
     [0,0,0]],
    [[0,1,1],
     [0,1,0],
     [0,1,0]],
    [[0,0,0],
     [1,1,1],
     [0,0,1]],
    [[0,1,0],
     [0,1,0],
     [1,1,0]]
  ],
  L: [
    [[0,0,1],
     [1,1,1],
     [0,0,0]],
    [[0,1,0],
     [0,1,0],
     [0,1,1]],
    [[0,0,0],
     [1,1,1],
     [1,0,0]],
    [[1,1,0],
     [0,1,0],
     [0,1,0]]
  ]
};

// 方块类型到颜色的映射
const SHAPE_TO_COLOR = {
  'I': 1, 'O': 2, 'T': 3, 'S': 4, 'Z': 5, 'J': 6, 'L': 7
};

// 游戏状态
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let piecesPlaced = 0;

// DOM 元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const piecesEl = document.getElementById('pieces');
const speedEl = document.getElementById('speed');
const gameStatusEl = document.getElementById('gameStatus');
const nextPieceEl = document.getElementById('nextPiece');
const bgMusic = document.getElementById('bgMusic');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicIcon = document.getElementById('musicIcon');
const volumeControl = document.getElementById('volumeControl');

// 初始化游戏板
function initBoard() {
  board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

// 创建新方块
function createPiece(type) {
  const shapeType = type || Object.keys(SHAPES)[Math.floor(Math.random() * Object.keys(SHAPES).length)];
  const shape = SHAPES[shapeType];
  return {
    matrix: shape[0],
    x: Math.floor(COLS / 2) - Math.floor(shape[0][0].length / 2),
    y: 0,
    type: shapeType,
    rotation: 0,
    color: SHAPE_TO_COLOR[shapeType]
  };
}

// 绘制游戏板
function drawBoard() {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制网格线
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(canvas.width, i * CELL_SIZE);
    ctx.stroke();
  }

  // 绘制已放置的方块
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        ctx.fillStyle = COLORS[board[y][x]];
        ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
  }

  // 绘制当前方块
  if (currentPiece) {
    drawPiece(currentPiece);
  }
}

// 绘制方块
function drawPiece(piece, offsetX = 0, offsetY = 0) {
  const matrix = piece.matrix;
  const x = piece.x + offsetX;
  const y = piece.y + offsetY;
  const color = COLORS[piece.color];

  for (let py = 0; py < matrix.length; py++) {
    for (let px = 0; px < matrix[py].length; px++) {
      if (matrix[py][px]) {
        const drawX = (x + px) * CELL_SIZE + 1;
        const drawY = (y + py) * CELL_SIZE + 1;
        ctx.fillStyle = color;
        ctx.fillRect(drawX, drawY, CELL_SIZE - 2, CELL_SIZE - 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.strokeRect(drawX, drawY, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
  }
}

// 绘制下一个方块
function drawNextPiece() {
  nextPieceEl.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  
  if (nextPiece) {
    const matrix = nextPiece.matrix;
    const cellSize = 20;
    const offsetX = (canvas.width - matrix[0].length * cellSize) / 2;
    const offsetY = (canvas.height - matrix.length * cellSize) / 2;
    
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let py = 0; py < matrix.length; py++) {
      for (let px = 0; px < matrix[py].length; px++) {
        if (matrix[py][px]) {
          const drawX = offsetX + px * cellSize + 1;
          const drawY = offsetY + py * cellSize + 1;
          ctx.fillStyle = COLORS[nextPiece.color];
          ctx.fillRect(drawX, drawY, cellSize - 2, cellSize - 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.strokeRect(drawX, drawY, cellSize - 2, cellSize - 2);
        }
      }
    }
  }
  
  nextPieceEl.appendChild(canvas);
}

// 碰撞检测
function collide(board, piece, offsetX = 0, offsetY = 0) {
  const matrix = piece.matrix;
  const x = piece.x + offsetX;
  const y = piece.y + offsetY;

  for (let py = 0; py < matrix.length; py++) {
    for (let px = 0; px < matrix[py].length; px++) {
      if (matrix[py][px]) {
        const newX = x + px;
        const newY = y + py;

        // 检查边界
        if (newX < 0 || newX >= COLS || newY >= ROWS) {
          return true;
        }
        
        // 检查与已放置方块的碰撞
        if (newY >= 0 && board[newY] && board[newY][newX]) {
          return true;
        }
      }
    }
  }
  return false;
}

// 旋转方块
function rotatePiece(piece, board) {
  const shape = SHAPES[piece.type];
  const nextRotation = (piece.rotation + 1) % shape.length;
  const originalRotation = piece.rotation;
  
  piece.rotation = nextRotation;
  piece.matrix = shape[nextRotation];
  
  // 如果旋转后碰撞，尝试左右移动
  if (collide(board, piece)) {
    // 尝试向左移动
    piece.x -= 1;
    if (collide(board, piece)) {
      // 尝试向右移动
      piece.x += 2;
      if (collide(board, piece)) {
        // 恢复原状
        piece.x -= 1;
        piece.rotation = originalRotation;
        piece.matrix = shape[originalRotation];
        return false;
      }
    }
  }
  
  return true;
}

// 放置方块
function placePiece() {
  const matrix = currentPiece.matrix;
  for (let py = 0; py < matrix.length; py++) {
    for (let px = 0; px < matrix[py].length; px++) {
      if (matrix[py][px]) {
        const y = currentPiece.y + py;
        const x = currentPiece.x + px;
        if (y >= 0) {
          board[y][x] = currentPiece.color;
        }
      }
    }
  }
  
  piecesPlaced++;
  piecesEl.textContent = piecesPlaced;
  
  // 检查游戏结束
  if (currentPiece.y <= 0) {
    gameOver();
    return;
  }
  
  // 消除满行
  clearLines();
  
  // 生成新方块
  currentPiece = nextPiece;
  nextPiece = createPiece();
  drawNextPiece();
}

// 清除满行
function clearLines() {
  let linesCleared = 0;
  
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      // 标记为清除中（用于动画效果）
      for (let x = 0; x < COLS; x++) {
        board[y][x] = 'clearing';
      }
      linesCleared++;
    }
  }
  
  if (linesCleared > 0) {
    // 移除已清除的行
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y][0] === 'clearing') {
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(0));
        y++; // 重新检查同一位置
      }
    }
    
    // 更新分数和等级
    lines += linesCleared;
    const points = [0, 40, 100, 300, 1200];
    score += points[linesCleared] * level;
    
    // 每消除10行提升一个等级
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    
    // 更新显示
    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
    speedEl.textContent = (1000 / dropInterval).toFixed(1);
    
    // 保存最高分
    const highScore = parseInt(localStorage.getItem('tetris_highScore') || '0');
    if (score > highScore) {
      localStorage.setItem('tetris_highScore', score.toString());
      highScoreEl.textContent = score;
    }
  }
}

// 移动方块
function movePiece(dx, dy) {
  if (!currentPiece || !gameRunning || gamePaused) return false;
  
  if (!collide(board, currentPiece, dx, dy)) {
    currentPiece.x += dx;
    currentPiece.y += dy;
    return true;
  }
  
  // 如果向下移动时碰撞，则放置方块
  if (dy > 0) {
    placePiece();
  }
  
  return false;
}

// 硬降（瞬间下落）
function hardDrop() {
  if (!currentPiece || !gameRunning || gamePaused) return;
  
  while (movePiece(0, 1)) {
    score += 2; // 硬降加分
  }
  scoreEl.textContent = score;
}

// 游戏循环
function update(time = 0) {
  if (!gameRunning || gamePaused) {
    requestAnimationFrame(update);
    return;
  }
  
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  
  // 自动下落
  if (dropCounter > dropInterval) {
    movePiece(0, 1);
    dropCounter = 0;
  }
  
  drawBoard();
  requestAnimationFrame(update);
}

// 音乐控制
let musicEnabled = localStorage.getItem('tetris_musicEnabled') !== 'false'; // 默认开启
let musicLoaded = false;

function initMusic() {
  // 加载保存的音乐设置
  const savedVolume = localStorage.getItem('tetris_volume');
  if (savedVolume !== null) {
    bgMusic.volume = savedVolume / 100;
    volumeControl.value = savedVolume;
  } else {
    bgMusic.volume = 0.5;
  }
  
  updateMusicIcon();
  
  // 监听音乐加载事件
  bgMusic.addEventListener('loadeddata', () => {
    musicLoaded = true;
    console.log('背景音乐加载成功');
  });
  
  bgMusic.addEventListener('error', (e) => {
    console.log('背景音乐加载失败，将静默运行');
    musicLoaded = false;
    musicIcon.textContent = '🔇';
    musicToggleBtn.disabled = true;
    musicToggleBtn.title = '音乐文件未找到，请将音乐文件放置在 assets/ 目录下';
  });
  
  // 尝试加载音乐
  bgMusic.load();
  
  // 尝试播放音乐（需要用户交互）
  bgMusic.play().catch(err => {
    console.log('音乐自动播放被阻止，需要用户交互');
  });
}

function toggleMusic() {
  if (!musicLoaded) {
    // 如果音乐未加载，尝试重新加载
    bgMusic.load();
    setTimeout(() => {
      if (musicLoaded) {
        musicEnabled = true;
        toggleMusic();
      }
    }, 100);
    return;
  }
  
  musicEnabled = !musicEnabled;
  localStorage.setItem('tetris_musicEnabled', musicEnabled);
  
  if (musicEnabled) {
    bgMusic.play().catch(err => {
      console.log('音乐播放失败:', err);
      musicEnabled = false;
      updateMusicIcon();
    });
  } else {
    bgMusic.pause();
  }
  
  updateMusicIcon();
}

function updateMusicIcon() {
  if (musicEnabled && !bgMusic.paused) {
    musicIcon.textContent = '🔊';
  } else {
    musicIcon.textContent = '🔇';
  }
}

function setVolume(value) {
  const volume = value / 100;
  bgMusic.volume = volume;
  localStorage.setItem('tetris_volume', value);
  updateMusicIcon();
}

// 开始游戏
function startGame() {
  if (gameRunning && !gamePaused) return;
  
  if (!gameRunning) {
    initBoard();
    score = 0;
    lines = 0;
    level = 1;
    piecesPlaced = 0;
    dropCounter = 0;
    dropInterval = 1000;
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    // 加载最高分
    const highScore = parseInt(localStorage.getItem('tetris_highScore') || '0');
    highScoreEl.textContent = highScore;
    
    // 更新显示
    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
    piecesEl.textContent = piecesPlaced;
    speedEl.textContent = '1.0';
    
    drawNextPiece();
    gameRunning = true;
  }
  
  gamePaused = false;
  lastTime = performance.now();
  
  // 开始播放音乐
  if (musicEnabled && musicLoaded) {
    bgMusic.play().catch(err => {
      console.log('音乐播放失败:', err);
    });
  }
  
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
  gameStatusEl.textContent = '游戏中...';
  gameStatusEl.className = 'bg-green-50 border border-green-200 rounded p-4 text-center text-sm text-green-700';
  
  requestAnimationFrame(update);
}

// 暂停游戏
function pauseGame() {
  if (!gameRunning) return;
  
  gamePaused = !gamePaused;
  
  if (gamePaused) {
    pauseBtn.textContent = '继续';
    gameStatusEl.textContent = '游戏已暂停';
    gameStatusEl.className = 'bg-yellow-50 border border-yellow-200 rounded p-4 text-center text-sm text-yellow-700';
    // 暂停音乐
    bgMusic.pause();
  } else {
    pauseBtn.textContent = '暂停';
    gameStatusEl.textContent = '游戏中...';
    gameStatusEl.className = 'bg-green-50 border border-green-200 rounded p-4 text-center text-sm text-green-700';
    lastTime = performance.now();
    // 恢复音乐
    if (musicEnabled && musicLoaded) {
      bgMusic.play().catch(err => {
        console.log('音乐播放失败:', err);
      });
    }
  }
}

// 重置游戏
function resetGame() {
  gameRunning = false;
  gamePaused = false;
  initBoard();
  currentPiece = null;
  nextPiece = null;
  score = 0;
  lines = 0;
  level = 1;
  piecesPlaced = 0;
  
  // 停止音乐
  bgMusic.pause();
  bgMusic.currentTime = 0;
  
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = false;
  pauseBtn.textContent = '暂停';
  
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
  piecesEl.textContent = piecesPlaced;
  speedEl.textContent = '1.0';
  
  gameStatusEl.textContent = '点击"开始游戏"开始';
  gameStatusEl.className = 'bg-white border rounded p-4 text-center text-sm text-gray-600';
  
  nextPieceEl.innerHTML = '';
  drawBoard();
}

// 游戏结束
function gameOver() {
  gameRunning = false;
  gamePaused = false;
  
  // 停止音乐
  bgMusic.pause();
  bgMusic.currentTime = 0;
  
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = false;
  pauseBtn.textContent = '暂停';
  
  gameStatusEl.textContent = `游戏结束！最终分数: ${score}`;
  gameStatusEl.className = 'bg-red-50 border border-red-200 rounded p-4 text-center text-sm text-red-700';
}

// 键盘控制
document.addEventListener('keydown', (e) => {
  if (!gameRunning || gamePaused) {
    if (e.key === 'p' || e.key === 'P') {
      if (gameRunning) pauseGame();
    }
    return;
  }
  
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      movePiece(-1, 0);
      break;
    case 'ArrowRight':
      e.preventDefault();
      movePiece(1, 0);
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (movePiece(0, 1)) {
        score += 1; // 加速下落加分
        scoreEl.textContent = score;
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      rotatePiece(currentPiece, board);
      break;
    case ' ':
      e.preventDefault();
      hardDrop();
      break;
    case 'p':
    case 'P':
      e.preventDefault();
      pauseGame();
      break;
  }
});

// 按钮事件
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
musicToggleBtn.addEventListener('click', toggleMusic);
volumeControl.addEventListener('input', (e) => setVolume(e.target.value));

// 音乐事件监听
bgMusic.addEventListener('play', updateMusicIcon);
bgMusic.addEventListener('pause', updateMusicIcon);
bgMusic.addEventListener('ended', () => {
  if (musicEnabled && gameRunning && !gamePaused) {
    bgMusic.play().catch(err => console.log('音乐播放失败:', err));
  }
});

// 初始化
initMusic();
resetGame();
drawBoard();

