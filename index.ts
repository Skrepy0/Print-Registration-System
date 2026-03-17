import { app, BrowserWindow } from 'electron'

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1400,
        height: 1000,
        autoHideMenuBar: true,
        icon:"./resources/icon.png",
    })

    win.loadFile('hub.html')
}


app.whenReady().then(() => {
    createWindow()
})