const fs = require('fs');
const path = require('path');

const frames = JSON.parse(fs.readFileSync(path.join(__dirname, 'frames_data.json')));

const maxW = 426;
const maxH = 452;
const centerX = maxW / 2;
const centerY = maxH / 2;

const centeredFrames = frames.map(frame => {
    const frameDots = frame.points;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    frameDots.forEach(dot => {
        if (dot.x < minX) minX = dot.x;
        if (dot.x > maxX) maxX = dot.x;
        if (dot.y < minY) minY = dot.y;
        if (dot.y > maxY) maxY = dot.y;
    });
    
    const frameCX = (minX + maxX) / 2;
    const frameCY = (minY + maxY) / 2;
    
    const offsetX = centerX - frameCX;
    const offsetY = centerY - frameCY;
    
    return frameDots.map(dot => ({
        x: dot.x + offsetX,
        y: dot.y + offsetY,
        r: dot.r
    }));
});

function generateGridVariant(filename, options) {
    const { duration, easing, stagger, noGrowth } = options;
    const numFrames = centeredFrames.length;
    const totalDuration = duration * numFrames;
    
    let svg = `<svg width="${maxW}" height="${maxH}" viewBox="0 0 ${maxW} ${maxH}" fill="none" xmlns="http://www.w3.org/2000/svg">
<style>
  .dot {
    fill: #FFFEFE;
    stroke: white;
    stroke-width: 2;
  }
`;

    for (let i = 0; i < 16; i++) {
        const delay = (i * stagger) / 1000;
        svg += `  .dot-${i} { animation: anim-${i} ${totalDuration}s ${easing} ${delay}s infinite; }
`;
        svg += `  @keyframes anim-${i} {
`;
        
        for (let f = 0; f <= numFrames; f++) {
            const frameIdx = f % numFrames;
            const percent = (f / numFrames) * 100;
            const nextPercent = percent + (100 / numFrames) * 0.8; // Hold for 80% of the slot
            
            const dot = centeredFrames[frameIdx][i];
            const r = (noGrowth) ? 4.726 : dot.r;
            
            svg += `    ${percent.toFixed(2)}%, ${nextPercent.toFixed(2)}% { transform: translate(${dot.x.toFixed(2)}px, ${dot.y.toFixed(2)}px); r: ${r.toFixed(2)}; }
`;
        }
        svg += `  }
`;
    }

    svg += `</style>
`;
    
    for (let i = 0; i < 16; i++) {
        svg += `  <circle class="dot dot-${i}" cx="0" cy="0" r="4.726" />
`;
    }
    
    svg += `</svg>`;
    fs.writeFileSync(path.join(__dirname, filename), svg);
}

// Variant 1: Snappy Stagger
generateGridVariant('grid-variant-snappy.svg', {
    duration: 1.2,
    easing: 'cubic-bezier(0.5, 0, 0.1, 1)',
    stagger: 20,
    noGrowth: true
});

// Variant 2: Bouncy Elastic
generateGridVariant('grid-variant-bouncy.svg', {
    duration: 1.5,
    easing: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    stagger: 40,
    noGrowth: true
});

// Variant 3: Fluid Flow
generateGridVariant('grid-variant-fluid.svg', {
    duration: 2.0,
    easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
    stagger: 10,
    noGrowth: true
});

console.log('Generated snappy, bouncy, and fluid grid variants!');
