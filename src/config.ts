import * as vscode from 'vscode';


export class CPDConfig {
    public readonly decTypeCritical = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "red",
        overviewRulerColor: "red",
        overviewRulerLane: vscode.OverviewRulerLane.Full
    });

    public readonly decTypeMajor = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "yellow",
        overviewRulerColor: "yellow",
        overviewRulerLane: vscode.OverviewRulerLane.Full
    });

    public readonly decTypeMinor = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "blue",
        overviewRulerColor: "blue",
        overviewRulerLane: vscode.OverviewRulerLane.Full
    });

    public constructor(
        public readonly minor: number,
        public readonly major: number
    ) {
        if(minor >= major) {
            throw new Error("Thresholds must be the following condition: minor < major");
        }
    }    
}


export class CodeAnalysisConfig {
    public readonly cpdConfig = new CPDConfig(300,700);

    public constructor() {

    }
}