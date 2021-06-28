const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * 获取文件的真实路径
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getDirPath(context, templatePath) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  return resourcePath;
}

/**
 *
 * @param {*} context
 * @param {*} templatePath
 * @returns
 */
function getExtensionFileVscodeResource(context, templatePath, filepath) {
  const resourcePath = path.join(context.extensionPath, templatePath);
  const dirPath = path.dirname(resourcePath);
  return vscode.Uri.file(path.resolve(dirPath, filepath)).with({ scheme: 'vscode-resource' }).toString();
}

/**
 * 创建文件
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 * @param {*} filedata 需要写入的数据 文件的配置信息
 */
function mhCreateFile(context, templatePath, filedata, callback) {
  fs.access(templatePath, (err) => {
    console.log(err);
    if (!err) {
      callback({ code: 'file', msg: '同名文件已存在,无法再次创建' });
    } else {
      //初始定义需要放入文件的初始化内容
      const data = {
        code: 200,
        msg: 'ok',
        filedata: filedata,
        data: [],
        dataCount: 0,
      };

      fs.writeFile(templatePath, JSON.stringify(data), 'utf8', (err) => {
        if (err) {
          callback(err); //失败后返回相关错误
        } else {
          callback(null); //成功后什么都不返回 只需要操作即可
        }
      });
    }
  });
}

/**
 * 删除文件
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function mhRemoveFile(context, templatePath, callback) {
  fs.unlink(templatePath, (err) => {
    if (err) {
      callback(err); //失败后返回相关错误
    } else {
      callback(null); //成功后什么都不返回 只需要操作即可
    }
  });
}
/**
 * 读取文件内容-格式化后返回数据
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function mhReadFile(context, templatePath, callback) {
  fs.readFile(templatePath, { flag: 'r', encoding: 'UTF-8' }, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      let jsondata = JSON.parse(data);
      callback(null, jsondata);
    }
  });
}
/**
 * 更新文件内容-某条数据(用于配置)
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 * @param {*} upData 需要写入的数据 需要包含需要修改的数据
 */
function mhUpdateFile(context, templatePath, upData, callback) {
  mhReadFile(context, templatePath, (err, oldData) => {
    let index = oldData.data.findIndex((item) => item.id === upData.id);
    oldData.data.splice(index, 1, upData);
    fs.writeFile(templatePath, JSON.stringify(oldData), 'utf8', (err) => {
      if (err) {
        callback(err); //失败后返回相关错误
      } else {
        callback(null); //成功后什么都不返回 只需要操作即可
      }
    });
  });
}
/**
 * 新增数据
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 * @param {*} insData 需要新增的数据
 */
function mhInsertData(context, templatePath, insData, type = 'data', callback) {
  mhReadFile(context, templatePath, (err, oldData) => {
    if (err) {
      callback(err);
    } else {
      if (type === 'noteType') {
        oldData.data.splice(oldData.data.length - 1, 0, insData);
      } else {
        oldData.data.unshift(insData);
      }

      oldData.dataCount += 1;
      fs.writeFile(templatePath, JSON.stringify(oldData), 'utf8', (err) => {
        if (err) {
          callback(err); //失败后返回相关错误
        } else {
          callback(null); //成功后什么都不返回 只需要操作即可
        }
      });
    }
  });
}
/**
 * 删除某条数据
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 * @param {*} id 需要删除的数据的id
 */
function mhRemoveData(context, templatePath, id, callback) {
  mhReadFile(context, templatePath, (err, oldData) => {
    if (err) {
      callback(err, null);
    } else {
      let index = oldData.data.findIndex((item) => item.id === id);
      if (index === -1) {
        callback({ data: null, msg: '当前笔记id不存在' }, null); //失败后返回相关错误
        return;
      }
      let delData = oldData.data.splice(index, 1);
      oldData.dataCount = oldData.dataCount - 1;
      fs.writeFile(templatePath, JSON.stringify(oldData), 'utf8', (errs) => {
        if (errs) {
          callback(errs, null); //失败后返回相关错误
        } else {
          callback(null, delData); //成功后什么都不返回 只需要操作即可
        }
      });
    }
  });
}
/**
 * 清空所有数据
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 *
 */
function mhClearData(context, templatePath, callback) {
  mhReadFile(context, templatePath, (err, oldData) => {
    if (err) {
      callback(err, null);
    } else {
      oldData.data = [];
      oldData.dataCount = 0;
      fs.writeFile(templatePath, JSON.stringify(oldData), 'utf8', (errs) => {
        if (errs) {
          callback(errs, null); //失败后返回相关错误
        } else {
          callback(null, null); //成功后什么都不返回 只需要操作即可
        }
      });
    }
  });
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
module.exports = {
  getDirPath,
  mhCreateFile,
  mhRemoveFile,
  mhReadFile,
  mhRemoveData,
  mhClearData,
  mhUpdateFile,
  mhInsertData,
  getWebViewContent,
};
