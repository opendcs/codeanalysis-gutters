import * as vscode from 'vscode';
import * as xml from 'xml2js';
import { Bug, FileReport } from './types';
import { expandedUri } from '../cpd/fileops';

export class BugCode {
    public constructor(
        public readonly cweid: string,
        public readonly description: string
    ) {}
}

export class PatternInfo {
    public constructor(
        public readonly abbrev: string,
        public readonly type: string,
        public readonly category: string
    ) {}
}

export class BugPattern {
    public constructor(
        public readonly pattern: PatternInfo,
        public readonly details: string,
        public readonly shortDescription: string
    ) {}
}

export class SpotBugsFileProcessor {
    public readonly reports= Array<FileReport>();
    public static readonly bugCategories = new Map<string,string>();
    public static readonly bugCodes = new Map<string,BugCode>();
    public static readonly bugPatterns = new Map<string,BugPattern>();
    private baseUrl: string;

    public constructor(xml: any,bugSource: vscode.Uri) {
        let collection = xml["BugCollection"];
        if (!collection) {
            throw new Error("File does not contain a SpotBugs bug collection");
        }
        this.loadBaselineData(collection);
        

        this.baseUrl = collection["Project"][0]["SrcDir"][0];
        var allBugs = this.getAllBugs(collection["BugInstance"]);
        let filesWithBugs = this.getFilesWithBugs(collection["FindBugsSummary"][0]["FileStats"]);
        
        filesWithBugs.forEach(file => {
            var report = new FileReport(
                            bugSource,
                            file,
                            allBugs.filter((bug)=> bug.sourceFile.path === file.path)
                        );
            this.reports.push(report);
        });

    }
    /**
     * Actually process the bugs
     * @param bugsXml the BugInstance section of the XML
     * @returns array of bugs
     */
    private getAllBugs(bugsXml: any): Bug[] {
        var bugs = new Array<Bug>();
        Object.keys(bugsXml)
              .forEach((_value,index)=>{
                var bug = bugsXml[index];
                bugs.push(
                    new Bug(
                        bug.$.category,
                        bug.$.type,
                        bug.$.abbrev,
                        Number.parseInt(bug.$.rank),
                        Number.parseInt(bug.$.priority),
                        bug["LongMessage"][0],
                        bug["ShortMessage"][0],
                        Number.parseInt(bug["SourceLine"][0].$.start),
                        Number.parseInt(bug["SourceLine"][0].$.end),
                        expandedUri(this.baseUrl+"/"+bug["SourceLine"][0].$.relSourcepath)
                    )
                );
        });
        return bugs;
    }

    /**
     * Load/Update the Bug Categories and other shared information
     * @param collection the "BugCollection" portion of the processed xml data
     */
    private loadBaselineData(collection: any) {
        Object.keys(collection["BugCategory"])
              .forEach((_value,index)=>{
                var cat = collection["BugCategory"][index];
                SpotBugsFileProcessor.bugCategories.set(cat.$.category,cat.Description[0]);
        });

        Object.keys(collection["BugCode"])
              .forEach((_value,index) => {
                var code = collection["BugCode"][index];
                SpotBugsFileProcessor.bugCodes.set(code.$.abbrev, {
                    "cweid": code.$.cweid,
                    "description": code.Description[0]
                });
        });

        Object.keys(collection["BugPattern"])
              .forEach((_value,index)=>{
                var pattern = collection["BugPattern"][index];
                SpotBugsFileProcessor.bugPatterns.set(pattern.$.abbrev, {
                    pattern: {
                        abbrev: pattern.$.abbrev,
                        type: pattern.$.type,
                        category: pattern.$.category
                    },
                    details: pattern.Details[0],
                    shortDescription: pattern.ShortDescription[0]
                });
              });
    }

    private getFilesWithBugs(fileStats: any[]): vscode.Uri[] {
        var files = new Array<vscode.Uri>();
        Object.keys(fileStats).forEach( (_value:string,idx: number) => {
            let stat = fileStats[idx].$;
            const bugCount = Number.parseInt(stat.bugCount);
            if (bugCount > 0) {
                files.push(expandedUri(this.baseUrl+"/"+stat.path));
            }
        });
        return files;
    }
    


    public static async read(file: vscode.Uri): Promise<FileReport[]> {

        return new Promise((resolve,reject) => {
            vscode.workspace.fs.readFile(file)
                .then(fileData=>{
                    xml.parseStringPromise(fileData)
                        .then((xml)=> {
                            var processor = new SpotBugsFileProcessor(xml,file);
                            var reports = processor.reports;
                            resolve(reports);
                        })
                    .catch((reason) => {
                        reject("Unable to read " + file + " because" + reason);
                    });
                });
        });
    }
}

