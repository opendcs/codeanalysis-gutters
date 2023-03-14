import * as vscode from 'vscode';


export class CPDConfig {
    /**
     * TODO: Mike 2023-03-13 I have no idea why the ThemeColors aren't working.
     */
    //#fa4d5640";
    public readonly criticalColor = new vscode.ThemeColor("duplicateStatus.critical");
    //"#ff832b40";
    public readonly majorColor = new vscode.ThemeColor("duplicateStatus.major");
    //"#f1c21b40";
    public readonly minorColor = new vscode.ThemeColor("duplicateStatus.minor");

    public readonly decTypeCritical = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: this.criticalColor,
        overviewRulerColor: this.criticalColor,
        overviewRulerLane: vscode.OverviewRulerLane.Full
    });

    public readonly decTypeMajor  = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: this.majorColor,
        overviewRulerColor: this.majorColor,
        overviewRulerLane: vscode.OverviewRulerLane.Full
    });

    public readonly decTypeMinor = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: this.minorColor,
        overviewRulerColor: this.minorColor,
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
    public readonly colorHigh = new vscode.ThemeColor("spotbugs.highConfidence");
    public readonly colorNormal = new vscode.ThemeColor("spotbugs.normalConfidence");
    public readonly colorLow = new vscode.ThemeColor("spotbugs.lowConfidence");
    public confidences: Array<number> = [1,2,3];

    public readonly decTypeHigh = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: this.colorHigh,
        overviewRulerColor: this.colorHigh,
        overviewRulerLane: vscode.OverviewRulerLane.Center
    });

    public readonly decTypeNormal = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: this.colorNormal,
        overviewRulerColor: this.colorNormal,
        overviewRulerLane: vscode.OverviewRulerLane.Center
    });

    public readonly decTypeLow = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
        backgroundColor: this.colorLow,
        overviewRulerColor: this.colorLow,
        overviewRulerLane: vscode.OverviewRulerLane.Center
    });

    public constructor() {
    }

    public getConfidences(): Array<number> {
        return this.confidences;
    }

    public setConfidences(confidences: Array<number>) {
        this.confidences = confidences;
    }
}


export class CodeAnalysisConfig implements vscode.Disposable{
    public readonly cpdConfig = new CPDConfig(300,700);
    public readonly spotbugsConfig = new SpotBugsConfig();
    public static readonly instance = new CodeAnalysisConfig();

    private constructor() {

    }
    dispose() {
    }
}