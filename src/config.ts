import * as vscode from 'vscode';
import { CONFIDENCE_KEY, rankConcerning, rankScariest, RANK_KEY, updateConfidenceFilterContext } from './data/spotbugs/gui/confidence';


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

export type ConfidenceChangeCallBack = (confidences: Array<number>) => void;
export type RankChangeCallback = (minRank: number) => void;

export class SpotBugsConfig {    
    
    public readonly colorHigh = new vscode.ThemeColor("spotbugs.highConfidence");
    public readonly colorNormal = new vscode.ThemeColor("spotbugs.normalConfidence");
    public readonly colorLow = new vscode.ThemeColor("spotbugs.lowConfidence");
    public confidences: Array<number> = [1,2,3];
    private confidenceChangeCallBacks: Array<ConfidenceChangeCallBack> = [];
    private minimumRank: number = rankConcerning.startValue;
    private rankChangeCallbacks: Array<RankChangeCallback> = [];

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

    public constructor(private readonly context: vscode.ExtensionContext) {
        this.onConfidenceChange((c) => updateConfidenceFilterContext(c));
        this.setConfidences(context.workspaceState.get(CONFIDENCE_KEY) || [1,2,3]);
        this.setMinimumRank(context.workspaceState.get(RANK_KEY) || rankConcerning.startValue);
    }

    public getConfidences(): Array<number> {
        return this.confidences;
    }

    public setConfidences(confidences: Array<number>) {
        this.confidences = confidences;
        this.context.workspaceState.update(CONFIDENCE_KEY,confidences);
        this.confidenceChangeCallBacks.forEach((cb)=> {
            cb(confidences);
        });
    }

    public getMinimumRank(): Number {
        return this.minimumRank;
    }

    public setMinimumRank(rank: number| Array<number>) {
        
        if(rank instanceof Array<number> ) {
            rank.sort();
            this.minimumRank = rank[-1];
        } else {
            this.minimumRank = rank;
        }
        this.context.workspaceState.update(RANK_KEY,this.minimumRank);
        this.rankChangeCallbacks.forEach(cb=>{
            cb(this.minimumRank);
        });
    }

    public onConfidenceChange(cb: ConfidenceChangeCallBack): void {
        this.confidenceChangeCallBacks.push(cb);
    }

    public onRankChange(cb: RankChangeCallback): void {
        this.rankChangeCallbacks.push(cb);
    }
}


export class CodeAnalysisConfig implements vscode.Disposable{
    public readonly cpdConfig = new CPDConfig(300,700);
    public readonly spotbugsConfig: SpotBugsConfig;
    private static staticInstance: CodeAnalysisConfig;

    private constructor(private readonly context: vscode.ExtensionContext) {
        this.spotbugsConfig = new SpotBugsConfig(context);
    }

    public static init(context: vscode.ExtensionContext): void {
        if (CodeAnalysisConfig.staticInstance == null) {
            CodeAnalysisConfig.staticInstance = new CodeAnalysisConfig(context);
        }
    }

    public static instance(): CodeAnalysisConfig {
        if (!CodeAnalysisConfig.staticInstance) {
            throw new Error("Config must be initialized with the ExtensionContext first.");
        }
        return CodeAnalysisConfig.staticInstance;
    }

    dispose() {

    }
}