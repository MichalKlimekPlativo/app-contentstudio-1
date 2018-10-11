import Property = api.data.Property;
import PropertySet = api.data.PropertySet;
import Value = api.data.Value;
import ValueType = api.data.ValueType;
import ValueTypes = api.data.ValueTypes;
import Content = api.content.Content;
import UploadedEvent = api.ui.uploader.UploadedEvent;
import {ImageUploaderEl} from '../ui/selector/image/ImageUploaderEl';
import {ImageErrorEvent} from '../ui/selector/image/ImageErrorEvent';
import {MediaUploaderElOperation} from '../ui/upload/MediaUploaderEl';
import {ContentInputTypeViewContext} from '../ContentInputTypeViewContext';
import {GetContentByIdRequest} from '../../resource/GetContentByIdRequest';
import {Point, Rect} from '../ui/selector/image/ImageEditor';

export class ImageUploader
    extends api.form.inputtype.support.BaseInputTypeSingleOccurrence {

    private imageUploader: ImageUploaderEl;

    private previousValidationRecording: api.form.inputtype.InputValidationRecording;

    private isCropAutoPositioned: boolean;

    private isFocusAutoPositioned: boolean;

    constructor(config: ContentInputTypeViewContext) {
        super(config);
        this.initUploader(config);
        this.addClass('image-uploader-input');
    }

    private initUploader(config: ContentInputTypeViewContext) {
        this.imageUploader = new ImageUploaderEl({
            params: {
                content: config.content.getContentId().toString()
            },
            operation: MediaUploaderElOperation.update,
            name: config.input.getName(),
            maximumOccurrences: 1,
            hideDefaultDropZone: true
        });

        this.imageUploader.getUploadButton().hide();
        this.appendChild(this.imageUploader);
    }

    getContext(): ContentInputTypeViewContext {
        return <ContentInputTypeViewContext>super.getContext();
    }

    getValueType(): ValueType {
        return ValueTypes.STRING;
    }

    newInitialValue(): Value {
        return ValueTypes.STRING.newNullValue();
    }

    layoutProperty(input: api.form.Input, property: Property): wemQ.Promise<void> {
        if (!ValueTypes.STRING.equals(property.getType()) && !ValueTypes.DATA.equals(property.getType())) {
            property.convertValueType(ValueTypes.STRING);
        }

        this.input = input;

        this.imageUploader.onUploadStarted(() => this.imageUploader.getUploadButton().hide());

        this.imageUploader.onFileUploaded((event: UploadedEvent<Content>) => {
            let content = event.getUploadItem().getModel();
            let value = this.imageUploader.getMediaValue(content);

            this.imageUploader.setOriginalDimensions(
                this.readSizeValue(content, 'imageWidth'),
                this.readSizeValue(content, 'imageHeight'),
                this.readOrientation(content));

            this.saveToProperty(value);
            api.notify.showFeedback(content.getDisplayName() + ' saved');
        });

        this.imageUploader.onUploadReset(() => {
            this.saveToProperty(this.newInitialValue());
            this.imageUploader.getUploadButton().show();
        });

        this.imageUploader.onUploadFailed(() => {
            this.saveToProperty(this.newInitialValue());
            this.imageUploader.getUploadButton().show();
            this.imageUploader.setProgressVisible(false);
        });

        ImageErrorEvent.on((event: ImageErrorEvent) => {
            if (this.getContext().content.getContentId().equals(event.getContentId())) {
                this.imageUploader.getUploadButton().show();
                this.imageUploader.setProgressVisible(false);
            }
        });

        this.imageUploader.onEditModeChanged((edit: boolean, crop: Rect, zoom: Rect, focus: Point) => {
            this.validate(edit);

            if (!edit && crop) {
                this.saveEditDataToProperty(crop, zoom, focus);
            }
        });

        this.imageUploader.onCropAutoPositionedChanged(auto => {
            this.isCropAutoPositioned = auto;
            if (auto) {
                this.saveEditDataToProperty({x: 0, y: 0, x2: 1, y2: 1}, {x: 0, y: 0, x2: 1, y2: 1}, null);
            }
        });

        this.imageUploader.onFocusAutoPositionedChanged(auto => {
            this.isFocusAutoPositioned = auto;
            if (auto) {
                this.saveEditDataToProperty(null, null, {x: 0.5, y: 0.5});
            }
        });

        this.imageUploader.onOrientationChanged(orientation => {
            this.writeOrientation(<Content>this.getContext().content, orientation);
        });

        return property.hasNonNullValue() ? this.updateProperty(property) : wemQ<void>(null);
    }

    protected saveToProperty(value: api.data.Value) {
        this.ignorePropertyChange = true;
        let property = this.getProperty();
        switch (property.getType()) {
        case ValueTypes.DATA:
            // update the attachment name, and reset the focal point data
            let set = property.getPropertySet();
            set.setProperty('attachment', 0, value);
            set.removeProperty('focalPoint', 0);
            set.removeProperty('cropPosition', 0);
            set.removeProperty('zoomPosition', 0);

            break;
        case ValueTypes.STRING:
            property.setValue(value);
            break;
        }
        this.validate();
        this.ignorePropertyChange = false;
    }

    updateProperty(_property: api.data.Property, unchangedOnly?: boolean): Q.Promise<void> {
        if ((!unchangedOnly || !this.imageUploader.isDirty()) && this.getContext().content.getContentId()) {

            return new GetContentByIdRequest(this.getContext().content.getContentId())
                .sendAndParse().then((content: api.content.Content) => {

                    this.imageUploader.setOriginalDimensions(
                        this.readSizeValue(content, 'imageWidth'),
                        this.readSizeValue(content, 'imageHeight'),
                        this.readOrientation(content));
                    this.imageUploader.setValue(content.getId(), false, false);

                    this.configEditorsProperties(content);

                }).catch((reason: any) => {
                    api.DefaultErrorHandler.handle(reason);
                });
        }
        return wemQ<void>(null);
    }

    reset() {
        this.imageUploader.resetBaseValues();
    }

    private saveEditDataToProperty(crop: Rect, zoom: Rect, focus: Point) {
        let container = this.getPropertyContainer(this.getProperty());

        this.saveCropToProperty(crop, zoom, container);
        this.saveFocusToProperty(focus, container);
    }

    private saveCropToProperty(crop: Rect, zoom: Rect, container?: PropertySet) {
        if (!container) {
            container = this.getPropertyContainer(this.getProperty());
        }
        if (container && crop && zoom) {
            if (this.isCropAutoPositioned && container.getPropertySets('zoomPosition').length === 0) {
                return;
            }
            container.setDoubleByPath('zoomPosition.left', zoom.x);
            container.setDoubleByPath('zoomPosition.top', zoom.y);
            container.setDoubleByPath('zoomPosition.right', zoom.x2);
            container.setDoubleByPath('zoomPosition.bottom', zoom.y2);

            container.setDoubleByPath('cropPosition.left', crop.x);
            container.setDoubleByPath('cropPosition.top', crop.y);
            container.setDoubleByPath('cropPosition.right', crop.x2);
            container.setDoubleByPath('cropPosition.bottom', crop.y2);
            container.setDoubleByPath('cropPosition.zoom', zoom.x2 - zoom.x);
        }
    }

    private saveFocusToProperty(focus: Point, container?: PropertySet) {
        if (!container) {
            container = this.getPropertyContainer(this.getProperty());
        }
        if (container && focus) {
            if (this.isFocusAutoPositioned && container.getPropertySets('focalPoint').length === 0) {
                return;
            }
            container.setDoubleByPath('focalPoint.x', focus.x);
            container.setDoubleByPath('focalPoint.y', focus.y);
        }
    }

    private getPropertyContainer(property: Property): PropertySet {
        let container;
        switch (property.getType()) {
        case ValueTypes.DATA:
            container = property.getPropertySet();
            break;
        case ValueTypes.STRING:
            // save in new format always no matter what was the format originally
            container = new api.data.PropertyTree().getRoot();
            container.setString('attachment', 0, property.getString());
            let propertyParent = property.getParent();
            let propertyName = property.getName();
            // remove old string property and set the new property set
            propertyParent.removeProperty(propertyName, 0);
            let newProperty = propertyParent.setPropertySet(propertyName, 0, container);
            // update local property reference
            this.registerProperty(newProperty);
            break;
        }
        return container;
    }

    private getFocalPoint(content: Content): Point {
        let focalProperty = this.getMediaProperty(content, 'focalPoint');

        if (!focalProperty) {
            return null;
        }

        let focalSet = focalProperty.getPropertySet();
        let x = focalSet.getDouble('x');
        let y = focalSet.getDouble('y');

        if (!x || !y) {
            return null;
        }

        return {
            x: x,
            y: y
        };
    }

    private getRectFromProperty(content: Content, propertyName: string): Rect {
        let property = this.getMediaProperty(content, propertyName);

        if (!property) {
            return null;
        }

        let cropPositionSet = property.getPropertySet();
        let x = cropPositionSet.getDouble('left');
        let y = cropPositionSet.getDouble('top');
        let x2 = cropPositionSet.getDouble('right');
        let y2 = cropPositionSet.getDouble('bottom');

        return {x, y, x2, y2};
    }

    private writeOrientation(content: Content, orientation: number) {
        const container = this.getPropertyContainer(this.getProperty());

        if (container && orientation === this.readOriginalOrientation(content)) {
            container.removeProperty('orientation', 0);
        } else {
            container.setLongByPath('orientation', orientation);
        }
    }

    private readOrientation(content: Content): number {
        let property = this.getMediaProperty(content, 'orientation');
        if (!property) {
            return this.readOriginalOrientation(content);
        }
        return property && property.getLong() || 1;
    }

    private readOriginalOrientation(content: Content): number {
        const property = this.getMetaProperty(content, 'orientation');
        if (!property) {
            return null;
        }
        return property && property.getLong() || 1;
    }

    private readSizeValue(content: Content, propertyName: string): number {
        let metaData = content.getProperty('metadata');
        if (metaData && api.data.ValueTypes.DATA.equals(metaData.getType())) {
            return parseInt(metaData.getPropertySet().getProperty(propertyName).getString(), 10);
        } else {
            metaData = this.getMetaProperty(content, propertyName);
            if (metaData) {
                return parseInt(metaData.getString(), 10);
            }
        }
        return 0;
    }

    private getMetaProperty(content: Content, propertyName: string): Property {
        const extra = content.getAllExtraData();
        for (let i = 0; i < extra.length; i++) {
            const metaProperty = extra[i].getData().getProperty(propertyName);
            if (metaProperty) {
                return metaProperty;
            }
        }
    }

    private getMediaProperty(content: Content, propertyName: string) {
        let mediaProperty = content.getProperty('media');
        if (!mediaProperty || !ValueTypes.DATA.equals(mediaProperty.getType())) {
            return null;
        }
        return mediaProperty.getPropertySet().getProperty(propertyName);
    }

    private configEditorsProperties(content: Content) {
        let focalPoint = this.getFocalPoint(content);
        this.imageUploader.setFocalPoint(focalPoint);

        let cropPosition = this.getRectFromProperty(content, 'cropPosition');
        this.imageUploader.setCrop(cropPosition);

        let zoomPosition = this.getRectFromProperty(content, 'zoomPosition');
        this.imageUploader.setZoom(zoomPosition);

        const orientation = this.readOrientation(content);
        const originalOrientation = this.readOriginalOrientation(content);
        if (orientation !== 1 || orientation !== originalOrientation) {
            this.imageUploader.setOrientation(orientation, originalOrientation);
        }
    }

    validate(silent: boolean = true): api.form.inputtype.InputValidationRecording {
        let recording = new api.form.inputtype.InputValidationRecording();
        let propertyValue = this.getProperty().getValue();

        if (this.imageUploader.isFocalPointEditMode() || this.imageUploader.isCropEditMode()) {
            recording.setBreaksMinimumOccurrences(true);
        }
        if (propertyValue.isNull() && this.input.getOccurrences().getMinimum() > 0) {
            recording.setBreaksMinimumOccurrences(true);
        }
        if (!silent) {
            if (recording.validityChanged(this.previousValidationRecording)) {
                this.notifyValidityChanged(new api.form.inputtype.InputValidityChangedEvent(recording, this.input.getName()));
            }
        }
        this.previousValidationRecording = recording;
        return recording;
    }

    onFocus(listener: (event: FocusEvent) => void) {
        this.imageUploader.onFocus(listener);
    }

    unFocus(listener: (event: FocusEvent) => void) {
        this.imageUploader.unFocus(listener);
    }

    onBlur(listener: (event: FocusEvent) => void) {
        this.imageUploader.onBlur(listener);
    }

    unBlur(listener: (event: FocusEvent) => void) {
        this.imageUploader.unBlur(listener);
    }

}

api.form.inputtype.InputTypeManager.register(new api.Class('ImageUploader', ImageUploader));