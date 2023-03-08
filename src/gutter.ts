import * as vscode from 'vscode';
import { CPDCache } from './data/cpd';


export function renderGutters(data: CPDCache, context: vscode.ExtensionContext) {
    console.log("Got Info, rendering");
    //console.dir(data.getData());
    var decTypeCritical = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "red"        
    });

    var decTypeMajor = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "yellow"
    });

    var decTypeMinor = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "blue"
    });

    if (vscode.workspace.workspaceFolders !== undefined) {
        let workspaceDir = vscode.workspace.workspaceFolders[0].uri.path+"/";
        let editor = vscode.window.activeTextEditor;
        if ( editor !== null && editor !== undefined) {
            var openFile = editor?.document.fileName.replace(workspaceDir,"");
            let dups = data.getData().get(openFile);
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

            editor?.setDecorations(decTypeMinor,minor);
            editor?.setDecorations(decTypeMajor,major);
            editor?.setDecorations(decTypeCritical,critical);
        }
    }
    
    
    /*
    editor?.setDecorations(decType,[
        {
            hoverMessage: "This is duplicated with",
            range: new vscode.Range(10,0,20,0)
        }
    ]);
    */
}