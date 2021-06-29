const vscode = require('vscode');
const webInit = require('./webviewInit');

module.exports.add = (context) => {
  context.subscriptions.push(
    vscode.commands.registerCommand('jovi-notebookforcode.addnote', (uri) => {
      const editor = vscode.window.activeTextEditor;
      const filePath = uri.path;
      const fileType = uri.path.split('.').slice(-1)[0];
      const fileName = uri.path.split('/').slice(-1)[0];
      let position = new vscode.Range(editor.selection.start, editor.selection.end);
      let text = editor.document.getText(position);
      webInit.initHtml('add', context, { filePath: filePath, fileType: fileType, fileName: fileName, text: text, uri: uri });
    })
  );
};
module.exports.open = (context) => {
  context.subscriptions.push(
    vscode.commands.registerCommand('jovi-notebookforcode.opennote', (uri) => {
      webInit.initHtml('open', context, { uri: uri });
    })
  );
};
