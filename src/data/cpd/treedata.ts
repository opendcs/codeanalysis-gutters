import * as vscode from 'vscode';
import { CPDCache } from './cache';
import { DuplicationData, expandedUri, OtherFile } from './fileops';

export class DuplicationItem{
    constructor(
        public readonly uri: vscode.Uri,
        public readonly data?: DuplicationData,
        public readonly otherFile?: OtherFile
    ) {        
    }
}

export class DuplicateCodeProvider implements vscode.TreeDataProvider<DuplicationItem> {
    private duplicateCache: CPDCache;

    public constructor(duplicateCache: CPDCache) {
        this.duplicateCache = duplicateCache;
        this.duplicateCache.onChange( () => {
            this.refresh();
        });
    }    

    private _onDidChangeTreeData: vscode.EventEmitter<DuplicationItem | undefined | null | void> = new vscode.EventEmitter<DuplicationItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DuplicationItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DuplicationItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        let ws = vscode.workspace;
        if ( element.data !== undefined) {
            return {
                resourceUri: expandedUri(element.data.thisFile),
                label: `At Line ${element.data.startLine}, ${element.data.numTokens} tokens Also in the following files`,
                command: {
                    command: 'vscode.open',
                    arguments: [expandedUri(element.data.thisFile),{selection: new vscode.Range(element.data.startLine,0,element.data.endLine,0)}],
                    title: 'Open File'
                },
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
            };
        } else if (element.otherFile !== undefined) {
            let of = element.otherFile;
            return {
                resourceUri: of.file,
                label: `${ws.asRelativePath(of.file)}:${of.line.toFixed(0)}`,
                command: {
                    command: 'vscode.open',
                    arguments: [of.file,{selection: new vscode.Range(of.line,0,of.line,0)}],
                    title: 'Open Other File'
                }
            };
        } else {
            return {
                resourceUri: element.uri,
                label: ws.asRelativePath(element.uri),
                command: {
                    command: 'vscode.open',
                    arguments: [element.uri],
                    title: 'Open File'
                },
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
            };
        }
        
    }
    getChildren(element?: DuplicationItem | undefined): vscode.ProviderResult<DuplicationItem[]> {
        var items = new Array<DuplicationItem>();
        let cache = this.duplicateCache;
        if(element) {
            if (!element.data && !element.otherFile) {
                
                this.duplicateCache.getData(element.uri).forEach( (data)=>{
                    items.push(new DuplicationItem(element.uri,data));
                });
            } else {
                element.data?.otherFiles.forEach((of)=>{
                    items.push(new DuplicationItem(element.uri,undefined,of));
                });
            }
        } else {
            items = cache.getKnownFiles().map((uri)=>new DuplicationItem(uri));
        }
        return Promise.resolve(items);
    }
    getParent?(element: DuplicationItem): vscode.ProviderResult<DuplicationItem> {
        throw new Error('Method not implemented.');
    }
    resolveTreeData?(item: vscode.TreeItem, element: DuplicationData, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error('Method not implemented.');
    }

}