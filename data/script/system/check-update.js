import { showToast } from './utils/function.js'

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('checkUpdateBtn')

  if (!btn) {
    console.error('Check update button not found!')
    return
  }

  if (!window.electronAPI) {
    console.error('electronAPI is not available!')
    showToast('更新功能初始化失败', 'error')
    btn.disabled = true
    btn.title = '更新功能不可用'
    return
  }

  window.electronAPI.on('update-status', (data) => {
    switch (data.type) {
      case 'checking':
        if (btn) btn.disabled = true
        break
      case 'available':
        if (btn) btn.disabled = false
        break
      case 'not-available':
        showToast('当前已是最新版本', 'info')
        if (btn) btn.disabled = false
        break
      case 'download-progress':
        break
      case 'downloaded':
        showToast('下载完成，即将重启安装...', 'success')
        if (btn) btn.disabled = true
        break
      case 'error':
        showToast(`检查更新失败：${data.error}`, 'error')
        if (btn) btn.disabled = false
        break
      default:
        break
    }
  })

  btn.addEventListener('click', () => {
    window.electronAPI.send('check-for-updates')
  })
})
