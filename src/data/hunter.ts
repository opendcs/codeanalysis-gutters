import * as xml from 'xml2js';
import * as fs from 'fs';
import * as vscode from 'vscode';

/**
 * function called when the file hunter finds a file.
 * Used to register additional actions.
 */
type FileCallback = (file: vscode.Uri) => void;
type FileCheckCallback = (file: vscode.Uri) => Thenable<boolean>;

/**
 * Files of a given type.
 */
export class FileHunter {
    public readonly files = new Array<vscode.Uri>();
    private whenFound: FileCallback;

    public constructor(glob: string = "**/*.xml",fileVerifier: FileCheckCallback,whenFound: FileCallback) {
        var self = this;
        this.whenFound = whenFound;
        console.log("Starting file hunt");
        vscode.workspace.findFiles("**/*.xml").then( (files: vscode.Uri[])=> {
            files.forEach( (file) => {
                fileVerifier(file).then((result)=> {
                    if (result) {
                        console.log("Found file for this hunter: " + file.toString());
                        whenFound(file);
                    }
                });                
            });
        });
    }
}
