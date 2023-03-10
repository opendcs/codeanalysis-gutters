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

/**
 * Make sure we have a full path to the file
 * @param file full or relative path to file
 * @returns Uri to the file with workspace dir added if needed.
 */
function expandedUri(file: string): vscode.Uri {
    var uri = vscode.Uri.file(file);
    /** If the file is a relative assume it's from the workspace root
         * and tweak as required
         */
    if (!file.startsWith("/") && vscode.workspace.workspaceFolders !== undefined) {
        const workspaceDir = vscode.workspace.workspaceFolders[0].uri;
        uri = vscode.Uri.file(workspaceDir.path + "/" + file);
    }
    return uri;
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

    /**
     * Actually read the data
     * @param file uri to the cpd xml file to process
     */
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
                    var allFiles = new Array<OtherFile>();
                    Object.keys(xmlFiles).forEach( (value,idx) => {
                        var xmlFile = xmlFiles[idx].$;
                        allFiles.push(
                            new OtherFile(
                                expandedUri(xmlFile.path),
                                Number.parseInt(xmlFile.line)
                            )
                        );
                    });

                    Object.keys(xmlFiles).forEach( (value:string, idx:number) => {
                        var dupFile = xmlFiles[idx].$;
                        var file = dupFile.path;
                        var startLine = Number.parseInt(dupFile.line);
                        var endLine = Number.parseInt(dupFile.endline);
                        var otherFiles = new Array<OtherFile>();
                        allFiles.forEach((path) => {
                            if (path.file.toString() !== expandedUri(file).toString()) {
                                otherFiles.push(path);
                            }
                        });

                        var uri = expandedUri(file);
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

    /**
     * Rerender decorations if change of duplication data.
     */
    private fireChange() {
        this.callbacks.forEach( (cb) => cb() );
    }

    /**
     * Register function to be called on any change.
     * @param cb 
     */
    public onChange(cb: () => void) {
        this.callbacks.push(cb);
    }

    /**
     * Retrieve Duplication data for a given file.
     * @param file The file we want data for
     * @returns All Duplicate data for the given file, or []
     */
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