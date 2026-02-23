const fs = require('fs');
const path = require('path');

function parseTransform(transformStr, cx, cy) {
    if (!transformStr) return { x: cx, y: cy };
    let x = cx, y = cy;
    
    const matrixMatch = transformStr.match(/matrix\(([^)]+)\)/);
    if (matrixMatch) {
        const [a, b, c, d, e, f] = matrixMatch[1].split(/[ ,]+/).map(Number);
        const nx = a * x + c * y + e;
        const ny = b * x + d * y + f;
        x = nx; y = ny;
    }
    
    const rotateMatch = transformStr.match(/rotate\(([^)]+)\)/);
    if (rotateMatch) {
        const parts = rotateMatch[1].split(/[ ,]+/).map(Number);
        const angle = parts[0] * Math.PI / 180;
        const rx = parts[1] || 0;
        const ry = parts[2] || 0;
        const dx = x - rx;
        const dy = y - ry;
        x = rx + dx * Math.cos(angle) - dy * Math.sin(angle);
        y = ry + dx * Math.sin(angle) + dy * Math.cos(angle);
    }
    return { x, y };
}

function extractDots(file) {
    const content = fs.readFileSync(file, 'utf8');
    const dots = [];
    
    const circleRegex = /<circle[^>]+cx="([^"]+)"[^>]+cy="([^"]+)"[^>]+r="([^"]+)"(?:[^>]+transform="([^"]+)")?[^>]*>/g;
    let match;
    while ((match = circleRegex.exec(content)) !== null) {
        const cx = Number(match[1]);
        const cy = Number(match[2]);
        const r = Number(match[3]);
        const transform = match[4];
        const pos = parseTransform(transform, cx, cy);
        dots.push({ x: pos.x, y: pos.y, r });
    }
    
    // extract paths that are circles
    const pathRegex = /<path d="([^"]+)"[^>]*>/g;
    while ((match = pathRegex.exec(content)) !== null) {
        const d = match[1];
        if (d.length > 250) continue; // skip text paths
        if (!d.includes('C')) continue;
        
        const coords = d.match(/[-0-9.]+/g).map(Number);
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < coords.length; i += 2) {
            // Very rough bounding box approximation
            const x = coords[i];
            const y = coords[i+1];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        // for paths representing circles, max and min give the diameter
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const r = (maxX - minX) / 2;
        dots.push({ x: cx, y: cy, r });
    }

    // Sort dots so we can match them between frames consistently.
    // Sorting by Y then X
    return dots.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 5) return a.y - b.y;
        return a.x - b.x;
    });
}

const frames = [1, 2, 3, 4, 5].map(i => {
    return extractDots(path.join(__dirname, 'frames', `${i}.svg`));
});

fs.writeFileSync(path.join(__dirname, 'frames_data.json'), JSON.stringify(frames, null, 2));
console.log('Extracted frames data:', frames.map(f => f.length).join(', '));
