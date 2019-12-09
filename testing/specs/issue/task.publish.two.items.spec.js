/**
 * Created on 10.07.2018.
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../../libs/WebDriverHelper');
const appConstant = require('../../libs/app_const');
const studioUtils = require('../../libs/studio.utils.js');
const IssueListDialog = require('../../page_objects/issue/issue.list.dialog');
const CreateTaskDialog = require('../../page_objects/issue/create.task.dialog');
const TaskDetailsDialog = require('../../page_objects/issue/task.details.dialog');
const TaskDetailsDialogItemsTab = require('../../page_objects/issue/task.details.items.tab');
const ContentBrowsePanel = require('../../page_objects/browsepanel/content.browse.panel');
const contentBuilder = require("../../libs/content.builder");
const ContentItemPreviewPanel = require('../../page_objects/browsepanel/contentItem.preview.panel');
const ContentPublishDialog = require("../../page_objects/content.publish.dialog");

describe('task.publish.two.items.spec: 2 folders have been added and published', function () {
    this.timeout(appConstant.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();
    let TASK_TITLE = appConstant.generateRandomName('task');
    let folder1;
    let folder2;
    it(`Precondition: WHEN two 'Work in Progress' folders has been added THEN folders should be present in the grid`,
        async () => {
            let contentBrowsePanel = new ContentBrowsePanel();
            let displayName1 = contentBuilder.generateRandomName('folder');
            let displayName2 = contentBuilder.generateRandomName('folder');
            folder2 = contentBuilder.buildFolder(displayName2);
            folder1 = contentBuilder.buildFolder(displayName1);
            //do add the first folder:
            await studioUtils.doAddFolder(folder1);
            // add the second folder:
            await studioUtils.doAddFolder(folder2);
            await studioUtils.typeNameInFilterPanel(folder1.displayName);
            await contentBrowsePanel.waitForContentDisplayed(folder1.displayName);
        });
    it(`GIVEN two folders are selected WHEN new task has been created THEN items tab on 'Issue Details Dialog' should be loaded with expected data`,
        async () => {
            let taskDetailsDialog = new TaskDetailsDialog();
            let createTaskDialog = new CreateTaskDialog();
            let contentBrowsePanel = new ContentBrowsePanel();
            let taskDetailsDialogItemsTab = new TaskDetailsDialogItemsTab();
            //1. Do both folders 'Mark as Ready':
            await studioUtils.findContentAndClickCheckBox(folder1.displayName);
            await studioUtils.findContentAndClickCheckBox(folder2.displayName)
            await contentBrowsePanel.clickOnMarkAsReadyButtonAndConfirm();
            await contentBrowsePanel.waitForPublishButtonVisible();
            //2. Open 'Create Task' dialog and create new task:
            await contentBrowsePanel.openPublishMenuAndClickOnCreateTask();
            await createTaskDialog.typeTitle(TASK_TITLE);
            await createTaskDialog.clickOnCreateTaskButton();
            await taskDetailsDialog.clickOnItemsTabBarItem();
            // 3. Verify issue's data:
            let result = await taskDetailsDialogItemsTab.getItemDisplayNames();
            assert.isTrue(result.includes(folder1.displayName));
            assert.isTrue(result.includes(folder2.displayName));
            let actualNumber = await taskDetailsDialog.getNumberInItemsTab();
            assert.equal(actualNumber, '2', "2 items to publish should be present in the dialog");
            let status = await taskDetailsDialogItemsTab.getContentStatus(folder1.displayName)
            assert.equal(status, 'New', "New content-status should be displayed in the dialog");
        });

    it(`GIVEN 'Issue Details Dialog' is opened AND Items-tab activated WHEN 'Publish...' button has been pressed THEN 2 content should be published`,
        async () => {
            let taskDetailsDialog = new TaskDetailsDialog();
            let issueListDialog = new IssueListDialog();
            let taskDetailsDialogItemsTab = new TaskDetailsDialogItemsTab();
            await studioUtils.openIssuesListDialog();
            //1. Open Issue Details Dialog:
            await issueListDialog.clickOnIssue(TASK_TITLE);
            await taskDetailsDialog.waitForDialogOpened();
            //2.Go to Items tab:
            await taskDetailsDialog.clickOnItemsTabBarItem();
            //Click on Publish... button and open Publishing Wizard
            await taskDetailsDialogItemsTab.clickOnPublishAndOpenPublishWizard();
            let contentPublishDialog = new ContentPublishDialog();
            //3. Click on Publish Now button :
            await contentPublishDialog.clickOnPublishNowButton();
            let message = await taskDetailsDialog.waitForNotificationMessage();
            assert.equal(message, appConstant.TWO_ITEMS_PUBLISHED, '`2 items are published` message should be displayed');
        });

    it(`GIVEN two items are published WHEN both items has been selected THEN issue-menu button should be visible on the toolbar because the issue was not closed `,
        async () => {
            let contentItemPreviewPanel = new ContentItemPreviewPanel();
            //1. Select checkboxes:
            await studioUtils.findContentAndClickCheckBox(folder1.displayName);
            await studioUtils.findContentAndClickCheckBox(folder2.displayName);
            studioUtils.saveScreenshot("issue_menu_should_be_displayed");
            //2. 'Issue Menu button should be visible, because the task was not closed'
            await contentItemPreviewPanel.waitForIssueNameInMenuButton(TASK_TITLE);
        });

    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});