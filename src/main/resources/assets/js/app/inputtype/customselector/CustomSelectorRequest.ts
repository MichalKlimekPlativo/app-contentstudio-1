import ResourceRequest = api.rest.ResourceRequest;
import i18n = api.util.i18n;
import {CustomSelectorItem} from './CustomSelectorItem';

export interface CustomSelectorResponse {
    total: number;
    count: number;
    hits: CustomSelectorItem[];
}

export class CustomSelectorRequest
    extends ResourceRequest<CustomSelectorResponse, CustomSelectorItem[]> {

    public static DEFAULT_SIZE: number = 10;

    private requestPath: string;
    private ids: string[] = [];
    private query: string;
    private start: number = 0;
    private count: number = CustomSelectorRequest.DEFAULT_SIZE;

    private results: CustomSelectorItem[];
    private loaded: boolean = false;

    constructor() {
        super();
        this.setMethod('GET');
    }

    setRequestPath(requestPath: string) {
        this.requestPath = requestPath;
    }

    hasRequestPath(): boolean {
        return !!this.requestPath;
    }

    isPartiallyLoaded(): boolean {
        return !!this.results && this.results.length > 0 && !this.loaded;
    }

    resetParams() {
        this.ids = [];
        this.start = 0;
        this.loaded = false;
    }

    getParams(): Object {
        return {
            ids: this.ids && this.ids.length > 0 ? this.ids.toString() : null,
            query: this.query || null,
            start: this.start || null,
            count: this.count || null
        };
    }

    getRequestPath(): api.rest.Path {
        return api.rest.Path.fromString(this.requestPath);
    }

    sendAndParse(): wemQ.Promise<CustomSelectorItem[]> {
        return this.send().then((response: api.rest.JsonResponse<CustomSelectorResponse>) => {

            let result: CustomSelectorResponse = response.getResult();
            if (this.start === 0) {
                this.results = [];
            }

            this.validateResponse(result);

            this.start += result.count;
            this.loaded = this.start >= result.total;

            let items = result.hits.map((hit) => {
                return new CustomSelectorItem(hit);
            });

            this.results = this.results.concat(items);

            return this.results;
        });
    }

    private validateResponse(result: CustomSelectorResponse) {
        const errors = [];
        const isInvalid = (value) => value == null || value == null;

        if (isInvalid(result.total)) {
            errors.push(`'total'`);
        }
        if (isInvalid(result.count)) {
            errors.push(`'count'`);
        }
        if (isInvalid(result.hits)) {
            errors.push(`'hits'`);
        }
        if (errors.length > 0) {
            throw new Error(i18n('field.customSelector.errors', errors.join(', ')));
        }
    }

    setIds(ids: string[]): CustomSelectorRequest {
        this.ids = ids;
        return this;
    }

    setFrom(from: number): CustomSelectorRequest {
        this.start = from;
        return this;
    }

    setSize(size: number): CustomSelectorRequest {
        this.count = size;
        return this;
    }

    setQuery(query: string): CustomSelectorRequest {
        this.query = query;
        return this;
    }
}
