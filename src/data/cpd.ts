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

export class CPDCache {
    private duplicateData: Array<DuplicationData>;

    public constructor(cpdXmlFile: string) {
        //this.fileInfoMap = new Map<String,DuplicationData[]>();
        this.duplicateData = new Array<DuplicationData>();
        var self = this;
        var data = fs.readFileSync(cpdXmlFile, "utf-8");
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
                    var dupElement = new DuplicationData(file,otherFiles,startLine,endLine,tokensDuplicate);
                    self.duplicateData.push(dupElement);
                });
            });
        });
    }

    public getData() {
        return this.duplicateData;
    }
}