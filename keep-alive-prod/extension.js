const vscode = require('vscode');
const http = require('http');
const https = require('https');
const { URL } = require('url');

let interval;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const startCommand = vscode.commands.registerCommand('keepAlive.start', () => {
        const config = vscode.workspace.getConfiguration('keepAlive');
        const domain = config.get('domain');
        const intervalTime = config.get('interval') || 60000;

        if (!domain) {
            vscode.window.showErrorMessage('keepAlive.domain is not set in settings.json');
            return;
        }

        vscode.window.showInformationMessage(`Started keep-alive pings to ${domain}`);

        interval = setInterval(() => {
            try {
                const urlObj = new URL(domain);
                const lib = urlObj.protocol === 'https:' ? https : http;

                const req = lib.get(domain, res => {
                    console.log(`Keep-alive ping to ${domain} - Status: ${res.statusCode}`);
                });

                req.on('error', err => {
                    console.error(`Keep-alive error: ${err.message}`);
                    vscode.window.showWarningMessage(`Keep-alive error: ${err.message}`);
                });
            } catch (err) {
                vscode.window.showErrorMessage(`Invalid domain URL: ${domain}`);
            }
        }, intervalTime);
    });

    const stopCommand = vscode.commands.registerCommand('keepAlive.stop', () => {
        if (interval) {
            clearInterval(interval);
            vscode.window.showInformationMessage('Keep-alive stopped');
        }
    });

    context.subscriptions.push(startCommand, stopCommand);
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
