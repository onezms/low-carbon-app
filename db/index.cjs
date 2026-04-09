const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// 获取当前文件的目录路径
const __filename = require('url').fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据库文件路径，存在本地
const dbPath = path.join(__dirname, 'low-carbon.db')
const db = new sqlite3.Database(dbPath)

// 1. 创建用户表
db.run(`CREATE TABLE IF NOT EXISTS user (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nickname TEXT,
  avatar TEXT DEFAULT 'default.png',
  total_point INTEGER DEFAULT 0,
  total_carbon REAL DEFAULT 0,
  check_days INTEGER DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
)`)

// 2. 创建碳记录明细表
db.run(`CREATE TABLE IF NOT EXISTS carbon_record (
  record_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  record_type TEXT NOT NULL,
  sub_type TEXT,
  value REAL,
  carbon_output REAL DEFAULT 0,
  carbon_reduce REAL DEFAULT 0,
  point INTEGER DEFAULT 0,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(user_id)
)`)

// 3. 创建科普文章表
db.run(`CREATE TABLE IF NOT EXISTS article (
  article_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_img TEXT,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
)`)

// 4. 创建勋章表
db.run(`CREATE TABLE IF NOT EXISTS medal (
  medal_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition TEXT NOT NULL,
  point_need INTEGER DEFAULT 0
)`)

module.exports = db
