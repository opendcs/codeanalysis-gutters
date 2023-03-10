import * as xml from 'xml2js';
import * as fs from 'fs';
import * as vscode from 'vscode';

/**
 * function called when the file hunter finds a file.
 * Used to register additional actions.
 */
type FileCallback = (file: vscode.Uri) => void;

/**
 * Keeps list of CPD files
 */
export class CPDFileHunter {
    public readonly files = new Array<vscode.Uri>();
    private callback: FileCallback;

    public constructor(callback: FileCallback) {
        var self = this;
        this.callback = callback;
        console.log("Starting file hunt");
        vscode.workspace.findFiles("**/*.xml").then( (files: vscode.Uri[])=> {
            files.forEach( (file) => {
                vscode.workspace.fs.readFile(file)
                      .then( (data) => {
                            if (data.toString().includes("<pmd-cpd>")) {
                                console.log("Found pmd-cpd file: " + file.toString());
                                callback(file);
                            }
                      });
            });
        });
    }
}
