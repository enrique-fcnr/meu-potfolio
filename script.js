// Animação do Header ao mover o mouse
const header = document.getElementById('header');
const headerContent = header.querySelector('.header-content');

// Configuração do Canvas para o campo de estrelas
const canvas = document.getElementById('starfield-canvas');
const ctx = canvas.getContext('2d');
let stars = [];
const starCount = 300;
let mouseX = 0;
let mouseY = 0;

function initStars() {
    canvas.width = header.offsetWidth;
    canvas.height = header.offsetHeight;
    stars = [];
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.1 + 0.05,
            opacity: Math.random(),
        });
    }
}

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateStars() {
    // Efeito de paralaxe baseado na posição do mouse
    const dx = (mouseX - canvas.width / 2) * 0.01;
    const dy = (mouseY - canvas.height / 2) * 0.01;

    stars.forEach(star => {
        star.x += star.speed * dx;
        star.y += star.speed * dy;
        
        // Animação de movimento contínuo
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
        }
    });
}

function animate() {
    updateStars();
    drawStars();
    requestAnimationFrame(animate);
}

window.onload = function() {
    initStars();
    animate();
};

window.addEventListener('resize', initStars);

// Movimento do mouse
header.addEventListener('mousemove', (e) => {
    const rect = header.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    // Efeito 3D de inclinação do conteúdo
    const x = mouseX - rect.width / 2;
    const y = mouseY - rect.height / 2;
    const rotationY = x / 40;
    const rotationX = -y / 40;
    headerContent.style.transform = `translateZ(10px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
});

// Restaura a posição quando o mouse sai
header.addEventListener('mouseleave', () => {
    headerContent.style.transform = 'translateZ(0) rotateX(0) rotateY(0)';
    mouseX = canvas.width / 2;
    mouseY = canvas.height / 2;
});

// Animação de Scroll usando Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Opcional: Para animações que só acontecem uma vez
            // observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1 // A animação dispara quando 10% do elemento está visível
});

document.querySelectorAll('.fade-in-on-scroll').forEach(element => {
    observer.observe(element);
});

// Função para converter PCM para WAV
function pcmToWav(pcmData, sampleRate) {
    const numSamples = pcmData.length;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // RIFF chunk
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');
    
    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    
    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // write the PCM samples
    for (let i = 0; i < numSamples; i++) {
        view.setInt16(44 + i * 2, pcmData[i], true);
    }
    
    return new Blob([view], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}





    // Oculta o indicador de carregamento e mostra o texto do botão
    loadingIndicator.classList.add('hidden');
    buttonText.classList.remove('hidden');
    button.disabled = false;
