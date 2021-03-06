import ValueTypes = api.data.ValueTypes;
import UploadItem = api.ui.uploader.UploadItem;
import UploaderEl = api.ui.uploader.UploaderEl;
import {CreateMediaFromUrlRequest} from '../../../resource/CreateMediaFromUrlRequest';
import {Content, ContentBuilder} from '../../../content/Content';
import {ContentJson} from '../../../content/ContentJson';

export enum MediaUploaderElOperation {
    create,
    update
}

export interface MediaUploaderElConfig
    extends api.ui.uploader.UploaderElConfig {

    operation: MediaUploaderElOperation;
}

export class MediaUploaderEl
    extends UploaderEl<Content> {

    private fileName: string;

    private link: api.dom.AEl;

    constructor(config: MediaUploaderElConfig) {

        if (config.url == null) {
            config.url = api.util.UriHelper.getRestUri('content/' + MediaUploaderElOperation[config.operation] + 'Media');
        }

        super(config);

        this.addClass('media-uploader-el');

        this.initImageDropHandler();
    }

    private initImageDropHandler() {
        this.onDropzoneDrop((dropEvent: DragEvent) => {
            this.handleDraggedUrls(dropEvent);
        });
    }

    private handleDraggedUrls(dropEvent: DragEvent) {
        const isFileDropped: boolean = dropEvent.dataTransfer.files.length > 0;

        if (this.isUploading() || isFileDropped) {
            return;
        }

        const data: string = dropEvent.dataTransfer.getData('text/html');
        const isImgUrlDragged: boolean = data && !!data.match(/<img.*\ssrc="/i);

        if (!isImgUrlDragged) {
            return;
        }

        this.extractImagesFromDragData(data).map((img) => img.getAttribute('src')).forEach(this.uploadDraggedImg.bind(this));
    }

    private extractImagesFromDragData(data: string): HTMLElement[] {
        const tempDiv: HTMLElement = document.createElement('div');
        tempDiv.innerHTML = data;

        return [].slice.call(tempDiv.getElementsByTagName('img'));
    }

    private isSrcWithData(imgSrc: string): boolean {
        return imgSrc && imgSrc.substring(0, 5) === 'data:';
    }

    private uploadDraggedImg(imgSrc: string) {
        if (this.isSrcWithData(imgSrc)) {
            this.uploadUrlEncodedImage(imgSrc);
        } else {
            this.uploadRemoteImage(imgSrc);
        }
    }

    private uploadUrlEncodedImage(imgSrc: string) {
        const request: XMLHttpRequest = new XMLHttpRequest();
        request.open('GET', imgSrc, true);
        request.responseType = 'blob';
        request.onload = () => {
            const uploadedFile: Blob = request.response;
            const file: File = new File([uploadedFile], this.generateUniqueName(imgSrc));
            this.uploader.addFiles([file]);
        };
        request.send();
    }

    private uploadRemoteImage(imgSrc: string) {
        const name: string = this.generateUniqueName(imgSrc);
        const parent: string = this.config.params.parent;

        const uploadItem = new UploadItem<Content>(<any>{name: name});
        this.notifyFileUploadStarted([uploadItem]);

        new CreateMediaFromUrlRequest().setName(name).setUrl(imgSrc).setParent(parent).sendAndParse().then(
            (content: Content) => {
                uploadItem.setModel(<any>content);
                this.notifyFileUploaded(uploadItem);
            }).catch((reason: any) => {
            api.DefaultErrorHandler.handle(reason);
        }).done();
    }

    private generateUniqueName(imgSrc: string): string {
        const imgFormatRegExp: RegExpMatchArray = imgSrc.match(/image\/([a-z]+?);/i);
        const type: string = imgFormatRegExp ? imgFormatRegExp[1] ? imgFormatRegExp[1] : 'jpg' : 'jpg';

        const date: Date = new Date();
        const dateParts: number[] =
            [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];

        return 'image-' + dateParts.map(api.util.DateHelper.padNumber).join('') + '.' + type;
    }

    createModel(serverResponse: ContentJson): Content {
        if (serverResponse) {
            return new ContentBuilder().fromContentJson(<ContentJson> serverResponse).build();
        } else {
            return null;
        }
    }

    getModelValue(item: Content): string {
        return item.getId();
    }

    getMediaValue(item: Content): api.data.Value {
        let mediaProperty = item.getContentData().getProperty('media');
        let mediaValue;
        switch (mediaProperty.getType()) {
        case ValueTypes.DATA:
            mediaValue = mediaProperty.getPropertySet().getProperty('attachment').getValue();
            break;
        case ValueTypes.STRING:
            mediaValue = mediaProperty.getValue();
            break;
        }
        return mediaValue;
    }

    setFileName(name: string) {
        this.fileName = name;
        if (this.link && this.fileName != null && this.fileName !== '') {
            this.link.setHtml(this.fileName);
        }
    }

    createResultItem(value: string): api.dom.Element {
        this.link = new api.dom.AEl().setUrl(api.util.UriHelper.getRestUri('content/media/' + value), '_blank');
        this.link.setHtml(this.fileName != null && this.fileName !== '' ? this.fileName : value);

        return this.link;
    }
}
