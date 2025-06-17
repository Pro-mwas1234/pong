const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 14;
const PLAYER_X = 20;
const RIGHT_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 7;
const BALL_SPEED = 6;

let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let rightPaddleY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = (canvas.width - BALL_SIZE) / 2;
let ballY = (canvas.height - BALL_SIZE) / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

let playerScore = 0;
let rightScore = 0;
let gameMode = 'ai';

const keys = {
    ArrowUp: false,
    ArrowDown: false,
};

document.querySelectorAll('input[name="mode"]').forEach(input => {
    input.addEventListener('change', function () {
        gameMode = this.value;
        resetBall();
        playerScore = 0;
        rightScore = 0;
        playerY = (canvas.height - PADDLE_HEIGHT) / 2;
        rightPaddleY = (canvas.height - PADDLE_HEIGHT) / 2;
    });
});

function drawRect(x, y, w, h, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color = '#fff') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, size = "40px", color = "#fff", align = 'center') {
    ctx.fillStyle = color;
    ctx.font = `${size} Arial`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

function resetBall() {
    ballX = (canvas.width - BALL_SIZE) / 2;
    ballY = (canvas.height - BALL_SIZE) / 2;
    ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += 30) {
        drawRect(canvas.width / 2 - 2, y, 4, 18, '#666');
    }
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');
    drawRect(RIGHT_X, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');
    drawCircle(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, '#fff');
    drawText(playerScore, canvas.width / 4, 60);
    drawText(rightScore, canvas.width * 3 / 4, 60);
}

function update() {
    // Move ball
    ballX += ballVelX;
    ballY += ballVelY;

    // Top & bottom wall collision
    if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
        ballVelY *= -1;
    }

    // Player paddle collision (left)
    if (
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballX >= PLAYER_X && // Added for robustness
        ballY + BALL_SIZE >= playerY &&
        ballY <= playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH;
        ballVelX *= -1;
        // Add "spin"
        let collidePoint = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        let angle = collidePoint * (Math.PI / 4);
        ballVelY = BALL_SPEED * Math.sin(angle);
        ballVelX = -BALL_SPEED * Math.cos(angle); // Ensure ball goes right
    }

    // Right paddle collision (AI or Player)
    if (
        ballX + BALL_SIZE >= RIGHT_X &&
        ballX + BALL_SIZE <= RIGHT_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE >= rightPaddleY &&
        ballY <= rightPaddleY + PADDLE_HEIGHT
    ) {
        ballX = RIGHT_X - BALL_SIZE;
        ballVelX *= -1;
        let collidePoint = (ballY + BALL_SIZE / 2) - (rightPaddleY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        let angle = collidePoint * (Math.PI / 4);
        ballVelX = BALL_SPEED * Math.sin(angle);
        ballVelY = BALL_SPEED * Math.cos(angle); // Ensure ball goes left
    }

    // Score
    if (ballX < 0) {
        rightScore++;
        resetBall();
    }
    if (ballX + BALL_SIZE > canvas.width) {
        playerScore++;
        resetBall();
    }

    // Right paddle movement
    if (gameMode === 'ai') {
        let aiCenter = rightPaddleY + PADDLE_HEIGHT / 2;
        if (aiCenter < ballY + BALL_SIZE / 2 - 10) {
            rightPaddleY += PADDLE_SPEED * 0.7;
        } else if (aiCenter > ballY + BALL_SIZE / 2 + 10) {
            rightPaddleY -= PADDLE_SPEED * 0.7;
        }
    } else if (gameMode === 'player') {
        if (keys.ArrowUp) rightPaddleY -= PADDLE_SPEED;
        if (keys.ArrowDown) rightPaddleY += PADDLE_SPEED;
    }

    // Clamp paddles
    rightPaddleY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, rightPaddleY));
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
}

// Mouse moves left paddle
canvas.addEventListener('mousemove', function (evt) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = evt.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Keyboard for right paddle (player 2)
window.addEventListener('keydown', (e) => {
    if (e.code === "ArrowUp" || e.code === "ArrowDown") {
        keys[e.code] = true;
    }
});
window.addEventListener('keyup', (e) => {
    if (e.code === "ArrowUp" || e.code === "ArrowDown") {
        keys[e.code] = false;
    }
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
