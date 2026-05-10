import { app, BrowserWindow, dialog } from 'electron'
import log from 'electron-log'
import pkg from 'electron-updater'

const { autoUpdater } = pkg

autoUpdater.logger = log
log.transports.file.level = 'info'

let win: BrowserWindow

const UPDATE_SERVER_URL = 'http://prs.skrepy.dpdns.org/updates'
const DEV_UPDATE_SERVER_URL = 'http://localhost:3000/updates'

const createWindow = () => {
  win = new BrowserWindow({
    width: 1400,
    height: 1000,
    autoHideMenuBar: true,
    icon: './resources/icon.png',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })
  win.loadFile('hub.html')
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = false

  if (!app.isPackaged) {
    autoUpdater.forceDevUpdateConfig = true
  } else {
    autoUpdater.setFeedURL(UPDATE_SERVER_URL)
  }

  autoUpdater.on('update-available', (info) => {
    dialog
      .showMessageBox(win, {
        type: 'info',
        title: '发现新版本',
        message: `发现新版本 ${info.version}，是否立即下载并安装？(需重启,但是您的数据并不会丢失)`,
        buttons: ['暂不', '下载并安装'],
        defaultId: 1,
        cancelId: 0,
      })
      .then(({ response }) => {
        if (response === 1) {
          autoUpdater.downloadUpdate()
          log.info('开始下载更新...')
        }
      })
  })
  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`下载进度: ${progressObj.percent}%`)
  })

  autoUpdater.on('update-downloaded', (info) => {
    log.info(`新版本 ${info.version} 下载完成，即将安装...`)
    autoUpdater.quitAndInstall()
  })

  autoUpdater.on('error', (err) => {
    log.error('更新失败', err)
    dialog.showErrorBox('更新失败', `检查更新时发生错误：${err.message}`)
  })

  autoUpdater.checkForUpdatesAndNotify()
}

app.whenReady().then(() => {
  createWindow()
  setupAutoUpdater()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
