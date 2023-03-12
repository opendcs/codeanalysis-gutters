import * as vscode from 'vscode';
import { CodeAnalysisConfig, CPDConfig } from './config';
import { CPDCache } from './data/cpd/cache';
import { SpotBugsCache } from './data/spotbugs/cache';

enum State {
    renderOn,
    renderOff
}

/**
 * Handles rendering PMD-CMD duplicate data
 */
export class CPDGutters {
    private duplicates: CPDCache;
    private spotbugsBugs: SpotBugsCache;
    private duplicateState: State;
    private config: CodeAnalysisConfig;

    
    public constructor(duplicates: CPDCache, spotbugs: SpotBugsCache, config: CodeAnalysisConfig,context:vscode.ExtensionContext) {
        this.duplicates=duplicates;
        this.spotbugsBugs = spotbugs;
        this.config = config;
        this.duplicateState = State.renderOff;
        var onDupsChange = () => this.renderDuplicateGutters();
        var onSpotBugsChange = () => this.renderSpotbugsGutters();

        this.duplicates.onChange(onDupsChange.bind(this));
        this.spotbugsBugs.onChange(onSpotBugsChange.bind(this));
    }

    public showDuplicates() {
        this.duplicateState = State.renderOn;
        var self = this;
        vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor !== undefined) {
				self.renderDuplicateGutters();
			}
		});
        this.renderDuplicateGutters();
    }

    public hideDuplicates() {
        this.duplicateState = State.renderOff;
        vscode.window.onDidChangeActiveTextEditor((e)=>{});
        this.renderDuplicateGutters();
    }

    private renderDuplicateGutters() {
        if (this.duplicateState === State.renderOff) {
            let editor = vscode.window.activeTextEditor;
            editor?.setDecorations(this.config.cpdConfig.decTypeCritical,[]);
            editor?.setDecorations(this.config.cpdConfig.decTypeMajor,[]);
            editor?.setDecorations(this.config.cpdConfig.decTypeMinor,[]);
            return;
        }

        if (vscode.workspace.workspaceFolders !== undefined) {
            let editor = vscode.window.activeTextEditor;
            if ( editor !== null && editor !== undefined) {
                var openFile = editor?.document.fileName;
                let dups = this.duplicates.getData(vscode.Uri.file(openFile));
                var minor = new Array<vscode.DecorationOptions>();
                var major = new Array<vscode.DecorationOptions>();
                var critical = new Array<vscode.DecorationOptions>();

                dups?.forEach((dup) => {
                    if (dup.numTokens < this.config.cpdConfig.minor) {
                        minor.push(dup.getDecorationInformation());
                    } else if (dup.numTokens < this.config.cpdConfig.major) {
                        major.push(dup.getDecorationInformation());
                    } else {
                        critical.push(dup.getDecorationInformation());
                    }
                });

                editor?.setDecorations(this.config.cpdConfig.decTypeMinor,minor);
                editor?.setDecorations(this.config.cpdConfig.decTypeMajor,major);
                editor?.setDecorations(this.config.cpdConfig.decTypeCritical,critical);
            }
        }
    }

    renderSpotbugsGutters() {
        console.log("Would have rendered bugs");
    }
}