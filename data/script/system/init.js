import { renderRecords } from './components/records.js'
import { initChart } from './components/chart.js'
import { initEvents } from './utils/event.js'
import { calculateTotalPages } from './utils/function.js'
import { registerConfig } from '../data/config/config.js'
import { initWindowData } from './utils/io.js'

export function init() {
  initWindowData()
  calculateTotalPages()
  initEvents()
  renderRecords()
  initChart()
  registerConfig()
}
