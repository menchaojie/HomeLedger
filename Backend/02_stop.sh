#!/bin/bash

# HomeLedger 后端服务停止脚本
# 停止通过 01_start.sh 启动的 FastAPI 服务

echo "🛑 正在停止 HomeLedger 后端服务..."

# 方法1: 通过 .server.pid 文件停止
if [ -f ".server.pid" ]; then
    PID=$(cat .server.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "找到进程 (PID: $PID)"
        kill $PID
        echo "已发送终止信号"
        
        # 等待进程退出
        for i in {1..10}; do
            if ! ps -p $PID > /dev/null 2>&1; then
                echo "✅ 进程已正常终止"
                break
            fi
            sleep 1
        done
        
        # 如果进程仍在运行，强制终止
        if ps -p $PID > /dev/null 2>&1; then
            echo "进程仍在运行，强制终止..."
            kill -9 $PID
            sleep 1
        fi
        
        # 删除 PID 文件
        rm -f .server.pid
    else
        echo "PID 文件存在但进程未运行，清理残留文件"
        rm -f .server.pid
    fi
fi

# 方法2: 通过端口查找并杀死进程
PORT=8000
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -n "$PID" ]; then
    echo "找到运行在端口 $PORT 的进程: $PID"
    kill $PID
    echo "已发送终止信号"
    
    # 等待进程完全退出
    sleep 2
    
    # 检查是否还有残留进程
    if lsof -ti:$PORT > /dev/null 2>&1; then
        echo "进程仍在运行，强制终止..."
        kill -9 $PID
    fi
fi

# 方法3: 通过进程名查找并杀死进程
PROCESS_NAME="uvicorn"
PIDS=$(pgrep -f "$PROCESS_NAME.*app.main:app")

if [ -n "$PIDS" ]; then
    echo "找到 uvicorn 进程: $PIDS"
    kill $PIDS
    echo "已终止 uvicorn 进程"
fi

# 清理日志文件（可选）
# echo "清理日志文件..."
# > server.log

echo ""

# 验证服务是否已停止
if lsof -ti:$PORT >/dev/null 2>&1; then
    echo "⚠️  警告: 可能仍有进程在运行，请手动检查"
    echo "尝试使用: lsof -ti:$PORT"
else
    echo "🎉 后端服务已完全停止"
    echo "💡 提示: 可以重新启动服务: ./01_start.sh"
fi