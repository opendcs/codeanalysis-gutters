// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CodeAnalysisConfig } from './config';
import { CPDCache } from './data/cpd/cache';
import { DuplicateCodeProvider } from './data/cpd/treedata';
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
	let spotbugsProvider = new SpotBugsTreeProvider(spotbugsData);
	config.spotbugsConfig.onConfidenceChange((c)=> {
		cpdGutters.renderSpotbugsGutters();
		spotbugsProvider.refresh();
	});

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
    let refreshSpotbugsTree = vscode.commands.registerCommand('codeanalysis.spotbugs.refreshBugs', () => {
        spotbugsProvider.refresh();
    });

	let refreshCPDTree = vscode.commands.registerCommand('codeanalysis.pmd.refreshDuplicates', () => {
		duplicateProvider.refresh();
	});

	let spotbugsShowLow = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.showLow', () => {
		const currentConfidences = config.spotbugsConfig.getConfidences();
		var newConfidences = currentConfidences.concat(lowConfidence.value);
		config.spotbugsConfig.setConfidences(newConfidences);
	});

	let spotbugsHideLow = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.hideLow', () => {
		const currentConfidences = config.spotbugsConfig.getConfidences();
		var newConfidences = currentConfidences.filter((c)=> c !== lowConfidence.value);
		config.spotbugsConfig.setConfidences(newConfidences);
	});

	let spotbugsShowNormal = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.showNormal', () => {
		const currentConfidences = config.spotbugsConfig.getConfidences();
		var newConfidences = currentConfidences.concat(normalConfidence.value);
		config.spotbugsConfig.setConfidences(newConfidences);
	});

	let spotbugsHideNormal = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.hideNormal', () => {
		const currentConfidences = config.spotbugsConfig.getConfidences();
		var newConfidences = currentConfidences.filter((c)=> c !== normalConfidence.value);
		config.spotbugsConfig.setConfidences(newConfidences);
	});

	let spotbugsShowHigh = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.showHigh', () => {
		const currentConfidences = config.spotbugsConfig.getConfidences();
		var newConfidences = currentConfidences.concat(highConfidence.value);
		config.spotbugsConfig.setConfidences(newConfidences);
	});

	let spotbugsHideHigh = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.hideHigh', () => {
		const currentConfidences = config.spotbugsConfig.getConfidences();
		var newConfidences = currentConfidences.filter((c)=> c !== highConfidence.value);
		config.spotbugsConfig.setConfidences(newConfidences);
	});

	let selectSpotbugsConfidence = vscode.commands.registerCommand('codeanalysis.spotbugs.Confidence', () => {
		var currentConfidences = config.spotbugsConfig.confidences;
		vscode.window
		    .showQuickPick(CONFIDENCES.map(c=> {
				if ( currentConfidences.includes(c.value) ) {
					c.picked = true;
				} else {
					c.picked = undefined;
				}
				return c;
			}),
			{canPickMany:true}).then((confidences)=> {
				if(confidences) {
					config.spotbugsConfig.setConfidences(confidences?.map(v=>v.value)||[]);
					
				} // otherwise operation was cancelled
		});
	});

	context.subscriptions.push(showCPDGutters,
		hideCPDGutters,
		refreshCPDTree,
		showSpotBugsGutters,
		hideSpotBugsGutters,
		refreshSpotbugsTree,
		selectSpotbugsConfidence,
		spotbugsShowLow,
		spotbugsHideLow,
		spotbugsHideNormal,
		spotbugsShowNormal,
		spotbugsShowHigh,
		spotbugsHideHigh,
		config,
	);

	vscode.window.registerTreeDataProvider('cpd.DuplicateCode',duplicateProvider);
	vscode.window.registerTreeDataProvider('spotbugs.Bugs',spotbugsProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
