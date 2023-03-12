import { expandedUri } from "../cpd/fileops";
import { FileHunter } from "../hunter";
import * as vscode from 'vscode';
import * as xml from 'xml2js';
import { FileReport } from "./types";
import { SpotBugsFileProcessor } from "./processor";



export class SpotBugsCache {
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
     * @param file uri to the spotbugs xml file to process
     */
    private readData(file: vscode.Uri) {
        var self = this;
        SpotBugsFileProcessor.read(file).then(updatedReports => {
            updatedReports.forEach(newReport=> {
                var reports = self.bugs.get(newReport.file.path);
                if (!reports) {
                    self.bugs.set(newReport.file.path,new Array<FileReport>());
                    reports = self.bugs.get(newReport.file.path);
                } 
                var filteredReports = reports?.filter((report) => report.bugSource.path !== file.path)
                                            .concat(updatedReports);
                self.bugs.set(newReport.file.path,filteredReports|| []);
            });
            this.fireChange();
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
        var bugs = this.bugs.get(file.toString());
        return bugs || [];
    }

    public getKnownFiles(): Array<vscode.Uri> {
        return Array.from(this.bugs.keys(),(v,k) => expandedUri(v) );
    }
}
