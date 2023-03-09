import * as xml from 'xml2js';
import * as fs from 'fs';
import * as vscode from 'vscode';

/**
 * Contains the duplication data and function to retrieve the ranges
 */
export class DuplicationData {
    public readonly thisFile: string;
    public readonly otherFiles: string[];
    public readonly startLine: number;
    public readonly endLine: number;
    public readonly numTokens: number;

    public constructor(thisFile:string,otherFiles: string[],startLine: number,
                       endLine: number, numTokens: number) {
        this.thisFile = thisFile;
        this.otherFiles = otherFiles;
        this.startLine = startLine;
        this.endLine = endLine;
        this.numTokens = numTokens;
    }

    /**
     * @returns DecorationOptions containing the ranges and links to the other files
     */
    public getDecorationInformation() {
        var msg = new vscode.MarkdownString("# This is duplicated with: ");
        this.otherFiles.forEach((fileName) => {
            msg.appendText("- " + fileName);
        });

        return {
            hoverMessage: msg,
            range: new vscode.Range(this.startLine,0,this.endLine,0)
        };
    }
}

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

/**
 * Maintains duplication data and handles filesystem changes.
 */
export class CPDCache {
    private duplicateData: Map<string,Array<DuplicationData>>;
    private callbacks = new Array<()=>void>();
    private fileHunter: CPDFileHunter;

    public constructor() {
        this.duplicateData = new Map<string,Array<DuplicationData>>();        
        
        var self = this;
        this.fileHunter = new CPDFileHunter((file) => {
            console.log("Registering file watchers");
            this.readData(file);
            var watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(file,'*')
            );
            watcher.onDidChange(() => {
                self.duplicateData.delete(file.toString());
                self.readData(file);
            });
            watcher.onDidCreate(() => {
                self.duplicateData.delete(file.toString());
                self.readData(file);
            });
            watcher.onDidDelete( () => {
                self.duplicateData.delete(file.toString());
                self.fireChange();
            });
        });
    }

    private readData(file: vscode.Uri) {
        var self = this;
        
        vscode.workspace.fs.readFile(file).then((data) => {
            xml.parseString(data, (err, cpdData) => {
                if (err) {
                    throw err;
                }
                var duplicates = cpdData["pmd-cpd"]["duplication"];
                Object.keys(duplicates).forEach( (value:string,idx: number) => {
                    var tokensDuplicate = Number.parseInt(duplicates[idx].$.tokens);
                    var xmlFiles = duplicates[idx]["file"];
                    var allFiles = new Array<string>();
                    Object.keys(xmlFiles).forEach( (value,idx) => {
                        allFiles.push(xmlFiles[idx].$.path);
                    });

                    Object.keys(xmlFiles).forEach( (value:string, idx:number) => {
                        var dupFile = xmlFiles[idx].$;
                        var file = dupFile.path;
                        var startLine = Number.parseInt(dupFile.line);
                        var endLine = Number.parseInt(dupFile.endline);
                        var otherFiles = new Array<string>();
                        allFiles.forEach((path) => {
                            if (path !== file) {
                                otherFiles.push(path);
                            }
                        });
                        
                        var uri = vscode.Uri.file(file);
                        /** If the file is a relative assume it's from the workspace root
                          * and tweak as required
                          */
                        if (!file.startsWith("/") && vscode.workspace.workspaceFolders !== undefined) {
                            const workspaceDir = vscode.workspace.workspaceFolders[0].uri;
                            uri = vscode.Uri.file(workspaceDir.path + "/" + file);
                        }
                        var uriString = uri.toString();
                        var dupElement = new DuplicationData(file,otherFiles,startLine,endLine,tokensDuplicate);
                        if(!self.duplicateData.has(uriString)) {
                            self.duplicateData.set(uriString,new Array<DuplicationData>());
                        }
                        var dupSet = self.duplicateData.get(uriString) || new Array<DuplicationData>();
                        dupSet.push(dupElement);
                    });
                });
                self.fireChange();
            });
        });
    }

    private fireChange() {
        this.callbacks.forEach( (cb) => cb() );
    }

    public onChange(cb: () => void) {
        this.callbacks.push(cb);
    }

    public getData(file: vscode.Uri) : DuplicationData[] {
        var duplicates = this.duplicateData.get(file.toString());
        if( duplicates !== null && duplicates !== undefined) {
            return duplicates;
        } else {
            /* try to match with shorter and shorter */

        }
        
        return [];
    }
}