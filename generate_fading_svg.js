const fs = require('fs');
const path = require('path');

const framesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'frames_data.json')));

let svg = `<svg width="426" height="452" viewBox="0 0 426 452" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
    <circle id="dot" cx="0" cy="0" r="4.726" fill="#FFFEFE" stroke="white" stroke-width="2"/>
</defs>
<style>
  .frame {
    opacity: 0;
    animation: fadeFrame 10s ease-in-out infinite;
  }
  .f0 { animation-delay: 0s; }
  .f1 { animation-delay: -8s; }
  .f2 { animation-delay: -6s; }
  .f3 { animation-delay: -4s; }
  .f4 { animation-delay: -2s; }

  @keyframes fadeFrame {
    0% { opacity: 0; }
    5%, 20% { opacity: 1; }
    25%, 100% { opacity: 0; }
  }
</style>
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

for (let i = 0; i < 5; i++) {
    const frameContent = fs.readFileSync(path.join(__dirname, 'frames', `${i + 1}.svg`), 'utf8');
    const offset = frameSizes[i];
    const dx = cx - offset.w / 2;
    const dy = cy - offset.h / 2;
    
    svg += `\n<g class="frame f${i}">\n`;
    svg += extractTextPaths(frameContent, dx, dy) + '\n';
    
    // Add the mapped dots
    framesData[i].forEach(pt => {
        const x = pt.x + dx;
        const y = pt.y + dy;
        svg += `    <use href="#dot" x="${x.toFixed(2)}" y="${y.toFixed(2)}" />\n`;
    });
    
    svg += `</g>\n`;
}

svg += `</svg>`;

fs.writeFileSync(path.join(__dirname, 'grid-interpolated.svg'), svg);
console.log('Successfully generated fading grid SVG!');
