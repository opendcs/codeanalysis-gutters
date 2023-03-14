import * as vscode from 'vscode';

export class Confidence implements vscode.QuickPickItem {
    label: string;
    kind?: vscode.QuickPickItemKind.Default;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: true;
    alwaysShow?: true;
    buttons?: undefined;    

    public constructor(public readonly value: number, label: string, description: string) {
        this.label = label;
        this.description = description;
    }
}


const lowConfidence = new Confidence(3,"Low","Bugs that may be more likely to be false positives.");
const normalConfidence = new Confidence(2,"Normal", "Bugs that are well known but may be difficult to avoid false positives");
const highConfidence = new Confidence(1,"High","Bugs that are well known and understood.");
export const CONFIDENCES = [lowConfidence,normalConfidence,highConfidence];