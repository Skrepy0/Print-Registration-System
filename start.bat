@echo off
title 印刷登记系统本地服务器
echo Start the server, please wait.
cd /d %~dp0
start http://localhost:8000/hub.html
python -m http.server 8000
pause