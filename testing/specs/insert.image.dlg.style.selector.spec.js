/**
 * Created on 08.01.2019.
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
const InsertImageDialog = require('../page_objects/wizardpanel/insert.image.dialog.cke');

describe('insert.image.dlg.style.selector.spec: style selector, select Original option', function () {
    this.timeout(appConstant.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    let SITE;
    let IMAGE_DISPLAY_NAME = "Pop_03";

    it(`Preconditions: new site should be added`,
        async () => {
            let displayName = contentBuilder.generateRandomName('site');
            SITE = contentBuilder.buildSite(displayName, 'description', [appConstant.APP_CONTENT_TYPES]);
            await studioUtils.doAddSite(SITE);
        });

    it(`GIVEN htmlarea-content, image is selected on the modal dialog WHEN click on dropdown handle in styles selector THEN expected options should be present`,
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
                //click on dropdown handle and open style-options
                return insertImageDialog.getStyleSelectorOptions();
            }).then(result => {
                studioUtils.saveScreenshot('image_dialog_style_options');
                assert.isTrue(result[1] == appConstant.IMAGE_STYLE_ORIGINAL, "one available option should be present in options list");
            });
        });

    it(`GIVEN htmlarea-content, image is selected on the modal dialog WHEN 'Original' option has been selected THEN 'Custom Width' checkbox is getting disabled`,
        () => {
            let htmlAreaForm = new HtmlAreaForm();
            let insertImageDialog = new InsertImageDialog();
            return studioUtils.selectSiteAndOpenNewWizard(SITE.displayName, 'htmlarea0_1').then(() => {
            }).then(() => {
                return htmlAreaForm.showToolbarAndClickOnInsertImageButton();
            }).then(() => {
                return insertImageDialog.waitForDialogVisible();
            }).then(() => {
                return insertImageDialog.filterAndSelectImage(IMAGE_DISPLAY_NAME);
            }).then(() => {
                //type a option in 'filter input' and click on the option
                return insertImageDialog.doFilterStyleAndClickOnOption("Original");
            }).then(() => {
                //checkbox is getting disabled
                return expect(insertImageDialog.waitForCustomWidthCheckBoxDisabled()).to.eventually.true;
            }).then(() => {
                //checkbox should be unselected
                return expect(insertImageDialog.isCustomWidthCheckBoxSelected()).to.eventually.false;
            });
        });

    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
});
