import ContentPath = api.content.ContentPath;
import {ContentResourceRequest} from './ContentResourceRequest';
import {Content} from '../content/Content';
import {ContentJson} from '../content/ContentJson';

export class GetContentByPathRequest
    extends ContentResourceRequest<ContentJson, Content> {

    private contentPath: ContentPath;

    constructor(path: ContentPath) {
        super();
        super.setMethod('GET');
        this.contentPath = path;
    }

    getParams(): Object {
        return {
            path: this.contentPath.toString()
        };
    }

    getRequestPath(): api.rest.Path {
        return api.rest.Path.fromParent(super.getResourcePath(), 'bypath');
    }

    sendAndParse(): wemQ.Promise<Content> {

        return this.send().then((response: api.rest.JsonResponse<ContentJson>) => {
            return this.fromJsonToContent(response.getResult());
        });
    }
}
