/**
 * Created on 02.01.2019.
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConstant = require('../libs/app_const');
const studioUtils = require('../libs/studio.utils.js');
const contentBuilder = require("../libs/content.builder");
const HtmlAreaForm = require('../page_objects/wizardpanel/htmlarea.form.panel');
const ContentWizard = require('../page_objects/wizardpanel/content.wizard.panel');
const InsertImageDialog = require('../page_objects/wizardpanel/insert.image.dialog.cke');
const DetailsPanel = require('../page_objects/wizardpanel/details/wizard.details.panel');
const VersionsWidget = require('../page_objects/wizardpanel/details/wizard.versions.widget');


describe('insert.image.dlg.custom.width.spec:  click on the `custom width` checkbox and check `image range value`', function () {
    this.timeout(appConstant.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    let SITE;
    let HTML_AREA_CONTENT_NAME = contentBuilder.generateRandomName('hrtmlarea');
    let IMAGE_DISPLAY_NAME = "Pop_03";

    it(`Preconditions: new site should be added`,
        async () => {
            let displayName = contentBuilder.generateRandomName('site');
            SITE = contentBuilder.buildSite(displayName, 'description', [appConstant.APP_CONTENT_TYPES]);
            await studioUtils.doAddSite(SITE);
        });

    it(`GIVEN htmlarea-content, 'Insert Image' dialog is opened AND an image is selected WHEN 'Custom width' checkbox should be not selected by default`,
        () => {
            let insertImageDialog = new InsertImageDialog();
            let htmlAreaForm = new HtmlAreaForm();
            return studioUtils.selectSiteAndOpenNewWizard(SITE.displayName, 'htmlarea0_1').then(() => {
            }).then(() => {
                return htmlAreaForm.showToolbarAndClickOnInsertImageButton();
            }).then(() => {
                return insertImageDialog.waitForDialogVisible();
            }).then(() => {
                return insertImageDialog.filterAndSelectImage(IMAGE_DISPLAY_NAME);
            }).then(() => {
                //image style selector should be present on the modal dialog
                return expect(insertImageDialog.waitForStyleSelectorVisible()).to.eventually.true;
            }).then(() => {
                return insertImageDialog.isCustomWidthCheckBoxSelected();
            }).then(result => {
                studioUtils.saveScreenshot('image_dialog_custom_width_default_value');
                assert.isFalse(result, "'Custom width' checkbox should be not selected by default");
            });
        });

    it(`GIVEN htmlarea-content, 'Insert Image' dialog is opened AND an image is selected WHEN 'Custom width' checkbox has been clicked THEN default range(100%) for custom width should appear`,
        () => {
            let insertImageDialog = new InsertImageDialog();
            let htmlAreaForm = new HtmlAreaForm();
            return studioUtils.selectSiteAndOpenNewWizard(SITE.displayName, 'htmlarea0_1').then(() => {
            }).then(() => {
                return htmlAreaForm.showToolbarAndClickOnInsertImageButton();
            }).then(() => {
                return insertImageDialog.waitForDialogVisible();
            }).then(() => {
                return insertImageDialog.filterAndSelectImage(IMAGE_DISPLAY_NAME);
            }).then(() => {
                // click on the checkbox
                return insertImageDialog.clickOnCustomWidthCheckBox();
            }).then(() => {
                // range of the image should be 100% (default value)
                return insertImageDialog.waitForImageRangeValue();
            }).then(result => {
                studioUtils.saveScreenshot('image_dialog_custom_width_clicked');
                assert.isTrue(result == '100%');
            });
        });

    it(`GIVEN image withs custom width is inserted WHEN Save button has been pressed THEN content is saving`,
        () => {
            let insertImageDialog = new InsertImageDialog();
            let htmlAreaForm = new HtmlAreaForm();
            let contentWizard = new ContentWizard();
            return studioUtils.selectSiteAndOpenNewWizard(SITE.displayName, 'htmlarea0_1').then(() => {
                return contentWizard.typeDisplayName(HTML_AREA_CONTENT_NAME);
            }).then(() => {
                return htmlAreaForm.showToolbarAndClickOnInsertImageButton();
            }).then(() => {
                return insertImageDialog.waitForDialogVisible();
            }).then(() => {
                return insertImageDialog.filterAndSelectImage(IMAGE_DISPLAY_NAME);
            }).then(() => {
                // Custom Width has been checked
                return insertImageDialog.clickOnCustomWidthCheckBox();
            }).then(() => {
                return insertImageDialog.clickOnInsertButton();
            }).then(() => {
                //Save button has been pressed
                return contentWizard.waitAndClickOnSave();
            }).then(() => {
                // content is saving
                return insertImageDialog.waitForNotificationMessage();
            });
        });

    it(`GIVEN existing htmlarea-content with inserted image(custom width) is opened WHEN double click in htmmlarea THEN expected range should be displayed`,
        () => {
            let htmlAreaForm = new HtmlAreaForm();
            let insertImageDialog = new InsertImageDialog();
            return studioUtils.selectContentAndOpenWizard(HTML_AREA_CONTENT_NAME).then(()=>{
                return htmlAreaForm.pause(2000);
            }).then(() => {
                return htmlAreaForm.doubleClickOnHtmlArea();
            }).then(() => {
                return insertImageDialog.waitForDialogVisible();
            }).then(() => {
                return insertImageDialog.waitForImageRangeValue();
            }).then(result => {
                studioUtils.saveScreenshot('image_dialog_custom_width_clicked_saved');
                assert.isTrue(result == '100%');
            }).then(() => {
                return insertImageDialog.isCustomWidthCheckBoxSelected();
            }).then(result => {
                assert.isTrue(result, "`Custom Width` Checkbox should be selected");
            });
        });

    it(`GIVEN existing htmlarea-content with inserted image(custom width) is opened WHEN 'Custom Width' has been unselected THEN image-range is getting hidden`,
        () => {
            let htmlAreaForm = new HtmlAreaForm();
            let insertImageDialog = new InsertImageDialog();
            let contentWizard = new ContentWizard();
            return studioUtils.selectContentAndOpenWizard(HTML_AREA_CONTENT_NAME).then(()=>{
                return contentWizard.pause(2000);
            }).then(() => {
                //open 'Insert Image Dialog'
                return htmlAreaForm.doubleClickOnHtmlArea();
            }).then(() => {
                return insertImageDialog.waitForDialogVisible();
            }).then(() => {
                return insertImageDialog.clickOnCustomWidthCheckBox();
            }).then(() => {
                return insertImageDialog.waitForImageRangeNotVisible();
            }).then(result => {
                assert.isTrue(result, "image-range is getting not visible");
            }).then(() => {
                //`Custom Width` Checkbox should be unselected
                return expect(insertImageDialog.isCustomWidthCheckBoxSelected()).to.eventually.false;
            }).then(() => {
                // just save the changes and create new version
                return insertImageDialog.clickOnUpdateButton();
            }).then(() => {
                return contentWizard.waitAndClickOnSave();
            });
        });

    it(`GIVEN existing htmlarea-content with inserted image is opened WHEN rollback version with 'Custom Width' THEN image-range is getting visible again`,
        () => {
            let htmlAreaForm = new HtmlAreaForm();
            let insertImageDialog = new InsertImageDialog();
            let contentWizard = new ContentWizard();
            let versionsWidget = new VersionsWidget();
            let detailsPanel = new DetailsPanel();
            return studioUtils.selectContentAndOpenWizard(HTML_AREA_CONTENT_NAME).then(() => {
                return contentWizard.openDetailsPanel();
            }).then(() => {
                //open versions widget
                return detailsPanel.openVersionHistory();
            }).then(() => {
                return versionsWidget.waitForVersionsLoaded();
            }).then(() => {
                return versionsWidget.clickAndExpandVersion(1);
            }).then(() => {
                //rollback the version with 'Custom Width'
                return versionsWidget.clickOnRevertButton();
            }).then(() => {
                //open 'Insert Image Dialog'
                return htmlAreaForm.doubleClickOnHtmlArea();
            }).then(() => {
                return insertImageDialog.waitForDialogVisible();
            }).then(() => {
                // image-range is getting visible again(default value)
                return insertImageDialog.waitForImageRangeValue();
            }).then(result => {
                studioUtils.saveScreenshot('image_dialog_custom_width_rollback');
                assert.isTrue(result == '100%');
            }).then(() => {
                //`Custom Width` Checkbox is getting selected as well
                return expect(insertImageDialog.isCustomWidthCheckBoxSelected()).to.eventually.true;
            });
        });

    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
});
