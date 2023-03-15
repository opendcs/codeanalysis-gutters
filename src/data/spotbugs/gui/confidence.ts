import * as vscode from 'vscode';

export class Confidence implements vscode.QuickPickItem {
    label: string;
    kind?: vscode.QuickPickItemKind.Default;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: true;
    alwaysShow?: true;
    buttons?: undefined;
    public readonly whenContextKey: string;    

    public constructor(public readonly value: number, label: string, description: string) {
        this.label = label;
        this.description = description;
        this.whenContextKey = `codeanalysis.spotbugs.confidence.${label.toLowerCase()}.show`;
    }
}

export class Rank implements vscode.QuickPickItem {
    label: string;    
    description?: string | undefined;
    alwaysShow?: true;
    picked?: true | undefined;
    public readonly whenContextKey: string;

    public constructor(public readonly startValue: number, label:string, description: string) {
        this.label = label;
        this.description = description;
        this.whenContextKey = `codeanalysis.spotbugs.rank.${label}.show`;

    }

}
export const rankScariest = new Rank(4,"Scariest","Bug that are extremely likely to be exploited or cause major issues.");
export const rankScary = new Rank(9,"Scary","Bugs that are likely to be exploited or cause major issues.");
export const rankTroubling = new Rank(14,"Troubling","Code that may be exploited or cause major issues.");
export const rankConcerning = new Rank(20,"Concerning","Bugs that could be exploited or cause performances issues but aren't not immediate issues");
export const RANKS = [rankScariest,rankScary,rankTroubling,rankConcerning];
export const RANK_KEY = "ranks";
export const RANK_MAP: Map<number,Rank> = new Map<number,Rank>([[4, rankScariest],[9, rankScary],[14,rankTroubling],[20,rankConcerning]]);

export const lowConfidence = new Confidence(3,"Low","Bugs that may be more likely to be false positives.");
export const normalConfidence = new Confidence(2,"Normal", "Bugs that are well known but may be difficult to avoid false positives");
export const highConfidence = new Confidence(1,"High","Bugs that are well known and understood.");
export const CONFIDENCES = [lowConfidence,normalConfidence,highConfidence];
export const CONFIDENCE_KEY = "confidences";
export const CONFIDENCE_MAP: Map<number,Confidence> = new Map<number,Confidence>([[1,highConfidence],[2,normalConfidence],[3,highConfidence]]);

export function updateConfidenceFilterContext(confidences: Array<number>) {
    const cmd = vscode.commands.executeCommand;
    let confidencesOn = CONFIDENCES.filter((c) => confidences.includes(c.value));
    let confidencesOff = CONFIDENCES.filter((c)=> !confidences.includes(c.value));
    confidencesOn.forEach(c=> {
        cmd("setContext",c.whenContextKey,true);        
    });

    confidencesOff.forEach(c=>{
        cmd("setContext",c.whenContextKey,false);
    });
}

export function updateRankFilterContext(ranks: Array<number>| number) {
    const cmd = vscode.commands.executeCommand;
    let ranksOn: Array<Rank> = [];
    let ranksOff: Array<Rank> = [];
    if( ranks instanceof Number ) {

    } else if(ranks instanceof Array<Number>) {
        ranksOn = RANKS.filter((r)=> ranks.includes(r.startValue));
        ranksOff = RANKS.filter((r)=> !ranks.includes(r.startValue));
    }
    ranksOn.forEach(r=>{
        cmd("setContext",r.whenContextKey,true);
    });
    ranksOff.forEach(r=>{
        cmd("setContext",r.whenContextKey,false);
    });
    
}