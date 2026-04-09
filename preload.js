// 预加载脚本
const { contextBridge, ipcRenderer } = require('electron')

// 暴露选择目录功能给渲染进程
contextBridge.exposeInMainWorld('electron', {
  selectDirectory: () => {
    return new Promise((resolve) => {
      const win = require('electron').BrowserWindow.getFocusedWindow()
      require('electron').dialog.showOpenDialog(win, {
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
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
