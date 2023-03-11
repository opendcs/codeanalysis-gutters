import { expandedUri } from "../cpd/fileops";
import { FileHunter } from "../hunter";
import * as vscode from 'vscode';
import * as xml from 'xml2js';

export class Bug {

}

export class FileReport {
    public constructor(
        public readonly file: vscode.Uri,
        public readonly bugs: Bug[]    
    ) {

    }
}

export class CPDCache {
    private bugs: Map<string,Array<FileReport>>;
    private callbacks = new Array<()=>void>();
    private fileHunter: FileHunter;

    public constructor() {
        this.bugs = new Map<string,Array<FileReport>>();

        var self = this;
        this.fileHunter = new FileHunter(
            "**/*.xml",
            async (file) => {
                const data = await vscode.workspace
                    .fs
                    .readFile(file);
                return data.toString().includes("<BugCollection");
            },
            (file) => {
            console.log("Registering file watchers");
            this.readData(file);
            var watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(file,'*')
            );
            watcher.onDidChange(() => {
                self.bugs.delete(file.toString());
                self.readData(file);
            });
            watcher.onDidCreate(() => {
                self.bugs.delete(file.toString());
                self.readData(file);
            });
            watcher.onDidDelete( () => {
                self.bugs.delete(file.toString());
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
            xml.parseString(data, (err, bugData) => {
                if (err) {
                    throw err;
                }
                /*
                var duplicates = bugData["pmd-cpd"]["duplication"];
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
                */
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
    public getBugs(file: vscode.Uri) : FileReport[] {
        var duplicates = this.bugs.get(file.toString());
        if( duplicates !== null && duplicates !== undefined) {
            return duplicates;
        }
        return [];
    }

    public getKnownFiles(): Array<vscode.Uri> {
        return Array.from(this.bugs.keys(),(v,k) => expandedUri(v) );
    }
}
