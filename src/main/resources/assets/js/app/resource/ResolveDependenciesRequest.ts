import ContentId = api.content.ContentId;
import Path = api.rest.Path;
import {ResolveDependenciesResult, ResolveDependenciesResultJson} from './ResolveDependenciesResult';
import {ContentResourceRequest} from './ContentResourceRequest';

export class ResolveDependenciesRequest
    extends ContentResourceRequest<ResolveDependenciesResultJson, ResolveDependenciesResult> {

    private ids: ContentId[];

    constructor(contentIds: ContentId[]) {
        super();
        super.setMethod('POST');
        this.ids = contentIds;
    }

    getParams(): Object {
        return {
            contentIds: this.ids.map(id => id.toString())
        };
    }

    getRequestPath(): Path {
        return Path.fromParent(super.getResourcePath(), 'getDependencies');
    }

    sendAndParse(): wemQ.Promise<ResolveDependenciesResult> {

        return this.send().then((response: api.rest.JsonResponse<any>) => {
            return ResolveDependenciesResult.fromJson(response.getResult());
        });
    }
}
