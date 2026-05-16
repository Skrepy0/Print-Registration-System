const { contextBridge, ipcRenderer, shell } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    const validChannels = ['check-for-updates']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  on: (channel, callback) => {
    const validChannels = ['update-status']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args))
    }
  },
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  writeFile: (filePath, buffer) =>
    ipcRenderer.invoke('fs:writeFile', filePath, buffer),
  getDefaultPriceRule: () => ipcRenderer.invoke('get-default-price-rule'),
  beep: () => shell.beep(),
})
