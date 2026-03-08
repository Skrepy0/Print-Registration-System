import {
  calculateTotalPages, settings,
  toggleExpenseTypeOther,
  toggleGradeOther,
  togglePaperSizeOther,
  toggleSubjectOther, toggleSubmitterOther, updateSubject
} from "./utils/function.js";
import * as constants from "../data/constants.js";
import {
  goToNextPage,
  goToPrevPage,
  handleFormSubmit,
  handlePageSizeChange,
  handleSearch,
  handleSelectAll, handleSort
} from "./components/form.js";
import {backupData, exportAllRecords, exportSelectedRecords, handleFileUpload} from "./utils/io.js";
import {closeModal} from "./utils/modal.js";
import {renderRecords} from "./components/records.js";
import {initChart} from "./components/chart.js";

export function init() {
  calculateTotalPages();

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

  renderRecords();
  initChart();
}