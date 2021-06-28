// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  require('./notebook').add(context);
  require('./notebook').open(context);
}

// 插件呗释放时触发
function deactivate() {
  console.log('插件已被释放!');
}

module.exports = {
  activate,
  deactivate,
};
