const fs = require('fs');
const path = require('path');

const framesDir = path.join(__dirname, 'frames');
const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.svg')).sort((a,b) => parseInt(a) - parseInt(b));

const framesData = [];

frameFiles.forEach(file => {
    const content = fs.readFileSync(path.join(framesDir, file), 'utf-8');
    framesData.push({
        file,
        content
    });
});

fs.writeFileSync('frames_data.js', `const framesData = ${JSON.stringify(framesData, null, 2)};\n`);
console.log('Created frames_data.js');
