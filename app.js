const elements = {
    quoteInput: document.getElementById('quote-input'),
    outputCanvas: document.getElementById('output-canvas'),
    // downloadBtn: document.getElementById('download-btn'),
    copyBtn: document.getElementById('copy-btn'),
    backgroundOptionsContainer: document.getElementById('background-options'),
};

const ctx = elements.outputCanvas.getContext('2d');
elements.outputCanvas.width = config.canvasWidth;
elements.outputCanvas.height = config.canvasHeight;

// elements.maxWidth.width = config.maxWidth;
// elements.maxHeight.height = config.maxHeight;

elements.quoteInput.addEventListener('input', generateImage);
elements.quoteInput.addEventListener('paste', () => {
  setTimeout(generateImage, 0);
});
elements.quoteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cursorPosition = elements.quoteInput.selectionStart;
      elements.quoteInput.value = elements.quoteInput.value.slice(0, cursorPosition) + '\n' + elements.quoteInput.value.slice(cursorPosition);
      elements.quoteInput.selectionStart = elements.quoteInput.selectionEnd = cursorPosition + 1;
    }
    setTimeout(generateImage, 0);
  });
  



// elements.downloadBtn.addEventListener('click', downloadImage);
elements.copyBtn.addEventListener('click', copyImageToClipboard);

generateGradientButtons();
generateImage();

function drawText() {
    const text = elements.quoteInput.value.trim() || config.text.default;
    const lines = splitTextIntoLines(text);
    const fontSize = calculateFontSize(lines);
    const lineHeight = fontSize + 12;
  
    ctx.font = `${fontSize}px 'Poppins', sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const y = elements.outputCanvas.height / 2 - ((lines.length - 1) * lineHeight) / 2 + i * lineHeight;
      ctx.fillText(line, elements.outputCanvas.width / 2, y);
    }
  }
  
  function calculateFontSize(lines) {
    let fontSize = config.maxFontSize;
  
    while (fontSize >= config.minFontSize) {
      ctx.font = `${fontSize}px 'Poppins', sans-serif`;
      const isTextWidthExceeded = lines.some(line => ctx.measureText(line).width > elements.outputCanvas.width - 2 * config.padding);
      const lineHeight = fontSize + 12;
      const totalHeight = lines.length * lineHeight;
  
      if (!isTextWidthExceeded && totalHeight <= elements.outputCanvas.height - 2 * config.padding) {
        return fontSize;
      }
  
      fontSize -= 1;
    }
  
    return config.minFontSize;
  }
  

  function splitTextIntoLines(text) {
    const paragraphs = text.split('\n');
    const lines = [];
  
    paragraphs.forEach(paragraph => {
      const words = paragraph.split(' ');
      let currentLine = words[0];
  
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
  
        if (width < elements.outputCanvas.width - 2 * config.padding) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
  
      lines.push(currentLine);
    });
  
    return lines;
  }
  

function generateImage() {
    drawBackground();
    drawText();
}

async function downloadImage() {
    elements.outputCanvas.toBlob(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'quote_image.png';
        link.click();
    });
}

async function copyImageToClipboard() {
    const dataUrl = elements.outputCanvas.toDataURL();
    const imgBlob = await (await fetch(dataUrl)).blob();
    const clipboardItem = new ClipboardItem({ 'image/png': imgBlob });
    await navigator.clipboard.write([clipboardItem]);
}

// Restored gradient background functions
function generateGradientButtons() {
    config.gradients.forEach(gradient => {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'background';
        input.value = gradient.id;
        input.id = 'background' + gradient.id;
        input.checked = gradient.id === 1;
        input.addEventListener('change', () => {
            generateImage();
        });
        const label = document.createElement('label');
        label.htmlFor = 'background' + gradient.id;
        label.style.background = `linear-gradient(135deg, ${gradient.colors[0]} 0%, ${gradient.colors[1]} 100%)`;
        label.style.width = '30px';
        label.style.height = '30px';
        label.style.cursor = 'pointer';
        label.style.border = '1px solid transparent';
        label.style.backgroundSize = 'cover';
        label.style.marginRight = '5px';
        label.style.borderRadius = '5px';

        elements.backgroundOptionsContainer.appendChild(input);
        elements.backgroundOptionsContainer.appendChild(label);
    });
}

function getSelectedBackground() {
    const backgroundOptions = document.getElementsByName('background');
    for (const option of backgroundOptions) {
        if (option.checked) {
            return config.gradients.find(gradient => gradient.id === parseInt(option.value));
        }
    }
}

function createGradient(background) {
    const gradient = ctx.createLinearGradient(0, 0, elements.outputCanvas.width, elements.outputCanvas.height);
    gradient.addColorStop(0, background.colors[0]);
    gradient.addColorStop(1, background.colors[1]);
    return gradient;
}

function drawBackground() {
    const background = getSelectedBackground();
    const gradient = createGradient(background);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, elements.outputCanvas.width, elements.outputCanvas.height);
}