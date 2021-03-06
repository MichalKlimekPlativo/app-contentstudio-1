/**
 * Created on 15.11.2018.
 *
 */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConstant = require('../libs/app_const');
const ContentBrowsePanel = require('../page_objects/browsepanel/content.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const contentBuilder = require("../libs/content.builder");
const UserAccessWidget = require('../page_objects/browsepanel/detailspanel/user.access.widget.itemview');
const EditPermissionsDialog = require('../page_objects/edit.permissions.dialog');

describe('overwrite.permissions.spec: open details panel, update permissions in a parent content and check then in child content',
    function () {
        this.timeout(appConstant.SUITE_TIMEOUT);
        webDriverHelper.setupBrowser();

        let parentFolder;
        let childFolder;
        let NOTIFICATION_MESSAGE = "Permissions for 2 items are applied.";

        it(`Preconditions: parent and child folder should be created with default permissions`,
            async () => {
                let displayName1 = contentBuilder.generateRandomName('folder');
                let displayName2 = contentBuilder.generateRandomName('folder');
                parentFolder = contentBuilder.buildFolder(displayName1);
                childFolder = contentBuilder.buildFolder(displayName2);
                await studioUtils.doAddFolder(parentFolder);
                await studioUtils.findAndSelectItem(parentFolder.displayName);
                await studioUtils.doAddFolder(childFolder);
            });

        it(`GIVEN 'Edit Permissions' dialog for parent folder is opened WHEN default permissions for 'Anonymous' user has been added THEN correct notification message should appear `,
            async () => {
                let editPermissionsDialog = new EditPermissionsDialog();
                let contentBrowsePanel = new ContentBrowsePanel();
                //1. Select the parent folder and open Edit Permissions dialog
                await openEditPermissionsDialog(parentFolder.displayName);
                //2. click on the checkbox and uncheck it
                await editPermissionsDialog.clickOnInheritPermissionsCheckBox();
                //3. Add permissions for Anonymous User:
                await editPermissionsDialog.filterAndSelectPrincipal(appConstant.systemUsersDisplayName.ANONYMOUS_USER);
                await editPermissionsDialog.clickOnApplyButton();
                let result = await contentBrowsePanel.waitForNotificationMessage();
                assert.equal(result, NOTIFICATION_MESSAGE, "permissions should be applied for child as well")
            });

        it(`GIVEN default permissions for 'Anonymous' in parent folder is added WHEN 'Edit Permissions' dialog for child content is opened THEN default permissions for 'Anonymous' should be present as well`,
            async () => {
                let editPermissionsDialog = new EditPermissionsDialog();
                await openEditPermissionsDialog(childFolder.displayName);
                //child folder should inherit parent's permissions by default:
                let result = await editPermissionsDialog.getDisplayNameOfSelectedPrincipals();
                assert.isTrue(result.includes(appConstant.systemUsersDisplayName.ANONYMOUS_USER),
                    "permissions for `Anonymous User` should be applied from parent folder");
            });

        it(`GIVEN 'Inherit permissions' is unchecked in child folder WHEN permissions for 'Anonymous user' has been removed in parent folder THEN permissions for child should not be changed`,
            () => {
                let editPermissionsDialog = new EditPermissionsDialog();
                return clickOnInheritCheckBoxInEditPermissionsDialog(childFolder.displayName).then(() => {
                    return editPermissionsDialog.clickOnApplyButton();
                }).then(() => {
                    return openEditPermissionsDialog(parentFolder.displayName);
                }).then(() => {
                    //remove 'Anonymous User'- entry for parent folder
                    return editPermissionsDialog.removeAclEntry("users/anonymous")
                }).then(() => {
                    return editPermissionsDialog.clickOnApplyButton();
                }).then(() => {
                    // open 'Edit permission' dialog for the child folder again
                    return openEditPermissionsDialog(childFolder.displayName);
                }).then(() => {
                    studioUtils.saveScreenshot("child_content_overwrite_perm_was_not_checked_1");
                    return editPermissionsDialog.getDisplayNameOfSelectedPrincipals();
                }).then(result => {
                    assert.isTrue(result.includes(appConstant.systemUsersDisplayName.ANONYMOUS_USER),
                        "default permissions for `Anonymous User` should be present for child folder, because 'inherit' checkbox is unchecked");
                });
            });

        // Default merging strategy:
        // if permission is set in parent entry, use the value from the parent entry
        it(`GIVEN 'Inherit permissions' is unchecked in child folder WHEN default permissions for 'Everyone' has been added in parent THEN default permissions for 'Everyone' should  be added in child content as well`,
            () => {
                let editPermissionsDialog = new EditPermissionsDialog();
                return openEditPermissionsDialog(parentFolder.displayName).then(() => {
                    //add default permissions for 'Everyone'
                    return editPermissionsDialog.filterAndSelectPrincipal(appConstant.systemUsersDisplayName.EVERYONE);
                }).then(() => {
                    return editPermissionsDialog.clickOnApplyButton();
                }).then(() => {
                    // open 'Edit permission' dialog for the child folder again
                    return openEditPermissionsDialog(childFolder.displayName);
                }).then(() => {
                    studioUtils.saveScreenshot("child_content_overwrite_perm_was_not_checked_2");
                    return editPermissionsDialog.getDisplayNameOfSelectedPrincipals();
                }).then(result => {
                    assert.isTrue(result.includes(appConstant.systemUsersDisplayName.EVERYONE),
                        "default permissions for 'Everyone' should  be added in child content as well, because `Default merging strategy` is applied");
                });
            });

        beforeEach(() => studioUtils.navigateToContentStudioApp());
        afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
        before(() => {
            return console.log('specification is starting: ' + this.title);
        });

        function clickOnInheritCheckBoxInEditPermissionsDialog(contentName) {
            let editPermissionsDialog = new EditPermissionsDialog();
            return openEditPermissionsDialog(contentName).then(() => {
                return editPermissionsDialog.clickOnInheritPermissionsCheckBox();
            })
        }

        function openEditPermissionsDialog(contentName) {
            let editPermissionsDialog = new EditPermissionsDialog();
            let userAccessWidget = new UserAccessWidget();
            return studioUtils.findAndSelectItem(contentName).then(() => {
                return studioUtils.openBrowseDetailsPanel();
            }).then(() => {
                return userAccessWidget.clickOnEditPermissionsLinkAndWaitForDialog();
            }).then(() => {
                return editPermissionsDialog.waitForDialogLoaded();
            })
        }
    });
