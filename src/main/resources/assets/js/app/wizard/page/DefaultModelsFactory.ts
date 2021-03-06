import {DefaultModels} from './DefaultModels';
import {GetDefaultPageTemplateRequest} from './GetDefaultPageTemplateRequest';
import {GetPageDescriptorByKeyRequest} from '../../resource/GetPageDescriptorByKeyRequest';
import {PageTemplate} from '../../content/PageTemplate';
import ContentTypeName = api.schema.content.ContentTypeName;
import ContentId = api.content.ContentId;
import PageDescriptor = api.content.page.PageDescriptor;
import i18n = api.util.i18n;

export interface DefaultModelsFactoryConfig {

    siteId: ContentId;

    contentType: ContentTypeName;

    applications: api.application.ApplicationKey[];
}

export class DefaultModelsFactory {

    static create(config: DefaultModelsFactoryConfig): wemQ.Promise<DefaultModels> {

        return new GetDefaultPageTemplateRequest(config.siteId, config.contentType).sendAndParse().then(
            (defaultPageTemplate: PageTemplate) => {

                let defaultPageTemplateDescriptorPromise = null;
                if (defaultPageTemplate && defaultPageTemplate.isPage()) {
                    defaultPageTemplateDescriptorPromise =
                        new GetPageDescriptorByKeyRequest(defaultPageTemplate.getController()).sendAndParse();
                } else if (defaultPageTemplate && !defaultPageTemplate.isPage()) {
                    defaultPageTemplate = null;
                }

                let deferred = wemQ.defer<DefaultModels>();
                if (defaultPageTemplateDescriptorPromise) {
                    defaultPageTemplateDescriptorPromise.then((defaultPageTemplateDescriptor: PageDescriptor) => {

                        deferred.resolve(new DefaultModels(defaultPageTemplate, defaultPageTemplateDescriptor));
                    }).catch((reason) => {
                        const msg = i18n('notify.wizard.noDescriptor', defaultPageTemplate.getController());
                        deferred.reject(new api.Exception(msg, api.ExceptionType.WARNING));
                    }).done();
                } else {
                    deferred.resolve(new DefaultModels(defaultPageTemplate, null));
                }

                return deferred.promise;
            });
    }
}
