import * as xml from 'xml2js';
import * as vscode from 'vscode';
import { CPDFileHunter } from './hunter';
import { DuplicationData, expandedUri, OtherFile } from './fileops';

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