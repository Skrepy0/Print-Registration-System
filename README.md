**商丘市人民印刷有限公司**印刷登记快速录入系统

## **用途**
用于**商丘市第一高级中学**印刷数据统计

## **界面展示**
<img src="resources/1.png" alt="界面">

## **使用方法**

### 方式一
如果已经安装了python，并且设置了环境变量，双击[start.bat](./start.bat)即可启动
### 方式二
直接双击[start.exe](./start.exe)，启动本地服务器即可（注意：start.exe仅支持winxp以后的版本！）

## **配置**

### **启动配置**
打开[host_config.json](./config/host_config.json)文件，有两个配置项：
- **log_print**：启动时是否在终端打印日志
- **local_host**：启动的端口号

### **默认信息**
- [select.json](./config/select.json)存储的是“学科”和“费用类型”信息
- [submitter.json](./config/submitter.json)存储的是送印人的**默认信息**，也可以在“设置/编辑教师信息”中添加信息

## 谢鸣
>二次修改自[这里](https://www.52pojie.cn/thread-2076303-1-1.html)