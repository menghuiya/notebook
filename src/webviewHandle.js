const vscode = require('vscode');
const FileAction = require('./vscodeUtil');
const webUtil = require('./webviweUtil');
class MessageHandler extends FileAction {
  constructor(exContext) {
    super();
    this.exContext = exContext;
  }
  reloadWeb(global, message) {
    //重启view视图
    vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction').then((result) => {
      vscode.window.showInformationMessage('重载成功，如有问题请联系QQ1274323054');
      webUtil.invokeCallback(global.panel, message, 'ddddd');
    });
  }
  insertData(global, message) {
    this.mhInsertData(this.exContext, message.value.dataPath, message.value.data, '', (err) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '新增数据出错!');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        // vscode.window.showInformationMessage('笔记新增成功');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'ok' });
      }
    });
  }
  updateData(global, message) {
    this.mhUpdateFile(this.exContext, message.value.dataPath, message.value.data, (err) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '更新数据出错!');
      } else {
        // vscode.window.showInformationMessage('笔记更新成功');
      }
      webUtil.invokeCallback(global.panel, message, 'ddddd');
    });
  }
  removeNote(global, message) {
    this.mhRemoveData(this.exContext, message.value.dataPath, message.value.id, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记删除失败!');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        // vscode.window.showInformationMessage('笔记删除成功');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'ok' });
      }
    });
  }
  collectNote(global, message) {
    this.mhRemoveData(this.exContext, 'mhnotedata/note_data.json', message.value, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记删除失败!');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        this.mhInsertData(this.exContext, 'mhnotedata/coll_data.json', data[0], '', (err) => {
          if (err) {
            vscode.window.showErrorMessage(err.msg || '新增数据出错!');
            webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
          } else {
            // vscode.window.showInformationMessage('笔记新增成功');
            webUtil.invokeCallback(global.panel, message, { data: null, type: 'ok' });
          }
        });
      }
    });
  }
  moveNote(global, message) {
    this.mhRemoveData(this.exContext, message.value.formPath, message.value.id, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记删除失败!');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        this.mhInsertData(this.exContext, message.value.movePath, data[0], '', (err) => {
          if (err) {
            vscode.window.showErrorMessage(err.msg || '移动数据出错!');
            webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
          } else {
            // vscode.window.showInformationMessage('笔记新增成功');
            webUtil.invokeCallback(global.panel, message, { data: null, type: 'ok' });
          }
        });
      }
    });
  }
  changeNoteType(global, message) {
    this.mhReadFile(this.exContext, message.value, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记切换失败!');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        // vscode.window.showInformationMessage('笔记切换成功');
        webUtil.invokeCallback(global.panel, message, { data: data, type: 'ok' });
      }
    });
  }
  insertType(global, message) {
    this.mhCreateFile(this.exContext, message.value.dataPath, { name: message.value.name }, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记分类创建失败!');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        this.mhInsertData(this.exContext, 'mhnotedata/data.json', message.value, 'noteType', (err) => {
          if (err) {
            vscode.window.showErrorMessage(err.msg || '新增数据出错!');
            webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
          } else {
            // vscode.window.showInformationMessage('笔记新增成功');
            webUtil.invokeCallback(global.panel, message, { data: null, type: 'ok' });
          }
        });
      }
    });
  }
  removeType(global, message) {
    this.mhRemoveData(this.exContext, 'mhnotedata/data.json', message.value.id, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记分类数据删除失败!');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        this.mhRemoveFile(this.exContext, message.value.dataPath, (err, data) => {
          if (err) {
            vscode.window.showErrorMessage(err.msg || '笔记分类文件不存在,删除失败!');
            webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
          } else {
            webUtil.invokeCallback(global.panel, message, { data: null, type: 'ok' });
          }
        });
      }
    });
  }
  clearTypeData(global, message) {
    this.mhClearData(this.exContext, message.value.dataPath, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记分类数据删除失败!');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'ok' });
      }
    });
  }
  importNote(global, message) {
    let saveData = `
  ### 梦回笔记本
  ---
    `;
    this.mhReadFile(this.exContext, message.value.dataPath, async (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记获取失败!');
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        data.data.forEach((item, index) => {
          saveData += `
  ### ${index + 1}, ${item.title} 
  <kbd>文件路径:</kbd> ${'`' + item.filePath + '`'}
  ${'```' + item.type} 
  ${item.code} 
  ${'```'} 
  ${item.des} 
          `;
        });
        // 让用户手动选择文件的的存储路径
        const uri = await vscode.window.showSaveDialog({
          title: '选择保存笔记的路径(必须输入文件名称!)',
          filters: {
            markdown: ['md'],
          },
          saveLabel: '保存笔记',
        });
        if (!uri) {
          return false;
        }
        vscode.workspace.fs.writeFile(uri, new Uint8Array(Buffer.from(saveData))); // 写入文件
        webUtil.invokeCallback(global.panel, message, { data: null, type: 'ok' });
      }
    });
  }
}

module.exports = MessageHandler;
