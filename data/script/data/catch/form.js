import { data, saveData } from './catch.js'
import * as constants from '../constants.js'
import { loadSubmitters, reload, state } from '../constants.js'
import {
  disableBackgroundWheel,
  showToast,
} from '../../system/utils/function.js'
import { config } from '../config/config.js'
import {
  closeAddDataModal,
  closePromptModal,
  showAddDataModal,
  showEditDataModal,
  showPromptModal,
} from '../../system/utils/modal.js'

export function closeEditDataPage() {
  constants.editDataModal.classList.add('hidden')
  constants.editTeacherDataModal.classList.remove('hidden')
  disableBackgroundWheel()
}

function editData(key) {
  showEditDataModal()
  const record =
    data.catchTeacherList[
      Object.keys(data.catchTeacherList).find((k) => k === key)
    ]
  if (!record) {
    showToast('记录不存在', 'error')
    return
  }

  const isCustomSubmitter = !state.submitterOptions.includes(key)
  const isCustomGrade = !constants.GRADE_OPTIONS.includes(record[0])
  const isCustomSubject = !state.subjects_options.includes(record[1])

  constants.editDataForm.innerHTML = `
        <input type="hidden" id="edit-data-id" value="${key}">

        <!-- 基本信息 (不变) -->
        <div class="space-y-3">
            <h3 class="text-sm font-medium text-neutral/80 uppercase tracking-wider">基本信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label class="block text-sm font-medium mb-1">年级</label>
                    <select id="edit-grade-data" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        ${constants.GRADE_OPTIONS.map((g) => `<option value="${g}" ${record[0] === g ? 'selected' : ''}>${g}</option>`).join('')}
                        <option value="其他" ${isCustomGrade ? 'selected' : ''}>其他</option>
                    </select>
                    <div id="edit-grade-data-other-box" class="mt-2 ${isCustomGrade ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">其他年级：</label><input type="text" id="edit-grade-data-other" value="${isCustomGrade ? record[0] : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label class="block text-sm font-medium mb-1">学科 <span class="text-red-500">*</span></label>
                    <select id="edit-subject-data" required class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        <option value="">请选择</option>${state.subjects_options.map((s) => `<option value="${s}" ${record[1] === s ? 'selected' : ''}>${s}</option>`).join('')}<option value="其他" ${isCustomSubject ? 'selected' : ''}>其他</option>
                    </select>
                    <div id="edit-subject-data-other-box" class="mt-2 ${isCustomSubject ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">自定义学科：</label><input type="text" id="edit-subject-data-other" value="${isCustomSubject ? record[1] : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
                </div>
                <div><label class="block text-sm font-medium mb-1">送印人 <span class="text-red-500">*</span></label>
                    <select id="edit-submitter-data" required class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom bg-gray-50/50 focus:bg-white">
                        <option value="">请选择</option>${state.submitterOptions.map((s) => `<option value="${s}" ${key === s ? 'selected' : ''}>${s}</option>`).join('')}<option value="其他" ${isCustomSubmitter ? 'selected' : ''}>其他</option>
                    </select>
                    <div id="edit-submitter-data-other-box" class="mt-2 ${isCustomSubmitter ? '' : 'hidden'}"><label class="block text-sm font-medium mb-1 text-gray-600">其他送印人：</label><input type="text" id="edit-submitter-data-other" value="${isCustomSubmitter ? key : ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl input-focus transition-custom"></div>
            </div>
        </div>
        <!-- 操作按钮 -->
        <div class="flex space-x-3 pt-2">
            <button type="button" id="cancel-edit-data" class="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 text-neutral flex items-center justify-center btn-scale bg-white/80"><i class="fa fa-times mr-1"></i> 取消</button>
            <button type="submit" class="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-xl btn-scale ripple-effect"><i class="fa fa-save mr-1"></i> 保存修改</button>
        </div>
      `

  // 其他字段切换
  document
    .getElementById('edit-grade-data')
    .addEventListener('change', function () {
      document
        .getElementById('edit-grade-data-other-box')
        .classList.toggle('hidden', this.value !== '其他')
    })
  document
    .getElementById('edit-subject-data')
    .addEventListener('change', function () {
      document
        .getElementById('edit-subject-data-other-box')
        .classList.toggle('hidden', this.value !== '其他')
    })
  document
    .getElementById('edit-submitter-data')
    .addEventListener('change', function () {
      document
        .getElementById('edit-submitter-data-other-box')
        .classList.toggle('hidden', this.value !== '其他')
    })
  document
    .getElementById('edit-submitter-data')
    .addEventListener('change', function () {
      if (!config.autoMatchEnabled) return
      const submitter = document.getElementById('edit-submitter-data')
      if (submitter && submitter.value !== '其他') {
        if (getAutoDataBySubmitter[submitter.value]) {
          document.getElementById('edit-subject-data').value =
            getAutoDataBySubmitter[submitter.value][1]
          document.getElementById('edit-grade-data').value =
            getAutoDataBySubmitter[submitter.value][0]
        }
      }
    })

  document
    .getElementById('cancel-edit-data')
    .addEventListener('click', closeEditDataPage)
  const getValue = (sel, other) => {
    if (sel.value === '其他') {
      return other.value.trim() || '其他'
    }
    return sel.value || ''
  }

  const handleEditData = (e) => {
    e.preventDefault()
    const finalGrade = getValue(
      document.getElementById('edit-grade-data'),
      document.getElementById('edit-grade-data-other')
    )
    const finalSubject = getValue(
      document.getElementById('edit-subject-data'),
      document.getElementById('edit-subject-data-other')
    )
    const finalSubmitter = getValue(
      document.getElementById('edit-submitter-data'),
      document.getElementById('edit-submitter-data-other')
    )
    if (!finalGrade) return showToast('请选择年级', 'warning')
    if (!finalSubject) return showToast('请选择或输入学科', 'warning')
    if (!finalSubmitter) return showToast('请输入送印人', 'warning')

    if (Object.keys(data.catchTeacherList).findIndex((r) => r === key) === -1) {
      showToast('记录不存在', 'error')
      return
    }
    if (finalSubmitter !== key) {
      delete data.catchTeacherList[key]
      delete window.teachersData[key]
    }
    data.catchTeacherList[finalSubmitter] = [finalGrade, finalSubject]
    saveData()
    loadSubmitters()
    renderData()
    closeEditDataPage()
  }
  constants.editDataForm.removeEventListener('submit', handleEditData)
  constants.editDataForm.addEventListener('submit', handleEditData)
}

function delData(key) {
  for (let i = 0; i < Object.keys(data.catchTeacherList).length; i++) {
    let k = Object.keys(data.catchTeacherList)[i]
    if (k === key) {
      delete data.catchTeacherList[k]
      break
    }
  }
  if (window.teachersData[key]) {
    delete window.teachersData[key]
  }
}

function deleteData(key) {
  showPromptModal(`确定要删除该记录吗？`, () => {
    delData(key)
    saveData()
    loadSubmitters()
    renderData()
    closePromptModal()
  })
}

export function addData() {
  showAddDataModal()
  const addGradeDataSelect = document.getElementById('add-grade-data')
  let addSubjectDataSelect = document.getElementById('add-subject-data')
  const addSubmitterData = document.getElementById('add-submitter-data')
  const initOption = (options, dom) => {
    // 获取现有选项的 value 和 text 集合
    const existingValues = new Set(
      Array.from(dom.options).map((opt) => opt.value)
    )
    const existingTexts = new Set(
      Array.from(dom.options).map((opt) => opt.text)
    )

    options.forEach((e) => {
      // 如果 value 或 text 已存在，则跳过
      if (!existingValues.has(e) && !existingTexts.has(e)) {
        const option = document.createElement('option')
        option.value = e
        option.text = e
        dom.add(option)
      }
    })
  }
  initOption(state.subjects_options, addSubjectDataSelect)
  initOption(constants.GRADE_OPTIONS, addGradeDataSelect)
  function submitAdd() {
    let finalSubmitter = addSubmitterData.value
    let finalGrade = addGradeDataSelect.value
    let finalSubject = addSubjectDataSelect.value
    if (!finalGrade) {
      showToast('请选择有效的年级', 'warning')
      return
    }
    if (!finalSubject) {
      showToast('请选择有效的学科', 'warning')
      return
    }
    if (!finalSubmitter) {
      showToast('请输入有效的送印人', 'warning')
      return
    }
    for (let i = 0; i < Object.keys(data.catchTeacherList).length; i++) {
      if (Object.keys(data.catchTeacherList)[i] === finalSubmitter) {
        showToast(`送印人'${finalSubmitter}'的记录已存在`, 'warning')
        return
      }
    }
    data.catchTeacherList[addSubmitterData.value] = [
      addGradeDataSelect.value,
      addSubjectDataSelect.value,
    ]
    reload()
    renderData()
    saveData()
    closeAddDataModal()
    showToast('添加成功', 'success')
    addGradeDataSelect.value = ''
    addSubjectDataSelect.value = ''
    addSubmitterData.value = ''
  }
  document
    .getElementById('submit-added-data')
    .addEventListener('click', submitAdd)
  document
    .getElementById('cancel-add-data')
    .addEventListener('click', closeAddDataModal)
}

export function deleteSelectDataRecords() {
  const ids = Array.from(
    document.querySelectorAll('.record-teacher-select:checked')
  ).map((c) => c.dataset.id)
  if (!ids.length) return showToast('请选择记录', 'warning')
  showPromptModal(`确定要删除这${ids.length}条记录吗？`, () => {
    ids.forEach((key) => {
      delData(key)
    })
    saveData()
    loadSubmitters()
    renderData()
    closePromptModal()
    constants.editCatchSelectAll.checked = false
  })
}

export function handleDataSearch() {
  state.searchData = constants.searchDataInput.value.trim()
  renderData()
}

function getFilterData() {
  if (!state.searchData) return data.catchTeacherList

  const term = state.searchData.toLowerCase().trim() // 统一转小写并去除首尾空格
  const results = {}

  Object.entries(data.catchTeacherList).forEach(
    ([teacher, [subject, grade]]) => {
      if (
        teacher.toLowerCase().includes(term) ||
        subject.toLowerCase().includes(term) ||
        grade.toLowerCase().includes(term)
      ) {
        results[teacher] = [subject, grade]
      }
    }
  )

  return results
}

export function updateSelectAllData() {
  const cs = document.querySelectorAll('.record-teacher-select')
  constants.editCatchSelectAll.checked =
    cs.length && Array.from(cs).every((c) => c.checked)
}

export function handleSelectAllData() {
  document
    .querySelectorAll('.record-teacher-select')
    .forEach((cb) => (cb.checked = constants.editCatchSelectAll.checked))
}

export function renderData() {
  // 确保数据存在
  if (!data || !data.catchTeacherList) return
  let filter = getFilterData()
  // 清空表格体（删除所有现有行）
  constants.editCatchTBody.innerHTML = ''
  const keys = Object.keys(filter)
  if (!keys.length) {
    constants.editCatchTBody.innerHTML =
      '<tr><td colspan="8" class="px-3 py-8 text-center text-neutral/60"><i class="fa fa-inbox mr-2"></i>暂无记录</td></tr>'
    return
  }
  keys.forEach((key) => {
    const tr = document.createElement('tr')
    tr.className = 'hover:bg-gray-50/80 transition-colors'

    // 从数据中获取学科和年级（假设数据结构为 { 教师姓名: [学科, 年级] }）
    const subject = filter[key][0]
    const grade = filter[key][1]

    tr.innerHTML = `
      <td class="px-3 py-3">
        <input type="checkbox" class="record-teacher-select rounded border-gray-300 text-primary focus:ring-primary/30" data-id="${key}">
      </td>
      <td class="px-3 py-3">${key}</td>
      <td class="px-3 py-3">${grade}</td>
      <td class="px-3 py-3">${subject}</td>
      <td class="px-3 py-3">
        <button class="edit-teacher-btn text-blue-500 p-1 hover:text-blue-700 transition-transform hover:scale-110">
          <i class="fa info-link tooltip-left" data-info="修改记录">📝</i>
        </button>
        <button class="delete-teacher-btn text-red-500 p-1 hover:text-red-700 transition-transform hover:scale-110">
          <i class="fa info-link tooltip-right" data-info="删除记录">🔥</i>
        </button>
      </td>
    `

    constants.editCatchTBody.appendChild(tr)

    // 绑定事件
    tr.querySelector('.edit-teacher-btn').addEventListener('click', () =>
      editData(key)
    )
    tr.querySelector('.delete-teacher-btn').addEventListener('click', () =>
      deleteData(key)
    )
    const cb = tr.querySelector('.record-teacher-select')
    cb.addEventListener('change', updateSelectAllData)
  })

  // 更新全选复选框状态
  updateSelectAllData()
}
