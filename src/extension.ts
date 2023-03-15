// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CodeAnalysisConfig } from './config';
import { CPDCache } from './data/cpd/cache';
import { DuplicateCodeProvider } from './data/cpd/treedata';
import { setupSpotbugs } from './data/spotbugs/activation';
import { SpotBugsCache } from './data/spotbugs/cache';
import { CONFIDENCES, highConfidence, lowConfidence, normalConfidence } from './data/spotbugs/gui/confidence';
import { SpotBugsTreeProvider } from './data/spotbugs/SpotBugsTree';
import { CPDGutters } from './gutter';

export function activate(context: vscode.ExtensionContext) {
	CodeAnalysisConfig.init(context);
	let config = CodeAnalysisConfig.instance();
	let spotbugsData = new SpotBugsCache();
	let data = new CPDCache();	
	let cpdGutters = new CPDGutters(data,spotbugsData,config,context);
	let duplicateProvider = new DuplicateCodeProvider(data);
	
	config.spotbugsConfig.onConfidenceChange((c)=> {
		cpdGutters.renderSpotbugsGutters();
	});

	setupSpotbugs(context,config.spotbugsConfig,spotbugsData);
	let showCPDGutters = vscode.commands.registerCommand('codeanalysis.pmd.showDuplicates', () => {
		cpdGutters.showDuplicates();
	});
	let hideCPDGutters = vscode.commands.registerCommand('codeanalysis.pmd.hideDuplicates', () => {
		cpdGutters.hideDuplicates();
	});let showSpotBugsGutters = vscode.commands.registerCommand('codeanalysis.spotbugs.showBugs', () => {
        cpdGutters.showSpotBugs();
    });
    let hideSpotBugsGutters = vscode.commands.registerCommand('codeanalysis.spotbugs.hideBugs', () => {
        cpdGutters.hideSpotBugs();
    });
    

	let refreshCPDTree = vscode.commands.registerCommand('codeanalysis.pmd.refreshDuplicates', () => {
		duplicateProvider.refresh();
	});

	

	context.subscriptions.push(showCPDGutters,
		hideCPDGutters,
		refreshCPDTree,
		showSpotBugsGutters,
		hideSpotBugsGutters,
		config,
	);

	vscode.window.registerTreeDataProvider('cpd.DuplicateCode',duplicateProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
