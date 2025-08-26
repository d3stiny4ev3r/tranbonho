// Mảng tin nhắn và số lượng notification
const messages = [" 600k!"];
const notificationCount = 100;
let createdNotifications = 0;

// Hàm tạo notification ngẫu nhiên
function generateRandomNotifications() {
    for (let i = 0; i < notificationCount; i++) {
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.className = 'notification';
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            notification.innerHTML = `
                <div class="notification-header">
                    <button class="minimize-btn" onclick="minimizeNotification(this)">–</button>
                    <span>Cho anh xin</span>
                </div>
                <p>${randomMessage}</p>
            `;
            
            const randomX = Math.random() * (window.innerWidth - 240);
            const randomY = Math.random() * (window.innerHeight - 160);
            notification.style.left = randomX + 'px';
            notification.style.top = randomY + 'px';
            
            document.body.appendChild(notification);
            createdNotifications++;
            
            if (createdNotifications === notificationCount) {
                showFinalMessage();
            }
        }, i * 200);
    }
}

// Hàm minimize notification
function minimizeNotification(button) {
    const notification = button.closest('.notification');
    notification.style.display = 'none';
}

// Hàm hiển thị tin nhắn cuối
function showFinalMessage() {
    const finalMessage = document.getElementById('finalMessage');
    finalMessage.style.display = 'block';
    drawOnCanvas();
    setTimeout(() => {
        const text1 = document.getElementById('text1');
        text1.style.display = 'block';
    }, 2000);
}

// Các element cho text morphing
const elts = {
    text1: document.getElementById("text1"),
    text2: document.getElementById("text2"),
};

// Mảng text để morph
const texts = ["Nhấn", "vào", "Trái", "Tim", "❤️"];

const morphTime = 1;
const cooldownTime = 0.25;

let textIndex = texts.length - 1;
let time = new Date();
let morph = 0;
let cooldown = cooldownTime;

elts.text1.textContent = texts[textIndex % texts.length];
elts.text2.textContent = texts[(textIndex + 1) % texts.length];

// Hàm morph text
function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    
    let fraction = morph / morphTime;
    
    if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
    }
    
    setMorph(fraction);
}

// Hàm set morph
function setMorph(fraction) {
    elts.text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    
    fraction = 1 - fraction;
    elts.text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    elts.text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    
    elts.text1.textContent = texts[textIndex % texts.length];
    elts.text2.textContent = texts[(textIndex + 1) % texts.length];
}

// Hàm cooldown
function doCooldown() {
    morph = 0;
    
    elts.text2.style.filter = "";
    elts.text2.style.opacity = "100%";
    
    elts.text1.style.filter = "";
    elts.text1.style.opacity = "0%";
}

// Hàm animate
function animate() {
    requestAnimationFrame(animate);
    
    let newTime = new Date();
    let shouldIncrementIndex = cooldown > 0;
    let dt = (newTime - time) / 1000;
    time = newTime;
    
    cooldown -= dt;
    
    if (cooldown <= 0) {
        if (shouldIncrementIndex) {
            textIndex++;
        }
        doMorph();
    } else {
        doCooldown();
    }
}

animate();

// Cài đặt particle system
var settings = {
    particles: {
        length: 500,        // Số lượng particle tối đa
        duration: 2,        // Thời gian tồn tại particle (giây)
        velocity: 100,      // Vận tốc particle (pixel/giây)
        effect: -0.75,      // Hiệu ứng (chơi với giá trị này để có hiệu ứng đẹp)
        size: 30,           // Kích thước particle (pixel)
    },
};

// Polyfill RequestAnimationFrame
(function () {
    var b = 0;
    var c = ["ms", "moz", "webkit", "o"];
    for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
        window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
        window.cancelAnimationFrame =
            window[c[a] + "CancelRequestAnimationFrame"] ||
            window[c[a] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (h, e) {
            var d = new Date().getTime();
            var f = Math.max(0, 16 - (d - b));
            var g = window.setTimeout(function () {
                h(d + f);
            }, f);
            b = d + f;
            return g;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (d) {
            clearTimeout(d);
        };
    }
})();

// Class Point
var Point = (function () {
    function Point(x, y) {
        this.x = typeof x !== 'undefined' ? x : 0;
        this.y = typeof y !== 'undefined' ? y : 0;
    }
    
    Point.prototype.clone = function () {
        return new Point(this.x, this.y);
    };
    
    Point.prototype.length = function (length) {
        if (typeof length === 'undefined')
            return Math.sqrt(this.x * this.x + this.y * this.y);
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
    };
    
    Point.prototype.normalize = function () {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    };
    
    return Point;
})();

// Class Particle
var Particle = (function () {
    function Particle() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
    }
    
    Particle.prototype.initialize = function (x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
    };
    
    Particle.prototype.update = function (deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
    };
    
    Particle.prototype.draw = function (context, image) {
        function easeOut(t) {
            return (--t) * t * t + 1;
        }
        
        var size = image.width * easeOut(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
    };
    
    return Particle;
})();

// Class ParticlePool
var ParticlePool = (function () {
    var particles,
        firstActive = 0,
        firstFree = 0,
        duration = settings.particles.duration;

    function ParticlePool(length) {
        // Tạo và populate particle pool
        particles = new Array(length);
        
        for (var i = 0; i < particles.length; i++)
            particles[i] = new Particle();
    }

    ParticlePool.prototype.add = function (x, y, dx, dy) {
        particles[firstFree].initialize(x, y, dx, dy);

        // Xử lý circular queue
        firstFree++;
        if (firstFree == particles.length) firstFree = 0;
        if (firstActive == firstFree) firstActive++;
        if (firstActive == particles.length) firstActive = 0;
    };

    ParticlePool.prototype.update = function (deltaTime) {
        var i;

        // Update active particles
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
                particles[i].update(deltaTime);
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
                particles[i].update(deltaTime);
            for (i = 0; i < firstFree; i++)
                particles[i].update(deltaTime);
        }

        // Remove inactive particles
        while (
            particles[firstActive].age >= duration &&
            firstActive != firstFree
        ) {
            firstActive++;
            if (firstActive == particles.length) firstActive = 0;
        }
    };

    ParticlePool.prototype.draw = function (context, image) {
        // Draw active particles
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
                particles[i].draw(context, image);
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
                particles[i].draw(context, image);
            for (i = 0; i < firstFree; i++)
                particles[i].draw(context, image);
        }
    };

    return ParticlePool;
})();

// Hàm vẽ canvas (cần implement)
function drawOnCanvas() {
    // TODO: Implement canvas drawing for particle effects
    console.log("Canvas drawing function called");
}
