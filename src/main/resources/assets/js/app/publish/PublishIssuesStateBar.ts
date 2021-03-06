import i18n = api.util.i18n;
import SpanEl = api.dom.SpanEl;
import DivEl = api.dom.DivEl;

export class PublishIssuesStateBar
    extends api.dom.DivEl {

    private containsInvalidElement: api.dom.Element;

    private containsInProgressElement: api.dom.Element;

    private containsNotPublishableElement: api.dom.Element;

    private loadFailedElement: api.dom.Element;

    constructor() {
        super('publish-dialog-issues');

        this.createContainsInvalidElement();
        this.createContainsInProgressElement();
        this.createContainsNotPublishableElement();
        this.createLoadFailedElement();
    }

    private createContainsInvalidElement() {
        this.containsInvalidElement = new api.dom.H6El('state-line');
        const icon: DivEl = new DivEl('state-icon invalid');
        const span1: SpanEl = new SpanEl('part1').setHtml(i18n('dialog.publish.invalidError.part1'));
        const span2: SpanEl = new SpanEl('part2').setHtml(i18n('dialog.publish.invalidError.part2'));
        this.containsInvalidElement.appendChildren(icon, span1, span2);
    }

    private createContainsInProgressElement() {
        this.containsInProgressElement = new api.dom.H6El('state-line');
        const icon: DivEl = new DivEl('state-icon in-progress');
        const span1: SpanEl = new SpanEl('part1').setHtml(i18n('dialog.publish.in-progress.part1'));
        const span2: SpanEl = new SpanEl('part2').setHtml(i18n('dialog.publish.in-progress.part2'));
        this.containsInProgressElement.appendChildren(icon, span1, span2);
    }

    private createContainsNotPublishableElement() {
        this.containsNotPublishableElement = new api.dom.H6El('not-publishable');
        const span: SpanEl = new SpanEl().setHtml(i18n('dialog.publish.notPublishable'));
        this.containsNotPublishableElement.appendChildren(span);
    }

    private createLoadFailedElement() {
        this.loadFailedElement = new api.dom.H6El('load-failed').setHtml(i18n('dialog.publish.error.loadFailed'));
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.reset();
            this.appendChildren(
                this.containsInProgressElement,
                this.containsInvalidElement,
                this.containsNotPublishableElement,
                this.loadFailedElement
            );

            return rendered;
        });
    }

    setContainsInvalidVisible(flag: boolean) {
        this.containsInvalidElement.setVisible(flag);
    }

    setContainsInProgressVisible(flag: boolean) {
        this.containsInProgressElement.setVisible(flag);
    }

    setContainsNotPublishableVisible(flag: boolean) {
        this.containsNotPublishableElement.setVisible(flag);
    }

    showLoadFailed() {
        this.loadFailedElement.show();
    }

    reset() {
        this.containsInvalidElement.hide();
        this.containsInProgressElement.hide();
        this.containsNotPublishableElement.hide();
        this.loadFailedElement.hide();
    }
}
