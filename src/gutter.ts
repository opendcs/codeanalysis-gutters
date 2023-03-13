import * as vscode from 'vscode';
import { CodeAnalysisConfig, CPDConfig } from './config';
import { CPDCache } from './data/cpd/cache';
import { SpotBugsCache } from './data/spotbugs/cache';
import { Bug } from './data/spotbugs/types';

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
    private spotbugsState: State;
    private config: CodeAnalysisConfig;

    
    public constructor(duplicates: CPDCache, spotbugs: SpotBugsCache, config: CodeAnalysisConfig,context:vscode.ExtensionContext) {
        this.duplicates=duplicates;
        this.spotbugsBugs = spotbugs;
        this.config = config;
        this.duplicateState = State.renderOff;
        this.spotbugsState = State.renderOff;
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

    public showSpotBugs() {
        this.spotbugsState = State.renderOn;
        var self = this;
        vscode.window.onDidChangeActiveTextEditor((editor)=> {
            if(editor) {
                self.renderSpotbugsGutters();
            }
        });
        this.renderSpotbugsGutters();
    }

    public hideSpotBugs() {
        this.spotbugsState = State.renderOff;
        vscode.window.onDidChangeActiveTextEditor((editor)=>{});
        this.renderSpotbugsGutters();
    }

    private renderDuplicateGutters() {
        const editor = vscode.window.activeTextEditor;
        if (this.duplicateState === State.renderOff) {
            editor?.setDecorations(this.config.cpdConfig.decTypeCritical,[]);
            editor?.setDecorations(this.config.cpdConfig.decTypeMajor,[]);
            editor?.setDecorations(this.config.cpdConfig.decTypeMinor,[]);
            return;
        }

        if (vscode.workspace.workspaceFolders !== undefined) {
            if ( editor !== null && editor !== undefined) {
                const openFile = editor.document.fileName;
                const dups = this.duplicates.getData(vscode.Uri.file(openFile));
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
        const editor = vscode.window.activeTextEditor;
        if (this.spotbugsState === State.renderOff) {
            editor?.setDecorations(this.config.cpdConfig.decTypeCritical,[]);
            editor?.setDecorations(this.config.cpdConfig.decTypeMajor,[]);
            editor?.setDecorations(this.config.cpdConfig.decTypeMinor,[]);
            return;
        }

        if (vscode.workspace.workspaceFolders !== undefined) {
            if (editor) {
                const openFile = editor.document.fileName;
                var high = new Array<vscode.DecorationOptions>();
                var normal = new Array<vscode.DecorationOptions>();
                var low = new Array<vscode.DecorationOptions>();

                const bugs = this.spotbugsBugs.getBugs(vscode.Uri.file(openFile));
                bugs?.forEach((report)=>{
                    report.bugs.forEach(bug=>{
                        if(bug.priority === 1) {
                            high.push(bug.getDecorationInfo());
                        } else if(bug.priority === 2) {
                            normal.push(bug.getDecorationInfo());                            
                        } else {
                            low.push(bug.getDecorationInfo());
                        }
                    });
                });

                editor?.setDecorations(this.config.spotbugsConfig.decTypeHigh,high);
                editor?.setDecorations(this.config.spotbugsConfig.decTypeNormal,normal);
                editor?.setDecorations(this.config.spotbugsConfig.decTypeLow,low);
            }
        }
    }
}
