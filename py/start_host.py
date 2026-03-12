#!/usr/bin/env python3
import datetime
import json
import os
import sys
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler

try:
    with open('./config/host_config.json', 'r') as file:
        file = json.load(file)
        config = file
except Exception as e:
    print(f"配置文件./config/host_config.json在加载时出现错误{e}")

class LoggingHTTPRequestHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # 生成时间戳和日志字符串
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        message = format % args
        log_line = f"{timestamp} - {self.address_string()} - {message}"

        # 输出到控制台（保留原有行为）
        if config["log_print"]:
            sys.stderr.write(log_line + "\n")
            sys.stderr.flush()

def get_exe_dir():
    if getattr(sys, 'frozen', False):
        exe_path = sys.executable
    else:
        exe_path = __file__
    return os.path.dirname(os.path.abspath(exe_path))
def main():
    project_dir = get_exe_dir()
    os.chdir(project_dir)

    print("正在启动服务器，请稍候...")
    print(f"服务器根目录: {project_dir}")
    print("关闭此窗口即可关闭服务器")

    webbrowser.open(f"http://localhost:{config['local_host']}/hub.html")

    server_address = ('', config["local_host"])
    httpd = HTTPServer(server_address, LoggingHTTPRequestHandler)
    print(f"服务器运行在 http://localhost:{config['local_host']}/")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n正在停止服务器...")
        httpd.shutdown()
        print("服务器已停止。")
    finally:
        input("按任意键退出...")

if __name__ == "__main__":
    main()