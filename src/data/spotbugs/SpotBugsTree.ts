import * as vscode from 'vscode';
import { CodeAnalysisConfig } from '../../config';
import { SpotBugsCache} from './cache';
import { CONFIDENCE_MAP } from './gui/confidence';
import { Bug,FileReport } from './types';

interface SpotBugsNode {
    /**
     * Provide Children of this node, if any
     */
    children(): SpotBugsNode[] | undefined;

    /**
     * Provide the appropriate tree item data.
     */
    item(): vscode.TreeItem | Thenable<vscode.TreeItem>;
}

class SpotBugsBugNode implements SpotBugsNode {
    public constructor(
        public readonly bug: Bug
    ) {}

    children(): SpotBugsNode[] | undefined {
        return undefined;
    }
    item(): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const config = CodeAnalysisConfig.instance().spotbugsConfig;
        return {
            resourceUri: this.bug.sourceFile,            
            description: `${this.bug.startLine}: Category ${this.bug.category}, Rank ${this.bug.rank}, Confidence ${CONFIDENCE_MAP.get(this.bug.priority)?.label}`,
            tooltip: `${this.bug.longMessage}`,
            command: {
                command: 'vscode.open',
                arguments: [this.bug.sourceFile,{selection:new vscode.Range(this.bug.startLine,0,this.bug.endLine,0)}],
                title: 'Open File'
            },
            collapsibleState: vscode.TreeItemCollapsibleState.None
        };
    }

}

class SpotBugsReportNode implements SpotBugsNode {
    public constructor(
        private readonly reportSource: vscode.Uri,
        private readonly report: FileReport
    ) {}

    children(): SpotBugsNode[] | undefined {
        const config = CodeAnalysisConfig.instance().spotbugsConfig;
        return this.report.bugs.filter(bug=>config.confidences.includes(bug.priority))
                               .filter(bug=>bug.rank <= config.getMinimumRank())
                               .map((bug)=>new SpotBugsBugNode(bug));
    }

    item(): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const config = CodeAnalysisConfig.instance().spotbugsConfig;
        return {
            resourceUri: this.reportSource,
            tooltip: this.reportSource.toString(),
            description: `${this.report.bugs.filter(bug=>config.confidences.includes(bug.priority))
                                            .filter(bug=>bug.rank <= config.getMinimumRank())
                                            .length} bugs`,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed
        };
    }
}

class SpotBugsFileNode implements SpotBugsNode {
    public constructor(
        private readonly file: vscode.Uri,
        private readonly cache: SpotBugsCache
    ) {}

    children(): SpotBugsNode[] | undefined {
        const config = CodeAnalysisConfig.instance().spotbugsConfig;
        var bugs = this.cache.getBugs(this.file);
        var items = new Array<SpotBugsReportNode>();
        
        bugs.forEach((rep,source) => {
                items.push(new SpotBugsReportNode(vscode.Uri.parse(source),rep));           
        });
        return items;
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
        this.bugCache = bugsReports;
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
            const config = CodeAnalysisConfig.instance().spotbugsConfig;
            var items = new Array<SpotBugsFileNode>();
            // TODO consider going filtering only here and passing on.
            this.bugCache.getKnownFiles().forEach((file)=>{
                var hasBugs = false;
                this.bugCache.getBugs(file).forEach((rep,file)=> {
                    if(rep.bugs.filter(bug=>config.confidences.includes(bug.priority))
                    .filter(bug=>bug.rank <= config.getMinimumRank()).length > 0) {
                        hasBugs = true;
                    }
                });
                if(hasBugs) {
                    items.push(new SpotBugsFileNode(file,this.bugCache));
                }
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