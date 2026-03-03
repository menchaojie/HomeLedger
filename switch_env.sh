#!/bin/bash

# 环境切换脚本
# 用于快速切换开发和生产环境配置

echo "=== 环境配置切换工具 ==="
echo "请选择要切换的环境："
echo "1. 本地开发环境"
echo "2. 生产环境"

read -p "请输入选择 (1 或 2): " choice

# 定义配置变量
if [ "$choice" = "1" ]; then
    # 开发环境配置
    API_BASE_URL="http://127.0.0.1:8000/api"
    API_HOST="http://127.0.0.1:8000"
    SERVER_DOMAIN="http://127.0.0.1:8000"
    echo "切换到开发环境..."
elif [ "$choice" = "2" ]; then
    # 生产环境配置
    API_BASE_URL="https://menchaojie.top:2288/api"
    API_HOST="https://menchaojie.top:2288"
    SERVER_DOMAIN="https://menchaojie.top:2288"
    echo "切换到生产环境..."
else
    echo "无效选择，请重新运行脚本"
    exit 1
fi

# 修改前端配置文件 (WeApp/utils/api.js)
echo "更新前端配置文件..."
sed -i.bak "s#const API_BASE_URL = .*#const API_BASE_URL = '$API_BASE_URL';#" WeApp/utils/api.js
sed -i.bak "s#const API_HOST = .*#const API_HOST = '$API_HOST';#" WeApp/utils/api.js

# 修改后端配置文件 (Backend/app/core/config.py)
echo "更新后端配置文件..."
sed -i.bak "s#server_domain: str = .*#server_domain: str = \"$SERVER_DOMAIN\"#" Backend/app/core/config.py

echo "环境切换完成！"
echo "前端 API_BASE_URL: $API_BASE_URL"
echo "前端 API_HOST: $API_HOST"
echo "后端 server_domain: $SERVER_DOMAIN"

# 清理备份文件
rm -f WeApp/utils/api.js.bak Backend/app/core/config.py.bak

echo "备份文件已清理"