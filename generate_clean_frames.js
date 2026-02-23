const fs = require('fs');

const frames = JSON.parse(fs.readFileSync('extracted_frames.json', 'utf8'));

const cleanFrames = frames.map(frame => {
  const vb = frame.viewBox.split(' ').map(Number);
  const cx = vb[0] + vb[2] / 2;
  const cy = vb[1] + vb[3] / 2;

  const points = [];
  
  // parse circles
  frame.circles.forEach(circleStr => {
    const cxMatch = circleStr.match(/cx="([^"]+)"/);
    const cyMatch = circleStr.match(/cy="([^"]+)"/);
    const transformMatch = circleStr.match(/transform="([^"]+)"/);
    
    let x = parseFloat(cxMatch[1]);
    let y = parseFloat(cyMatch[1]);
    
    if (transformMatch) {
      const t = transformMatch[1];
      if (t.startsWith('matrix')) {
        const m = t.match(/matrix\(([^)]+)\)/)[1].split(/[ ,]+/).map(Number);
        const nx = m[0] * x + m[2] * y + m[4];
        const ny = m[1] * x + m[3] * y + m[5];
        x = nx;
        y = ny;
      } else if (t.startsWith('rotate')) {
        const r = t.match(/rotate\(([^)]+)\)/)[1].split(/[ ,]+/).map(Number);
        const angle = r[0] * Math.PI / 180;
        const rx = r[1] || 0;
        const ry = r[2] || 0;
        const dx = x - rx;
        const dy = y - ry;
        const nx = dx * Math.cos(angle) - dy * Math.sin(angle) + rx;
        const ny = dx * Math.sin(angle) + dy * Math.cos(angle) + ry;
        x = nx;
        y = ny;
      }
    }
    
    points.push({ x: x - cx, y: y - cy });
  });

  // parse paths
  let textNode = "";
  let pathCircles = [];
  
  // in frame 5 there are paths that are circles.
  frame.paths.forEach(pathStr => {
      // Very long paths are text. Short ones are circles.
      if (pathStr.length > 500) {
          textNode = pathStr;
      } else {
          // It's a circle. Let's find its center.
          // e.g., <path d="M68 226C68 230.473 64.5891 234 60.5 234C56.4109 234 .../>
          // we can just average the coordinates
          const coords = pathStr.match(/[-+]?\d*\.?\d+/g).map(Number);
          let minX = Infinity, maxX = -Infinity;
          let minY = Infinity, maxY = -Infinity;
          
          // roughly extract bounding box
          for(let i=0; i<coords.length; i+=2) {
              if (coords[i] < minX) minX = coords[i];
              if (coords[i] > maxX) maxX = coords[i];
              if (coords[i+1] < minY) minY = coords[i+1];
              if (coords[i+1] > maxY) maxY = coords[i+1];
          }
          const px = (minX + maxX) / 2;
          const py = (minY + maxY) / 2;
          points.push({ x: px - cx, y: py - cy });
      }
  });

  return {
    name: frame.file,
    viewBox: frame.viewBox,
    points,
    textNode
  };
});

fs.writeFileSync('frames_data.js', `const framesData = ${JSON.stringify(cleanFrames, null, 2)};\n`);
console.log('Cleaned frames written to frames_data.js');
