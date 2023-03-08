// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CPDCache } from './data/cpd';
import { renderGutters } from './gutter';

let data = new CPDCache("/home/mike/projects/pmd-cpd-gutters/pmd-gutters/examples/cpd/cpd.xml");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('pmd-gutters.showDuplicates', () => {
		renderGutters(data,context);
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor !== undefined) {
				renderGutters(data,context);
			}
		});

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
