import * as vscode  from "vscode";
import { SpotBugsConfig } from "../../config";
import { SpotBugsCache } from "./cache";
import { lowConfidence, normalConfidence, highConfidence, CONFIDENCES, RANKS } from "./gui/confidence";
import { SpotBugsTreeProvider } from "./SpotBugsTree";

export function setupSpotbugs(context: vscode.ExtensionContext, config: SpotBugsConfig,data: SpotBugsCache): void {
    let spotbugsProvider = new SpotBugsTreeProvider(data);
    vscode.window.registerTreeDataProvider('spotbugs.Bugs',spotbugsProvider);

    config.onConfidenceChange((c)=>{
        spotbugsProvider.refresh();
    });

    config.onRankChange(r=>{
        spotbugsProvider.refresh();
    });

    let refreshSpotbugsTree = vscode.commands.registerCommand('codeanalysis.spotbugs.refreshBugs', () => {
        spotbugsProvider.refresh();
    });

    let spotbugsShowLow = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.showLow', () => {
		const currentConfidences = config.getConfidences();
		var newConfidences = currentConfidences.concat(lowConfidence.value);
		config.setConfidences(newConfidences);
	});

	let spotbugsHideLow = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.hideLow', () => {
		const currentConfidences = config.getConfidences();
		var newConfidences = currentConfidences.filter((c)=> c !== lowConfidence.value);
		config.setConfidences(newConfidences);
	});

	let spotbugsShowNormal = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.showNormal', () => {
		const currentConfidences = config.getConfidences();
		var newConfidences = currentConfidences.concat(normalConfidence.value);
		config.setConfidences(newConfidences);
	});

	let spotbugsHideNormal = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.hideNormal', () => {
		const currentConfidences = config.getConfidences();
		var newConfidences = currentConfidences.filter((c)=> c !== normalConfidence.value);
		config.setConfidences(newConfidences);
	});

	let spotbugsShowHigh = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.showHigh', () => {
		const currentConfidences = config.getConfidences();
		var newConfidences = currentConfidences.concat(highConfidence.value);
		config.setConfidences(newConfidences);
	});

	let spotbugsHideHigh = vscode.commands.registerCommand('codeanalysis.spotbugs.confidence.hideHigh', () => {
		const currentConfidences = config.getConfidences();
		var newConfidences = currentConfidences.filter((c)=> c !== highConfidence.value);
		config.setConfidences(newConfidences);
	});

    

	let selectSpotbugsConfidence = vscode.commands.registerCommand('codeanalysis.spotbugs.Confidence', () => {
		var currentConfidences = config.confidences;
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
					config.setConfidences(confidences?.map(v=>v.value)||[]);
					
				} // otherwise operation was cancelled
		});
	});

    let selectSpotbugsRank = vscode.commands.registerCommand('codeanalysis.spotbugs.Ranks', () => {
        var currentRank = config.getMinimumRank();
        vscode.window.showQuickPick(RANKS,{canPickMany:false})
                    .then(rank => {
                        if(rank) {
                            config.setMinimumRank(rank.startValue);
                        }
                    });
    });

    context.subscriptions.push(
        selectSpotbugsConfidence,
		spotbugsShowLow,
		spotbugsHideLow,
		spotbugsHideNormal,
		spotbugsShowNormal,
		spotbugsShowHigh,
		spotbugsHideHigh,
        selectSpotbugsRank
    );
}