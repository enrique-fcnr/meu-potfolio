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

// Dicionário de descrições de projetos
const projectDescriptions = {
    'project2': "Este é o projeto de Sistema de Notas de Aluno. É um sistema individual que estou desenvolvendo com Java e Spring Boot. O projeto aplica os princípios de orientação a objetos e arquitetura em camadas, com foco em back-end para cadastro de notas e checagem de aprovação. Ele é um exemplo prático do meu conhecimento em desenvolvimento de software e fundamentos de programação.",
    'project3': "Este é o projeto de Estimativa de Custo de Combustível. Um projeto individual em andamento, também em Java e Spring Boot. O objetivo é criar um sistema para estimar custos, com estudo de integração com serviços AWS, como EC2 e RDS. Este projeto demonstra minha proatividade em expandir meus conhecimentos para a área de cloud computing e infraestrutura.",
    'project4': "Este é o projeto de Análise de Sentimentos. Um modelo de machine learning para analisar e classificar o sentimento de textos, como avaliações de clientes ou posts em redes sociais. Este projeto demonstra minha capacidade de trabalhar com dados, aplicar conceitos de machine learning e criar ferramentas poderosas para análise de informações."
};

// Função para gerar e reproduzir áudio com exponential backoff
async function generateAndPlayAudio(projectId) {
    const projectContainer = document.querySelector(`[data-project-id="${projectId}"]`);
    const button = projectContainer.querySelector('button');
    const audioPlayer = projectContainer.querySelector('audio');
    const loadingIndicator = projectContainer.querySelector('.loading-indicator');
    const buttonText = projectContainer.querySelector('.button-text');
    
    const description = projectDescriptions[projectId] || "Descrição do projeto não encontrada.";

    // Oculta o texto do botão e mostra o indicador de carregamento
    buttonText.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
    button.disabled = true;

    const payload = {
        contents: [{
            parts: [{ text: description }]
        }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Iapetus" }
                }
            }
        },
        model: "gemini-2.5-flash-preview-tts"
    };

    const apiKey = ""; // A chave da API será fornecida em tempo de execução
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

    let retryCount = 0;
    const maxRetries = 5;

    while (retryCount < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;

            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)[1], 10);
                const pcmData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
                const pcm16 = new Int16Array(pcmData.buffer);

                const wavBlob = pcmToWav(pcm16, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                
                audioPlayer.src = audioUrl;
                audioPlayer.play();
                break; // Sai do loop de retentativas
            } else {
                throw new Error("Resposta da API de áudio inesperada ou incompleta.");
            }
        } catch (error) {
            console.error("Falha ao gerar áudio:", error);
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`Retentando em ${delay / 1000} segundos... (Tentativa ${retryCount} de ${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // Oculta o indicador de carregamento e mostra o texto do botão
    loadingIndicator.classList.add('hidden');
    buttonText.classList.remove('hidden');
    button.disabled = false;
}
