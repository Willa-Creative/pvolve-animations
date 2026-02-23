const fs = require('fs');
const path = require('path');

const framesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'frames_data.json')));

let svg = `<svg width="426" height="452" viewBox="0 0 426 452" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
    <circle id="dot" cx="0" cy="0" r="4.726" fill="#FFFEFE" stroke="white" stroke-width="2"/>
</defs>
<style>
  .text {
    opacity: 0;
    animation: fadeText 12s ease-in-out infinite;
  }
  .f0 { animation-delay: 0s; }
  .f1 { animation-delay: 2.4s; }
  .f2 { animation-delay: 4.8s; }
  .f3 { animation-delay: 7.2s; }
  .f4 { animation-delay: 9.6s; }

  @keyframes fadeText {
    0%, 15% { opacity: 1; }
    20%, 95% { opacity: 0; }
    100% { opacity: 1; }
  }
`;

function extractTextPaths(content, dx, dy) {
    const paths = [];
    const pathRegex = /<path d="([^"]+)"[^>]*>/g;
    let match;
    while ((match = pathRegex.exec(content)) !== null) {
        if (match[1].length > 250) {
            paths.push(`    <path d="${match[1]}" fill="#FFFEFE" transform="translate(${dx}, ${dy})" />`);
        }
    }
    return paths.join('\n');
}

const frameSizes = [
    {w: 206, h: 206},
    {w: 204, h: 206},
    {w: 224, h: 222},
    {w: 272, h: 288},
    {w: 426, h: 452}
];

const maxW = 426, maxH = 452;
const cx = maxW / 2, cy = maxH / 2;

for (let i = 0; i < 16; i++) {
    // stagger the dots by a small amount
    const delay = i * 0.05;
    svg += `  .dot${i} { animation: moveDot${i} 12s cubic-bezier(0.65, 0, 0.35, 1) infinite; animation-delay: ${delay}s; }\n`;
    svg += `  @keyframes moveDot${i} {\n`;
    
    for (let f = 0; f < 5; f++) {
        const offset = frameSizes[f];
        const dx = cx - offset.w / 2;
        const dy = cy - offset.h / 2;
        const pt = framesData[f][i];
        const x = pt.x + dx;
        const y = pt.y + dy;
        const scale = pt.r / 4.726;
        
        const startPercent = f * 20;
        const endPercent = startPercent + 15;
        
        if (f === 0) {
            // dots start out as square, coming out from nothing
            svg += `    0% { transform: translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(0); }\n`;
            svg += `    4%, 15% { transform: translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale.toFixed(2)}); }\n`;
        } else {
            // increase zoom towards like 3d for the last frame
            const finalScale = f === 4 ? scale * 1.1 : scale;
            svg += `    ${startPercent}%, ${endPercent}% { transform: translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${finalScale.toFixed(2)}); }\n`;
        }
    }
    
    // reset to start
    const offset0 = frameSizes[0];
    const dx0 = cx - offset0.w / 2;
    const dy0 = cy - offset0.h / 2;
    const pt0 = framesData[0][i];
    const x0 = pt0.x + dx0;
    const y0 = pt0.y + dy0;
    svg += `    100% { transform: translate(${x0.toFixed(2)}px, ${y0.toFixed(2)}px) scale(0); }\n`;
    svg += `  }\n`;
}

svg += `</style>\n`;

// Add text layers
for (let i = 0; i < 5; i++) {
    const frameContent = fs.readFileSync(path.join(__dirname, 'frames', `${i + 1}.svg`), 'utf8');
    const offset = frameSizes[i];
    const dx = cx - offset.w / 2;
    const dy = cy - offset.h / 2;
    
    svg += `<g class="text f${i}">\n`;
    svg += extractTextPaths(frameContent, dx, dy) + '\n';
    svg += `</g>\n`;
}

// Add moving dots
svg += `<g class="dots">\n`;
for (let i = 0; i < 16; i++) {
    svg += `  <use href="#dot" class="dot${i}" />\n`;
}
svg += `</g>\n`;

svg += `</svg>`;

fs.writeFileSync(path.join(__dirname, 'grid.svg'), svg);
console.log('Successfully generated new grid SVG!');
