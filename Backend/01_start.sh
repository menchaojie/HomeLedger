#!/bin/bash

# HomeLedger 后端服务启动脚本
# 启动 FastAPI 服务器，支持热重载，日志输出到 server.log

# 设置变量
APP="app.main:app"
HOST="0.0.0.0"
PORT=8000
LOG_FILE="server.log"

# 检查是否已安装依赖
if [ ! -f "requirements.txt" ]; then
    echo "错误: 未找到 requirements.txt 文件"
    exit 1
fi

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 python3 命令"
    exit 1
fi

# 检查是否已安装依赖包
if ! python3 -c "import uvicorn" &> /dev/null; then
    echo "警告: uvicorn 未安装，尝试安装依赖..."
    pip install -r requirements.txt
fi

# 检查端口是否被占用
if lsof -ti:$PORT &> /dev/null; then
    echo "错误: 端口 $PORT 已被占用"
    echo "请先停止相关服务或使用其他端口"
    echo "可以使用命令: ./02_stop.sh"
    exit 1
fi

# 检查是否已有 .server.pid 文件且进程在运行
if [ -f ".server.pid" ]; then
    EXISTING_PID=$(cat .server.pid)
    if ps -p $EXISTING_PID > /dev/null 2>&1; then
        echo "⚠️  服务已经在运行 (PID: $EXISTING_PID)"
        echo "请先停止服务: ./02_stop.sh"
        echo "或等待当前服务完成"
        exit 1
    else
        echo "清理残留的 PID 文件..."
        rm -f .server.pid
    fi
fi

echo "🚀 启动 HomeLedger 后端服务..."
echo "应用: $APP"
echo "地址: http://$HOST:$PORT"
echo "日志文件: $LOG_FILE"
echo ""

# 启动服务
nohup uvicorn $APP --reload --host $HOST --port $PORT > $LOG_FILE 2>&1 &

# 获取进程ID
SERVER_PID=$!

# 保存进程ID到文件（用于停止脚本）
echo $SERVER_PID > .server.pid

echo "✅ 服务已启动 (PID: $SERVER_PID)"
echo "📝 日志输出到: $LOG_FILE"
echo "🌐 访问地址: http://localhost:$PORT"
echo "📚 API文档: http://localhost:$PORT/docs"
echo ""
echo "💡 提示:"
echo "- 查看日志: tail -f $LOG_FILE"
echo "- 停止服务: ./02_stop.sh"
echo "- 服务将在后台运行，关闭终端不会影响"
echo ""

# 等待服务启动
sleep 3

# 检查服务是否正常启动
if curl -s http://localhost:$PORT/docs > /dev/null 2>&1; then
    echo "🎉 服务启动成功!"
    # echo "服务运行中... (按 Ctrl+C 停止查看日志)"
    
    # 实时显示日志（可选）
    # tail -f $LOG_FILE
    tail -20 $LOG_FILE
else
    echo "⚠️  服务启动可能有问题，请检查日志:"
    tail -20 $LOG_FILE
fi