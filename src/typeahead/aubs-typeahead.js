import {inject, bindable, bindingMode, observable, BindingEngine} from 'aurelia-framework';
import {bootstrapOptions} from "../utils/bootstrap-options";

@inject(BindingEngine)
export class AubsTypeaheadCustomElement {
  @bindable({defaultBindingMode: bindingMode.twoWay}) value;
  @bindable data;
  @bindable disabled = false;
  @bindable openOnFocus = false;
  @bindable resultsLimit;
  @bindable focusFirst = true;
  @bindable selectSingleResult = false;
  @bindable loadingText = 'Loading...';
  @bindable inputClass = '';
  @bindable placeholder = 'Start typing to get results';
  @bindable key = 'name';
  @bindable noResultsText = 'No Results';
  @bindable waitTime = 350;
  @bindable instantCleanEmpty = true;
  @bindable customEntry = false;

  promiseQueue = [];
  v4 = false;
  dropdown;
  input;
  displayData = [];
  @observable filter = '';
  focusedIndex = -1;
  loading = false;

  constructor(bindingEngine) {
    this.bindingEngine = bindingEngine;

    this.openListener = () => this.openDropdown();
    this.outsideClickListener = evt => this.handleBlur(evt);
    this.keyDownListener = evt => this.onKeyDown(evt);
  }

  bind() {
        if(bootstrapOptions.version === 4){
            this.v4 = true;
        }

    if (Array.isArray(this.data)) {
      this.dataObserver = this.bindingEngine.collectionObserver(this.data).subscribe(() => {
        this.checkCustomEntry();
        this.applyPlugins();
      });
    }

    this.checkCustomEntry();
  }

  attached() {
    if (this.openOnFocus) {
      this.input.addEventListener('focus', this.openListener);
      this.input.addEventListener('click', this.openListener);
    }

    document.addEventListener('click', this.outsideClickListener);
    this.input.addEventListener('keydown', this.keyDownListener);
  }

  detached() {
    if (this.dataObserver) {
      this.dataObserver.dispose();
    }

    document.removeEventListener('click', this.outsideClickListener);
    this.input.removeEventListener('keydown', this.keyDownListener);

    if (this.openOnFocus) {
      this.input.removeEventListener('focus', this.openListener);
      this.input.removeEventListener('click', this.openListener);
    }
  }

  valueChanged() {
    let newFilter = this.getName(this.value);

    if (newFilter !== this.filter) {
      this.ignoreChange = true;
      this.filter = newFilter;
    }
  }

  openDropdown() {
    if (this.dropdown.classList.contains('open')) {
      return;
    }

    this.dropdown.classList.add('open');
    this.focusNone();
    this.applyPlugins();
  }

  doFocusFirst() {
    if (this.focusFirst && this.displayData.length > 0) {
      this.displayData[0].$focused = true;
      this.focusedIndex = 0;
    }
  }

  checkCustomEntry() {
    if (this.data.length > 0 && typeof this.data[0] === 'object') {
      this.customEntry = false;
    }
  }

  filterChanged() {
    if (this.ignoreChange) {
      this.ignoreChange = false;
      return;
    }

    this.applyPlugins()
      .then(() => {
        if (this.instantCleanEmpty && this.filter.length === 0) {
          this.value = null;
        } else if (this.customEntry) {
          this.value = this.filter;
        } else if (this.selectSingleResult && this.displayData.length === 1) {
          this.itemSelected(this.displayData[0]);
        }
      });
  }

  applyPlugins() {
    this.focusNone();
    let localData;

    if (typeof this.data === 'function') {
      this.displayData = [];
      this.loading = true;

      let promise = this.data({filter: this.filter, limit: this.resultsLimit})
        .then(data => {
          if (this.promiseQueue.length > 1) {
            this.promiseQueue.splice(0, 1);
            return;
          }

          this.displayData = data;
          this.doFocusFirst();
          this.promiseQueue.splice(0, 1);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
          this.displayData = [];
          throw new Error('Unable to retrieve data');
        });

      this.promiseQueue.push(promise);
      return promise;
    }

    localData = [].concat(this.data);
    if (this.filter && this.filter.length > 0) {
      localData = this.doFilter(localData);
    }

    if (!this.isNull(this.resultsLimit) && !isNaN(this.resultsLimit)) {
      localData = localData.slice(0, this.resultsLimit);
    }

    this.displayData = localData;
    this.doFocusFirst();

    return Promise.resolve({});
  }

  focusNone() {
    let focused = this.displayData.find(next => next.$focused);
    if (focused) {
      focused.$focused = false;
    }

    this.focusedIndex = -1;
  }

  doFilter(toFilter) {
    return toFilter.filter(item => !this.isNull(item) && this.getName(item).toLowerCase().indexOf(this.filter.toLowerCase()) > -1);
  }

  getName(item) {
    if (this.isNull(item)) {
      return '';
    }

    if (typeof item === 'object') {
      return item[this.key].toString();
    }

    return item.toString();
  }

  resetFilter() {
    if (this.filter.length === 0) {
      this.value = null;
    }

    let newFilter;
    if (this.isNull(this.value)) {
      newFilter = '';
    } else {
      newFilter = this.getName(this.value);
    }

    if (newFilter !== this.filter) {
      this.ignoreChange = true;
      this.filter = newFilter;
    }
  }


  handleBlur(evt) {
    if (!this.dropdown.classList.contains('open')) {
      return;
    }

    setTimeout(() => {
      if (!this.dropdown.contains(evt.target)) {
        this.dropdown.classList.remove('open');
        this.focusNone();
        this.resetFilter();
      }
    }, this.waitTime);
  }

  itemSelected(item) {
    this.value = item;
    this.dropdown.classList.remove('open');

    let newFilter = this.getName(this.value);
    if (newFilter !== this.filter) {
      this.ignoreChange = true;
      this.filter = newFilter;
    }
  }

  isNull(item) {
    return item === null || item === undefined;
  }

  onKeyDown(evt) {
    this.dropdown.classList.add('open');

    switch (evt.keyCode) {
    case 40:
      return this.handleDown();
    case 38:
      return this.handleUp();
    case 13:
    case 9:
      return this.handleEnter();
    case 27:
      return this.handleScape();
    default:
      return;
    }
  }

  handleDown() {
    if (this.focusedIndex >= this.displayData.length - 1) {
      return;
    }

    if (this.focusedIndex >= 0) {
      this.displayData[this.focusedIndex].$focused = false;
    }
    this.displayData[++this.focusedIndex].$focused = true;
  }

  handleUp() {
    if (this.focusedIndex === 0) {
      return;
    }

    this.displayData[this.focusedIndex--].$focused = false;
    this.displayData[this.focusedIndex].$focused = true;
  }

  handleEnter() {
    if (this.displayData.length === 0 || this.focusedIndex < 0) {
      return;
    }

    this.itemSelected(this.displayData[this.focusedIndex]);
  }

  handleScape() {
    this.dropdown.classList.remove('open');
    this.focusNone();
    this.resetFilter();
  }
}
