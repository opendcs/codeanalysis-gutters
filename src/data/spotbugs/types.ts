import * as vscode from 'vscode';
import { SpotBugsFileProcessor } from './processor';

/**
 * Bug information
 */
export class Bug {
    getDecorationInfo(): vscode.DecorationOptions {
        var msg = new vscode.MarkdownString(`# ${SpotBugsFileProcessor.bugCodes.get(this.typeAbbrev)?.description}\r\n---\r\n\r\n`);
        
        msg.appendMarkdown(`Category: ${this.category}, Rank: ${this.rank}\n${this.shortMessage}\r\n---\r\n\r\n`);
        msg.appendMarkdown(`${this.longMessage}\n`);
        const pattern = SpotBugsFileProcessor.bugPatterns.get(this.typeAbbrev);
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