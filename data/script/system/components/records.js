import * as constants from "../../data/constants.js";
import {state} from "../../data/constants.js";
import {updateChart} from "./chart.js";
import {getFinalValue, showToast, updateSyncStatus} from "../utils/function.js";
import {closeModal, openModal} from "../utils/modal.js";
import {config} from "../../data/config/config.js";

export function getFilteredRecords() {
  if (!state.searchTerm) return state.records.slice();
  const term = state.searchTerm.toLowerCase();
  return state.records.filter(r =>
    r.date.toLowerCase().includes(term) ||
    (r.grade || '').toLowerCase().includes(term) ||
    r.subject.toLowerCase().includes(term) ||
    r.submitter.toLowerCase().includes(term) ||
    r.paperSize.toLowerCase().includes(term)
  );
}
export function renderRecords() {
  const filtered = getFilteredRecords();
  if (state.sortField) {
    filtered.sort((a, b) => {
      let va = a[state.sortField];
      let vb = b[state.sortField];
      if (va == null || va === '') va = constants.sortDirection === 'asc' ? '\uffff' : '';
      if (vb == null || vb === '') vb = constants.sortDirection === 'asc' ? '\uffff' : '';
      if (state.sortField === 'totalPages') {
        va = parseInt(va) || 0;
        vb = parseInt(vb) || 0;
        return state.sortDirection === 'asc' ? va - vb : vb - va;
      }
      const strA = String(va).toLowerCase();
      const strB = String(vb).toLowerCase();
      if (strA < strB) return state.sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return state.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const total = Math.ceil(filtered.length / state.pageSize);
  state.currentPage = Math.min(state.currentPage, total || 1);
  const start = (state.currentPage - 1) * state.pageSize;
  const end = Math.min(start + state.pageSize, filtered.length);
  const curr = filtered.slice(start, end);

  constants.totalRecordsElement.textContent = filtered.length;
  constants.startRecordElement.textContent = filtered.length ? start + 1 : 0;
  constants.endRecordElement.textContent = end;
  constants.currentPageElement.textContent = `第 ${state.currentPage} 页`;
  constants.prevPageButton.disabled = state.currentPage === 1;
  constants.nextPageButton.disabled = state.currentPage >= total;

  constants.recordsTableBody.innerHTML = '';
  if (!curr.length) {
    constants.recordsTableBody.innerHTML = '<tr><td colspan="8" class="px-3 py-8 text-center text-neutral/60"><i class="fa fa-inbox mr-2"></i>暂无记录</td></tr>';
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
    constants.recordsTableBody.appendChild(tr);
    tr.querySelector('.edit-btn').addEventListener('click', () => editRecord(r.id));
    tr.querySelector('.delete-btn').addEventListener('click', () => deleteRecord(r.id));
    const cb = tr.querySelector('.record-select');
    cb.addEventListener('change', updateSelectAllStatus);
  });
  updateSelectAllStatus();
}

export function editRecord(id) {
  const record = state.records.find(r => r.id === id);
  if (!record) {
    showToast('记录不存在', 'error');
    return;
  }

  const isCustomGrade = !constants.GRADE_OPTIONS.includes(record.grade);
  const isCustomSubject = !state.subjects_options.includes(record.subject);
  const isCustomSubmitter = !state.submitterOptions.includes(record.submitter);
  const isCustomPaperSize = !constants.PAPER_SIZE_OPTIONS.includes(record.paperSize);
  const isCustomExpenseType = !state.expense_type_options.includes(record.expenseType);

  constants.editForm.innerHTML = `
        <input type="hidden" id="edit-id" value="${record.id}">

        <!-- 基本信息 (不变) -->
        <div class="space-y-3">
            <h3 class="text-sm font-medium text-neutral/80 uppercase tracking-wider">基本信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label class="block text-sm font-medium mb-1">日期 <span class="text-red-500">*</span></label><input type="date" id="edit-date" required value="${record.date}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white"></div>
                <div><label class="block text-sm font-medium mb-1">年级</label>
                    <select id="edit-grade" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        ${constants.GRADE_OPTIONS.map(g => `<option value="${g}" ${record.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
                        <option value="其他" ${isCustomGrade ? 'selected' : ''}>其他</option>
                    </select>
                    <div id="edit-grade-other-box" class="mt-2 ${isCustomGrade ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">其他年级：</label><input type="text" id="edit-grade-other" value="${isCustomGrade ? record.grade : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label class="block text-sm font-medium mb-1">学科 <span class="text-red-500">*</span></label>
                    <select id="edit-subject" required class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        <option value="">请选择</option>${state.subjects_options.map(s => `<option value="${s}" ${record.subject === s ? 'selected' : ''}>${s}</option>`).join('')}<option value="其他" ${isCustomSubject ? 'selected' : ''}>其他</option>
                    </select>
                    <div id="edit-subject-other-box" class="mt-2 ${isCustomSubject ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">自定义学科：</label><input type="text" id="edit-subject-other" value="${isCustomSubject ? record.subject : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
                </div>
                <div><label class="block text-sm font-medium mb-1">送印人 <span class="text-red-500">*</span></label>
                    <select id="edit-submitter" required class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        <option value="">请选择</option>${state.submitterOptions.map(s => `<option value="${s}" ${record.subject === s ? 'selected' : ''}>${s}</option>`).join('')}<option value="其他" ${isCustomSubmitter ? 'selected' : ''}>其他</option>
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
                        ${constants.PAPER_SIZE_OPTIONS.map(p => `<option value="${p}" ${record.paperSize === p ? 'selected' : ''}>${p}</option>`).join('')}<option value="其他" ${isCustomPaperSize ? 'selected' : ''}>其他</option>
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
                    ${state.expense_type_options.map(e => `<option value="${e}" ${record.expenseType === e ? 'selected' : ''}>${e}</option>`).join('')}<option value="其他" ${isCustomExpenseType ? 'selected' : ''}>其他</option>
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
  document.getElementById('edit-submitter').addEventListener('change', function () {
    if (!config.autoMatchEnabled) return;
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

    const index = state.records.findIndex(r => r.id === id);
    if (index === -1) {
      showToast('记录不存在', 'error');
      return;
    }

    state.records[index] = {
      ...state.records[index],
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
  constants.editForm.removeEventListener('submit', handleEditSubmit);
  constants.editForm.addEventListener('submit', handleEditSubmit);
  openModal();
}
export function saveRecords() {
  state.records = state.records.map(({unitPrice, totalAmount, ...keep}) => keep);
  localStorage.setItem('printingRecords', JSON.stringify(state.records));
  updateSyncStatus(true);
}
function delRecord(id) {
  state.records = state.records.filter(r => r.id !== id);
  saveRecords();
  renderRecords();
  updateChart();
  showToast('已删除', 'success');
}
export function deleteRecord(id) {
  if (confirm('确定删除？')) {
    delRecord(id);
  }
}

export function delSelectedRecords(){
  const ids = Array.from(document.querySelectorAll('.record-select:checked')).map(c => c.dataset.id);
  if (!ids.length) return showToast('请选择记录', 'warning');
  if (confirm('确定删除？')) {
    state.records.filter(r => {
      if (ids.includes(r.id)){
        delRecord(r.id);
      }
    });
  }
}

export function updateSelectAllStatus() {
  const cs = document.querySelectorAll('.record-select');
  constants.selectAllCheckbox.checked = cs.length && Array.from(cs).every(c => c.checked);
}