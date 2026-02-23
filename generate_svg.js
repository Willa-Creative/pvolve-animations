const fs = require('fs');
const path = require('path');

const frames = JSON.parse(fs.readFileSync(path.join(__dirname, 'frames_data.json')));

// Let's find the maximum bounding box to center everything
let maxW = 426;
let maxH = 452;
let centerX = maxW / 2;
let centerY = maxH / 2;

// Center all frames based on their own bounding box
const centeredFrames = frames.map(frameDots => {
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

let svg = `<svg width="426" height="452" viewBox="0 0 426 452" fill="none" xmlns="http://www.w3.org/2000/svg">
<style>
  circle {
    fill: #FFFEFE;
    stroke: white;
    stroke-width: 2;
  }
</style>
`;

for (let i = 0; i < 16; i++) {
    // Ping-pong sequence to loop smoothly: 1 -> 2 -> 3 -> 4 -> 5 -> 4 -> 3 -> 2 -> 1
    const seq = [0, 1, 2, 3, 4, 3, 2, 1, 0];
    const cxVals = seq.map(f => centeredFrames[f][i].x.toFixed(2)).join(';');
    const cyVals = seq.map(f => centeredFrames[f][i].y.toFixed(2)).join(';');
    const rVals = seq.map(f => centeredFrames[f][i].r.toFixed(2)).join(';');
    
    const initX = centeredFrames[0][i].x.toFixed(2);
    const initY = centeredFrames[0][i].y.toFixed(2);
    const initR = centeredFrames[0][i].r.toFixed(2);
    
    svg += `  <circle cx="${initX}" cy="${initY}" r="${initR}">
    <animate attributeName="cx" values="${cxVals}" dur="8s" repeatCount="indefinite" />
    <animate attributeName="cy" values="${cyVals}" dur="8s" repeatCount="indefinite" />
    <animate attributeName="r" values="${rVals}" dur="8s" repeatCount="indefinite" />
  </circle>
`;
}
svg += `</svg>`;

fs.writeFileSync(path.join(__dirname, 'grid-interpolated.svg'), svg);
console.log('Successfully generated grid-interpolated.svg!');
