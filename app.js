const quoteInput = document.getElementById('quote-input');
const outputCanvas = document.getElementById('output-canvas');
const ctx = outputCanvas.getContext('2d');
const downloadBtn = document.getElementById('download-btn');

const backgroundOptions = document.getElementsByName('background');
const boldOption = document.getElementById('bold');
const italicOption = document.getElementById('italic');

for (const option of backgroundOptions) {
    option.addEventListener('change', () => {
        generateImage();
    });
}

boldOption.addEventListener('change', () => {
    generateImage();
});

italicOption.addEventListener('change', () => {
    generateImage();
});

quoteInput.addEventListener('input', () => {
    generateImage();
});

downloadBtn.addEventListener('click', () => {
    outputCanvas.toBlob(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'quote_image.png';
        link.click();
    });
});

function getSelectedBackground() {
    for (const option of backgroundOptions) {
        if (option.checked) {
            return parseInt(option.value);
        }
    }
}

function createGradient(background) {
    const gradient = ctx.createLinearGradient(0, 0, 1200, 628);
    if (background === 1) {
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(1, '#fad0c4');
    } else {
        gradient.addColorStop(0, '#84fab0');
        gradient.addColorStop(1, '#8fd3f4');
    }
    return gradient;
}

function wrapText(context, text, maxWidth, maxHeight, lineHeight) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    const maxLines = Math.floor(maxHeight / lineHeight);

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            if (lines.length < maxLines - 1) {
                lines.push(line);
            } else {
                // Truncate the text if it exceeds the maximum number of lines
                line = line.trim() + '...';
                lines.push(line);
                break;
            }
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    if (lines.length < maxLines) {
        lines.push(line);
    }
    return lines;
}


function drawTextWithLineHeight(context, textLines, x, y, lineHeight) {
    for (let i = 0; i < textLines.length; i++) {
        context.fillText(textLines[i], x, y + i * lineHeight);
    }
}

function generateImage() {
    const quoteText = quoteInput.value;
    if (!quoteText) {
        downloadBtn.disabled = true;
        return;
    }

    // Set canvas dimensions
    outputCanvas.width = 1200;
    outputCanvas.height = 628;

    // Draw background gradient
    const selectedBackground = getSelectedBackground();
    const gradient = createGradient(selectedBackground);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 628);

    // Set text style
    const isBold = boldOption.checked;
    const isItalic = italicOption.checked;
    let fontStyle = '';

    fontStyle += isBold ? 'bold ' : '';
    fontStyle += isItalic ? 'italic ' : '';

    ctx.font = fontStyle + '40px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text with word wrapping
    const maxWidth = 1000; // Maximum width of the text area
    const maxHeight = 500; // Maximum height of the text area
    const lineHeight = 48; // Line height for word wrapping
    const padding = 20; // Padding between text and canvas edges
    const lines = wrapText(ctx, quoteText, maxWidth - padding * 2, maxHeight - padding * 2, lineHeight);

    const textAreaHeight = lines.length * lineHeight;
    const textY = (outputCanvas.height - textAreaHeight) / 2;

    drawTextWithLineHeight(ctx, lines, outputCanvas.width / 2, textY, lineHeight);

    // Enable downloading of the image
    downloadBtn.disabled = false;
}

// Initial image generation
generateImage();
