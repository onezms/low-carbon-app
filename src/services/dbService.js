// 数据库服务层 - 浏览器兼容版本
// 使用 localStorage 作为存储，适配网页应用

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
  }

  loadFromLocalStorage() {
    try {
      for (const table in this.tables) {
        const data = localStorage.getItem(`low-carbon-${table}`)
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
        localStorage.setItem(`low-carbon-${table}`, JSON.stringify(this.tables[table]))
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
            row[`${table}_id`] = this.getNextId(table)
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
            this.saveToLocalStorage()
            callback(null)
            return
          }
        }
      }

      callback(null)
    } catch (e) {
      callback(e)
    }
  }

  get(sql, params, callback) {
    try {
      const tableMatch = sql.match(/SELECT.*FROM (\w+)/)
      if (tableMatch) {
        const table = tableMatch[1]
        if (this.tables[table]) {
          const rows = this.tables[table]
          const row = rows.find(r => {
            const whereMatch = sql.match(/WHERE (\w+) = \?/)
            if (whereMatch) {
              const field = whereMatch[1]
              return r[field] === params[0]
            }
            return true
          })
          callback(null, row)
          return
        }
      }
      callback(null, null)
    } catch (e) {
      callback(e, null)
    }
  }

  all(sql, params, callback) {
    try {
      const tableMatch = sql.match(/SELECT.*FROM (\w+)/)
      if (tableMatch) {
        const table = tableMatch[1]
        if (this.tables[table]) {
          let rows = [...this.tables[table]]
          
          const whereMatch = sql.match(/WHERE (\w+) = \?/)
          if (whereMatch) {
            const field = whereMatch[1]
            rows = rows.filter(r => r[field] === params[0])
          }
          
          callback(null, rows)
          return
        }
      }
      callback(null, [])
    } catch (e) {
      callback(e, [])
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
    return Math.max(...rows.map(r => r[`${table}_id`])) + 1
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
