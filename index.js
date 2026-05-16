const electron = require('electron')
const path = require('path')
const log = require('electron-log')
const fs = require('fs')

const { app, BrowserWindow, dialog, ipcMain, shell } = electron

let win = null
let autoUpdater = null
const backupPath = path.join(
  app.getPath('userData'),
  './backup/localStorage_backup.json'
)
const backupDir = path.dirname(backupPath)
const rulePath = './data/assets/default_price.json'
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
}
const UPDATE_SERVER_URL = 'http://prs.skrepy.dpdns.org/updates'

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 1000,
    autoHideMenuBar: true,
    icon: './resources/icon.png',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  win.loadFile('hub.html')
}

function setupAutoUpdater() {
  const { autoUpdater: updater } = require('electron-updater')
  autoUpdater = updater

  autoUpdater.logger = log
  log.transports.file.level = 'info'

  autoUpdater.autoDownload = false

  if (!app.isPackaged) {
    autoUpdater.forceDevUpdateConfig = true
  } else {
    autoUpdater.setFeedURL(UPDATE_SERVER_URL)
  }

  autoUpdater.on('update-available', (info) => {
    win?.webContents.send('update-status', {
      type: 'available',
      version: info.version,
    })

    dialog
      .showMessageBox(win, {
        type: 'info',
        title: '发现新版本',
        message: `发现新版本 ${info.version}，是否立即下载并安装？(需重启,但是您的数据并不会丢失)`,
        buttons: ['暂不', '下载并安装'],
        defaultId: 1,
        cancelId: 0,
      })
      .then((result) => {
        if (result.response === 1) {
          autoUpdater.downloadUpdate()
          log.info('开始下载更新...')
        }
      })
  })

  autoUpdater.on('update-not-available', () => {
    win?.webContents.send('update-status', { type: 'not-available' })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`下载进度: ${progressObj.percent}%`)
    win?.webContents.send('update-status', {
      type: 'download-progress',
      percent: progressObj.percent,
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    log.info(`新版本 ${info.version} 下载完成，即将安装...`)
    win?.webContents.send('update-status', {
      type: 'downloaded',
      version: info.version,
    })
    autoUpdater.quitAndInstall()
  })

  autoUpdater.on('error', (err) => {
    log.error('更新失败', err)
    win?.webContents.send('update-status', {
      type: 'error',
      error: err.message,
    })
    dialog.showErrorBox('更新失败', `检查更新时发生错误：${err.message}`)
  })

  ipcMain.on('check-for-updates', () => {
    win?.webContents.send('update-status', { type: 'checking' })
    autoUpdater.checkForUpdates()
  })
  autoUpdater.checkForUpdatesAndNotify()
}
ipcMain.handle('dialog:selectDirectory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: '选择保存目录',
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('fs:writeFile', async (event, filePath, buffer) => {
  try {
    fs.writeFileSync(filePath, buffer)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
ipcMain.on('backup-local-storage', (event, data) => {
  try {
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`LocalStorage 已备份至 ${backupPath}`)
  } catch (err) {
    console.error('备份 LocalStorage 失败:', err)
  }
})
ipcMain.handle('open-backup-folder', async (event) => {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  await shell.openPath(backupDir)
})

function readConfigFile() {
  try {
    if (fs.existsSync(rulePath)) {
      const data = fs.readFileSync(rulePath, 'utf8')
      return JSON.parse(data)
    } else {
      return { meg: '读取配置文件失败:' }
    }
  } catch (error) {
    console.error('读取配置文件失败:', error)
    return null
  }
}
ipcMain.handle('get-default-price-rule', () => {
  return readConfigFile()
})

app.whenReady().then(() => {
  createWindow()
  setupAutoUpdater()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
