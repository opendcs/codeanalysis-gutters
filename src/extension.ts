// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CPDCache } from './data/cpd/cache';
import { DuplicateCodeProvider } from './data/cpd/treedata';
import { CPDGutters } from './gutter';



export function activate(context: vscode.ExtensionContext) {
	let data = new CPDCache();
	let cpdGutters = new CPDGutters(data,context);
	let duplicateProvider = new DuplicateCodeProvider(data)

	let showCPDGutters = vscode.commands.registerCommand('codeanalysis-gutters.pmd.showDuplicates', () => {
		cpdGutters.showDuplicates();
	});
	let hideCPDGutters = vscode.commands.registerCommand('codeanalysis-gutters.pmd.hideDuplicates', () => {
		cpdGutters.hideDuplicates();
	});

	let refreshCPDTree = vscode.commands.registerCommand('codeanalysis-gutters.pmd.refreshDuplicates', () => {
		duplicateProvider.refresh();
	});

	let editTreeSelection = vscode.commands.registerCommand('codeanalysis-gutters.pmd.editFromTree', (file) => {
		vscode.workspace.openTextDocument(file);
	});

	context.subscriptions.push(showCPDGutters,hideCPDGutters,refreshCPDTree,editTreeSelection);

	
	vscode.window.registerTreeDataProvider('cpd.DuplicateCode',duplicateProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
