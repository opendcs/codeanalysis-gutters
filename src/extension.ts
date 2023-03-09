// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CPDCache } from './data/cpd';
import { PMDGutters } from './gutter';

let data = new CPDCache("/home/mike/projects/pmd-cpd-gutters/pmd-gutters/examples/cpd/cpd.xml");

export function activate(context: vscode.ExtensionContext) {
	let pmdGutters = new PMDGutters(data,context);
	let showGutters = vscode.commands.registerCommand('pmd-gutters.showDuplicates', () => {
		pmdGutters.showDuplicates();
	});
	let hideGutters = vscode.commands.registerCommand('pmd-gutters.hideDuplicates', () => {
		pmdGutters.hideDuplicates();
	});

	context.subscriptions.push(showGutters,hideGutters);
}

// This method is called when your extension is deactivated
export function deactivate() {}
