// it will concern about whether list is scrollable;
// need target node;

import { ArrowKeyHandler } from 'key-emitter';
import DOMEventer from 'dom-eventer';
import ScrollController from 'scroll-controller';
import Emitter from 'emitter-helper';

export default class ListViewNavigator extends Emitter{
  constructor(opts) {
    super();

    const { target, max } = opts;

    this.target = opts.target;


    this.activeIndex = -1;
    this.activeShowIndex = this.activeIndex;

    this.arrowHandler = new ArrowKeyHandler({
      max: max,
    });

    this.scroller = new ScrollController({
      node: this.target
    });


    this.itemHeight = opts.itemHeight;
    this.eventer = new DOMEventer('list');

    this.mountArrowHandler();
    this.registerArrowEventer();
  }

  // split a list into three zone;
  // TZ, MZ, BZ

  // TZ: top zone means, item in view port, there has space on bottom;
  seperateZoneByIndex(index) {
    const zone = [];
    if ((index + 1) * this.itemHeight <= this.target.clientHeight) zone.push('TZ');
    if (index * this.itemHeight + this.target.clientHeight >= this.target.scrollHeight) zone.push('BZ');
    if (zone.length === 0) zone.push('MZ');
    return zone;
  }

  distanceNeedToTransform(index) {
    const zone = this.seperateZoneByIndex(index);
    if (zone.indexOf('MZ') >= 0 || zone.indexOf('TZ') >= 0) return this.itemHeight * index;
    if (zone.indexOf('BZ') >= 0) return this.target.scrollHeight - this.target.clientHeight;
  }

  isItemInViewport(index) {
    if (!this.scroller.hasScrollbar()) return true;

    const longerThanTop = index * this.itemHeight >= this.target.scrollTop;
    const lessThanTotal = this.target.scrollTop + this.target.clientHeight >= (index + 1) * this.itemHeight;

    return  longerThanTop && lessThanTotal;
  }

  isItemInStrictViewport(index) {
    const zone = this.seperateZoneByIndex(index);
    if (zone.indexOf('TZ') >= 0 && zone.indexOf('BZ') >= 0) return true;
    if (zone.indexOf('BZ') >= 0 && this.scroller.hasScrollToEnd()) return true;
    if (index * this.itemHeight === this.target.scrollTop && this.activeShowIndex === index) return true;

    return false;
  }

  moveSelectedToViewport() {
    if (!this.scroller.hasScrollbar()) return;
  }

  updateIndexAfterCommit(index) {
    this.activeIndex = index;
    this.activeShowIndex = this.activeIndex;

    this.arrowHandler.setIndex(index);
  }

  resetShowIndex(max) {
    this.activeShowIndex = 0;
    this.arrowHandler.setIndex(this.activeShowIndex);

    if (typeof max !== 'undefined') {
      this.arrowHandler.setMax(max);
    }
  }

  updateIndexAfterArrowKey(index) {
    this.activeShowIndex = index;
    this.arrowHandler.setIndex(index);
  }

  next(index, isCommitKey) {
    if (this.isItemInStrictViewport(index)) return;

    if (isCommitKey) {
      this.updateIndexAfterCommit(index);
    } else {
      this.updateIndexAfterArrowKey(index);
    }
    const distance = this.distanceNeedToTransform(index);
    this.target.scrollTop = distance;
  }

  registerArrowEventer() {
    this.eventer.listen(window, 'keydown', (e) => {
      this.arrowHandler.setState(e.keyCode);
    }, true);
  }

  mountArrowHandler() {
    this.arrowHandler.on('change', ({ index }) => {
      // current object will emit current index and next index
      this.emit('change', index, this.activeShowIndex);
      this.next(index);
    })

    this.arrowHandler.on('commit', ({ index }) => {
      this.emit('commit', index, this.activeIndex);
      this.next(index, true);
    })
  }
}
