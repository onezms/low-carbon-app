﻿﻿﻿﻿﻿// 数据库服务 - 浏览器模拟数据版本
// 使用 localStorage 作为存储后端，为网页应用

let dataPath = 'localStorage'

class BrowserDB {
  constructor() {
    this.tables = {
      user: [],
      carbon_record: [],
      article: [],
      medal: []
    }
    this.loadFromLocalStorage()
    this.generateMockData()
  }

  loadFromLocalStorage() {
    try {
      for (const table in this.tables) {
        const data = localStorage.getItem('low-carbon-' + table)
        if (data) {
          this.tables[table] = JSON.parse(data)
        }
      }
    } catch (e) {
      console.error('Failed to load data from localStorage:', e)
    }
  }

  saveToLocalStorage() {
    try {
      for (const table in this.tables) {
        localStorage.setItem('low-carbon-' + table, JSON.stringify(this.tables[table]))
      }
    } catch (e) {
      console.error('Failed to save data to localStorage:', e)
    }
  }

  run(sql, params, callback) {
    try {
      if (sql.startsWith('CREATE TABLE')) {
        callback(null)
        return
      }

      if (sql.startsWith('INSERT INTO')) {
        const tableMatch = sql.match(/INSERT INTO (\w+)/)
        if (tableMatch) {
          const table = tableMatch[1]
          if (this.tables[table]) {
            const row = this.createRowFromParams(sql, params)
            row[table + '_id'] = this.getNextId(table)
            row.create_time = new Date().toISOString()
            this.tables[table].push(row)
            this.saveToLocalStorage()
            callback(null)
            return
          }
        }
      }

      if (sql.startsWith('UPDATE')) {
        const tableMatch = sql.match(/UPDATE (\w+)/)
        if (tableMatch) {
          const table = tableMatch[1]
          if (this.tables[table]) {
            if (table === 'user') {
              let pointsToAdd = 0
              let carbonToAdd = 0
              let userId = null

              if (sql.includes('total_point') && sql.includes('total_carbon')) {
                pointsToAdd = parseFloat(params[0]) || 0
                carbonToAdd = parseFloat(params[1]) || 0
                userId = params[2]
              }
              else if (sql.includes('total_point') && sql.includes('+ 2')) {
                pointsToAdd = 2
                userId = params[0]
              }
              else if (sql.includes('total_point')) {
                pointsToAdd = parseFloat(params[0]) || 0
                userId = params[1]
              }
              else if (sql.includes('total_carbon')) {
                carbonToAdd = parseFloat(params[0]) || 0
                userId = params[1]
              }

              for (let i = 0; i < this.tables[table].length; i++) {
                const row = this.tables[table][i]
                if (String(row.user_id) === String(userId)) {
                  if (pointsToAdd > 0) {
                    row.total_point = (parseFloat(row.total_point) || 0) + pointsToAdd
                  }
                  if (carbonToAdd > 0) {
                    row.total_carbon = (parseFloat(row.total_carbon) || 0) + carbonToAdd
                  }
                  break
                }
              }
            }

            this.saveToLocalStorage()
            if (typeof callback === 'function') {
              callback(null)
            }
            return
          }
        }
      }

      if (typeof callback === 'function') {
        callback(null)
      }
    } catch (e) {
      if (typeof callback === 'function') {
        callback(e)
      }
    }
  }

  get(sql, params, callback) {
    try {
      const tableMatch = sql.match(/SELECT.*FROM (\w+)/)
      if (tableMatch) {
        const table = tableMatch[1]
        if (this.tables[table]) {
          const rows = this.tables[table]
          let row = null

          if (table === 'user' && sql.includes('username')) {
            row = rows.find(r => r.username === params[0])
          }
          else if (table === 'user' && sql.includes('user_id')) {
            const targetUserId = params[0]
            row = rows.find(r => {
              return String(r.user_id) === String(targetUserId)
            })
          }
          else if (table === 'carbon_record' && sql.includes('record_type = \'打卡\'')) {
            const targetUserId = params[0]
            row = rows.find(r => {
              if (String(r.user_id) !== String(targetUserId)) return false
              if (r.record_type !== '打卡') return false
              const recordDate = new Date(r.create_time).toISOString().split('T')[0]
              if (recordDate !== params[1]) return false
              return true
            })
          }
          else {
            row = rows.find(r => {
              const whereMatch = sql.match(/WHERE (\w+) = \?/)
              if (whereMatch) {
                const field = whereMatch[1]
                return r[field] === params[0]
              }
              return true
            })
          }

          if (typeof callback === 'function') {
            callback(null, row)
          }
          return
        }
      }
      if (typeof callback === 'function') {
        callback(null, null)
      }
    } catch (e) {
      if (typeof callback === 'function') {
        callback(e, null)
      }
    }
  }

  all(sql, params, callback) {
    try {
      const tableMatch = sql.match(/SELECT.*FROM (\w+)/)
      if (tableMatch) {
        const table = tableMatch[1]
        if (this.tables[table]) {
          let rows = [...this.tables[table]]

          const whereMatch = sql.match(/WHERE (.+?)(?: GROUP BY| ORDER BY| LIMIT|$)/)
          if (whereMatch) {
            const whereClause = whereMatch[1]
            const conditions = whereClause.split('AND').map(c => c.trim())

            rows = rows.filter(r => {
              let paramIndex = 0
              for (const condition of conditions) {
                if (condition.includes('= ?')) {
                  const fieldMatch = condition.match(/(\w+) = \?/)
                  if (fieldMatch) {
                    const field = fieldMatch[1]
                    if (String(r[field]) !== String(params[paramIndex])) {
                      return false
                    }
                    paramIndex++
                  }
                }
              }
              return true
            })
          }

          if (sql.includes('GROUP BY')) {
            const groupByMatch = sql.match(/GROUP BY (.+?)(?: ORDER BY| LIMIT|$)/)
            if (groupByMatch) {
              const groupByField = groupByMatch[1].trim()
              const sumMatch = sql.match(/SUM\(([^)]+)\)/)

              if (sumMatch) {
                const sumField = sumMatch[1]

                const grouped = {}
                rows.forEach(row => {
                  let groupKey

                  if (groupByField.includes('strftime')) {
                    const strftimeMatch = groupByField.match(/strftime\('%Y-%m', (\w+)\)/)
                    if (strftimeMatch) {
                      const dateField = strftimeMatch[1]
                      const date = new Date(row[dateField])
                      groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                    }
                  }
                  else if (groupByField.includes('date(')) {
                    const dateMatch = groupByField.match(/date\((\w+)\)/)
                    if (dateMatch) {
                      const dateField = dateMatch[1]
                      groupKey = new Date(row[dateField]).toISOString().split('T')[0]
                    }
                  }
                  else {
                    groupKey = row[groupByField]
                  }

                  if (!grouped[groupKey]) {
                    grouped[groupKey] = 0
                  }
                  grouped[groupKey] += parseFloat(row[sumField]) || 0
                })

                const result = Object.entries(grouped).map(([date, total]) => ({
                  date,
                  total
                }))

                const orderByMatch = sql.match(/ORDER BY (.+?)(?: LIMIT|$)/)
                if (orderByMatch) {
                  const orderByField = orderByMatch[1].trim()
                  if (orderByField.includes('DESC')) {
                    result.sort((a, b) => new Date(b.date) - new Date(a.date))
                  } else {
                    result.sort((a, b) => new Date(a.date) - new Date(b.date))
                  }
                }

                const limitMatch = sql.match(/LIMIT (\d+)/)
                if (limitMatch) {
                  const limit = parseInt(limitMatch[1])
                  callback(null, result.slice(0, limit))
                } else {
                  callback(null, result)
                }
                return
              }
            }
          }

          else if (sql.includes('SUM(')) {
            const sumMatch = sql.match(/SUM\(([^)]+)\)/)
            if (sumMatch) {
              const sumField = sumMatch[1]
              const total = rows.reduce((acc, row) => {
                return acc + (parseFloat(row[sumField]) || 0)
              }, 0)
              if (typeof callback === 'function') {
                callback(null, [{ total }])
              }
              return
            }
          }

          if (typeof callback === 'function') {
            callback(null, rows)
          }
          return
        }
      }
      if (typeof callback === 'function') {
        callback(null, [])
      }
    } catch (e) {
      if (typeof callback === 'function') {
        callback(e, [])
      }
    }
  }

  createRowFromParams(sql, params) {
    const row = {}
    const columnsMatch = sql.match(/\(([^)]+)\)/)
    const valuesMatch = sql.match(/VALUES \(([^)]+)\)/)

    if (columnsMatch && valuesMatch) {
      const columns = columnsMatch[1].split(',').map(c => c.trim())
      params.forEach((param, index) => {
        row[columns[index]] = param
      })
    }

    return row
  }

  getNextId(table) {
    const rows = this.tables[table]
    if (rows.length === 0) return 1
    return Math.max(...rows.map(r => r[table + '_id'])) + 1
  }

  generateMockData() {
    if (this.tables.carbon_record.length < 10) {
      const mockData = []
      const userId = 1
      const recordTypes = ['出行', '居家能耗', '垃圾分类']
      const trafficTypes = ['步行/自行车', '公交/地铁', '电动车', '燃油私家车']

      const now = new Date()

      for (let i = 0; i < 90; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)

        const recordCount = Math.floor(Math.random() * 3) + 1

        for (let j = 0; j < recordCount; j++) {
          const recordType = recordTypes[Math.floor(Math.random() * recordTypes.length)]
          let subType, carbonOutput, carbonReduce, point, value

          if (recordType === '出行') {
            subType = trafficTypes[Math.floor(Math.random() * trafficTypes.length)]
            const mileage = Math.random() * 10 + 1

            switch (subType) {
              case '步行/自行车':
                carbonOutput = 0
                carbonReduce = mileage * 0.18
                point = 5
                break
              case '公交/地铁':
                carbonOutput = mileage * 0.04
                carbonReduce = mileage * 0.14
                point = 3
                break
              case '电动车':
                carbonOutput = mileage * 0.02
                carbonReduce = mileage * 0.16
                point = 2
                break
              case '燃油私家车':
                carbonOutput = mileage * 0.18
                carbonReduce = 0
                point = 0
                break
            }
            value = `${mileage.toFixed(1)}公里`
          } else if (recordType === '居家能耗') {
            subType = '用电用水'
            const electric = Math.random() * 5 + 1
            const water = Math.random() * 2 + 1
            carbonOutput = electric * 0.785 + water * 0.91
            carbonReduce = 0
            point = 0
            value = `${electric.toFixed(1)}度/${water.toFixed(1)}吨`
          } else if (recordType === '垃圾分类') {
            subType = '可回收+厨余'
            carbonOutput = 0
            carbonReduce = 0.5
            point = 4
            value = '分类回收'
          }

          mockData.push({
            id: Date.now() + i * 100 + j,
            user_id: userId,
            record_type: recordType,
            sub_type: subType,
            value: value,
            carbon_output: carbonOutput.toFixed(3),
            carbon_reduce: carbonReduce.toFixed(3),
            point: point,
            create_time: date.toISOString()
          })
        }
      }

      this.tables.carbon_record = [...this.tables.carbon_record, ...mockData]
      this.saveToLocalStorage()
    }
  }
}

function getDataPath() {
  return dataPath
}

function setDataPath(newPath) {
  dataPath = newPath
  return true
}

const db = new BrowserDB()
export default db
export { getDataPath, setDataPath }