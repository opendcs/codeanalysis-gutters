import * as vscode from 'vscode';
import { SpotBugsFileProcessor } from './processor';

/**
 * Bug information
 */
export class Bug {
    private static readonly confidence: string[] = ["undefined","high","normal","low"];

    getDecorationInfo(): vscode.DecorationOptions {
        var msg = new vscode.MarkdownString(
                    `# Confidence: ${Bug.confidence[this.priority]} `
                   + ` Rank: ${this.rank}, Category: ${SpotBugsFileProcessor.bugCategories.get(this.category)}\r\n---\r\n\r\n`);
        msg.appendMarkdown(`${this.longMessage}\n`);
        const pattern = SpotBugsFileProcessor.bugPatterns.get(this.type);
        msg.appendMarkdown(`## ${pattern?.shortDescription}\r\n---\r\n\r\n`);
        msg.appendMarkdown(`${pattern?.details}`);
        msg.isTrusted = true;
        msg.supportHtml = true;
        return {
            hoverMessage: msg,
            range: new vscode.Range(this.startLine,0,this.endLine,0)
        };
    }
    public constructor(
        public readonly category: string,
        public readonly type: string,
        public readonly typeAbbrev: string,
        public readonly rank: number,
        public readonly priority: number,
        public readonly longMessage: string,
        public readonly shortMessage: string,
        public readonly startLine: number,
        public readonly endLine: number,
        public readonly sourceFile: vscode.Uri
    ) {}
}

/**
 * List of bugs for a given source file from a given tool
 * Report file.
 */
export class FileReport {
    public constructor(
        public readonly bugSource: vscode.Uri,
        public readonly file: vscode.Uri,
        public readonly bugs: Bug[]    
    ) {

    }
}