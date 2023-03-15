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


export const lowConfidence = new Confidence(3,"Low","Bugs that may be more likely to be false positives.");
export const normalConfidence = new Confidence(2,"Normal", "Bugs that are well known but may be difficult to avoid false positives");
export const highConfidence = new Confidence(1,"High","Bugs that are well known and understood.");
export const CONFIDENCES = [lowConfidence,normalConfidence,highConfidence];
export const CONFIDENCE_KEY = "confidences";
export const CONFIDENCE_MAP = {1:highConfidence,2:normalConfidence,3:highConfidence};

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