// Import the required VS Code module
const vscode = require('vscode');
const axios = require('axios');

let interval;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('keepAlive.start', async function () {
        const config = vscode.workspace.getConfiguration('keepAlive');
        const domain = config.get('domain');
        const intervalTime = config.get('interval') || 60000;

        if (!domain) {
            vscode.window.showErrorMessage('No domain specified in settings. Add "keepAlive.domain" in settings.json');
            return;
        }

        vscode.window.showInformationMessage(`Starting keep-alive checks for ${domain}`);

        interval = setInterval(async () => {
            try {
                await axios.get(domain);
                console.log(`Keep-alive check successful: ${domain}`);
            } catch (error) {
                vscode.window.showWarningMessage(`Keep-alive check failed for ${domain}`);
            }
        }, intervalTime);
    });

    let stopDisposable = vscode.commands.registerCommand('keepAlive.stop', function () {
        if (interval) {
            clearInterval(interval);
            vscode.window.showInformationMessage('Keep-alive check stopped');
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(stopDisposable);
}

function deactivate() {
    if (interval) {
        clearInterval(interval);
    }
}

module.exports = {
    activate,
    deactivate
};