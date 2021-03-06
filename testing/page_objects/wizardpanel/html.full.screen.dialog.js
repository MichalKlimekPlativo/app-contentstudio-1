const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const HtmlArea = require('../../page_objects/components/htmlarea');

const xpath = {
    container: `//div[contains(@id,'FullscreenDialog')]`,
};

class HtmlFullScreenDialog extends Page {

    get cancelButtonTop() {
        return xpath.container + lib.CANCEL_BUTTON_TOP;
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButtonTop);
    }

    waitForDialogLoaded() {
        return this.waitForElementDisplayed(xpath.container, appConst.TIMEOUT_2).catch(err => {
            this.saveScreenshot('err_open_full_screen_dialog');
            throw new Error('Full Screen Dialog must be opened!' + err);
        });
    }

    waitForDialogClosed() {
        return this.waitForElementNotDisplayed(xpath.container, appConst.TIMEOUT_2);
    }

    typeTextInHtmlArea(strings) {
        let htmlArea = new HtmlArea();
        return htmlArea.typeTextInHtmlArea(xpath.container, text);
    }

    getTextFromHtmlArea() {
        let htmlArea = new HtmlArea();
        return htmlArea.getTextFromHtmlArea(xpath.container);
    }
};
module.exports = HtmlFullScreenDialog;

