#!/bin/bash

# 部署前脚本 - 确保上传目录存在

echo "正在创建上传目录..."

# 创建 uploads 目录
mkdir -p public/uploads

# 设置权限
chmod 755 public/uploads

# 创建 .gitkeep 文件（如果不存在）
if [ ! -f public/uploads/.gitkeep ]; then
    touch public/uploads/.gitkeep
fi

echo "✅ 上传目录创建成功"
echo "目录权限: $(ls -ld public/uploads | awk '{print $1, $3, $4}')"

# 检查写权限
if [ -w public/uploads ]; then
    echo "✅ 上传目录具有写权限"
else
    echo "❌ 上传目录没有写权限，请手动设置:"
    echo "   chmod 755 public/uploads"
    exit 1
fi

echo "部署前准备完成！"
