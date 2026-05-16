import { uploadRule } from '../../data/config/auto-price.js'
import * as constants from '../../data/constants.js'
import { reload } from '../../data/constants.js'
import { delSelectedRecords, selectToday } from '../components/records.js'
import {
  showToast,
  calculateExpense,
  calculateTotalPages,
  disableBackgroundWheel,
  enableBackgroundWheel,
  settings,
  toggleExpenseTypeOther,
  toggleGradeOther,
  togglePaperSizeOther,
  toggleSubjectOther,
  toggleSubmitterOther,
  updateAutoData,
  updateToggleUI,
} from './function.js'
import {
  goToNextPage,
  goToPrevPage,
  handleFormSubmit,
  handlePageSizeChange,
  handleSearch,
  handleSelectAll,
  handleSort,
} from '../components/form.js'
import {
  backupData,
  backupSubmitterData,
  exportAllRecords,
  exportSelectedRecords,
  fileUploadSubmitterData,
  handleFileUpload,
  downloadPriceRule,
} from './io.js'
import { closeAddDataModal, closeModal, closePromptModal } from './modal.js'
import { config, resetPriceRule } from '../../data/config/config.js'
import {
  addData,
  closeEditDataPage,
  deleteSelectDataRecords,
  handleDataSearch,
  handleSelectAllData,
  renderData,
} from '../../data/catch/form.js'

export function registerEvents() {
  for (let i = 0; i < constants.toggles.length; i++) {
    let toggle = constants.toggles[i]
    toggle.addEventListener('click', () => {
      toggle.textContent = toggle.textContent === '关' ? '开' : '关'
      updateToggleUI()
    })
  }
  document.addEventListener('DOMContentLoaded', reload)

  constants.autoMatchToggle.addEventListener('click', () => {
    config.autoMatchEnabled = !config.autoMatchEnabled
    localStorage.setItem(
      'autoMatchEnabled',
      JSON.stringify(config.autoMatchEnabled)
    )
  })

  constants.autoCatchToggle.addEventListener('click', () => {
    config.autoCatchInfo = !config.autoCatchInfo
    localStorage.setItem('autoCatchInfo', JSON.stringify(config.autoCatchInfo))
  })
  constants.soundPromptToggle.addEventListener('click', () => {
    config.soundPrompt = !config.soundPrompt
    localStorage.setItem('soundPrompt', JSON.stringify(config.soundPrompt))
  })
  constants.reverseUpload.addEventListener('click', () => {
    config.reverseDateUpload = !config.reverseDateUpload
    localStorage.setItem(
      'reverseDateUpload',
      JSON.stringify(config.reverseDateUpload)
    )
  })
  constants.gradeUpload.addEventListener('click', () => {
    config.gradeUpload = !config.gradeUpload
    localStorage.setItem('gradeUpload', JSON.stringify(config.gradeUpload))
  })
  constants.autoFillPrice.addEventListener('click', () => {
    config.autoFillPrice = !config.autoFillPrice
    localStorage.setItem('autoFillPrice', JSON.stringify(config.autoFillPrice))
  })
  // 关闭模态框（点击遮罩或关闭按钮）
  constants.closeBtn.addEventListener('click', () => {
    constants.settingsModal.classList.add('hidden')
    enableBackgroundWheel()
  })
  constants.closeEditTeacherData.addEventListener('click', () => {
    constants.editTeacherDataModal.classList.add('hidden')
    enableBackgroundWheel()
  })
  constants.editTeacherDataModal.addEventListener('click', (e) => {
    if (e.target === constants.editTeacherDataModal) {
      constants.editTeacherDataModal.classList.add('hidden')
      enableBackgroundWheel()
    }
  })
  constants.editDataModal.addEventListener('click', (e) => {
    if (e.target === constants.editDataModal) {
      constants.editDataModal.classList.add('hidden')
      constants.editTeacherDataModal.classList.remove('hidden')
      disableBackgroundWheel()
    }
  })
  constants.closeDataModalButton.addEventListener('click', () => {
    closeEditDataPage()
  })
  constants.addDataModal.addEventListener('click', (e) => {
    if (e.target === constants.editDataModal) {
      closeAddDataModal()
    }
  })

  // 点击遮罩层关闭
  constants.settingsModal.addEventListener('click', (e) => {
    if (e.target === constants.settingsModal) {
      constants.settingsModal.classList.add('hidden')
      enableBackgroundWheel()
    }
  })

  constants.promptModal.addEventListener('click', (e) => {
    if (e.target === constants.editDataModal) {
      closePromptModal()
    }
  })
  constants.promptFalseBtn.addEventListener('click', closePromptModal)

  constants.delSelectedRecord.addEventListener('click', () => {
    delSelectedRecords()
  })
}

export function initEvents() {
  document
    .getElementById('settings-complete-btn')
    .addEventListener('click', () => {
      constants.settingsModal.classList.add('hidden')
      enableBackgroundWheel()
    })

  constants.paperCountInput.addEventListener('input', calculateTotalPages)
  constants.copyCountInput.addEventListener('input', calculateTotalPages)
  constants.printTypeSelect.addEventListener('change', calculateTotalPages)
  constants.priceInput.addEventListener('input', calculateExpense)

  constants.paperSizeSelect.addEventListener('change', togglePaperSizeOther)
  constants.gradeSelect.addEventListener('change', toggleGradeOther)
  constants.subjectSelect.addEventListener('change', toggleSubjectOther)
  constants.submitterSelect.addEventListener('change', toggleSubmitterOther)
  constants.submitterSelect.addEventListener('change', updateAutoData)
  constants.expenseTypeSelect.addEventListener('change', toggleExpenseTypeOther)
  constants.closeAddDataModalButton.addEventListener('click', closeAddDataModal)

  constants.printForm.addEventListener('reset', function () {
    setTimeout(() => {
      constants.paperSizeOtherInput.value = ''
      constants.gradeOtherInput.value = ''
      constants.subjectOtherInput.value = ''
      constants.submitterOtherContainer.value = ''
      constants.expenseTypeOtherInput.value = ''
      constants.priceInput.value = '0.01'
      togglePaperSizeOther()
      toggleGradeOther()
      toggleSubjectOther()
      toggleExpenseTypeOther()
      toggleSubmitterOther()
      calculateTotalPages()
    }, 10)
  })

  constants.printForm.addEventListener('submit', handleFormSubmit)

  constants.prevPageButton.addEventListener('click', goToPrevPage)
  constants.nextPageButton.addEventListener('click', goToNextPage)
  constants.pageSizeSelect.addEventListener('change', handlePageSizeChange)
  constants.searchInput.addEventListener('input', handleSearch)
  constants.selectAllCheckbox.addEventListener('change', handleSelectAll)
  constants.editCatchSelectAll.addEventListener('change', handleSelectAllData)
  constants.exportSelectedButton.addEventListener(
    'click',
    exportSelectedRecords
  )
  constants.exportAllButton.addEventListener('click', exportAllRecords)
  constants.settingsButton.addEventListener('click', settings)
  constants.backupButton.addEventListener('click', backupData)
  constants.searchDataInput.addEventListener('input', handleDataSearch)
  constants.deleteSelectData.addEventListener('click', deleteSelectDataRecords)
  constants.selectTodayRecords.addEventListener('click', selectToday)
  constants.backupSubmitterButton.addEventListener('click', backupSubmitterData)
  constants.addDataButton.addEventListener('click', addData)

  document.querySelectorAll('.sortable').forEach((header) => {
    header.addEventListener('click', () => handleSort(header.dataset.sort))
  })

  constants.closeModalButton.addEventListener('click', closeModal)
  constants.editModal.addEventListener('click', (e) => {
    if (e.target === constants.editModal) closeModal()
  })
  constants.resetPriceRuleBtn.addEventListener('click', resetPriceRule)
  constants.importButton.addEventListener('click', () =>
    constants.fileUploadInput.click()
  )
  constants.loadBackupSubmitterButton.addEventListener('click', () =>
    constants.uploadSubmitterFile.click()
  )
  constants.fileUploadInput.addEventListener('change', handleFileUpload)
  constants.uploadSubmitterFile.addEventListener(
    'change',
    fileUploadSubmitterData
  )
  constants.uploadPriceBtn.addEventListener('click', () => {
    constants.uploadPriceRuleInput.click()
  })
  constants.downloadPriceRuleBtn.addEventListener('click', downloadPriceRule)
  constants.uploadPriceRuleInput.addEventListener('change', (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result)
        const res = uploadRule(jsonData)
        if (res.status) showToast('导入价格规则成功!', 'info')
        else {
          showToast(`此文件不是有效的价格规则设置:${res.err}`, 'error')
          console.error(`此文件不是有效的价格规则设置:${res.err}`)
        }
      } catch (err) {
        console.error('JSON 解析失败', err)
        showToast('文件内容不是有效的 JSON 格式', 'error')
      }
    }
    reader.onerror = () => {
      console.error('文件读取失败')
      showToast('无法读取文件')
    }
    reader.readAsText(file, 'UTF-8')
  })
  constants.editTeacherDataToggle.addEventListener('click', () => {
    constants.settingsModal.classList.add('hidden')
    constants.editTeacherDataModal.classList.remove('hidden')
    disableBackgroundWheel()
    renderData()
  })
}
