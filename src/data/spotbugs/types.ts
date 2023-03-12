import * as vscode from 'vscode';

/**
 * Bug information
 */
export class Bug {
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