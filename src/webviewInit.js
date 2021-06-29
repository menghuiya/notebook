const vscode = require('vscode');
const webUtil = require('./webviweUtil');
const FileAction = require('./vscodeUtil');
const MessageHandler = require('./webviewHandle');
const util = new FileAction();
let exContext = null; //定义一个全局的context 以供使用
/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
const messageHandler = new MessageHandler(exContext);
let windowDataMap = new Map();
let panel = undefined;
function initHtml(type, context, deData) {
  exContext = context;
  webUtil.initfirstData();
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

      panel.webview.html = util.getWebViewContent(context, 'src/view/note.html');
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
      panel.webview.html = util.getWebViewContent(context, 'src/view/note.html');
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

module.exports = { initHtml };
