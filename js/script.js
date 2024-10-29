// Seleciona o canvas e o contexto
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Variáveis globais
let backgroundStars = [];
let constellationStars = [];
let lineProgress = {}; // Agora um objeto para controlar o progresso de cada letra
let mouse = { x: null, y: null };
const messages = [
  'Você é incrível!',
  'Nossa amizade é especial.',
  'Obrigado por estar sempre presente.',
  'Você ilumina meus dias.',
  'Adoro passar tempo com você.'
];

// Variáveis para a segunda mensagem com fade-in
let messageOpacity = 0; // Opacidade inicial da segunda mensagem
const maxOpacity = 1; // Opacidade máxima
const fadeInSpeed = 0.02; // Velocidade do fade-in

// Defina o nome da sua amiga
const name = 'RAFAELA'; // Nome em letras maiúsculas

// Ajustar o tamanho do canvas para preencher a tela
resizeCanvas();

// Eventos de redimensionamento e mouse
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('click', handleClick);

// Função para redimensionar o canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawBackgroundStars();
  lineProgress = {}; // Resetar o progresso ao redimensionar
}

// Função para lidar com o movimento do mouse
function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
}

// Função para lidar com cliques no canvas
function handleClick(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  constellationStars.forEach((star, index) => {
    const dx = star.x - mouseX;
    const dy = star.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      showMessage(messages[index % messages.length], mouseX, mouseY);
    }
  });
}

// Função para desenhar as estrelas de fundo
function drawBackgroundStars() {
  backgroundStars = [];
  for (let i = 0; i < 200; i++) {
    backgroundStars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      brightness: Math.random() * 0.5 + 0.5
    });
  }
}

// Função principal de animação
function animateBackgroundStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Animação das estrelas de fundo
  backgroundStars.forEach(star => {
    // Calcular a distância entre o mouse e a estrela
    const dx = star.x - mouse.x;
    const dy = star.y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Se a estrela estiver próxima ao mouse, aumentar o brilho
    if (distance < 100) {
      star.brightness = 1;
    } else {
      // Ajuste suave do brilho
      star.brightness += (Math.random() - 0.5) * 0.05;
      if (star.brightness > 0.7) star.brightness = 0.7;
      if (star.brightness < 0.2) star.brightness = 0.2;
    }

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
    ctx.fill();
  });

  // Desenho da constelação
  drawConstellation();

  // Desenho do texto personalizado
  drawText();

  // Controlar o fade-in da segunda mensagem
  if (lineProgress && Object.keys(lineProgress).length === name.length) {
    // Verificar se todas as letras foram desenhadas
    if (messageOpacity < maxOpacity) {
      messageOpacity += fadeInSpeed;
      if (messageOpacity > maxOpacity) messageOpacity = maxOpacity;
    }
  }

  requestAnimationFrame(animateBackgroundStars);
}

// Função para desenhar a constelação
function drawConstellation() {
  constellationStars = []; // Limpar as estrelas da constelação

  const letters = getLetterCoordinates(name);
  const totalWidth = letters.length * 120; // Espaçamento entre letras
  const offsetX = (canvas.width - totalWidth) / 2;
  const offsetY = canvas.height / 2;

  letters.forEach((letter, index) => {
    lineProgress[index] = lineProgress[index] || 0; // Inicializar o progresso da letra
    const stars = [];

    letter.forEach(point => {
      const x = point.x + offsetX + index * 120;
      const y = point.y + offsetY;
      stars.push({ x, y });
      constellationStars.push({ x, y }); // Adicionar ao array de estrelas da constelação
      drawStar(x, y);
    });

    connectStars(stars, index);
  });
}

// Função para desenhar uma estrela individual
function drawStar(x, y) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.restore();
}

// Função para conectar as estrelas da constelação dentro de uma letra
function connectStars(stars, letterIndex) {
  if (stars.length < 2) return; // Não conectar se houver menos de 2 estrelas

  ctx.beginPath();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;

  let progress = lineProgress[letterIndex];
  const totalDistance = getTotalDistance(stars);

  for (let i = 0; i < stars.length - 1; i++) {
    const start = stars[i];
    const end = stars[i + 1];

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (progress >= distance) {
      progress -= distance;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
    } else {
      const angle = Math.atan2(dy, dx);
      const x = start.x + Math.cos(angle) * progress;
      const y = start.y + Math.sin(angle) * progress;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(x, y);
      break;
    }
  }

  ctx.stroke();

  if (lineProgress[letterIndex] < totalDistance) {
    lineProgress[letterIndex] += 2; // Velocidade do desenho das linhas
  }
}

// Função para calcular a distância total das linhas da constelação dentro de uma letra
function getTotalDistance(stars) {
  let distance = 0;
  for (let i = 0; i < stars.length - 1; i++) {
    const dx = stars[i + 1].x - stars[i].x;
    const dy = stars[i + 1].y - stars[i].y;
    distance += Math.sqrt(dx * dx + dy * dy);
  }
  return distance;
}

// Função para mostrar mensagens ao clicar nas estrelas da constelação
function showMessage(text, x, y) {
  ctx.save();
  ctx.fillStyle = '#FFD700';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y - 20);
  ctx.restore();

  // Fazer a mensagem desaparecer após alguns segundos
  setTimeout(() => {
    // Redesenhar a área onde a mensagem foi exibida
    ctx.clearRect(x - 100, y - 50, 200, 50);
  }, 2000);
}

// Função para desenhar o texto personalizado
function drawText() {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  
  // Primeira Mensagem
  ctx.fillText('Para minha melhor amiga, Rafaela', canvas.width / 2, canvas.height - 50);
  
  // Segunda Mensagem com Opacidade (Fade-In)
  ctx.globalAlpha = messageOpacity; // Aplica a opacidade
  ctx.fillText('Obg por tudoa rafa, eu te amo muiiito', canvas.width / 2, canvas.height - 20);
  
  ctx.restore();
}

// Função para obter coordenadas de letras manualmente
function getLetterCoordinates(text) {
  const letters = [];

  for (let char of text) {
    switch (char) {
      case 'R':
        letters.push(getLetterR());
        break;
      case 'A':
        letters.push(getLetterA());
        break;
      case 'F':
        letters.push(getLetterF());
        break;
      case 'E':
        letters.push(getLetterE());
        break;
      case 'L':
        letters.push(getLetterL());
        break;
      default:
        letters.push([]); // Adicionar um array vazio para caracteres não definidos
        break;
    }
  }

  return letters;
}

// Funções para definir as coordenadas de cada letra

function getLetterR() {
  const points = [
    { x: 0, y: 0 },
    { x: 0, y: -50 },
    { x: 30, y: -50 },
    { x: 40, y: -40 },
    { x: 30, y: -30 },
    { x: 0, y: -30 },
    { x: 30, y: -30 },
    { x: 50, y: 0 },
    // Diagonal da perna
    { x: 40, y: 10 },
    { x: 30, y: 20 },
    { x: 20, y: 30 } // Extensão para uma perna mais longa
  ];
  return points;
}

function getLetterA() {
  const points = [
    { x: 30, y: -50 }, // Topo da letra 'A'
    { x: 0, y: 0 },    // Base esquerda
    { x: 60, y: 0 },   // Base direita
    { x: 30, y: -50 }, // Volta ao topo
    { x: 20, y: -25 }, // Barra esquerda
    { x: 40, y: -25 }  // Barra direita
  ];
  return points;
}

function getLetterF() {
  const points = [
    { x: 0, y: 0 },
    { x: 0, y: -50 },
    { x: 30, y: -50 },
    { x: 0, y: -25 },
    { x: 25, y: -25 }
  ];
  return points;
}

function getLetterE() {
  const points = [
    { x: 0, y: 0 },
    { x: 0, y: -50 },
    { x: 30, y: -50 },
    { x: 0, y: -25 },
    { x: 25, y: -25 },
    { x: 0, y: 0 },
    { x: 30, y: 0 }
  ];
  return points;
}

function getLetterL() {
  const points = [
    { x: 0, y: -50 },
    { x: 0, y: 0 },
    { x: 30, y: 0 }
  ];
  return points;
}

// Iniciar a animação
drawBackgroundStars();
animateBackgroundStars();
