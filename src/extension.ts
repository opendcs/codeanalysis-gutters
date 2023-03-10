// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CPDCache } from './data/cpd';
import { CPDGutters } from './gutter';



export function activate(context: vscode.ExtensionContext) {
	let data = new CPDCache();
	let cpdGutters = new CPDGutters(data,context);
	let showCPDGutters = vscode.commands.registerCommand('codeanalysis-gutters.pmd.showDuplicates', () => {
		cpdGutters.showDuplicates();
	});
	let hideCPDGutters = vscode.commands.registerCommand('codeanalysis-gutters.pmd.hideDuplicates', () => {
		cpdGutters.hideDuplicates();
	});

	context.subscriptions.push(showCPDGutters,hideCPDGutters);
}

// This method is called when your extension is deactivated
export function deactivate() {}
