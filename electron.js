const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')

// 创建窗口
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 加载应用
  win.loadFile('dist/index.html')

  // 打开开发者工具
  // win.webContents.openDevTools()
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  createWindow()

  // 当应用被激活时创建窗口（适用于 macOS）
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口关闭时退出应用（适用于 Windows 和 Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 导出选择目录功能
module.exports = {
  selectDirectory: () => {
    return new Promise((resolve) => {
      const win = BrowserWindow.getFocusedWindow()
      dialog.showOpenDialog(win, {
        properties: ['openDirectory']
      }).then((result) => {
        if (!result.canceled && result.filePaths.length > 0) {
          resolve(result.filePaths[0])
        } else {
          resolve(null)
        }
      })
    })
  }
}
