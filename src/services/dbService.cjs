// 数据库服务层，根据不同环境提供不同的实现

// 浏览器环境不导入 Node.js 模块
let fs, path, fileURLToPath
if (typeof window === 'undefined') {
  // Node.js 环境
  fs = require('fs')
  path = require('path')
  const url = require('url')
  fileURLToPath = url.fileURLToPath
}

// 获取当前文件的目录路径
let __filename, __dirname
if (typeof window === 'undefined') {
  __filename = fileURLToPath(import.meta.url)
  __dirname = path.dirname(__filename)
}

// 默认数据存储路径
let dataPath = ''

// 初始化数据存储路径
function initDataPath() {
  if (typeof window !== 'undefined') {
    // 浏览器环境
    dataPath = 'localStorage'
  } else {
    // Node.js 环境（Electron 和 Capacitor）
    // 默认存储在用户文档目录
    const homedir = process.env.HOME || process.env.USERPROFILE
    dataPath = path.join(homedir, '低碳生活管家')
    // 创建目录
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true })
    }
  }
}

// 设置数据存储路径
function setDataPath(newPath) {
  if (typeof window !== 'undefined') {
    // 浏览器环境不支持自定义路径
    return false
  }
  dataPath = newPath
  // 创建目录
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
  }
  // 重新加载数据
  if (db instanceof FileDB) {
    db.loadFromFile()
  }
  return true
}

// 获取当前数据存储路径
function getDataPath() {
  return dataPath
}

// 浏览器环境的存储实现
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
      // 简单的 SQL 解析，只处理 INSERT、UPDATE、CREATE TABLE 语句
      if (sql.startsWith('CREATE TABLE')) {
        // 忽略创建表语句
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
            // 简单处理 UPDATE 语句
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
          // 简单处理 SELECT 语句
          const rows = this.tables[table]
          const row = rows.find(r => {
            // 简单的 WHERE 条件匹配
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
          // 简单处理 SELECT 语句
          let rows = [...this.tables[table]]
          
          // 简单的 WHERE 条件匹配
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
    // 简单的参数解析
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

// 文件系统存储实现（适用于 Electron 和 Capacitor）
class FileDB {
  constructor() {
    this.tables = {
      user: [],
      carbon_record: [],
      article: [],
      medal: []
    }
    this.loadFromFile()
  }

  loadFromFile() {
    try {
      for (const table in this.tables) {
        const filePath = path.join(dataPath, `${table}.json`)
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf8')
          this.tables[table] = JSON.parse(data)
        }
      }
    } catch (e) {
      console.error('Failed to load data from file:', e)
    }
  }

  saveToFile() {
    try {
      for (const table in this.tables) {
        const filePath = path.join(dataPath, `${table}.json`)
        fs.writeFileSync(filePath, JSON.stringify(this.tables[table], null, 2))
      }
    } catch (e) {
      console.error('Failed to save data to file:', e)
    }
  }

  run(sql, params, callback) {
    try {
      // 简单的 SQL 解析，只处理 INSERT、UPDATE、CREATE TABLE 语句
      if (sql.startsWith('CREATE TABLE')) {
        // 忽略创建表语句
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
            this.saveToFile()
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
            // 简单处理 UPDATE 语句
            this.saveToFile()
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
          // 简单处理 SELECT 语句
          const rows = this.tables[table]
          const row = rows.find(r => {
            // 简单的 WHERE 条件匹配
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
          // 简单处理 SELECT 语句
          let rows = [...this.tables[table]]
          
          // 简单的 WHERE 条件匹配
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
    // 简单的参数解析
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

// 初始化数据存储路径
initDataPath()

// 检测环境
let db
if (typeof window !== 'undefined') {
  // 浏览器环境
  db = new BrowserDB()
} else {
  // Node.js 环境（Electron 和 Capacitor）
  try {
    // 尝试使用 sqlite3
    const sqlite3 = require('sqlite3')
    const dbPath = path.join(dataPath, 'low-carbon.db')
    db = new sqlite3.Database(dbPath)
  } catch (e) {
    console.error('Failed to load sqlite3, using file storage instead:', e)
    // 降级到文件存储
    db = new FileDB()
  }
}

module.exports = db
