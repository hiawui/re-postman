#!/bin/bash

# 图片尺寸调整脚本
# 使用方法: ./resize-image.sh input.jpg output.jpg

if [ $# -ne 2 ]; then
    echo "使用方法: $0 <输入文件> <输出文件>"
    echo "示例: $0 screenshot.jpg screenshot-small.jpg"
    exit 1
fi

input_file="$1"
output_file="$2"

# 检查输入文件是否存在
if [ ! -f "$input_file" ]; then
    echo "错误: 输入文件 '$input_file' 不存在"
    exit 1
fi

# 使用 sips 调整图片尺寸
echo "正在调整图片尺寸..."
sips -z 280 440 "$input_file" --out "$output_file"

if [ $? -eq 0 ]; then
    echo "✅ 图片调整成功！"
    echo "📁 输出文件: $output_file"
    echo "📏 新尺寸: 440x280"
    
    # 显示文件信息
    echo ""
    echo "📊 文件信息:"
    sips -g pixelWidth -g pixelHeight "$output_file"
else
    echo "❌ 图片调整失败"
    exit 1
fi 