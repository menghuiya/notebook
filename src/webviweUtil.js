const vscode = require('vscode');
const fs = require('fs');

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

module.exports = { invokeCallback, initfirstData };
