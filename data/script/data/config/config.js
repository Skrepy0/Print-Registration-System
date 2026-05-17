import * as constants from '../constants.js'
import { PAPER_SIZE_OPTIONS, DEFAULT_PAPER_SIZE_OPTIONS } from '../constants.js'
import { updateToggleUI } from '../../system/utils/function.js'
import {
  showToast,
  updatePaperTypeByPriceRule,
} from '../../system/utils/function.js'
export const getDefaultPriceRule = () => {
  return JSON.parse(
    '{"prices":[{"spec":"8K","data":[{"price":0.18,"region":[0,500]},{"price":0.15,"region":[501,1000]},{"price":0.13,"region":[1001,1500]},{"price":0.11,"region":[1501,2000]},{"price":0.07,"region":[2001,"infinity"]}]},{"spec":"A4","data":[{"price":0.14,"region":[0,500]},{"price":0.13,"region":[501,1000]},{"price":0.13,"region":[1001,1500]},{"price":0.11,"region":[1501,2000]},{"price":0.08,"region":[2001,"infinity"]}]}]}'
  )
}
export const config = {
  autoMatchEnabled:
    localStorage.getItem('autoMatchEnabled') !== null
      ? JSON.parse(localStorage.getItem('autoMatchEnabled'))
      : true,
  autoCatchInfo:
    localStorage.getItem('autoCatchInfo') !== null
      ? JSON.parse(localStorage.getItem('autoCatchInfo'))
      : false,
  soundPrompt:
    localStorage.getItem('soundPrompt') !== null
      ? JSON.parse(localStorage.getItem('soundPrompt'))
      : true,
  reverseDateUpload:
    localStorage.getItem('reverseDateUpload') !== null
      ? JSON.parse(localStorage.getItem('reverseDateUpload'))
      : true,
  gradeUpload:
    localStorage.getItem('gradeUpload') !== null
      ? JSON.parse(localStorage.getItem('gradeUpload'))
      : true,
  autoFillPrice:
    localStorage.getItem('autoFillPrice') !== null
      ? JSON.parse(localStorage.getItem('autoFillPrice'))
      : true,

  autoPriceRule:
    localStorage.getItem('autoPriceRule') !== null
      ? JSON.parse(localStorage.getItem('autoPriceRule'))
      : getDefaultPriceRule(),
}
updatePaperTypeByPriceRule()
export function resetPriceRule() {
  config.autoPriceRule = getDefaultPriceRule()
  console.log(config.autoPriceRule)
  localStorage.setItem('autoPriceRule', JSON.stringify(config.autoPriceRule))
  showToast('已重置价格规则')
  updatePaperTypeByPriceRule()
}
export function registerConfig() {
  constants.soundPromptToggle.textContent = init(config.soundPrompt)
  constants.autoCatchToggle.textContent = init(config.autoCatchInfo)
  constants.autoMatchToggle.textContent = init(config.autoMatchEnabled)
  constants.reverseUpload.textContent = init(config.reverseDateUpload)
  constants.gradeUpload.textContent = init(config.gradeUpload)
  constants.autoFillPrice.textContent = init(config.autoFillPrice)
  updateToggleUI()
}
function init(value) {
  return value ? '开' : '关'
}
