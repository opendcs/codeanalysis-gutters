import * as vscode from 'vscode';
import { CPDCache } from './data/cpd';


export function renderGutters(data: CPDCache, context: vscode.ExtensionContext) {
    console.log("Got the following information: ");
    console.dir(data.getData());
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
        let editors = vscode.window.visibleTextEditors;
        
        editors.forEach((editor)=>{
            var openFile = editor?.document.fileName.replace(workspaceDir,"");        
            // render minor
            data.getData().forEach((dup,idx) => {
                if (dup.thisFile === openFile) {
                    console.log("file matched");
    
                    if (dup.numTokens < 300) {
                        editor?.setDecorations(decTypeMinor,[dup.getDecorationInformation()]);
                    } else if (dup.numTokens < 700) {
                        editor?.setDecorations(decTypeMajor,[dup.getDecorationInformation()]);
                    } else {
                        editor?.setDecorations(decTypeCritical,[dup.getDecorationInformation()]);
                    }
                }
            });
        });
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