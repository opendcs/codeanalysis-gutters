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

export class SpotBugsConfig {
    public readonly decTypeHigh = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "red",
        overviewRulerColor: "red",
        overviewRulerLane: vscode.OverviewRulerLane.Center
    });

    public readonly decTypeNormal = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "yellow",
        overviewRulerColor: "yellow",
        overviewRulerLane: vscode.OverviewRulerLane.Center
    });

    public readonly decTypeLow = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: "blue",
        overviewRulerColor: "blue",
        overviewRulerLane: vscode.OverviewRulerLane.Center
    });

    public constructor() {}
}


export class CodeAnalysisConfig {
    public readonly cpdConfig = new CPDConfig(300,700);
    public readonly spotbugsConfig = new SpotBugsConfig();

    public constructor() {

    }
}