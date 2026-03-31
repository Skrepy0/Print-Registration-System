window.teachersData = {}
window.selectData = {}
fetch('./config/submitter.json')
  .then((response) => {
    if (!response.ok) {
      console.error(response.text)
      showToast(`请求失败：${response.text}`)
    }
    return response.json()
  })
  .then((json) => {
    window.teachersData = json
  })
  .catch((error) => {
    console.error(error)
    showToast('加载config/submitter.json失败')
  })

fetch('./config/select.json')
  .then((response) => {
    if (!response.ok) {
      console.error(response.text)
      showToast(`请求失败：${response.text}`)
    }
    return response.json()
  })
  .then((json) => {
    window.selectData = json
  })
  .catch((error) => {
    console.error(error)
    showToast('加载config/select.json失败')
  })

function showToast(msg) {
  let type = 'error'
  const toast = document.getElementById('toast')
  const icon = document.getElementById('toast-icon')
  const msgEl = document.getElementById('toast-message')
  const colors = {
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue',
  }
  const icons = {
    error: 'fa-times-circle',
  }
  toast.className = `fixed bottom-5 right-5 px-4 py-3 rounded-xl shadow-2xl transform translate-y-20 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center z-50 backdrop-blur-md bg-white/90 border border-${colors[type]}-200`
  icon.className = `fa ${icons[type]} mr-2 text-${colors[type]}-600`
  msgEl.textContent = msg
  setTimeout(() => {
    toast.classList.remove('translate-y-20', 'opacity-0')
    toast.classList.add('translate-y-0', 'opacity-100')
  }, 10)
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100')
    toast.classList.add('translate-y-20', 'opacity-0')
  }, 3000)
}
