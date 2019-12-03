/**
 * Created on 13.07.2018.
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

describe('task.not.valid.content.spec: create a task with not valid content', function () {
    this.timeout(appConstant.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();
    let TASK_TITLE = appConstant.generateRandomName('task');

    it(`GIVEN existing folder with one not valid child is selected WHEN 'Create Task' menu item has been selected and issue created THEN '10' number should be in 'Items' on IssueDetailsDialog`,
        async () => {
            let taskDetailsDialog = new TaskDetailsDialog();
            let createTaskDialog = new CreateTaskDialog();
            let contentBrowsePanel = new ContentBrowsePanel();
            //1. Select existing folder with children:
            await studioUtils.findAndSelectItem(appConstant.TEST_FOLDER_2_NAME);
            await contentBrowsePanel.waitForPublishButtonVisible();
            //2. open 'Create Task' dialog
            await contentBrowsePanel.openPublishMenuAndClickOnCreateTask();
            await createTaskDialog.typeTitle(TASK_TITLE);
            await createTaskDialog.clickOnIncludeChildrenToggler(appConstant.TEST_FOLDER_2_DISPLAY_NAME);
            studioUtils.saveScreenshot("create_task_dialog1");
            //3. Create this task:
            await createTaskDialog.clickOnCreateTaskButton();
            studioUtils.saveScreenshot("issue_details_should_be_loaded");
            await taskDetailsDialog.waitForDialogOpened();
            await taskDetailsDialog.pause(1000);
            //4. 10 items should be in the task-details dialog:
            let result = await taskDetailsDialog.getNumberOfItems();
            assert.equal(result, '10', 'Ten items should be displayed in the `Items`link');
        });

    it(`GIVEN task with not valid item is clicked WHEN Items-tab has been clicked THEN 'Publish & Close Issue' button should be disabled, because invalid child is present`,
        async () => {
            let issueListDialog = new IssueListDialog();
            let taskDetailsDialog = new TaskDetailsDialog();
            let issueDetailsDialogItemsTab = new TaskDetailsDialogItemsTab();
            //1. Open Issues List Dialog:
            await studioUtils.openIssuesListDialog();
            //2. Click on the task and open Task Details dialog:
            await issueListDialog.clickOnIssue(TASK_TITLE);
            await taskDetailsDialog.waitForDialogOpened();
            //3. Go to 'Items' tab:
            await taskDetailsDialog.clickOnItemsTabBarItem();
            studioUtils.saveScreenshot("publish_close_issue_should_be_disabled");
            // 4.'Publish & Close button should be disabled, because invalid child is present'
            let result = await issueDetailsDialogItemsTab.isPublishAndCloseIssueButtonEnabled();
            assert.isFalse(result, 'Publish & Close button should be disabled(invalid child)');
        });

    it(`GIVEN Items-tab has been clicked WHEN not valid content has been excluded THEN 'Publish...' button is getting enabled`,
        async () => {
            let issueListDialog = new IssueListDialog();
            let issueDetailsDialog = new TaskDetailsDialog();
            let taskDetailsDialogItemsTab = new TaskDetailsDialogItemsTab();
            //1. Open Issues List dialog:
            await studioUtils.openIssuesListDialog();
            //2. Click on the task and open Task Details dialog:
            await issueListDialog.clickOnIssue(TASK_TITLE);
            await issueDetailsDialog.waitForDialogOpened();
            //3. Go to 'Items' tab:
            await issueDetailsDialog.clickOnItemsTabBarItem();
            //4. Exclude the not valid content:
            await taskDetailsDialogItemsTab.excludeDependantItem('shortcut-imported');
            //5.'Publish & Close' button gets enabled, because invalid child is excluded'
            await taskDetailsDialogItemsTab.waitForPublishAndCloseIssueButtonEnabled();
        });

    beforeEach(() => studioUtils.navigateToContentStudioApp());
    afterEach(() => studioUtils.doCloseAllWindowTabsAndSwitchToHome());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
