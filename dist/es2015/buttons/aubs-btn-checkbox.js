var _dec, _dec2, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3;

function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
        enumerable: descriptor.enumerable,
        configurable: descriptor.configurable,
        writable: descriptor.writable,
        value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
        desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
        desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
        return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
        desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
        desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
        Object['define' + 'Property'](target, property, desc);
        desc = null;
    }

    return desc;
}

function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

import { inject, bindable, bindingMode } from "aurelia-framework";

export let AubsBtnCheckboxCustomAttribute = (_dec = inject(Element), _dec2 = bindable({ defaultBindingMode: bindingMode.twoWay }), _dec(_class = (_class2 = class AubsBtnCheckboxCustomAttribute {

    constructor(element) {
        _initDefineProp(this, 'state', _descriptor, this);

        _initDefineProp(this, 'checkedValue', _descriptor2, this);

        _initDefineProp(this, 'uncheckedValue', _descriptor3, this);

        this.element = element;

        if (this.element.tagName !== 'BUTTON' && this.element.tagName !== 'A') {
            throw new Error("The aubs-btn-checkbox attribute can only be used in button and anchor elements");
        }

        this.clickedListener = () => this.buttonClicked();
    }

    bind() {
        if (this.checkedValue == undefined || this.checkedValue == null) {
            this.checkedValue = true;
        }

        if (this.uncheckedValue == undefined || this.uncheckedValue == null) {
            this.uncheckedValue = false;
        }

        if (this.state !== this.checkedValue && this.state !== this.uncheckedValue) {
            this.state = this.uncheckedValue;
        }
    }

    attached() {
        this.element.addEventListener('click', this.clickedListener);
        this.setClass();
    }

    detached() {
        this.element.removeEventListener('click', this.clickedListener);
    }

    stateChanged() {
        this.setClass();
    }

    buttonClicked() {
        this.state = this.state === this.checkedValue ? this.uncheckedValue : this.checkedValue;
        this.setClass();
    }

    setClass() {
        if (this.state == this.checkedValue) {
            this.element.classList.add('active');
        } else {
            this.element.classList.remove('active');
        }
    }
}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'state', [_dec2], {
    enumerable: true,
    initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'checkedValue', [bindable], {
    enumerable: true,
    initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'uncheckedValue', [bindable], {
    enumerable: true,
    initializer: null
})), _class2)) || _class);