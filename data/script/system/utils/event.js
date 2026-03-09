import * as constants from "../../data/constants.js";
import {deleteSelectData, reload, searchDataInput, selectTodayRecords} from "../../data/constants.js";
import {delSelectedRecords, selectToday} from "../components/records.js";
import {
  updateToggleUI,
  calculateTotalPages, settings,
  toggleExpenseTypeOther,
  toggleGradeOther,
  togglePaperSizeOther,
  toggleSubjectOther, toggleSubmitterOther, updateAutoData, enableBackgroundWheel
} from "./function.js";
import {
  goToNextPage,
  goToPrevPage,
  handleFormSubmit,
  handlePageSizeChange,
  handleSearch,
  handleSelectAll, handleSort
} from "../components/form.js";
import {backupData, exportAllRecords, exportSelectedRecords, handleFileUpload} from "./io.js";
import {closeModal} from "./modal.js";
import {config} from "../../data/config/config.js";
import {deleteSelectDataRecords, handleDataSearch, handleSelectAllData, renderData} from "../../data/catch/form.js";

export function registerEvents() {
  // 点击切换
  for (let i = 0; i < constants.toggles.length; i++) {
    let toggle = constants.toggles[i];
    toggle.addEventListener("click", () => {
      toggle.textContent = toggle.textContent === '关' ? '开' : '关';
      updateToggleUI();
    });
  }
  document.addEventListener('DOMContentLoaded', reload);

  constants.autoMatchToggle.addEventListener('click', () => {
    config.autoMatchEnabled = !config.autoMatchEnabled;
    localStorage.setItem('autoMatchEnabled', JSON.stringify(config.autoMatchEnabled));
  });

  constants.autoCatchToggle.addEventListener('click', () => {
    config.autoCatchInfo = !config.autoCatchInfo;
    localStorage.setItem('autoCatchInfo', JSON.stringify(config.autoCatchInfo));
  });

  // 关闭模态框（点击遮罩或关闭按钮）
  constants.closeBtn.addEventListener('click', () => {
    constants.settingsModal.classList.add('hidden');
    enableBackgroundWheel();
  });
  constants.closeEditTeacherData.addEventListener('click', () => {
    constants.editTeacherDataModal.classList.add('hidden');
    enableBackgroundWheel();
  })
  constants.editTeacherDataModal.addEventListener('click', (e) => {
    if (e.target === constants.editTeacherDataModal) {
      constants.editTeacherDataModal.classList.add('hidden');
      enableBackgroundWheel();
    }
  });

  // 点击遮罩层关闭
  constants.settingsModal.addEventListener('click', (e) => {
    if (e.target === constants.settingsModal) {
      constants.settingsModal.classList.add('hidden');
      enableBackgroundWheel();
    }
  });

  constants.delSelectedRecord.addEventListener('click', () => {
    delSelectedRecords()
  });
}

export function initEvents() {
  constants.paperCountInput.addEventListener('input', calculateTotalPages);
  constants.copyCountInput.addEventListener('input', calculateTotalPages);
  constants.printTypeSelect.addEventListener('change', calculateTotalPages);

  constants.paperSizeSelect.addEventListener('change', togglePaperSizeOther);
  constants.gradeSelect.addEventListener('change', toggleGradeOther);
  constants.subjectSelect.addEventListener('change', toggleSubjectOther);
  constants.submitterSelect.addEventListener('change', toggleSubmitterOther)
  constants.submitterSelect.addEventListener('change', updateAutoData)
  constants.expenseTypeSelect.addEventListener('change', toggleExpenseTypeOther);

  constants.printForm.addEventListener('reset', function () {
    setTimeout(() => {
      constants.paperSizeOtherInput.value = '';
      constants.gradeOtherInput.value = '';
      constants.subjectOtherInput.value = '';
      constants.submitterOtherContainer.value = '';
      constants.expenseTypeOtherInput.value = '';
      togglePaperSizeOther();
      toggleGradeOther();
      toggleSubjectOther();
      toggleExpenseTypeOther();
      toggleSubmitterOther();
      calculateTotalPages();
    }, 10);
  });

  constants.printForm.addEventListener('submit', handleFormSubmit);

  constants.prevPageButton.addEventListener('click', goToPrevPage);
  constants.nextPageButton.addEventListener('click', goToNextPage);
  constants.pageSizeSelect.addEventListener('change', handlePageSizeChange);
  constants.searchInput.addEventListener('input', handleSearch);
  constants.selectAllCheckbox.addEventListener('change', handleSelectAll);
  constants.editCatchSelectAll.addEventListener('change', handleSelectAllData);
  constants.exportSelectedButton.addEventListener('click', exportSelectedRecords);
  constants.exportAllButton.addEventListener('click', exportAllRecords);
  constants.settingsButton.addEventListener('click', settings)
  constants.backupButton.addEventListener('click', backupData);
  constants.searchDataInput.addEventListener('input', handleDataSearch);
  constants.deleteSelectData.addEventListener('click', deleteSelectDataRecords);
  constants.selectTodayRecords.addEventListener('click', selectToday);

  document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => handleSort(header.dataset.sort));
  });

  constants.closeModalButton.addEventListener('click', closeModal);
  constants.editModal.addEventListener('click', (e) => {
    if (e.target === constants.editModal) closeModal();
  });

  constants.importButton.addEventListener('click', () => constants.fileUploadInput.click());
  constants.fileUploadInput.addEventListener('change', handleFileUpload);

  constants.editTeacherDataToggle.addEventListener('click', () => {
    constants.settingsModal.classList.add('hidden');
    constants.editTeacherDataModal.classList.remove('hidden');
    renderData();
  });
}