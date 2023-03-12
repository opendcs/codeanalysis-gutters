import * as vscode from 'vscode';
import { CPDCache } from './cache';
import { DuplicationData, expandedUri, OtherFile } from './fileops';

interface DuplicationNode {
    item(): vscode.TreeItem | Promise<vscode.TreeItem>;
    children(): DuplicationNode[] | undefined;
}

class DuplicationOtherFileNode implements DuplicationNode {
    public constructor(
        private readonly otherFile: OtherFile
    ) {}
    item(): vscode.TreeItem | Promise<vscode.TreeItem> {
        let ws = vscode.workspace;
        let of = this.otherFile;
        return {
            resourceUri: of.file,
            label: `${ws.asRelativePath(of.file)}:${of.line.toFixed(0)}`,
            command: {
                command: 'vscode.open',
                arguments: [of.file,{selection: new vscode.Range(of.line,0,of.line,0)}],
                title: 'Open Other File'
            }
        };
    }
    children(): DuplicationNode[] | undefined {
        return undefined;
    }

}

class DuplicationThisFileNode implements DuplicationNode {
    public constructor(
        private readonly data: DuplicationData
    ) {}


    item(): vscode.TreeItem | Promise<vscode.TreeItem> {
        return {
            resourceUri: expandedUri(this.data.thisFile),
            label: `At Line ${this.data.startLine}, ${this.data.numTokens} tokens Also in the following files`,
            command: {
                command: 'vscode.open',
                arguments: [expandedUri(this.data.thisFile),
                            {
                                selection: new vscode.Range(this.data.startLine,0,this.data.endLine,0)
                            }
                        ],
                title: 'Open File'
            },
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
        };
    }
    children(): DuplicationNode[] | undefined {
        return this.data.otherFiles.map((of) => new DuplicationOtherFileNode(of));        
    }

}

class DuplicationRootFileNode implements DuplicationNode {
    public constructor(
        public readonly uri: vscode.Uri,
        private readonly cache: CPDCache
    ) {}

    item(): vscode.TreeItem | Promise<vscode.TreeItem> {
        let ws = vscode.workspace;
        return {
            resourceUri: this.uri,
            label: ws.asRelativePath(this.uri),
            command: {
                command: 'vscode.open',
                arguments: [this.uri],
                title: 'Open File'
            },
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
        };
    }
    children(): DuplicationNode[] | undefined {
        return this.cache.getData(this.uri).map(data => new DuplicationThisFileNode(data));
    }

}



export class DuplicateCodeProvider implements vscode.TreeDataProvider<DuplicationNode> {
    private duplicateCache: CPDCache;

    public constructor(duplicateCache: CPDCache) {
        this.duplicateCache = duplicateCache;
        this.duplicateCache.onChange( () => {
            this.refresh();
        });
    }    

    private _onDidChangeTreeData: vscode.EventEmitter<DuplicationNode | undefined | null | void> = new vscode.EventEmitter<DuplicationNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DuplicationNode | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: DuplicationNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element.item();
    }
    getChildren(element?: DuplicationNode | undefined): vscode.ProviderResult<DuplicationNode[]> {
        var items = new Array<DuplicationNode>();
        let cache = this.duplicateCache;
        if(element) {
            items = element.children() || [];
        } else {
            items = cache.getKnownFiles().map((uri)=>new DuplicationRootFileNode(uri,this.duplicateCache));
        }
        return Promise.resolve(items);
    }
    getParent?(element: DuplicationNode): vscode.ProviderResult<DuplicationNode> {
        throw new Error('Method not implemented.');
    }
    resolveTreeData?(item: vscode.TreeItem, element: DuplicationData, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error('Method not implemented.');
    }

}