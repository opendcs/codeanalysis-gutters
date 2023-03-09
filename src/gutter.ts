import * as vscode from 'vscode';
import { CPDCache } from './data/cpd';

enum State {
    renderOn,
    renderOff
}

export class PMDGutters {
    private duplicates: CPDCache;
    private duplicateState: State;

    private decTypeCritical = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "red"
    });

    private decTypeMajor = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "yellow"
    });

    private decTypeMinor = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "blue"
    });

    public constructor(duplicates: CPDCache, context:vscode.ExtensionContext) {
        this.duplicates=duplicates;
        this.duplicateState = State.renderOff;
    }

    public showDuplicates() {
        this.duplicateState = State.renderOn;
        var self = this;
        vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor !== undefined) {
				self.renderGutters();
			}
		});
        this.renderGutters();
    }

    public hideDuplicates() {
        this.duplicateState = State.renderOff;
        vscode.window.onDidChangeActiveTextEditor((e)=>{});
        this.renderGutters();
    }

    private renderGutters() {
        if (this.duplicateState === State.renderOff) {
            let editor = vscode.window.activeTextEditor;
            editor?.setDecorations(this.decTypeCritical,[]);
            editor?.setDecorations(this.decTypeMajor,[]);
            editor?.setDecorations(this.decTypeMinor,[]);
            return;
        }
    
        if (vscode.workspace.workspaceFolders !== undefined) {
            let workspaceDir = vscode.workspace.workspaceFolders[0].uri.path+"/";
            let editor = vscode.window.activeTextEditor;
            if ( editor !== null && editor !== undefined) {
                var openFile = editor?.document.fileName.replace(workspaceDir,"");
                let dups = this.duplicates.getData().get(openFile);
                var minor = new Array<vscode.DecorationOptions>();
                var major = new Array<vscode.DecorationOptions>();
                var critical = new Array<vscode.DecorationOptions>();
    
                dups?.forEach((dup) => {
                    if (dup.numTokens < 300) {
                        minor.push(dup.getDecorationInformation());
                    } else if (dup.numTokens < 700) {
                        major.push(dup.getDecorationInformation());
                    } else {
                        critical.push(dup.getDecorationInformation());
                    }
                });
    
                editor?.setDecorations(this.decTypeMinor,minor);
                editor?.setDecorations(this.decTypeMajor,major);
                editor?.setDecorations(this.decTypeCritical,critical);
            }
        }
    }
}