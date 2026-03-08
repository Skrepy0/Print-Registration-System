(function () {
  // 从localStorage加载，并清理遗留的unitPrice/totalAmount字段
  let rawRecords = JSON.parse(localStorage.getItem('printingRecords')) || [];
  let records = rawRecords.map(({unitPrice, totalAmount, ...rest}) => rest); // 彻底丢弃旧字段

  let currentPage = 1;
  let pageSize = 10;
  let sortField = null;
  let sortDirection = 'asc';
  let searchTerm = '';
  let chart = null;

  // DOM 元素
  const printForm = document.getElementById('print-form');
  const recordsTableBody = document.getElementById('records-table-body');
  const totalRecordsElement = document.getElementById('total-records');
  const startRecordElement = document.getElementById('start-record');
  const endRecordElement = document.getElementById('end-record');
  const currentPageElement = document.getElementById('current-page');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const pageSizeSelect = document.getElementById('page-size');
  const searchInput = document.getElementById('search-input');
  const selectAllCheckbox = document.getElementById('select-all');
  const exportSelectedButton = document.getElementById('export-selected-btn');
  const exportAllButton = document.getElementById('export-all-btn');
  const backupButton = document.getElementById('backup-btn');
  const settingsButton = document.getElementById('settings-btn');
  const editModal = document.getElementById('edit-modal');
  const modalContent = document.getElementById('modal-content');
  const closeModalButton = document.getElementById('close-modal');
  const editForm = document.getElementById('edit-form');
  const importButton = document.getElementById('import-btn');
  const fileUploadInput = document.getElementById('file-upload');
  const settingsModal = document.getElementById('settingsModal');
  const closeBtn = document.getElementById('closeSettings');
  const autoMatchToggle = document.getElementById('transform-button');

  // 设置部分的全局变量
  const saved = localStorage.getItem('autoMatchEnabled');
  let autoMatchEnabled = saved !== null ? JSON.parse(saved) : true;
  autoMatchToggle.textContent = autoMatchEnabled ? "开" : "关";
  // 计算字段 (印刷总数)
  const paperCountInput = document.getElementById('paper-count');
  const copyCountInput = document.getElementById('copy-count');
  const printTypeSelect = document.getElementById('print-type');
  const totalPagesInput = document.getElementById('total-pages');  // 只读，位于费用分类区块

  // 下拉框"其他"相关 (包含恢复的费用分类字段)
  const paperSizeSelect = document.getElementById('paper-size');
  const paperSizeOtherContainer = document.getElementById('paper-size-other-container');
  const paperSizeOtherInput = document.getElementById('paper-size-other');
  const gradeSelect = document.getElementById('grade');
  const gradeOtherContainer = document.getElementById('grade-other-container');
  const gradeOtherInput = document.getElementById('grade-other');
  // 费用分类相关 (已恢复)
  const expenseTypeSelect = document.getElementById('expense-type');
  const expenseTypeOtherContainer = document.getElementById('expense-type-other-container');
  const expenseTypeOtherInput = document.getElementById('expense-type-other');
  const subjectSelect = document.getElementById('subject');
  const subjectOtherContainer = document.getElementById('subject-other-container');
  const subjectOtherInput = document.getElementById('subject-other');
  const submitterSelect = document.getElementById('submitter');
  const submitterOtherContainer = document.getElementById('submitter-other-container');
  const submitterOtherInput = document.getElementById('submitter-other');
  const responsiblePersonInput = document.getElementById('responsible-person'); // 已移入费用分类

  // 预设值列表
  let subjects_options;
  let expense_type_options = ['试卷', '答题卡'];
  let submitterOptions;
  document.addEventListener('DOMContentLoaded', function() {
    // ===== 处理 select 数据 =====
    if (window.selectData) {
      const data = window.selectData;

      // 添加额外费用类型
      if (data.added_expense_type && Array.isArray(data.added_expense_type)) {
        data.added_expense_type.forEach(expenseType => {
          const option = document.createElement('option');
          option.text = expenseType;
          option.value = expenseType;
          // 插入到第二个选项之前（索引1），保留第一个提示项
          expenseTypeSelect.insertBefore(option, expenseTypeSelect[1]);
          expense_type_options.push(expenseType);
        });
      }

      // 设置科目选项
      if (data.subject && Array.isArray(data.subject)) {
        subjects_options = data.subject; // 保存到全局变量（如果需要）
        data.subject.forEach(subject => {
          const option = document.createElement('option');
          option.text = subject;
          option.value = subject;
          subjectSelect.insertBefore(option, subjectSelect[1]);
        });
      }
      showToast('配置数据加载成功', 'info');
    } else {
      console.error('selectData 未定义');
      showToast('配置数据加载失败', 'error');
    }

    // ===== 处理 teachers 数据 =====
    if (window.teachersData) {
      window.getSubjectBySubmitter = window.teachersData; // 保持全局变量名一致
      submitterOptions = Object.keys(window.teachersData);
      submitterOptions.forEach((submitter) => {
        const option = document.createElement('option');
        option.text = submitter;
        option.value = submitter;
        submitterSelect.insertBefore(option, submitterSelect[1]);
      });
      showToast('教师数据加载成功', 'info');
    } else {
      console.error('teachersData 未定义');
      showToast('教师数据加载失败', 'error');
    }
  });
  const GRADE_OPTIONS = ['高一', '高二', '高三'];
  const PAPER_SIZE_OPTIONS = ['A3', 'A4', 'A5', 'B4', 'B5'];


  // 初始化日期为今天
  document.getElementById('date').valueAsDate = new Date();

  // ========== 工具函数 ==========
  function updateToggleUI() {
    autoMatchToggle.style.color = autoMatchEnabled ? 'green' : 'red';
  }

  function getFilteredRecords() {
    if (!searchTerm) return records.slice();
    const term = searchTerm.toLowerCase();
    return records.filter(r =>
      r.date.toLowerCase().includes(term) ||
      (r.grade || '').toLowerCase().includes(term) ||
      r.subject.toLowerCase().includes(term) ||
      r.submitter.toLowerCase().includes(term) ||
      r.paperSize.toLowerCase().includes(term)
    );
  }

  function getFinalValue(sel, other) {
    if (sel.value === '其他') return other.value.trim() || '其他';
    return sel.value || '';
  }

  // 计算印刷总数 (纸张*份数*单双系数)
  function calculateTotalPages() {
    const paperCount = parseInt(paperCountInput.value) || 0;
    const copyCount = parseInt(copyCountInput.value) || 0;
    totalPagesInput.value = paperCount * copyCount;
  }

  // 保存至localStorage并清理旧字段
  function saveRecords() {
    const cleanRecords = records.map(({unitPrice, totalAmount, ...keep}) => keep);
    records = cleanRecords;
    localStorage.setItem('printingRecords', JSON.stringify(records));
    updateSyncStatus(true);
  }

  function updateSyncStatus(s) {
    document.getElementById('sync-status').innerHTML = s ? '<i class="fa fa-check-circle text-green-500 mr-1 animate-pulse"></i><span>数据已同步</span>' : '<i class="fa fa-exclamation-triangle text-yellow-500 mr-1"></i><span>数据未同步</span>';
  }

  function updateSubject() {
    if (!autoMatchEnabled) return;
    const submitter = document.getElementById('submitter');
    if (submitter && submitter.value !== '其他') {
      if (getSubjectBySubmitter[submitter.value]) {
        subjectSelect.value = getSubjectBySubmitter[submitter.value];
      }
    }
  }

  // ========== 初始化事件 ==========
  function init() {
    calculateTotalPages();

    paperCountInput.addEventListener('input', calculateTotalPages);
    copyCountInput.addEventListener('input', calculateTotalPages);
    printTypeSelect.addEventListener('change', calculateTotalPages);

    paperSizeSelect.addEventListener('change', togglePaperSizeOther);
    gradeSelect.addEventListener('change', toggleGradeOther);
    subjectSelect.addEventListener('change', toggleSubjectOther);
    submitterSelect.addEventListener('change', toggleSubmitterOther)
    submitterSelect.addEventListener('change', updateSubject)
    expenseTypeSelect.addEventListener('change', toggleExpenseTypeOther);

    printForm.addEventListener('reset', function () {
      setTimeout(() => {
        paperSizeOtherInput.value = '';
        gradeOtherInput.value = '';
        subjectOtherInput.value = '';
        submitterOtherContainer.value = '';
        expenseTypeOtherInput.value = '';
        togglePaperSizeOther();
        toggleGradeOther();
        toggleSubjectOther();
        toggleExpenseTypeOther();
        calculateTotalPages();
      }, 10);
    });

    printForm.addEventListener('submit', handleFormSubmit);

    prevPageButton.addEventListener('click', goToPrevPage);
    nextPageButton.addEventListener('click', goToNextPage);
    pageSizeSelect.addEventListener('change', handlePageSizeChange);
    searchInput.addEventListener('input', handleSearch);
    selectAllCheckbox.addEventListener('change', handleSelectAll);
    exportSelectedButton.addEventListener('click', exportSelectedRecords);
    exportAllButton.addEventListener('click', exportAllRecords);
    settingsButton.addEventListener('click', settings)
    backupButton.addEventListener('click', backupData);

    document.querySelectorAll('.sortable').forEach(header => {
      header.addEventListener('click', () => handleSort(header.dataset.sort));
    });

    closeModalButton.addEventListener('click', closeModal);
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) closeModal();
    });

    importButton.addEventListener('click', () => fileUploadInput.click());
    fileUploadInput.addEventListener('change', handleFileUpload);

    renderRecords();
    initChart();
  }

  // 设置
  // 初始化 UI
  updateToggleUI();

  // 点击切换
  autoMatchToggle.addEventListener('click', () => {
    autoMatchEnabled = !autoMatchEnabled;
    updateToggleUI();
    autoMatchToggle.textContent = autoMatchEnabled ? '开' : '关';
    localStorage.setItem('autoMatchEnabled', JSON.stringify(autoMatchEnabled));
  });

  // settings 函数：显示模态框
  function settings() {
    settingsModal.classList.remove('hidden');
  }

  // 关闭模态框（点击遮罩或关闭按钮）
  closeBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  // 点击遮罩层关闭
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });


  // ========== 其他字段切换 ==========
  function togglePaperSizeOther() {
    paperSizeSelect.value === '其他' ? paperSizeOtherContainer.classList.remove('hidden') : (paperSizeOtherContainer.classList.add('hidden'), paperSizeOtherInput.value = '');
  }

  function toggleGradeOther() {
    gradeSelect.value === '其他' ? gradeOtherContainer.classList.remove('hidden') : (gradeOtherContainer.classList.add('hidden'), gradeOtherInput.value = '');
  }

  function toggleSubjectOther() {
    subjectSelect.value === '其他' ? subjectOtherContainer.classList.remove('hidden') : (subjectOtherContainer.classList.add('hidden'), subjectOtherInput.value = '');
  }

  function toggleSubmitterOther() {
    submitterSelect.value === '其他' ? submitterOtherContainer.classList.remove('hidden') : (submitterOtherContainer.classList.add('hidden'), submitterOtherInput.value = '');
  }

  function toggleExpenseTypeOther() {
    expenseTypeSelect.value === '其他' ? expenseTypeOtherContainer.classList.remove('hidden') : (expenseTypeOtherContainer.classList.add('hidden'), expenseTypeOtherInput.value = '');
  }

  // ========== 表单提交 (无单价/金额) ==========
  function handleFormSubmit(e) {
    e.preventDefault();
    const grade = getFinalValue(gradeSelect, gradeOtherInput);
    const subject = getFinalValue(subjectSelect, subjectOtherInput);
    const submitter = getFinalValue(submitterSelect, submitterOtherInput);
    const paperSize = getFinalValue(paperSizeSelect, paperSizeOtherInput);
    const expenseType = getFinalValue(expenseTypeSelect, expenseTypeOtherInput);
    if (!grade || grade === '请选择年级') return showToast('请选择年级', 'warning');
    if (!subject) return showToast('请选择或输入学科', 'warning');
    if (!submitter || submitter === '其他') return showToast('请输入有效的送印人', 'warning');

    const newRecord = {
      id: Date.now().toString(),
      date: document.getElementById('date').value,
      grade, subject, paperSize, expenseType, submitter,
      printType: printTypeSelect.value,
      paperCount: parseInt(paperCountInput.value) || 0,
      copyCount: parseInt(copyCountInput.value) || 0,
      plateCount: parseInt(document.getElementById('plate-count').value) || 0,
      totalPages: parseInt(totalPagesInput.value) || 0,
      responsiblePerson: responsiblePersonInput.value.trim(),
      notes: document.getElementById('notes').value.trim(),
      createdAt: new Date().toISOString()
    };
    records.unshift(newRecord);
    saveRecords();
    renderRecords();
    updateChart();
    printForm.reset();
    document.getElementById('date').valueAsDate = new Date();
    calculateTotalPages();
    showToast('记录保存成功', 'success');
  }

  // ========== 渲染表格 (无金额列) ==========
  function renderRecords() {
    const filtered = getFilteredRecords();
    if (sortField) {
      filtered.sort((a, b) => {
        let va = a[sortField];
        let vb = b[sortField];
        if (va == null || va === '') va = sortDirection === 'asc' ? '\uffff' : '';
        if (vb == null || vb === '') vb = sortDirection === 'asc' ? '\uffff' : '';
        if (sortField === 'totalPages') {
          va = parseInt(va) || 0;
          vb = parseInt(vb) || 0;
          return sortDirection === 'asc' ? va - vb : vb - va;
        }
        const strA = String(va).toLowerCase();
        const strB = String(vb).toLowerCase();
        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const total = Math.ceil(filtered.length / pageSize);
    currentPage = Math.min(currentPage, total || 1);
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, filtered.length);
    const curr = filtered.slice(start, end);

    totalRecordsElement.textContent = filtered.length;
    startRecordElement.textContent = filtered.length ? start + 1 : 0;
    endRecordElement.textContent = end;
    currentPageElement.textContent = `第 ${currentPage} 页`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage >= total;

    recordsTableBody.innerHTML = '';
    if (!curr.length) {
      recordsTableBody.innerHTML = '<tr><td colspan="8" class="px-3 py-8 text-center text-neutral/60"><i class="fa fa-inbox mr-2"></i>暂无记录</td></tr>';
      return;
    }

    curr.forEach(r => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50/80 transition-colors';
      tr.innerHTML = `
          <td class="px-3 py-3"><input type="checkbox" class="record-select rounded border-gray-300 text-primary focus:ring-primary/30" data-id="${r.id}"></td>
          <td class="px-3 py-3">${r.date}</td>
          <td class="px-3 py-3">${r.grade || '-'}</td>
          <td class="px-3 py-3">${r.subject}</td>
          <td class="px-3 py-3">${r.submitter}</td>
          <td class="px-3 py-3">${r.printType}</td>
          <td class="px-3 py-3">${r.totalPages}</td>
          <td class="px-3 py-3">
            <button class="edit-btn text-blue-500 p-1 hover:text-blue-700 transition-transform hover:scale-110"><i class="fa info-link" data-info="修改记录">📝</i></button>
            <button class="delete-btn text-red-500 p-1 hover:text-red-700 transition-transform hover:scale-110"><i class="fa info-link" data-info="删除记录">🔥</i></button>
          </td>
        `;
      recordsTableBody.appendChild(tr);
      tr.querySelector('.edit-btn').addEventListener('click', () => editRecord(r.id));
      tr.querySelector('.delete-btn').addEventListener('click', () => deleteRecord(r.id));
      const cb = tr.querySelector('.record-select');
      cb.addEventListener('change', updateSelectAllStatus);
    });
    updateSelectAllStatus();
  }

  // ========== 分页、搜索、排序 ==========
  function goToPrevPage() {
    if (currentPage > 1) {
      currentPage--;
      renderRecords();
    }
  }

  function goToNextPage() {
    const t = Math.ceil(getFilteredRecords().length / pageSize);
    if (currentPage < t) {
      currentPage++;
      renderRecords();
    }
  }

  function handlePageSizeChange() {
    pageSize = +pageSizeSelect.value;
    currentPage = 1;
    renderRecords();
  }

  function handleSearch() {
    searchTerm = searchInput.value.trim();
    currentPage = 1;
    renderRecords();
  }

  function handleSort(f) {
    if (sortField === f) sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      sortField = f;
      sortDirection = 'asc';
    }
    document.querySelectorAll('.sortable i').forEach(i => i.className = 'fa fa-sort ml-1');
    const ic = document.querySelector(`.sortable[data-sort="${f}"] i`);
    if (ic) ic.className = `fa fa-sort-${sortDirection} ml-1`;
    renderRecords();
  }

  // ========== 全选 ==========
  function handleSelectAll() {
    document.querySelectorAll('.record-select').forEach(cb => cb.checked = selectAllCheckbox.checked);
  }

  function updateSelectAllStatus() {
    const cs = document.querySelectorAll('.record-select');
    selectAllCheckbox.checked = cs.length && Array.from(cs).every(c => c.checked);
  }

  // ========== 导出 (无金额字段) ==========
  function exportSelectedRecords() {
    const ids = Array.from(document.querySelectorAll('.record-select:checked')).map(c => c.dataset.id);
    if (!ids.length) return showToast('请选择记录', 'warning');
    exportRecordsToExcel(records.filter(r => ids.includes(r.id)), '印刷记录_选中');
  }

  function exportAllRecords() {
    exportRecordsToExcel(records, '印刷记录_全部');
  }

  function exportRecordsToExcel(data, name) {
    const out = data.map(r => ({
      日期: r.date, 年级: r.grade || '', 学科: r.subject, 送印人: r.submitter, 纸张: r.paperSize,
      单双: r.printType, 纸张数: r.paperCount, 份数: r.copyCount, 印刷总数: r.totalPages,
      类型: r.expenseType, 负责人: r.responsiblePerson || '', 备注: r.notes || ''
    }));
    const ws = XLSX.utils.json_to_sheet(out);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '印刷记录');
    XLSX.writeFile(wb, `${name}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    showToast('导出成功', 'success');
  }

  // ========== 备份 ==========
  function backupData() {
    if (!records.length) return showToast('无数据可备份', 'warning');
    const cleanForBackup = records.map(({unitPrice, totalAmount, ...keep}) => keep);
    const blob = new Blob([JSON.stringify({records: cleanForBackup, time: new Date()})], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `备份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('备份成功', 'success');
  }

  // ========== 导入 ==========
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file || (file.type !== 'application/json' && !file.name.endsWith('.json'))) {
      showToast('请选择JSON文件', 'error');
      fileUploadInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.records || !Array.isArray(data.records)) throw new Error('无效备份');
        const cleanedIncoming = data.records.map(({unitPrice, totalAmount, ...rest}) => rest);
        const isValid = cleanedIncoming.every(r => r.id && r.date && r.subject && r.submitter);
        if (!isValid) {
          showToast('备份文件中存在不完整的记录', 'error');
          fileUploadInput.value = '';
          return;
        }

        const mode = confirm(`备份中有 ${cleanedIncoming.length} 条记录。\n确定=覆盖现有，取消=合并`);
        if (mode) {
          records = cleanedIncoming;
        } else {
          const existingIds = new Set(records.map(r => r.id));
          const newRecords = cleanedIncoming.filter(r => !existingIds.has(r.id));
          const updatedRecords = cleanedIncoming.filter(r => existingIds.has(r.id));
          updatedRecords.forEach(backupRecord => {
            const index = records.findIndex(r => r.id === backupRecord.id);
            if (index !== -1) records[index] = backupRecord;
          });
          records = [...newRecords, ...records];
        }
        saveRecords();
        renderRecords();
        updateChart();
        showToast('导入成功', 'success');
      } catch (err) {
        showToast('解析失败', 'error');
      }
      fileUploadInput.value = '';
    };
    reader.readAsText(file);
  }

  // ========== 删除 ==========
  function deleteRecord(id) {
    if (confirm('确定删除？')) {
      records = records.filter(r => r.id !== id);
      saveRecords();
      renderRecords();
      updateChart();
      showToast('已删除', 'success');
    }
  }

  // ========== 模态框 ==========
  function openModal() {
    editModal.classList.remove('hidden');
    void modalContent.offsetWidth;
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
  }

  function closeModal() {
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      editModal.classList.add('hidden');
      editForm.innerHTML = '';
    }, 300);
  }

  // ========== 提示 ==========
  function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const msgEl = document.getElementById('toast-message');
    const colors = {success: 'green', warning: 'yellow', error: 'red', info: 'blue'};
    const icons = {
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle',
      info: 'fa-info-circle'
    };
    toast.className = `fixed bottom-5 right-5 px-4 py-3 rounded-xl shadow-2xl transform translate-y-20 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center z-50 backdrop-blur-md bg-white/90 border border-${colors[type]}-200`;
    icon.className = `fa ${icons[type]} mr-2 text-${colors[type]}-600`;
    msgEl.textContent = msg;
    setTimeout(() => {
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
  }

  // ========== 图表 (仅印刷总数) ==========
  function initChart() {
    const ctx = document.getElementById('statistics-chart').getContext('2d');
    const data = getChartData();
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {label: '印刷总数', data: data.totalPages, backgroundColor: 'rgba(22,93,255,0.7)', borderRadius: 6}
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {y: {beginAtZero: true, grid: {color: '#eef2f6'}}},
        plugins: {legend: {labels: {usePointStyle: true, boxWidth: 8}}}
      }
    });
  }

  function updateChart() {
    if (!chart) return;
    const d = getChartData();
    chart.data.labels = d.labels;
    chart.data.datasets[0].data = d.totalPages;
    chart.update();
  }

  function getChartData() {
    const labels = [], pages = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      labels.push(`${d.getMonth() + 1}月${d.getDate()}日`);
      const day = records.filter(r => r.date === key);
      pages.push(day.reduce((s, r) => s + r.totalPages, 0));
    }
    return {labels, totalPages: pages};
  }

  // ========== 编辑记录 (恢复费用分类区块，无单价/金额) ==========
  function editRecord(id) {
    const record = records.find(r => r.id === id);
    if (!record) {
      showToast('记录不存在', 'error');
      return;
    }

    const isCustomGrade = !GRADE_OPTIONS.includes(record.grade);
    const isCustomSubject = !subjects_options.includes(record.subject);
    const isCustomSubmitter = !submitterOptions.includes(record.submitter);
    const isCustomPaperSize = !PAPER_SIZE_OPTIONS.includes(record.paperSize);
    const isCustomExpenseType = !expense_type_options.includes(record.expenseType);

    editForm.innerHTML = `
        <input type="hidden" id="edit-id" value="${record.id}">

        <!-- 基本信息 (不变) -->
        <div class="space-y-3">
            <h3 class="text-sm font-medium text-neutral/80 uppercase tracking-wider">基本信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label class="block text-sm font-medium mb-1">日期 <span class="text-red-500">*</span></label><input type="date" id="edit-date" required value="${record.date}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white"></div>
                <div><label class="block text-sm font-medium mb-1">年级</label>
                    <select id="edit-grade" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        ${GRADE_OPTIONS.map(g => `<option value="${g}" ${record.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
                        <option value="其他" ${isCustomGrade ? 'selected' : ''}>其他</option>
                    </select>
                    <div id="edit-grade-other-box" class="mt-2 ${isCustomGrade ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">其他年级：</label><input type="text" id="edit-grade-other" value="${isCustomGrade ? record.grade : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label class="block text-sm font-medium mb-1">学科 <span class="text-red-500">*</span></label>
                    <select id="edit-subject" required class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        <option value="">请选择</option>${subjects_options.map(s => `<option value="${s}" ${record.subject === s ? 'selected' : ''}>${s}</option>`).join('')}<option value="其他" ${isCustomSubject ? 'selected' : ''}>其他</option>
                    </select>
                    <div id="edit-subject-other-box" class="mt-2 ${isCustomSubject ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">自定义学科：</label><input type="text" id="edit-subject-other" value="${isCustomSubject ? record.subject : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
                </div>
                <div><label class="block text-sm font-medium mb-1">送印人 <span class="text-red-500">*</span></label>
                    <select id="edit-submitter" required class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        <option value="">请选择</option>${submitterOptions.map(s => `<option value="${s}" ${record.subject === s ? 'selected' : ''}>${s}</option>`).join('')}<option value="其他" ${isCustomSubmitter ? 'selected' : ''}>其他</option>
                    </select>
                    <div id="edit-submitter-other-box" class="mt-2 ${isCustomSubmitter ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">其他送印人：</label><input type="text" id="edit-submitter-other" value="${isCustomSubmitter ? record.submitter : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
            </div>
        </div>

        <!-- 印刷信息 (不变) -->
        <div class="space-y-3">
            <h3 class="text-sm font-medium text-neutral/80 uppercase tracking-wider">印刷信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label class="block text-sm font-medium mb-1">纸张规格</label>
                    <select id="edit-paper-size" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        ${PAPER_SIZE_OPTIONS.map(p => `<option value="${p}" ${record.paperSize === p ? 'selected' : ''}>${p}</option>`).join('')}<option value="其他" ${isCustomPaperSize ? 'selected' : ''}>其他</option>
                    </select>
                    <div id="edit-paper-other-box" class="mt-2 ${isCustomPaperSize ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">自定义规格：</label><input type="text" id="edit-paper-other" value="${isCustomPaperSize ? record.paperSize : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
                </div>
                <div><label class="block text-sm font-medium mb-1">单双 <span class="text-red-500">*</span></label><select id="edit-print-type" required class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white"><option value="单面" ${record.printType === '单面' ? 'selected' : ''}>单面</option><option value="双面" ${record.printType === '双面' ? 'selected' : ''}>双面</option></select></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label class="block text-sm font-medium mb-1">印刷纸张 <span class="text-red-500">*</span></label><input type="number" id="edit-paper-count" required min="1" value="${record.paperCount}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white"></div>
                <div><label class="block text-sm font-medium mb-1">印刷份数 <span class="text-red-500">*</span></label><input type="number" id="edit-copy-count" required min="1" value="${record.copyCount}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white"></div>
            </div>
            <div><label class="block text-sm font-medium mb-1">制版数量</label><input type="number" id="edit-plate-count" min="0" value="${record.plateCount}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white"></div>
        </div>

        <!-- ===== 费用分类区块（恢复，无单价/金额） ===== -->
        <div class="space-y-3">
            <h3 class="text-sm font-medium text-neutral/80 uppercase tracking-wider">📁 费用分类</h3>
            <div>
                <label class="block text-sm font-medium mb-1">印刷总数</label>
                <input type="number" id="edit-total-pages" readonly value="${record.totalPages}" class="w-full px-3 py-2 bg-gray-100/50 border border-gray-200 rounded-xl text-gray-600">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">类型</label>
                <select id="edit-expense-type" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                    ${expense_type_options.map(e => `<option value="${e}" ${record.expenseType === e ? 'selected' : ''}>${e}</option>`).join('')}<option value="其他" ${isCustomExpenseType ? 'selected' : ''}>其他</option>
                </select>
                <div id="edit-expense-other-box" class="mt-2 ${isCustomExpenseType ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">自定义类型：</label><input type="text" id="edit-expense-other" value="${isCustomExpenseType ? record.expenseType : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">负责人</label>
                <input type="text" id="edit-responsible" value="${record.responsiblePerson || ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
            </div>
        </div>

        <!-- 备注 -->
        <div>
            <label class="block text-sm font-medium mb-1">备注</label>
            <textarea id="edit-notes" rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white resize-none">${record.notes || ''}</textarea>
        </div>

        <!-- 操作按钮 -->
        <div class="flex space-x-3 pt-2">
            <button type="button" id="cancel-edit" class="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 text-neutral flex items-center justify-center btn-scale bg-white/80"><i class="fa fa-times mr-1"></i> 取消</button>
            <button type="submit" class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-xl btn-scale ripple-effect"><i class="fa fa-save mr-1"></i> 保存修改</button>
        </div>
      `;

    // 绑定事件和计算逻辑 (仅总数)
    const editPaperCount = document.getElementById('edit-paper-count');
    const editCopyCount = document.getElementById('edit-copy-count');
    const editPrintType = document.getElementById('edit-print-type');
    const editTotalPages = document.getElementById('edit-total-pages');

    function calcEditTotal() {
      const pc = parseInt(editPaperCount.value) || 0;
      const cc = parseInt(editCopyCount.value) || 0;
      editTotalPages.value = pc * cc;
    }

    editPaperCount.addEventListener('input', calcEditTotal);
    editCopyCount.addEventListener('input', calcEditTotal);
    editPrintType.addEventListener('change', calcEditTotal);

    // 其他字段切换
    document.getElementById('edit-grade').addEventListener('change', function () {
      document.getElementById('edit-grade-other-box').classList.toggle('hidden', this.value !== '其他');
    });
    document.getElementById('edit-subject').addEventListener('change', function () {
      document.getElementById('edit-subject-other-box').classList.toggle('hidden', this.value !== '其他');
    });
    document.getElementById('edit-submitter').addEventListener('change', function () {
      document.getElementById('edit-submitter-other-box').classList.toggle('hidden', this.value !== '其他');
    })
    document.getElementById('edit-submitter').addEventListener('change',function (){
      if (!autoMatchEnabled) return;
      const submitter = document.getElementById('edit-submitter');
      if (submitter && submitter.value !== '其他') {
        if (getSubjectBySubmitter[submitter.value]) {
          document.getElementById('edit-subject').value = getSubjectBySubmitter[submitter.value];
        }
      }
    })
    document.getElementById('edit-paper-size').addEventListener('change', function () {
      document.getElementById('edit-paper-other-box').classList.toggle('hidden', this.value !== '其他');
    });
    document.getElementById('edit-expense-type').addEventListener('change', function () {
      document.getElementById('edit-expense-other-box').classList.toggle('hidden', this.value !== '其他');
    });

    document.getElementById('cancel-edit').addEventListener('click', closeModal);

    const handleEditSubmit = (e) => {
      e.preventDefault();
      const finalGrade = getFinalValue(document.getElementById('edit-grade'), document.getElementById('edit-grade-other'));
      const finalSubject = getFinalValue(document.getElementById('edit-subject'), document.getElementById('edit-subject-other'));
      const finalSubmitter = getFinalValue(document.getElementById('edit-submitter'), document.getElementById('edit-submitter-other'));
      const finalPaperSize = getFinalValue(document.getElementById('edit-paper-size'), document.getElementById('edit-paper-other'));
      const finalExpenseType = getFinalValue(document.getElementById('edit-expense-type'), document.getElementById('edit-expense-other'));
      if (!document.getElementById('edit-date').value) return showToast('请选择日期', 'warning');
      if (!finalGrade) return showToast('请选择年级', 'warning');
      if (!finalSubject) return showToast('请选择或输入学科', 'warning');
      if (!finalSubmitter) return showToast('请输入送印人', 'warning');

      const index = records.findIndex(r => r.id === id);
      if (index === -1) {
        showToast('记录不存在', 'error');
        return;
      }

      records[index] = {
        ...records[index],
        date: document.getElementById('edit-date').value,
        grade: finalGrade,
        subject: finalSubject,
        submitter: finalSubmitter,
        paperSize: finalPaperSize,
        printType: editPrintType.value,
        paperCount: parseInt(editPaperCount.value) || 0,
        copyCount: parseInt(editCopyCount.value) || 0,
        plateCount: parseInt(document.getElementById('edit-plate-count').value) || 0,
        totalPages: parseInt(editTotalPages.value) || 0,
        expenseType: finalExpenseType,
        responsiblePerson: document.getElementById('edit-responsible').value.trim(),
        notes: document.getElementById('edit-notes').value.trim()
      };
      saveRecords();
      renderRecords();
      updateChart();
      closeModal();
      showToast('记录修改成功', 'success');
    };
    editForm.removeEventListener('submit', handleEditSubmit);
    editForm.addEventListener('submit', handleEditSubmit);
    openModal();
  }

  // 启动
  init();
})();