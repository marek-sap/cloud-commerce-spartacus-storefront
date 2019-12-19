import {
  ChangeDetectionStrategy,
  Component,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  CmsService,
  CMSTabParagraphContainer,
  WindowRef,
} from '@spartacus/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import {
  map,
  switchMap,
  distinctUntilChanged,
  distinctUntilKeyChanged,
} from 'rxjs/operators';
import { CmsComponentData } from '../../../cms-structure/page/model/index';
import { ComponentWrapperDirective } from '../../../cms-structure/page/component/component-wrapper.directive';

@Component({
  selector: 'cx-tab-paragraph-container',
  templateUrl: './tab-paragraph-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabParagraphContainerComponent
  implements AfterViewInit, OnInit, OnDestroy {
  activeTabNum = 0;

  @ViewChildren(ComponentWrapperDirective) children!: QueryList<
    ComponentWrapperDirective
  >;

  tabTitleParams: Observable<any>[] = [];

  subscription: Subscription;

  constructor(
    componentData: CmsComponentData<CMSTabParagraphContainer>,
    cmsService: CmsService,
    // tslint:disable-next-line:unified-signatures
    winRef: WindowRef
  );
  /**
   * @deprecated since 1.4
   *
   * TODO(issue:#5813) Deprecated since 1.4
   */
  constructor(
    componentData: CmsComponentData<CMSTabParagraphContainer>,
    cmsService: CmsService
  );
  constructor(
    public componentData: CmsComponentData<CMSTabParagraphContainer>,
    private cmsService: CmsService,
    private winRef?: WindowRef
  ) {}

  components$: Observable<any[]> = this.componentData.data$.pipe(
    distinctUntilKeyChanged('components'),
    switchMap(data =>
      combineLatest(
        data.components.split(' ').map(component =>
          this.cmsService.getComponentData<any>(component).pipe(
            distinctUntilChanged(),
            map(tab => {
              if (!tab.flexType) {
                tab = {
                  ...tab,
                  flexType: tab.typeCode,
                };
              }

              return {
                ...tab,
                title: `${data.uid}.tabs.${tab.uid}`,
              };
            })
          )
        )
      )
    )
  );

  select(tabNum: number): void {
    this.activeTabNum = tabNum;
  }

  ngOnInit(): void {
    if (this.winRef && this.winRef.nativeWindow) {
      const routeState =
        this.winRef.nativeWindow.history &&
        this.winRef.nativeWindow.history.state;

      if (routeState && routeState['activeTab']) {
        this.activeTabNum = routeState['activeTab'];
      }
    }
  }

  ngAfterViewInit(): void {
    // If the sub cms components data exist, these components created before ngAfterViewInit is called.
    // In this case, directly get the title parameters from them.
    // If the sub cms components data do not exist, need load them first.
    // In this case, listen to the changes to wait for them created.
    if (this.children.length > 0) {
      this.getTitleParams(this.children);
    } else {
      this.subscription = this.children.changes.subscribe(
        (tabComps: QueryList<ComponentWrapperDirective>) =>
          this.getTitleParams(tabComps)
      );
    }
  }

  private getTitleParams(children: QueryList<ComponentWrapperDirective>) {
    children.forEach(comp => {
      if (comp.cmpRef && comp.cmpRef.instance.tabTitleParam$) {
        this.tabTitleParams.push(comp.cmpRef.instance.tabTitleParam$);
      } else {
        this.tabTitleParams.push(null);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
