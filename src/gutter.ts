import * as vscode from 'vscode';
import { CPDCache } from './data/cpd';


export function renderGutters(context: vscode.ExtensionContext) {

    var data = new CPDCache("/home/mike/projects/pmd-cpd-gutters/pmd-gutters/examples/cpd/cpd.xml");    
    console.log("Got the following information: ");
    console.dir(data.getData());
    var decType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "red",
        overviewRulerColor: "red",
        overviewRulerLane: vscode.OverviewRulerLane.Full
    });

    var editor = vscode.window.activeTextEditor;
    console.log("File is " + editor);
    if( editor === undefined || editor === null ) {
        return;
    }
    
    editor?.setDecorations(decType,[
        {
            hoverMessage: "This is duplicated with",
            range: new vscode.Range(10,0,20,0)
        }
    ]);
}