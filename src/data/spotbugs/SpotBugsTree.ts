import * as vscode from 'vscode';
import { SpotBugsCache} from './cache';
import { Bug,FileReport } from './types';

interface SpotBugsNode {
    children(): SpotBugsNode[] | undefined;
    item(): vscode.TreeItem | Thenable<vscode.TreeItem>;
}

class SpotBugsFileNode implements SpotBugsNode {
    public constructor(
        private readonly file: vscode.Uri,
        private readonly cache: SpotBugsCache
    ) {}

    children(): SpotBugsNode[] | undefined {
        return [];
    }
    item(): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return {
            resourceUri: this.file,
            command: {
                command: 'vscode.open',
                arguments: [this.file],
                title: 'Open File'
            },
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
        };
    }

}


export class SpotBugsTreeProvider implements vscode.TreeDataProvider<SpotBugsNode> {
    private bugCache: SpotBugsCache;

    public constructor(bugsReports: SpotBugsCache) {
        this.bugCache = bugsReports
        this.bugCache.onChange( () => {
            this.refresh();
        });
    }    

    private _onDidChangeTreeData: vscode.EventEmitter<SpotBugsNode | undefined | null | void> = new vscode.EventEmitter<SpotBugsNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SpotBugsNode | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }


    getTreeItem(element: SpotBugsNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element.item();
    }
    getChildren(element?: SpotBugsNode | undefined): vscode.ProviderResult<SpotBugsNode[]> {
        if (element) {
            return element.children();
        } else {
            var items = new Array<SpotBugsFileNode>();
            this.bugCache.getKnownFiles().forEach((file)=>{
                items.push(new SpotBugsFileNode(file,this.bugCache));
            });
            return items;
        }
    }
    getParent?(element: SpotBugsNode): vscode.ProviderResult<SpotBugsNode> {
        throw new Error('Method not implemented.');
    }
    resolveTreeItem?(item: vscode.TreeItem, element: SpotBugsNode, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error('Method not implemented.');
    }
}