#!/bin/bash
TARGET_DIR=\$1
if [ -z "$TARGET_DIR" ]; then
    echo "请提供目录路径作为参数"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "目录 $TARGET_DIR 不存在"
    exit 1
fi


find "$TARGET_DIR" -type f | while read -r file; do
    if file "$file" | grep -q text; then
        sed -i '/console\.log/d' "$file"
        echo "已删除 $file 中的 console.log 行"
    fi
done

