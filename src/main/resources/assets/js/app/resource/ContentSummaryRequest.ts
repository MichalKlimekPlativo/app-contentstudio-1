import QueryField = api.query.QueryField;
import OrderExpr = api.query.expr.OrderExpr;
import QueryExpr = api.query.expr.QueryExpr;
import FieldExpr = api.query.expr.FieldExpr;
import FieldOrderExpr = api.query.expr.FieldOrderExpr;
import OrderDirection = api.query.expr.OrderDirection;
import ConstraintExpr = api.query.expr.ConstraintExpr;
import ContentSummaryJson = api.content.json.ContentSummaryJson;
import ContentSummary = api.content.ContentSummary;
import ContentPath = api.content.ContentPath;
import {ContentQueryRequest} from './ContentQueryRequest';
import {ContentQueryResult} from './ContentQueryResult';
import {ContentQueryResultJson} from './json/ContentQueryResultJson';
import {ContentQuery} from '../content/ContentQuery';

export class ContentSummaryRequest
    extends api.rest.ResourceRequest<ContentQueryResultJson<ContentSummaryJson>, ContentSummary[]> {

    private path: ContentPath;

    private searchString: string = '';

    private request: ContentQueryRequest<ContentSummaryJson, ContentSummary>;

    public static MODIFIED_TIME_DESC: FieldOrderExpr = new FieldOrderExpr(new FieldExpr('modifiedTime'), OrderDirection.DESC);

    public static SCORE_DESC: FieldOrderExpr = new FieldOrderExpr(new FieldExpr('_score'), OrderDirection.DESC);

    public static PATH_ASC: FieldOrderExpr = new FieldOrderExpr(new FieldExpr('_path'), OrderDirection.ASC);

    public static DEFAULT_ORDER: FieldOrderExpr[] = [ContentSummaryRequest.SCORE_DESC, ContentSummaryRequest.MODIFIED_TIME_DESC];

    public static ROOT_ORDER: FieldOrderExpr[] = [ContentSummaryRequest.SCORE_DESC, ContentSummaryRequest.PATH_ASC];

    constructor() {
        super();
        this.request =
            new ContentQueryRequest<ContentSummaryJson, ContentSummary>(new ContentQuery()).setExpand(api.rest.Expand.SUMMARY);
    }

    getSearchString(): string {
        return this.searchString;
    }

    getRestPath(): api.rest.Path {
        return this.request.getRestPath();
    }

    getRequestPath(): api.rest.Path {
        return this.request.getRequestPath();
    }

    getContentPath(): ContentPath {
        return this.path;
    }

    getParams(): Object {
        return this.request.getParams();
    }

    send(): wemQ.Promise<api.rest.JsonResponse<ContentQueryResultJson<ContentSummaryJson>>> {
        this.buildSearchQueryExpr();

        return this.request.send();
    }

    sendAndParse(): wemQ.Promise<ContentSummary[]> {
        this.buildSearchQueryExpr();

        return this.request.sendAndParse().then(
            (queryResult: ContentQueryResult<ContentSummary, ContentSummaryJson>) => {
                return queryResult.getContents();
            });
    }

    setAllowedContentTypes(contentTypes: string[]) {
        this.request.getContentQuery().setContentTypeNames(this.createContentTypeNames(contentTypes));
    }

    setAllowedContentTypeNames(contentTypeNames: api.schema.content.ContentTypeName[]) {
        this.request.getContentQuery().setContentTypeNames(contentTypeNames);
    }

    setSize(size: number) {
        this.request.getContentQuery().setSize(size);
    }

    setContentPath(path: ContentPath) {
        this.path = path;
    }

    setSearchString(value: string = '') {
        this.searchString = value;
    }

    isPartiallyLoaded(): boolean {
        return this.request.isPartiallyLoaded();
    }

    resetParams() {
        this.request.resetParams();
    }

    private buildSearchQueryExpr() {
        this.request.getContentQuery().setQueryExpr(new QueryExpr(this.createSearchExpression(), this.getDefaultOrder()));
    }

    protected getDefaultOrder(): OrderExpr[] {
        return ContentSummaryRequest.DEFAULT_ORDER;
    }

    protected createSearchExpression(): ConstraintExpr {
        return new api.query.PathMatchExpressionBuilder()
            .setSearchString(this.searchString)
            .setPath(this.path ? this.path.toString() : '')
            .addField(new QueryField(QueryField.DISPLAY_NAME, 5))
            .addField(new QueryField(QueryField.NAME, 3))
            .addField(new QueryField(QueryField.ALL))
            .build();
    }

    private createContentTypeNames(names: string[]): api.schema.content.ContentTypeName[] {
        return (names || []).map((name: string) => new api.schema.content.ContentTypeName(name));
    }
}
