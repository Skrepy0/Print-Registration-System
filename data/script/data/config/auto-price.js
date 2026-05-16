import { config } from './config.js'
import { showToast } from '../../system/utils/function.js'

export function validatePriceConfig(obj) {
  const errors = []
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return {
      status: false,
      error: ['配置必须是对象'],
    }
  }
  if (!Array.isArray(obj.prices)) {
    return {
      status: false,
      error: ['prices 必须是数组'],
    }
  }
  const specSet = new Set()

  obj.prices.forEach((priceItem, priceIndex) => {
    const path = `prices[${priceIndex}]`
    if (
      !priceItem ||
      typeof priceItem !== 'object' ||
      Array.isArray(priceItem)
    ) {
      errors.push(`${path} 必须是对象`)
      return
    }
    if (typeof priceItem.spec !== 'string') {
      errors.push(`${path}.spec 必须是字符串`)
    } else {
      const spec = priceItem.spec.trim()

      if (!spec) {
        errors.push(`${path}.spec 不能为空`)
      }

      if (specSet.has(spec)) {
        errors.push(`重复的 spec: "${spec}"`)
      }

      specSet.add(spec)
    }
    if (!Array.isArray(priceItem.data)) {
      errors.push(`${path}.data 必须是数组`)
      return
    }

    if (priceItem.data.length === 0) {
      errors.push(`${path}.data 不能为空`)
      return
    }

    const regions = []

    priceItem.data.forEach((dataItem, dataIndex) => {
      const dataPath = `${path}.data[${dataIndex}]`

      if (
        !dataItem ||
        typeof dataItem !== 'object' ||
        Array.isArray(dataItem)
      ) {
        errors.push(`${dataPath} 必须是对象`)
        return
      }
      if (
        typeof dataItem.price !== 'number' ||
        Number.isNaN(dataItem.price) ||
        dataItem.price < 0
      ) {
        errors.push(`${dataPath}.price 必须是非负数字`)
      }
      if (!Array.isArray(dataItem.region)) {
        errors.push(`${dataPath}.region 必须是数组`)
        return
      }

      if (dataItem.region.length !== 2) {
        errors.push(`${dataPath}.region 长度必须为2`)
        return
      }

      const [lower, upper] = dataItem.region
      if (
        typeof lower !== 'number' ||
        Number.isNaN(lower) ||
        lower < 0 ||
        !Number.isInteger(lower)
      ) {
        errors.push(`${dataPath}.region[0] 必须是非负整数`)
      }
      const validUpper =
        upper === 'infinity' ||
        (typeof upper === 'number' &&
          !Number.isNaN(upper) &&
          upper >= 0 &&
          Number.isInteger(upper))

      if (!validUpper) {
        errors.push(`${dataPath}.region[1] 必须是非负整数或字符串 "infinity"`)
      }
      if (upper === 'infinity' && dataIndex !== priceItem.data.length - 1) {
        errors.push(`${dataPath}.region 使用 infinity 时必须位于最后一个区间`)
      }
      if (
        typeof lower === 'number' &&
        typeof upper === 'number' &&
        lower > upper
      ) {
        errors.push(`${dataPath}.region 起始值不能大于结束值`)
      }

      regions.push({
        lower,
        upper: upper === 'infinity' ? Infinity : upper,
        index: dataIndex,
      })
    })
    regions.sort((a, b) => a.lower - b.lower)

    for (let i = 1; i < regions.length; i++) {
      const prev = regions[i - 1]
      const curr = regions[i]
      if (curr.lower <= prev.upper) {
        errors.push(
          `${path}.data[${curr.index}] 与 data[${prev.index}] 区间重叠`
        )
      }
    }
  })

  return errors.length
    ? {
        status: false,
        error: errors,
      }
    : {
        status: true,
      }
}

export function uploadRule(jsonData) {
  const res = validatePriceConfig(jsonData)
  if (res.status) {
    config.autoPriceRule = jsonData
    localStorage.setItem('autoPriceRule', JSON.stringify(config.autoPriceRule))
    return {
      status: true,
    }
  } else {
    return {
      status: false,
      err: res.errors,
    }
  }
}
