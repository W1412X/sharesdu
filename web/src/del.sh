#!/bin/bash

TARGET_DIR=$1

# 检查是否提供了目录参数
if [ -z "$TARGET_DIR" ]; then
  echo "请提供要清理的目录路径"
  exit 1
fi

find "$TARGET_DIR" -type f -exec sed -i '/console\.log/d' {} \;

