document.getElementById('year').textContent = new Date().getFullYear();

const root = document.documentElement;
const mark = document.getElementById('monogram-text');
const monogram = document.querySelector('.monogram');
const hitCanvas = document.createElement('canvas');
const hitContext = hitCanvas.getContext('2d', { willReadFrequently: true });

function drawHitArea(left, baseline, fontSize) {
  hitCanvas.width = monogram.clientWidth;
  hitCanvas.height = monogram.clientHeight;
  hitContext.clearRect(0, 0, hitCanvas.width, hitCanvas.height);
  hitContext.font = `800 ${fontSize}px Manrope`;
  hitContext.textBaseline = 'alphabetic';
  hitContext.fillText('J', left, baseline);
}

function fitMonogram() {
  if (window.innerWidth <= 650) {
    const left = window.innerWidth * 0.06;
    mark.setAttribute('x', left);
    mark.setAttribute('y', '124');
    mark.setAttribute('font-size', '150');
    drawHitArea(left, 124, 150);
    return;
  }

  const edgeGap = Math.max(16, Math.min(window.innerWidth * 0.02, 34));
  const sampleSize = 1000;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `800 ${sampleSize}px Manrope`;
  const bounds = context.measureText('J');
  const scale = (window.innerHeight - edgeGap * 2) / (bounds.actualBoundingBoxAscent + bounds.actualBoundingBoxDescent);
  const fontSize = sampleSize * scale;
  const left = edgeGap - bounds.actualBoundingBoxLeft * scale;
  const baseline = edgeGap + bounds.actualBoundingBoxAscent * scale;
  const markRight = left + bounds.actualBoundingBoxRight * scale;

  mark.setAttribute('x', left.toFixed(2));
  mark.setAttribute('y', baseline.toFixed(2));
  mark.setAttribute('font-size', fontSize.toFixed(2));
  root.style.setProperty('--mark-space', `${Math.ceil(markRight + edgeGap)}px`);
  drawHitArea(left, baseline, fontSize);
}

document.fonts.ready.then(fitMonogram);
window.addEventListener('resize', fitMonogram);

monogram.addEventListener('pointermove', (event) => {
  const box = monogram.getBoundingClientRect();
  const x = Math.floor(event.clientX - box.left);
  const y = Math.floor(event.clientY - box.top);
  let isOverLetter = false;

  for (let offsetY = -1; offsetY <= 1 && !isOverLetter; offsetY += 1) {
    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
      if (x + offsetX >= 0 && y + offsetY >= 0 && x + offsetX < hitCanvas.width && y + offsetY < hitCanvas.height) {
        isOverLetter = hitContext.getImageData(x + offsetX, y + offsetY, 1, 1).data[3] > 20;
      }
      if (isOverLetter) break;
    }
  }
  mark.classList.toggle('is-highlighted', isOverLetter);
});

monogram.addEventListener('pointerleave', () => mark.classList.remove('is-highlighted'));
