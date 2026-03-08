import * as constants from "../../data/constants.js";
import {state} from "../../data/constants.js";
import {delSelectedRecords} from "../components/records.js";
import {
  updateToggleUI,
  calculateTotalPages, settings,
  toggleExpenseTypeOther,
  toggleGradeOther,
  togglePaperSizeOther,
  toggleSubjectOther, toggleSubmitterOther, updateSubject
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

export function registerEvents() {
  // 点击切换
  constants.autoMatchToggle.addEventListener('click', () => {
    state.autoMatchEnabled = !state.autoMatchEnabled;
    updateToggleUI();
    constants.autoMatchToggle.textContent = state.autoMatchEnabled ? '开' : '关';
    localStorage.setItem('autoMatchEnabled', JSON.stringify(state.autoMatchEnabled));
  });

  // 关闭模态框（点击遮罩或关闭按钮）
  constants.closeBtn.addEventListener('click', () => {
    constants.settingsModal.classList.add('hidden');
  });

  // 点击遮罩层关闭
  constants.settingsModal.addEventListener('click', (e) => {
    if (e.target === constants.settingsModal) {
      constants.settingsModal.classList.add('hidden');
    }
  });

  constants.delSelectedRecord.addEventListener('click', () => {
    delSelectedRecords()
  })
}

export function initEvents() {
  constants.paperCountInput.addEventListener('input', calculateTotalPages);
  constants.copyCountInput.addEventListener('input', calculateTotalPages);
  constants.printTypeSelect.addEventListener('change', calculateTotalPages);

  constants.paperSizeSelect.addEventListener('change', togglePaperSizeOther);
  constants.gradeSelect.addEventListener('change', toggleGradeOther);
  constants.subjectSelect.addEventListener('change', toggleSubjectOther);
  constants.submitterSelect.addEventListener('change', toggleSubmitterOther)
  constants.submitterSelect.addEventListener('change', updateSubject)
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
  constants.exportSelectedButton.addEventListener('click', exportSelectedRecords);
  constants.exportAllButton.addEventListener('click', exportAllRecords);
  constants.settingsButton.addEventListener('click', settings)
  constants.backupButton.addEventListener('click', backupData);

  document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => handleSort(header.dataset.sort));
  });

  constants.closeModalButton.addEventListener('click', closeModal);
  constants.editModal.addEventListener('click', (e) => {
    if (e.target === constants.editModal) closeModal();
  });

  constants.importButton.addEventListener('click', () => constants.fileUploadInput.click());
  constants.fileUploadInput.addEventListener('change', handleFileUpload);
}