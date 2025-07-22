import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 SVG 图标内容
function createRSVG(size) {
  const fontSize = Math.floor(size * 0.6);
  const strokeWidth = Math.max(2, Math.floor(size * 0.08));
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1890ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#096dd9;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- 背景圆形 -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - strokeWidth}" 
          fill="url(#grad1)" stroke="#ffffff" stroke-width="${strokeWidth}" 
          filter="url(#shadow)"/>
  
  <!-- 字母 R -->
  <text x="${size/2}" y="${size/2 + fontSize/3}" 
        font-family="Arial, sans-serif" font-size="${fontSize}" 
        font-weight="bold" text-anchor="middle" 
        fill="#ffffff" filter="url(#shadow)">
    R
  </text>
</svg>`;
}

// 生成不同尺寸的图标
const sizes = [16, 32, 48, 128];

// 确保 icons 目录存在
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 生成图标文件
sizes.forEach(size => {
  const svgContent = createRSVG(size);
  const fileName = `icon${size}.svg`;
  const filePath = path.join(iconsDir, fileName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ 生成图标: ${fileName} (${size}x${size})`);
});

console.log('\n🎨 所有图标已生成完成！');
console.log('📁 图标位置:', iconsDir);
console.log('\n📋 下一步:');
console.log('1. 将 SVG 转换为 PNG 格式');
console.log('2. 更新 manifest.json 中的图标路径');
console.log('3. 重新构建项目: npm run build'); 