import {ContentNodeByDisplayNameComparator} from './ContentNodeByDisplayNameComparator';
import {ContentNodeByModifiedTimeComparator} from './ContentNodeByModifiedTimeComparator';
import {ContentSummaryAndCompareStatusFetcher} from '../resource/ContentSummaryAndCompareStatusFetcher';
import {ContentResponse} from '../resource/ContentResponse';
import {Content} from '../content/Content';
import {ContentSummaryAndCompareStatus} from '../content/ContentSummaryAndCompareStatus';
import GridColumnBuilder = api.ui.grid.GridColumnBuilder;
import ContentSummaryViewer = api.content.ContentSummaryViewer;
import TreeGrid = api.ui.treegrid.TreeGrid;
import TreeNode = api.ui.treegrid.TreeNode;
import TreeGridBuilder = api.ui.treegrid.TreeGridBuilder;
import i18n = api.util.i18n;

export class CompareContentGrid
    extends TreeGrid<ContentSummaryAndCompareStatus> {

    private content: Content;

    constructor(content: Content) {
        const nameFormatter = (row: number, cell: number, value: any, columnDef: any, node: TreeNode<ContentSummaryAndCompareStatus>) => {

            let viewer = <ContentSummaryViewer>node.getViewer('name');
            if (!viewer) {
                viewer = new ContentSummaryViewer();
                viewer.setObject(node.getData().getContentSummary());
                node.setViewer('name', viewer);
            }
            return viewer.toString();
        };

        super(new TreeGridBuilder<ContentSummaryAndCompareStatus>().setColumns([
                new GridColumnBuilder<TreeNode<ContentSummaryAndCompareStatus>>()
                    .setName(i18n('field.name'))
                    .setId('displayName')
                    .setField('displayName')
                    .setFormatter(nameFormatter)
                    .build()
            ]).setPartialLoadEnabled(true).setLoadBufferSize(20).
            prependClasses('compare-content-grid')
        );

        this.content = content;

        this.onLoaded(() => {
            this.selectAll();
        });
    }

    fetchChildren(parentNode?: TreeNode<ContentSummaryAndCompareStatus>): wemQ.Promise<ContentSummaryAndCompareStatus[]> {
        let parentContentId = parentNode && parentNode.getData() ? parentNode.getData().getContentId() : null;
        return ContentSummaryAndCompareStatusFetcher.fetchChildren(parentContentId).then(
            (data: ContentResponse<ContentSummaryAndCompareStatus>) => {
                return data.getContents();
            });
    }

    hasChildren(elem: ContentSummaryAndCompareStatus): boolean {
        return elem.hasChildren();
    }

    getDataId(data: ContentSummaryAndCompareStatus): string {
        return data.getId();
    }

    refreshNodeData(parentNode: TreeNode<ContentSummaryAndCompareStatus>): wemQ.Promise<TreeNode<ContentSummaryAndCompareStatus>> {
        return ContentSummaryAndCompareStatusFetcher.fetch(parentNode.getData().getContentId()).then(
            (content: ContentSummaryAndCompareStatus) => {
                parentNode.setData(content);
                this.refreshNode(parentNode);
                return parentNode;
            });
    }

    sortNodeChildren(node: TreeNode<ContentSummaryAndCompareStatus>) {
        let comparator: api.Comparator<TreeNode<ContentSummaryAndCompareStatus>>;
        if (this.getRoot().getCurrentRoot() === node) {
            comparator = new ContentNodeByDisplayNameComparator();
        } else {
            comparator = new ContentNodeByModifiedTimeComparator();
        }
        let children: TreeNode<ContentSummaryAndCompareStatus>[] = node.getChildren().sort(comparator.compare);
        node.setChildren(children);
        this.initData(this.getRoot().getCurrentRoot().treeToList());
    }
}
