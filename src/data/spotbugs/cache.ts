import { expandedUri } from "../cpd/fileops";
import { FileHunter } from "../hunter";
import * as vscode from 'vscode';
import * as xml from 'xml2js';
import { FileReport } from "./types";
import { SpotBugsFileProcessor } from "./processor";



export class SpotBugsCache {
    private reports: Map<string,Map<string,FileReport>>;
    private callbacks = new Array<()=>void>();
    private fileHunter: FileHunter;
    private activeConfidences: Array<number> = [1,2,3];

    public constructor() {
        this.reports = new Map<string,Map<string,FileReport>>();

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
                self.reports.delete(file.toString());
                self.readData(file);
            });
            watcher.onDidCreate(() => {
                self.reports.delete(file.toString());
                self.readData(file);
            });
            watcher.onDidDelete( () => {
                self.reports.delete(file.toString());
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
                var reports = self.reports.get(newReport.file.toString());
                if (!reports) {
                    self.reports.set(newReport.file.toString(),new Map<string,FileReport>());
                    reports = self.reports.get(newReport.file.toString());
                }                 
                reports?.set(newReport.bugSource.path,newReport);
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
    public getBugs(file: vscode.Uri) : Map<string,FileReport> {
        var reportsForFile = this.reports.get(file.toString());
        return reportsForFile || new Map<string,FileReport>();
    }

    public getKnownFiles(): Array<vscode.Uri> {
        return Array.from(this.reports.keys(),(v,k) => expandedUri(v) );
    }

    public setConfidences(confidenceSet: Array<number>): void {
        this.activeConfidences = confidenceSet;
    }

    public getConfidences() : Array<number> {
        return this.activeConfidences;
    }
}
