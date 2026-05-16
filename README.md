# 印刷登记快速录入系统

![License](https://img.shields.io/badge/License-Apache%202.0-pink.svg)

## 项目简介

**商丘市人民印刷有限公司**印刷登记快速录入系统是一个专为**商丘市第一高级中学**设计的印刷数据统计与管理工具。该系统提供了便捷的印刷登记、数据统计和可视化分析功能，帮助学校高效管理印刷资源，追踪印刷费用，并生成详细的统计报告。

## 主要功能

- **印刷登记**：快速录入印刷请求，包括送印人信息、学科、印刷数量、费用类型等
- **数据管理**：支持添加、编辑、删除印刷记录，以及批量删除功能
- **数据统计**：提供多种统计图表，直观展示印刷数据和费用分布
- **教师信息管理**：维护送印人信息库，便于快速选择常用送印人
- **数据导出**：支持将印刷数据导出为JSON格式，便于备份和恢复
- **自定义配置**：可自定义学科类别、费用类型等系统配置
- **自动备份数据**：每次关闭时自动备份 LocalStorage,并删除前一次的备份, 支持导入数据
- **自动价格表**：可根据纸张类型与印刷数量自动补充单价,自定义价格表

## 界面展示

<img src="resources/1.png" alt="系统界面">

## 技术栈

- **前端**：HTML5, CSS3, JavaScript
- **UI框架**：TailwindCSS
- **图表库**：Chart.js
- **数据处理**：JSON
- **桌面应用**：Electron
- **启动脚本**：Python HTTPServer（仅用于启动本地服务器）

## 安装与使用

### 前提条件

桌面应用:

- `Windows XP` 或更高版本

如需自行构建:

- 已安装 `Node.js` 和 `npm`

如需使用Python启动脚本

- 已安装 `Python 3.x`

### 安装方式

#### 方式一：使用安装包（推荐）

在[Release](https://github.com/Skrepy0/Print-Registration-System/releases)页面下载最新版本的安装包，按照安装向导完成安装即可。(目前只有x64的安装包)

#### ~~方式二：使用启动程序启动~~ (1.0.3版本开始已经废弃,会导致功能不全)

`Windows XP`及以上可使用此方法启动
双击项目根目录的[start.exe](./start.exe)即可启动系统。

> start.exe的源代码在`./py/`中

#### ~~方式三：使用批处理文件启动~~ (1.0.3版本开始已经废弃,会导致功能不全)

如果已安装Python并配置了环境变量，双击[start.bat](./start.bat)即可启动系统。

## 系统配置

### ~~启动配置~~ (1.0.3版本开始已经废弃)

打开[config/host_config.json](./config/host_config.json)文件，可配置以下选项：

```json
{
  "log_print": true,
  "local_host": 1145
}
```

- `log_print`：启动时是否在终端打印日志（布尔值）
- `local_host`：服务器启动的端口号（整数）

### 默认信息配置

#### 学科与费用类型

[config/select.json](./config/select.json)存储系统中的"学科"和"费用类型"信息：

```json
{
  "subject": [
    "语文",
    "数学",
    "英语",
    "物理",
    "化学",
    "生物",
    "地理",
    "政治",
    "历史"
  ],
  "added_expense_type": ["办公文件", "教学资料", "过级考资料"]
}
```

- `subject`：学科列表
- `added_expense_type`：费用类型列表

#### 送印人信息

[config/submitter.json](./config/submitter.json)存储送印人的默认信息。
你可以按下面的格式进行默认信息的配置

```json
{
  "张三": ["高一", "政治"],
  "李四": ["高二", "物理"]
}
```

您也可以在系统界面的`设置/编辑教师信息`中添加和管理送印人信息。

#### 价格规则示例

以下为系统默认的价格表
其中`spec`代表纸张类型,`region`代表价格区间

```json
{
  "prices": [
    {
      "spec": "8K",
      "data": [
        {
          "price": 0.18,
          "region": [0, 500]
        },
        {
          "price": 0.15,
          "region": [501, 1000]
        },
        {
          "price": 0.13,
          "region": [1001, 1500]
        },
        {
          "price": 0.11,
          "region": [1501, 2000]
        },
        {
          "price": 0.07,
          "region": [2001, "infinity"]
        }
      ]
    },
    {
      "spec": "A4",
      "data": [
        {
          "price": 0.14,
          "region": [0, 500]
        },
        {
          "price": 0.13,
          "region": [501, 1000]
        },
        {
          "price": 0.13,
          "region": [1001, 1500]
        },
        {
          "price": 0.11,
          "region": [1501, 2000]
        },
        {
          "price": 0.08,
          "region": [2001, "infinity"]
        }
      ]
    }
  ]
}
```

若`spec`中的类型在原来的纸张类型下拉框中没有,则会在下拉框中自动添加这个纸张类型
这种格式的json文件可以被系统识别,用户可以自定义价格表,但是要注意:

- `spec`的值不能为 `其他`
- 价格区间不能重叠

## 项目结构

```
PrintRegistrationSystem/
├── config/              # 配置文件目录
│   ├── host_config.json # 服务器配置
│   ├── select.json      # 学科和费用类型配置
│   └── submitter.json   # 送印人信息配置
├── data/                # 前端资源目录
│   ├── assets           # 一些默认配置文件
│   ├── css/             # 样式文件
│   └── script/          # JavaScript文件
├── py/                  # Python启动脚本目录
│   ├── start_host.py    # 服务器启动脚本
│   └── hud.html         # 启动测试界面
├── resources/           # 资源文件
│   ├── icon.png         # 应用图标
│   └── 1.png            # 界面截图
├── hub.html             # 主界面
├── index.js             # Electron主进程
├── preload.js           # Electron预加载进程
├── package.json         # 项目配置
├── dev-app-update.yml   # dev端的更新地址配置
└── start.bat            # Windows批处理启动脚本
```

## 开发指南

### 开发环境设置

1. 克隆项目仓库：`git clone https://github.com/Skrepy0/Print-Registration-System.git`
2. 进入项目目录：`cd PrintRegistrationSystem`
3. 安装依赖：`npm install`
4. 启动开发服务器：

- `npm run dev`(在默认浏览器打开)
- `npm run start`(启动桌面应用)

### 代码格式化

项目使用`Prettier`进行代码格式化，运行以下命令格式化代码：

```bash
npm run format
```

### 构建应用

使用以下命令构建应用：

```bash
npm run build
```

构建产物将输出在`dist`目录中。

## 常见问题

**Q: 如何修改系统默认端口？**

A: 编辑`config/host_config.json`文件，修改`local_host`字段的值。

**Q: 如何添加新的学科或费用类型？**

A: 编辑`config/select.json`文件，在相应的数组中添加新项。
**Q: 如何设置默认的送印人信息,以方便使用？**

A: 编辑`config/submmit.json`文件。具体见[这里](#送印人信息)

**Q: 配置了默认信息或添加了学科或费用类型,但是程序没有加载,如何处理？**

A: 重启服务器, 还不能解决就强制刷新当前界面(`Ctrl+Shift+R`),然后重启服务器即可。

**Q: 数据存储在哪里？**

A: 当前版本数据存储在浏览器的本地存储中(如果使用的是桌面软件则保存在软件的缓存里)，清除浏览器数据将**导致数据丢失**(桌面软件则不会)。

**Q: 如何备份数据？**

A: 使用系统提供的数据导出功能，将数据导出为`JSON`文件进行备份。

## 致谢

本项目基于[某开源项目](https://www.52pojie.cn/thread-2076303-1-1.html)进行二次开发，感谢原作者的贡献。

## 许可证

本项目采用 Apache-2.0 许可证，详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 作者：Skrepy2233
- 项目地址：[https://github.com/Skrepy0/Print-Registration-System](https://github.com/Skrepy0/Print-Registration-System)
- 问题反馈：[GitHub Issues](https://github.com/Skrepy0/Print-Registration-System/issues)
