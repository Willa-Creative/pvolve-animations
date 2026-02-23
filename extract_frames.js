const fs = require('fs');
const path = require('path');

const framesDir = path.join(__dirname, 'frames');
const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.svg')).sort((a,b) => parseInt(a) - parseInt(b));

const framesData = [];

frameFiles.forEach(file => {
    const content = fs.readFileSync(path.join(framesDir, file), 'utf-8');
    
    // Extract circles
    const circleRegex = /<circle[^>]+>/g;
    const circles = [];
    let match;
    while ((match = circleRegex.exec(content)) !== null) {
        circles.push(match[0]);
    }
    
    // Extract paths (text)
    const pathRegex = /<path[^>]+>/g;
    const paths = [];
    while ((match = pathRegex.exec(content)) !== null) {
        paths.push(match[0]);
    }

    // Extract viewBox
    const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '';

    framesData.push({
        file,
        circles,
        paths,
        viewBox
    });
});

fs.writeFileSync('extracted_frames.json', JSON.stringify(framesData, null, 2));
console.log('Extracted frames to extracted_frames.json');
