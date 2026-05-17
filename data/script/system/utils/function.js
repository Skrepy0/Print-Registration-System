import * as constants from '../../data/constants.js'
import {
  PAPER_SIZE_OPTIONS,
  DEFAULT_PAPER_SIZE_OPTIONS,
} from '../../data/constants.js'
import { config } from '../../data/config/config.js'
import { data, saveData } from '../../data/catch/catch.js'
function playSound(type) {
  try {
    if (!config.soundPrompt) return
  } catch {
    return
  }
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }

  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  const now = audioCtx.currentTime

  switch (type) {
    case 'warning':
      oscillator.type = 'sine'

      oscillator.frequency.setValueAtTime(700, now)
      oscillator.frequency.setValueAtTime(900, now + 0.12)

      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

      oscillator.start(now)
      oscillator.stop(now + 0.3)
      break

    case 'error':
      oscillator.type = 'square'

      oscillator.frequency.setValueAtTime(260, now)
      oscillator.frequency.exponentialRampToValueAtTime(120, now + 0.35)

      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      oscillator.start(now)
      oscillator.stop(now + 0.4)
      break

    default:
      return
  }
}

export function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast')
  const icon = document.getElementById('toast-icon')
  const msgEl = document.getElementById('toast-message')
  playSound(type)
  const colors = {
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue',
  }
  const icons = {
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    error: 'fa-times-circle',
    info: 'fa-info-circle',
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

// 计算印刷总数
export function calculateTotalPages() {
  const paperCount = parseInt(constants.paperCountInput.value) || 0
  const copyCount = parseInt(constants.copyCountInput.value) || 0
  constants.totalPagesInput.value = paperCount * copyCount
  calculateExpense()
  fillPrice()
}
export function calculateExpense() {
  const totalPages = parseInt(constants.totalPagesInput.value) || 0
  const price = parseFloat(constants.priceInput.value) || 0.0
  constants.expenseInput.value = (totalPages * price).toFixed(2)
}
export function getPrice(totalPages, paperType) {
  try {
    const priceRule = config.autoPriceRule.prices.find(
      (item) => item.spec === paperType
    )
    if (!priceRule && paperType !== '其他') {
      showToast(
        `未找到纸张类型 "${paperType}" 的价格规则,请手动输入`,
        'warning'
      )
      return 0.01
    }

    const { data } = priceRule
    for (const item of data) {
      const [lower, upper] = item.region
      const upperBound = upper === 'infinity' ? Infinity : upper

      if (totalPages >= lower && totalPages <= upperBound) {
        return parseFloat(item.price.toFixed(2))
      }
    }
    showToast(`页数 ${totalPages} 未匹配到任何价格区间,请手动输入`, 'warning')
    return 0.01
  } catch (e) {
    showToast('价格规则解析失败', 'error')
    console.error(e)
    return 0.01
  }
}
export function fillPrice() {
  if (!config.autoFillPrice) return
  const paperType = constants.paperSizeSelect.value
  const copyCount = parseInt(constants.copyCountInput.value) || 0
  const price = getPrice(copyCount, paperType)
  constants.priceInput.value = price
  calculateExpense()
}
export function updatePaperTypeByPriceRule() {
  PAPER_SIZE_OPTIONS.length = 0
  PAPER_SIZE_OPTIONS.push(...DEFAULT_PAPER_SIZE_OPTIONS)
  try {
    config.autoPriceRule['prices']
      .map((r) => r['spec'])
      .forEach((item) => {
        if (!PAPER_SIZE_OPTIONS.includes(item)) PAPER_SIZE_OPTIONS.push(item)
      })
  } catch (e) {
    showToast('价格规则解析失败', 'error')
    console.error(e)
    return
  }
  constants.paperSizeSelect.innerHTML = `${PAPER_SIZE_OPTIONS.map((p) => `<option value="${p}" ${PAPER_SIZE_OPTIONS[0] === p ? 'selected' : ''}>${p}</option>`).join('')}<option value="其他"}>其他</option>`
}
updatePaperTypeByPriceRule()
export function updateSyncStatus(s) {
  document.getElementById('sync-status').innerHTML = s
    ? '<i class="fa fa-check-circle text-green-500 mr-1 animate-pulse"></i><span>数据已同步</span>'
    : '<i class="fa fa-exclamation-triangle text-yellow-500 mr-1"></i><span>数据未同步</span>'
}

export function updateAutoData() {
  if (!config.autoMatchEnabled) return
  const submitter = document.getElementById('submitter')
  if (submitter && submitter.value !== '其他') {
    if (getAutoDataBySubmitter[submitter.value]) {
      constants.subjectSelect.value = getAutoDataBySubmitter[submitter.value][1]
      constants.gradeSelect.value = getAutoDataBySubmitter[submitter.value][0]
    }
  }
}

export function togglePaperSizeOther() {
  constants.paperSizeSelect.value === '其他'
    ? constants.paperSizeOtherContainer.classList.remove('hidden')
    : (constants.paperSizeOtherContainer.classList.add('hidden'),
      (constants.paperSizeOtherInput.value = ''))
  fillPrice()
}

export function toggleGradeOther() {
  constants.gradeSelect.value === '其他'
    ? constants.gradeOtherContainer.classList.remove('hidden')
    : (constants.gradeOtherContainer.classList.add('hidden'),
      (constants.gradeOtherInput.value = ''))
}

export function toggleSubjectOther() {
  constants.subjectSelect.value === '其他'
    ? constants.subjectOtherContainer.classList.remove('hidden')
    : (constants.subjectOtherContainer.classList.add('hidden'),
      (constants.subjectOtherInput.value = ''))
}

export function toggleSubmitterOther() {
  constants.submitterSelect.value === '其他'
    ? constants.submitterOtherContainer.classList.remove('hidden')
    : (constants.submitterOtherContainer.classList.add('hidden'),
      (constants.submitterOtherInput.value = ''))
}

export function toggleExpenseTypeOther() {
  constants.expenseTypeSelect.value === '其他'
    ? constants.expenseTypeOtherContainer.classList.remove('hidden')
    : (constants.expenseTypeOtherContainer.classList.add('hidden'),
      (constants.expenseTypeOtherInput.value = ''))
}

export function getFinalValue(sel, other) {
  if (sel.value === '其他') {
    return other.value.trim() || '其他'
  }
  return sel.value || ''
}

export function getSubmitterFinalValue(sel, other) {
  if (sel.value === '其他') {
    if (other.value.trim()) {
      if (config.autoCatchInfo) {
        data.catchTeacherList[other.value.trim()] = [
          getFinalValue(constants.gradeSelect, constants.gradeOtherInput),
          getFinalValue(constants.subjectSelect, constants.subjectOtherInput),
        ]
        saveData()
      }
      return other.value.trim()
    }
    return '其他'
  }
  return sel.value || ''
}

export function updateToggleUI() {
  for (let i = 0; i < constants.toggles.length; i++) {
    let toggle = constants.toggles[i]
    toggle.style.color = toggle.textContent === '开' ? 'green' : 'red'
  }
}

export function settings() {
  constants.settingsModal.classList.remove('hidden')
  disableBackgroundWheel()
}
// 禁用背景滚轮
export function disableBackgroundWheel() {
  document.body.classList.add('modal-open')
}

// 启用背景滚轮
export function enableBackgroundWheel() {
  document.body.classList.remove('modal-open')
}

export function isToday(dateStr) {
  const today = new Date()
  // 假设日期格式为 YYYY-MM-DD 或 YYYY/MM/DD
  const [year, month, day] = dateStr.split(/[-/]/).map(Number)
  return (
    today.getFullYear() === year &&
    today.getMonth() + 1 === month && // getMonth() 返回 0-11
    today.getDate() === day
  )
}
