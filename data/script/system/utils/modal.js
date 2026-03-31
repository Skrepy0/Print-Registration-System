import * as constants from '../../data/constants.js'
import { disableBackgroundWheel, enableBackgroundWheel } from './function.js'

export function openModal() {
  constants.editModal.classList.remove('hidden')
  void constants.modalContent.offsetWidth
  constants.modalContent.classList.remove('scale-95', 'opacity-0')
  constants.modalContent.classList.add('scale-100', 'opacity-100')
  disableBackgroundWheel()
}

export function closeModal() {
  constants.modalContent.classList.remove('scale-100', 'opacity-100')
  constants.modalContent.classList.add('scale-95', 'opacity-0')
  setTimeout(() => {
    constants.editModal.classList.add('hidden')
    constants.editForm.innerHTML = ''
  }, 300)
  enableBackgroundWheel()
}

export function showEditDataModal() {
  constants.editTeacherDataModal.classList.add('hidden')
  constants.editDataModal.classList.remove('hidden')
  constants.dataModalContent.classList.remove('scale-95', 'opacity-0')
  constants.dataModalContent.classList.add('scale-100', 'opacity-100')
  disableBackgroundWheel()
}
export function showAddDataModal() {
  constants.addDataModal.classList.remove('hidden')
  constants.addModalContent.classList.remove('scale-95', 'opacity-0')
  constants.addModalContent.classList.add('scale-100', 'opacity-100')
  disableBackgroundWheel()
}

export function closeAddDataModal() {
  constants.addDataModal.classList.add('hidden')
  constants.addModalContent.classList.add('scale-95', 'opacity-0')
  constants.addModalContent.classList.remove('scale-100', 'opacity-100')
}

export function openImportModeModal() {
  constants.importModeModal.classList.remove('hidden')
  disableBackgroundWheel()
}
export function closeImportModeModal() {
  constants.importModeModal.classList.add('hidden')
  enableBackgroundWheel()
}
export function showPromptModal(prompt, confirm) {
  constants.promptTitle.innerText = prompt
  // 注意：每次打开前应先移除之前绑定的监听器，或使用一次性事件，避免重复绑定
  constants.promptTrueBtn.addEventListener('click', confirm, { once: true }) // 使用 once 确保只触发一次

  // 1. 显示模态框容器，但内容设为隐藏态（动画起点）
  constants.promptModal.classList.remove('hidden')
  constants.promptModalContent.classList.remove('scale-100', 'opacity-100')
  constants.promptModalContent.classList.add('scale-95', 'opacity-0')

  // 2. 强制浏览器重绘，然后切换到显示态
  setTimeout(() => {
    constants.promptModalContent.classList.remove('scale-95', 'opacity-0')
    constants.promptModalContent.classList.add('scale-100', 'opacity-100')
  }, 10)

  disableBackgroundWheel()
}
export function closePromptModal() {
  constants.promptModalContent.classList.remove('scale-100', 'opacity-100')
  constants.promptModalContent.classList.add('scale-95', 'opacity-0')
  setTimeout(() => {
    constants.promptModal.classList.add('hidden')
    enableBackgroundWheel()
  }, 500)
  constants.promptModal.classList.add('hidden')
  constants.promptTitle.innerText = ''
  enableBackgroundWheel()
}
