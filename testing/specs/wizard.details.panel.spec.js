/**
 * Created on 31.07.2018.
 *
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConstant = require('../libs/app_const');
const ContentWizard = require('../page_objects/wizardpanel/content.wizard.panel');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');
const WizardDetailsPanel = require('../page_objects/wizardpanel/details/wizard.details.panel');
const WizardVersionsWidget = require('../page_objects/wizardpanel/details/wizard.versions.widget');
const WizardDependenciesWidget = require('../page_objects/wizardpanel/details/wizard.dependencies.widget');

describe('wizard.details.panel.spec: Open details panel in wizard and check widgets', function () {
    this.timeout(appConstant.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`GIVEN folder-wizard is opened WHEN 'Version history' menu item in Details panel has been selected THEN 'Version history' widget should be loaded`,
        () => {
        let wizardDetailsPanel = new WizardDetailsPanel();
        let wizardVersionsWidget = new WizardVersionsWidget();
            let contentWizard = new ContentWizard();
            return studioUtils.openContentWizard(appConst.contentTypes.FOLDER).then(() => {
            }).then(() => {
                return contentWizard.openDetailsPanel();
            }).then(() => {
                //Version history widget should not be displayed by default!
                return assert.eventually.isFalse(wizardVersionsWidget.isWidgetLoaded(), "`Versions Widget` should not be visible");
            }).then(() => {
                return wizardDetailsPanel.openVersionHistory();
            }).then(() => {
                studioUtils.saveScreenshot("wizard_versions_widget");
                return assert.eventually.isTrue(wizardVersionsWidget.waitForVersionsLoaded(), "`Versions Widget` should be loaded");
            });
        });

    it(`GIVEN folder-wizard is opened WHEN 'Dependencies' menu item in Details panel has been selected THEN 'Dependencies' widget should be loaded`,
        () => {
            let wizardDetailsPanel = new WizardDetailsPanel();
            let contentWizard = new ContentWizard();
            let wizardDependenciesWidget = new WizardDependenciesWidget();
            return studioUtils.openContentWizard(appConst.contentTypes.FOLDER).then(() => {
            }).then(() => {
                return contentWizard.openDetailsPanel();
            }).then(() => {
                //Version history widget should not be displayed by default!
                return assert.eventually.isFalse(wizardDependenciesWidget.isWidgetLoaded(), "`Versions Widget` should not be visible");
            }).then(() => {
                return wizardDetailsPanel.openDependencies();
            }).then(() => {
                studioUtils.saveScreenshot("wizard_dependencies_widget");
                return assert.eventually.isTrue(wizardDependenciesWidget.waitForWidgetLoaded(), "`Dependencies Widget` should be loaded");
            });
        });

    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
