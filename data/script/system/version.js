import * as constants from '../data/constants.js'
const version = 'v1.0.3'
export const updateVersionText = () => {
  constants.versionSpan.innerHTML = `当前版本${version}`
  constants.checkUpdateInfo.setAttribute('data-info', `当前版本${version}`)
}
