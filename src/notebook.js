const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const util = require('./vscodeUtil');
let exContext = null; //定义一个全局的context 以供使用
const initDataObj = {
  listData: {
    code: 200,
    msg: 'ok',
    filedata: { des: 'notetype' },
    data: [
      { id: 'noteList', name: '笔记列表', imgUrlCode: 'note', dataPath: 'mhnotedata/note_data.json' },
      { id: 'collection', name: '收藏列表', imgUrlCode: 'coll', dataPath: 'mhnotedata/coll_data.json' },
      { id: 'add', name: '新增分类', imgUrlCode: 'add' },
    ],
    dataCount: 2,
  },
  noteData: { code: 200, msg: 'ok', filedata: { name: '笔记数据' }, data: [], dataCount: 0 },
  colectData: { code: 200, msg: 'ok', filedata: { name: '收藏的笔记数据' }, data: [], dataCount: 0 },
};

/**
 * 在vscode  根目录创建文件,将我们的笔记内容存在本地，这样可以直接加载本地内容
 */
function initfirstData() {
  //检查是否存在笔记存放目录 如果没有 创建该目录！
  if (!fs.existsSync('mhnotedata')) {
    fs.mkdirSync('mhnotedata');
  }
  //如果存在，且初始化设置为真时 初始化相关数据
  const result = vscode.workspace.getConfiguration().get('jovi-notebookforcode.initNote');
  if (result) {
    fs.writeFileSync('mhnotedata/data.json', JSON.stringify(initDataObj.listData));
    fs.writeFileSync('mhnotedata/note_data.json', JSON.stringify(initDataObj.noteData));
    fs.writeFileSync('mhnotedata/coll_data.json', JSON.stringify(initDataObj.colectData));
    vscode.workspace.getConfiguration().update('jovi-notebookforcode.initNote', false, true);
  } else {
    //由于vscode卸载掉插件也会保留上次的记录，这个时候也需要去判断一下数据是否存在
    //其实只需要判断其中一个就行了
    try {
      fs.accessSync('mhnotedata/data.json', fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
      vscode.window.showInformationMessage('当前笔记初始数据不存在，已重新初始化！');
      fs.writeFileSync('mhnotedata/data.json', JSON.stringify(initDataObj.listData));
      fs.writeFileSync('mhnotedata/note_data.json', JSON.stringify(initDataObj.noteData));
      fs.writeFileSync('mhnotedata/coll_data.json', JSON.stringify(initDataObj.colectData));
    }
  }
}

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context, templatePath) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  const dirPath = path.dirname(resourcePath);
  let html = fs.readFileSync(resourcePath, 'utf-8');
  // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
  // debugger;
  html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
    if ($2.substring(0, 8) === 'https://' || $2.substring(0, 7) === 'http://') return m;
    return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
  });
  return html;
}

/**
 * 执行回调函数
 * @param {*} panel
 * @param {*} message
 * @param {*} resp
 */
function invokeCallback(panel, message, resp) {
  // 错误码在400-600之间的，默认弹出错误提示
  if (typeof resp == 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
    vscode.window.showErrorMessage(resp.message || '发生未知错误！');
  }
  panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: resp });
}

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
const messageHandler = {
  reloadWeb(global, message) {
    //重启view视图
    vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction').then((result) => {
      vscode.window.showInformationMessage('重载成功，如有问题请联系QQ1274323054');
      invokeCallback(global.panel, message, 'ddddd');
    });
  },
  insertData(global, message) {
    util.mhInsertData(exContext, message.value.dataPath, message.value.data, '', (err) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '新增数据出错!');
        invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        // vscode.window.showInformationMessage('笔记新增成功');
        invokeCallback(global.panel, message, { data: null, type: 'ok' });
      }
    });
  },
  updateData(global, message) {
    util.mhUpdateFile(exContext, message.value.dataPath, message.value.data, (err) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '更新数据出错!');
      } else {
        // vscode.window.showInformationMessage('笔记更新成功');
      }
      invokeCallback(global.panel, message, 'ddddd');
    });
  },
  removeNote(global, message) {
    util.mhRemoveData(exContext, message.value.dataPath, message.value.id, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记删除失败!');
        invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        // vscode.window.showInformationMessage('笔记删除成功');
        invokeCallback(global.panel, message, { data: null, type: 'ok' });
      }
    });
  },
  collectNote(global, message) {
    util.mhRemoveData(exContext, 'mhnotedata/note_data.json', message.value, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记删除失败!');
        invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        util.mhInsertData(exContext, 'mhnotedata/coll_data.json', data[0], '', (err) => {
          if (err) {
            vscode.window.showErrorMessage(err.msg || '新增数据出错!');
            invokeCallback(global.panel, message, { data: null, type: 'error' });
          } else {
            // vscode.window.showInformationMessage('笔记新增成功');
            invokeCallback(global.panel, message, { data: null, type: 'ok' });
          }
        });
      }
    });
  },
  moveNote(global, message) {
    util.mhRemoveData(exContext, message.value.formPath, message.value.id, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记删除失败!');
        invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        util.mhInsertData(exContext, message.value.movePath, data[0], '', (err) => {
          if (err) {
            vscode.window.showErrorMessage(err.msg || '移动数据出错!');
            invokeCallback(global.panel, message, { data: null, type: 'error' });
          } else {
            // vscode.window.showInformationMessage('笔记新增成功');
            invokeCallback(global.panel, message, { data: null, type: 'ok' });
          }
        });
      }
    });
  },
  changeNoteType(global, message) {
    util.mhReadFile(exContext, message.value, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记切换失败!');
        invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        // vscode.window.showInformationMessage('笔记切换成功');
        invokeCallback(global.panel, message, { data: data, type: 'ok' });
      }
    });
  },
  insertType(global, message) {
    util.mhCreateFile(exContext, message.value.dataPath, { name: message.value.name }, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记分类创建失败!');
        invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        util.mhInsertData(exContext, 'mhnotedata/data.json', message.value, 'noteType', (err) => {
          if (err) {
            vscode.window.showErrorMessage(err.msg || '新增数据出错!');
            invokeCallback(global.panel, message, { data: null, type: 'error' });
          } else {
            // vscode.window.showInformationMessage('笔记新增成功');
            invokeCallback(global.panel, message, { data: null, type: 'ok' });
          }
        });
      }
    });
  },
  removeType(global, message) {
    util.mhRemoveData(exContext, 'mhnotedata/data.json', message.value.id, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记分类数据删除失败!');
        invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        util.mhRemoveFile(exContext, message.value.dataPath, (err, data) => {
          if (err) {
            vscode.window.showErrorMessage(err.msg || '笔记分类文件不存在,删除失败!');
            invokeCallback(global.panel, message, { data: null, type: 'error' });
          } else {
            invokeCallback(global.panel, message, { data: null, type: 'ok' });
          }
        });
      }
    });
  },
  clearTypeData(global, message) {
    util.mhClearData(exContext, message.value.dataPath, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记分类数据删除失败!');
        invokeCallback(global.panel, message, { data: null, type: 'error' });
      } else {
        invokeCallback(global.panel, message, { data: null, type: 'ok' });
      }
    });
  },
  importNote(global, message) {
    let saveData = `
### 梦回笔记本
---
    `;
    util.mhReadFile(exContext, message.value.dataPath, async (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.msg || '笔记获取失败!');
        invokeCallback(global.panel, message, { data: null, type: 'error' });
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
        invokeCallback(global.panel, message, { data: null, type: 'ok' });
      }
    });
  },
};

let windowDataMap = new Map();
let panel = undefined;
function initHtml(type, context, deData) {
  initfirstData();
  if (type === 'add') {
    //创建webview
    if (windowDataMap.has('note')) {
      const webviewPanel = windowDataMap.get('note');
      if (webviewPanel) {
        webviewPanel.reveal();
        panel.title = `笔记本(${deData.fileName})`;
        panel.webview.postMessage({
          cmd: 'addNote',
          code: deData.text,
          fileName: deData.fileName,
          filePath: deData.filePath,
          type: deData.fileType,
        }); //将当前需要的数据传过去
      }
    } else {
      panel = vscode.window.createWebviewPanel(
        'catCoding',
        `笔记本(${deData.fileName})`,
        vscode.ViewColumn.Two, //显示在编辑器哪个部位
        {
          enableScripts: true, //启用js 因为默认是禁用的
          retainContextWhenHidden: true, //webvie 被隐藏是保持状态 避免被重置
        }
      );
      panel.iconPath = vscode.Uri.file(util.getDirPath(context, 'src/assets/notebook.svg'));
      // windowDataMap.set(deData.uri.toString(), panel);
      windowDataMap.set('note', panel);
      let global = { panel };

      panel.webview.html = getWebViewContent(context, 'src/view/note.html');
      util.mhReadFile(context, 'mhnotedata/note_data.json', (err, data) => {
        if (err) {
          vscode.window.showErrorMessage(err.msg || '初始化数据发生错误！');
        } else {
          panel.webview.postMessage({ cmd: 'initNote', data: data });
        }
      });
      util.mhReadFile(context, 'mhnotedata/data.json', (err, data) => {
        if (err) {
          vscode.window.showErrorMessage(err.msg || '初始化笔记本类别发生错误！');
        } else {
          panel.webview.postMessage({ cmd: 'initNoteType', data: data });
        }
      });

      panel.webview.postMessage({
        cmd: 'addNote',
        code: deData.text,
        fileName: deData.fileName,
        filePath: deData.filePath,
        type: deData.fileType,
      }); //将当前需要的数据传过去
      panel.webview.onDidReceiveMessage(
        (message) => {
          if (messageHandler[message.cmd]) {
            messageHandler[message.cmd](global, message);
          } else {
            vscode.window.showErrorMessage(`未找到名为 ${message.cmd} 回调方法!`);
          }
        },
        undefined,
        context.subscriptions
      );
    }
  } else {
    if (windowDataMap.has('note')) {
      const webviewPanel = windowDataMap.get('note');
      webviewPanel.reveal();
      panel.title = `笔记本`;
    } else {
      panel = vscode.window.createWebviewPanel(
        'catCoding',
        `笔记本`,
        vscode.ViewColumn.Two, //显示在编辑器哪个部位
        {
          enableScripts: true, //启用js 因为默认是禁用的
          retainContextWhenHidden: true, //webvie 被隐藏是保持状态 避免被重置
        }
      );
      panel.iconPath = vscode.Uri.file(util.getDirPath(context, 'src/assets/notebook.svg'));
      windowDataMap.set('note', panel);
      let global = { panel };
      panel.webview.html = getWebViewContent(context, 'src/view/note.html');
      util.mhReadFile(context, 'mhnotedata/note_data.json', (err, data) => {
        if (err) {
          vscode.window.showErrorMessage(err.msg || '初始化数据发生错误！');
        } else {
          panel.webview.postMessage({ cmd: 'initNote', data: data });
        }
      });
      util.mhReadFile(context, 'mhnotedata/data.json', (err, data) => {
        if (err) {
          vscode.window.showErrorMessage(err.msg || '初始化笔记本类别发生错误！');
        } else {
          panel.webview.postMessage({ cmd: 'initNoteType', data: data });
        }
      });

      panel.webview.onDidReceiveMessage(
        (message) => {
          if (messageHandler[message.cmd]) {
            messageHandler[message.cmd](global, message);
          } else {
            vscode.window.showErrorMessage(`未找到名为 ${message.cmd} 回调方法!`);
          }
        },
        undefined,
        context.subscriptions
      );
    }
  }
  // Reset when the current panel is closed
  panel.onDidDispose(() => {
    if (windowDataMap.has('note')) {
      windowDataMap.delete('note');
    }
  });
}

module.exports.add = (context) => {
  exContext = context;
  context.subscriptions.push(
    vscode.commands.registerCommand('jovi-notebookforcode.addnote', (uri) => {
      const editor = vscode.window.activeTextEditor;
      const filePath = uri.path;
      const fileType = uri.path.split('.').slice(-1)[0];
      const fileName = uri.path.split('/').slice(-1)[0];
      let position = new vscode.Range(editor.selection.start, editor.selection.end);
      let text = editor.document.getText(position);
      initHtml('add', context, { filePath: filePath, fileType: fileType, fileName: fileName, text: text, uri: uri });
    })
  );
};
module.exports.open = (context) => {
  exContext = context;
  context.subscriptions.push(
    vscode.commands.registerCommand('jovi-notebookforcode.opennote', (uri) => {
      initHtml('open', context, { uri: uri });
    })
  );
};
