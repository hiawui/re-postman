import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建简单的 PNG 图标（使用 Base64 编码的简单图标）
function createSimpleRIcon(size) {
  // 这是一个简单的蓝色圆形背景 + 白色 R 字母的图标
  // 由于无法直接生成 PNG，我们创建一个简单的 SVG 作为替代
  const fontSize = Math.floor(size * 0.6);
  const strokeWidth = Math.max(1, Math.floor(size * 0.05));
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1890ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#096dd9;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景圆形 -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - strokeWidth}" 
          fill="url(#grad1)" stroke="#ffffff" stroke-width="${strokeWidth}"/>
  
  <!-- 字母 R -->
  <text x="${size/2}" y="${size/2 + fontSize/3}" 
        font-family="Arial, sans-serif" font-size="${fontSize}" 
        font-weight="bold" text-anchor="middle" fill="#ffffff">
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
  const svgContent = createSimpleRIcon(size);
  const fileName = `icon${size}.svg`;
  const filePath = path.join(iconsDir, fileName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ 生成图标: ${fileName} (${size}x${size})`);
});

console.log('\n🎨 所有图标已生成完成！');
console.log('📁 图标位置:', iconsDir);
console.log('\n📋 下一步:');
console.log('1. 使用在线工具将 SVG 转换为 PNG');
console.log('2. 或者使用浏览器开发者工具转换');
console.log('3. 更新 manifest.json 中的图标路径');
console.log('4. 重新构建项目: npm run build');

console.log('\n🔧 手动转换方法:');
console.log('1. 在浏览器中打开 SVG 文件');
console.log('2. 右键点击图片，选择"另存为"');
console.log('3. 选择 PNG 格式保存');
console.log('4. 重命名为 icon{size}.png'); 