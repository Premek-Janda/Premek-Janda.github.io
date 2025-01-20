const NUMBER_OF_PARTICLES = Math.round(window.innerWidth * window.innerHeight / 7500);
const DISTANCE = 20_000;
const pointColor = () => 'rgba(150,150,150,' + (Math.random() * 0.25 + 0.75) + ')';
const lineColor = (distance) => 'rgba(150,150,150,' + (1 - (distance / DISTANCE)) + ')';

const canvas = document.getElementById('spiderWeb');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 150
};

const particlesArray = [];

class Particle {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.baseX = x;
        this.baseY = y;
        this.density = (Math.random() * 100) + 1;
        this.velocityX = (Math.random() - 0.5) * 0.25;
        this.velocityY = (Math.random() - 0.5) * 0.25;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        // random movement
        this.x += this.velocityX;
        this.y += this.velocityY;

        // keep the particles within canvas bounds
        if (this.x <= 0 || this.x >= canvas.width) {
            this.velocityX = -this.velocityX;
        }
        if (this.y <= 0 || this.y >= canvas.height) {
            this.velocityY = -this.velocityY;
        }

        // mouse interaction
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            this.x -= directionX;
            this.y -= directionY;
        }

        this.draw();
    }
}

function init() {
    particlesArray.length = 0;
    for (let i = 0; i < NUMBER_OF_PARTICLES; i++) {
        let size = Math.random() * 5 + 1;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let color = pointColor();

        particlesArray.push(new Particle(x, y, size, color));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
    requestAnimationFrame(animate);
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                         + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < DISTANCE) {
                ctx.strokeStyle = lineColor(distance);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

init();
animate();
