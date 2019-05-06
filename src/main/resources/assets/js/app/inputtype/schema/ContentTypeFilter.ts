import PropertyArray = api.data.PropertyArray;
import Value = api.data.Value;
import ValueType = api.data.ValueType;
import ValueTypes = api.data.ValueTypes;
import Input = api.form.Input;
import ContentTypeSummary = api.schema.content.ContentTypeSummary;
import SelectedOption = api.ui.selector.combobox.SelectedOption;
import SelectedOptionEvent = api.ui.selector.combobox.SelectedOptionEvent;
import BaseLoader = api.util.loader.BaseLoader;
import ContentTypeSummaryListJson = api.schema.content.ContentTypeSummaryListJson;
import BaseInputTypeManagingAdd = api.form.inputtype.support.BaseInputTypeManagingAdd;
import {ContentInputTypeViewContext} from '../ContentInputTypeViewContext';
import {PageTemplateContentTypeLoader} from './PageTemplateContentTypeLoader';
import {ContentTypeComboBox} from './ContentTypeComboBox';
import {ContentTypeSummaryLoader} from './ContentTypeSummaryLoader';
import {ContentTypeSummaryByDisplayNameComparator} from './ContentTypeSummaryByDisplayNameComparator';

export class ContentTypeFilter
    extends BaseInputTypeManagingAdd {

    private combobox: ContentTypeComboBox;

    private context: ContentInputTypeViewContext;

    private onContentTypesLoadedHandler: (contentTypeArray: ContentTypeSummary[]) => void;

    private isContextDependent: boolean;

    constructor(context: ContentInputTypeViewContext) {
        super('content-type-filter');
        this.context = context;
        this.onContentTypesLoadedHandler = this.onContentTypesLoaded.bind(this);
        this.readConfig(context.inputConfig);
    }

    protected readConfig(inputConfig: { [element: string]: { [name: string]: string }[]; }): void {
        const isContextDependentConfig = inputConfig['context'] ? inputConfig['context'][0] : {};
        const value = isContextDependentConfig['value'] || '';
        this.isContextDependent = value.toLowerCase() === 'true';
    }

    getValueType(): ValueType {
        return ValueTypes.STRING;
    }

    newInitialValue(): Value {
        return null;
    }

    private createLoader(): BaseLoader<ContentTypeSummaryListJson, ContentTypeSummary> {
        let loader: BaseLoader<ContentTypeSummaryListJson, ContentTypeSummary>;
        if (this.context.formContext.getContentTypeName().isPageTemplate()) {
            let contentId = this.context.site.getContentId();
            loader = new PageTemplateContentTypeLoader(contentId);
        } else {
            let contentId = this.isContextDependent && (this.context.content ? this.context.content.getContentId() : null);
            loader = new ContentTypeSummaryLoader(contentId);
        }

        loader.setComparator(new ContentTypeSummaryByDisplayNameComparator());

        return loader;
    }

    private createComboBox(): ContentTypeComboBox {
        let loader = this.createLoader();
        let comboBox = new ContentTypeComboBox(this.getInput().getOccurrences().getMaximum(), loader);

        comboBox.onLoaded(this.onContentTypesLoadedHandler);

        comboBox.onOptionSelected((event: SelectedOptionEvent<ContentTypeSummary>) => {
            this.fireFocusSwitchEvent(event);
            this.onContentTypeSelected(event.getSelectedOption());
        });

        comboBox.onOptionDeselected((event: SelectedOptionEvent<ContentTypeSummary>) =>
            this.onContentTypeDeselected(event.getSelectedOption()));

        return comboBox;
    }

    private onContentTypesLoaded(): void {

        this.combobox.getComboBox().setValue(this.getValueFromPropertyArray(this.getPropertyArray()));

        this.setLayoutInProgress(false);
        this.combobox.unLoaded(this.onContentTypesLoadedHandler);
    }

    private onContentTypeSelected(selectedOption: api.ui.selector.combobox.SelectedOption<ContentTypeSummary>): void {
        if (this.isLayoutInProgress()) {
            return;
        }
        this.ignorePropertyChange = true;
        let value = new Value(selectedOption.getOption().displayValue.getContentTypeName().toString(), ValueTypes.STRING);
        if (this.combobox.countSelected() === 1) { // overwrite initial value
            this.getPropertyArray().set(0, value);
        } else {
            this.getPropertyArray().add(value);
        }

        this.validate(false);
        this.ignorePropertyChange = false;
    }

    private onContentTypeDeselected(option: SelectedOption<ContentTypeSummary>): void {
        this.ignorePropertyChange = true;
        this.getPropertyArray().remove(option.getIndex());
        this.validate(false);
        this.ignorePropertyChange = false;
    }

    layout(input: Input, propertyArray: PropertyArray): wemQ.Promise<void> {
        if (!ValueTypes.STRING.equals(propertyArray.getType())) {
            propertyArray.convertValues(ValueTypes.STRING);
        }
        super.layout(input, propertyArray);

        this.appendChild(this.combobox = this.createComboBox());

        return this.combobox.getLoader().load().then(() => {
            this.validate(false);
            return wemQ<void>(null);
        });
    }

    update(propertyArray: api.data.PropertyArray, unchangedOnly: boolean): Q.Promise<void> {
        let superPromise = super.update(propertyArray, unchangedOnly);

        if (!unchangedOnly || !this.combobox.isDirty()) {
            return superPromise.then(() => {

                return this.combobox.getLoader().load().then(this.onContentTypesLoadedHandler);
            });
        } else if (this.combobox.isDirty()) {
            this.combobox.forceChangedEvent();
        }
        return superPromise;
    }

    reset() {
        this.combobox.resetBaseValues();
    }

    protected getNumberOfValids(): number {
        return this.getPropertyArray().getSize();
    }

    giveFocus(): boolean {
        return this.combobox.maximumOccurrencesReached() ? false : this.combobox.giveFocus();
    }

    onFocus(listener: (event: FocusEvent) => void) {
        this.combobox.onFocus(listener);
    }

    unFocus(listener: (event: FocusEvent) => void) {
        this.combobox.unFocus(listener);
    }

    onBlur(listener: (event: FocusEvent) => void) {
        this.combobox.onBlur(listener);
    }

    unBlur(listener: (event: FocusEvent) => void) {
        this.combobox.unBlur(listener);
    }
}

api.form.inputtype.InputTypeManager.register(new api.Class('ContentTypeFilter', ContentTypeFilter));
