/**
 * Created on 10.10.2019.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../../libs/WebDriverHelper');
const appConstant = require('../../libs/app_const');
const ContentBrowsePanel = require('../../page_objects/browsepanel/content.browse.panel');
const ContentWizard = require('../../page_objects/wizardpanel/content.wizard.panel');
const SettingsStepForm = require('../../page_objects/wizardpanel/settings.wizard.step.form');
const PublishContentDialog = require('../../page_objects/content.publish.dialog');
const studioUtils = require('../../libs/studio.utils.js');
const contentBuilder = require("../../libs/content.builder");

describe('publish.modified.deleted.content.spec - modify 2 published folders, select these folders and check default action`', function () {
    this.timeout(appConstant.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    let FOLDER1;
    let FOLDER2;
    it(`Precondition: 2 published folders should be added`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let parentFolder = contentBuilder.generateRandomName('folder');
            let childFolder = contentBuilder.generateRandomName('folder');
            FOLDER1 = contentBuilder.buildFolder(parentFolder);
            FOLDER2 = contentBuilder.buildFolder(childFolder);
            await studioUtils.doAddReadyFolder(FOLDER1);
            await studioUtils.doAddReadyFolder(FOLDER2);
            await contentBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER1.displayName);
            await contentBrowsePanel.clickOnCheckboxAndSelectRowByName(FOLDER2.displayName);
            await studioUtils.doPublish();
        });

    it(`Precondition: 2 published folders have been modified`,
        async () => {
            let contentWizard = new ContentWizard();
            let settingsStepForm = new SettingsStepForm();

            await studioUtils.selectAndOpenContentInWizard(FOLDER1.displayName);
            await settingsStepForm.filterOptionsAndSelectLanguage('English (en)');
            await contentWizard.hotKeySaveAndCloseWizard();

            await studioUtils.selectAndOpenContentInWizard(FOLDER2.displayName);
            await settingsStepForm.filterOptionsAndSelectLanguage('English (en)');
            await contentWizard.hotKeySaveAndCloseWizard();

        });

    //verifies https://github.com/enonic/app-contentstudio/issues/1083
    it(`GIVEN 2 modified folders are selected WHEN folders have been Marked as Deleted THEN default action gets PUBLISH...`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            await studioUtils.findContentAndClickCheckBox(FOLDER1.displayName);
            await studioUtils.findContentAndClickCheckBox(FOLDER2.displayName);

            //both folders have been 'marked as deleted':
            await contentBrowsePanel.clickOnDeleteAndMarkAsDeletedAndConfirm(2);
            studioUtils.saveScreenshot("deleted_folders_default_action");
            //default action get PUBLISH...
            await contentBrowsePanel.waitForDefaultAction(appConstant.PUBLISH_MENU.PUBLISH);
        });

    //verifies https://github.com/enonic/app-contentstudio/issues/1084 - do not check workflow state for deleted content
    it(`GIVEN 2 'Deleted' folders are selected WHEN Publish Wizard has been opened THEN 'Publish Now' button should be enabled`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let publishContentDialog = new PublishContentDialog();
            // 2 folders have been checked:
            await studioUtils.findContentAndClickCheckBox(FOLDER1.displayName);
            await studioUtils.findContentAndClickCheckBox(FOLDER2.displayName);

            // Publish Wizard has been opened:
            await contentBrowsePanel.openPublishMenuSelectItem(appConstant.PUBLISH_MENU.PUBLISH);
            studioUtils.saveScreenshot("deleted_folders_publish_dialog");
            // 'Publish Now' button should be enabled, because folders are Deleted:
            await publishContentDialog.waitForPublishNowButtonEnabled();
        });


    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
