const fs = require('fs');

const framesDataPath = 'frames_data.js';
let content = fs.readFileSync(framesDataPath, 'utf8');

// Strip the "const framesData = " part to parse it natively
const jsonStr = content.replace('const framesData = ', '').trim().replace(/;$/, '');
let frames = JSON.parse(jsonStr);

// We need to replace Phase 5 (index 4) with Phase 4 (index 3), 
// but scale the points to make them appear "closer" and bigger,
// and keep the Phase 5 text.

const phase4 = frames[3];
const phase5 = frames[4];

// Clone phase 4 points
const newPhase5Points = phase4.points.map(pt => {
    // To make them look closer/bigger, we can scale their distance from the center (0,0)
    // Let's scale by 1.6x
    const scaleFactor = 1.6;
    return {
        x: pt.x * scaleFactor,
        y: pt.y * scaleFactor
    };
});

// Construct new phase 5
const newPhase5 = {
    name: phase5.name,
    viewBox: phase4.viewBox, // Use phase 4's viewBox just in case
    points: newPhase5Points,
    textNode: phase5.textNode // Keep phase 5 text
};

// Replace phase 5
frames[4] = newPhase5;

fs.writeFileSync(framesDataPath, `const framesData = ${JSON.stringify(frames, null, 2)};\n`);
console.log('Updated Phase 5 to be a scaled-up Phase 4 with Phase 5 text.');