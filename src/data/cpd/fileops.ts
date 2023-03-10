import * as xml from 'xml2js';
import * as fs from 'fs';
import * as vscode from 'vscode';

/**
 * Maintains information necessary to provide
 * appropriate link to duplicate code in other files.
 */
export class OtherFile {
    public readonly file: vscode.Uri;
    public readonly line: number;

    public constructor(file: vscode.Uri, line: number) {
        this.file = file;
        this.line = line;
    }

    /**
     * Same file link format that would be seen in the terminal.
     * @returns text for the [] portions of the Markdown link.
     */
    public linkText(): string {
        return this.file.toString() + ":" + this.line.toFixed(0);
    }

    /**
     * File link in a format that vscode will open and move to the 
     * correct line.
     * @returns proper link with anchor.
     */
    public link(): string {
        return this.file.toString() + "#" + this.line.toFixed(0);
    }
}

/**
 * Contains the duplication data and function to retrieve the ranges
 */
export class DuplicationData {
    public readonly thisFile: string;
    public readonly otherFiles: OtherFile[];
    public readonly startLine: number;
    public readonly endLine: number;
    public readonly numTokens: number;

    public constructor(thisFile:string,otherFiles: OtherFile[],startLine: number,
                       endLine: number, numTokens: number) {
        this.thisFile = thisFile;
        this.otherFiles = otherFiles;
        this.startLine = startLine;
        this.endLine = endLine;
        this.numTokens = numTokens;
    }

    /**
     * Sets up the hover text and file links.
     * @returns DecorationOptions containing the ranges and links to the other files
     */
    public getDecorationInformation() {
        var msg = new vscode.MarkdownString("# This is duplicated with:\r\n---\r\n\r\n");
        this.otherFiles.forEach((file) => {
            msg.appendMarkdown("- ["+ file.linkText() +"](" + file.link() + ")\r\n");
        });
        //msg.isTrusted = true;
        return {
            hoverMessage: msg,
            range: new vscode.Range(this.startLine,0,this.endLine,0)
        };
    }
}


/**
 * Make sure we have a full path to the file
 * @param file full or relative path to file
 * @returns Uri to the file with workspace dir added if needed.
 */
export function expandedUri(file: string): vscode.Uri {
    if( file.match("[a-zA-Z]*://.*") ) {
        return vscode.Uri.parse(file);
    }
    var uri = vscode.Uri.file(file);
    /** If the file is a relative assume it's from the workspace root
         * and tweak as required
         */
    if (!file.startsWith("/") && !file.startsWith("file://") && vscode.workspace.workspaceFolders !== undefined) {
        const workspaceDir = vscode.workspace.workspaceFolders[0].uri;
        uri = vscode.Uri.file(workspaceDir.path + "/" + file);
    }
    return uri;
}
