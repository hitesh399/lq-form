import Vue from 'vue';
import { isEqual } from 'lodash/core'
import helper from 'vuejs-object-helper'

Vue.directive('lqModel', {

    bind: function (el, binding, vnode) {
        console.log('shd 1', el, vnode)
        let id = binding.value && binding.value.id ? binding.value.id : (vnode.data.attrs.id || vnode.data.attrs.name)
        const { context } = vnode
        // console.log(vnode, 'Bnode', id)
        let lqForm = getForm(context)
        // console.log('lqForm', lqForm, context, vnode)
        if (!lqForm) return
        // console.log('lqFormlqFormlqFormlqForm', lqForm.formValues, id)
        const storeValue = context.$helper.getProp(lqForm.formValues, id, null)
        
        if (storeValue) {
            if (vnode.componentOptions) {
                helper.setProp(vnode.componentOptions, 'propsData.value', storeValue)
            } else {
                el.value = storeValue
            }
        }
        let value = el.value
        // console.log('value', vnode)
        const isChoosable = ['checkbox', 'radio', 'select-multiple', 'select'].includes(el.type)
        if (value) {
            if (isChoosable && el.checked && ['checkbox', 'radio'].includes(el.type)) {
                if (el.type === 'checkbox') {
                    let __value = context.$helper.getProp(lqForm.formValues, id, [])
                    __value = __value && !context.$helper.isArray(__value) ? [__value] : (__value ? __value : [])
                    const index = __value.indexOf(value)
                    if (index === -1) {
                        __value.push(value)
                    }
                    context.$lqForm.setElementVal(lqForm.name, id, __value, false)
                } else {
                    context.$lqForm.setElementVal(lqForm.name, id, value, false)
                }
            } else if (['select-multiple', 'select'].includes(el.type)) {
                value = []
                let selectedLength = el.selectedOptions.length
                for (let i = 0; i < selectedLength; i++) {
                    value.push(el.selectedOptions[i].value)
                }
                context.$lqForm.setElementVal(lqForm.name, id, value, false)
            } else {
                context.$lqForm.setElementVal(lqForm.name, id, value, false)
            }
        }
        const _this = {
            id,
            lqForm: lqForm,
            $lqForm: context.$lqForm,
            $store: context.$store,
            $helper: context.$helper,
            formName: lqForm.name,
            $emit: context.$emit,
            $on: context.$on,
            nativeType: el.type,
            nativeName: el.name,
            isChoosable,
            keepAlive: context.$helper.getProp(vnode.data.attrs, 'keep-alive', true),
            validateOnEvent: context.$helper.getProp(vnode.data.attrs, 'validate-on-event', 'change'),
            simpleName: id.replaceAll(new RegExp("\.[0-9]+\.?"), '.*.')
        }
        context.$lqForm.addProps(lqForm.name, id, {
            touch: false,
            test: validate.bind(_this),
            formatter: null,
            dirty: false
        });
        const model_event = helper.getProp(vnode, 'componentInstance.$_modelEvent', 'input')
        // console.log('el.type', model_event)
        if (vnode.componentInstance) {
            vnode.componentInstance.$on(model_event, whenChange.bind(_this))
            vnode.componentInstance.$on('focus', setAsTouch.bind(_this))
            vnode.componentInstance.$on('click', whenClick.bind(_this))
            vnode.componentInstance.$on('blur', whenBlur.bind(_this))
            vnode.componentInstance.$on('keyup', whenKeyUp.bind(_this))
        } else {
            el.addEventListener(model_event, whenChange.bind(_this))
            el.addEventListener('focus', setAsTouch.bind(_this))
            el.addEventListener('click', whenClick.bind(_this))
            el.addEventListener('blur', whenBlur.bind(_this))
            el.addEventListener('keyup', whenKeyUp.bind(_this))
        }
        context.$store.watch(() => context.$store.getters['form/initializeValues'](lqForm.name), (res, oldValue) => {
            if (isEqual(res, oldValue)) {
                return
            }
            let init_value = res[id] ? res[id] : null
            // console.log('I am changed', oldValue, res)
            if (isChoosable) {
                init_value = context.$helper.isArray(init_value) ? init_value : (init_value ? [init_value] : [])
                if (['select-multiple', 'select'].includes(el.type)) {
                    let optionsLength = el.options.length
                    for (let i = 0; i < optionsLength; i++) {
                        const opt = el.options[i]
                        opt.defaultSelected = init_value.includes(opt.value)
                    }
                } else {
                    el.checked = init_value.includes(el.value)
                }
            } else {
                el.value = init_value
            }
        })
    },
    inserted: function (el, binding, vnode) {
        // console.log('shd 2', binding)

    },
    update: function (el) {
        // console.log('I am skdskhsk', el)
    },
    unbind: function (el, binding, vnode) {
        const model_event = helper.getProp(vnode, 'componentInstance.$_modelEvent', 'input')
        if (vnode.componentInstance) {
            vnode.componentInstance.$off(model_event, whenChange)
            vnode.componentInstance.$on('focus', setAsTouch)
            vnode.componentInstance.$on('click', whenClick)
            vnode.componentInstance.$on('blur', whenBlur)
            vnode.componentInstance.$on('keyup', whenKeyUp)
        } else {
            el.removeEventListener(model_event, whenChange)
            el.removeEventListener('focus', setAsTouch)
            el.removeEventListener('click', whenClick)
            el.removeEventListener('blur', whenBlur)
            el.removeEventListener('keyup', whenKeyUp)
        }
        // el.removeEventListener('change', whenChange)

        let id = binding.value && binding.value.id ? binding.value.id : (vnode.data.attrs.id || vnode.data.attrs.name)
        const { context } = vnode
        const keepAlive = context.$helper.getProp(vnode.data.attrs, 'keep-alive', true)

        let lqForm = getForm(context)
        if (!keepAlive) {
            context.$lqForm.removeElement(lqForm.name, id)
        }
    }
})

function whenBlur(event) {
    if (this.validateOnEvent === 'blur') {
        validate.bind(this)(true, true)
    }
}
function whenKeyUp(event) {
    if (this.validateOnEvent === 'keyup') {
        validate.bind(this)(true, true)
    }
}

function whenChange(event) {
    // console.log('I am here Tested.', event)
    const value = event instanceof InputEvent ? event.target.value : event
    if (!this.isChoosable) {
        this.$lqForm.setElementVal(this.lqForm.name, this.id, value, false)
    } else {
        const checked = event.target.checked
        let elms = this.lqForm.$el.querySelectorAll(`input[name="${this.nativeName}"]`)
        const _length = elms ? elms.length : 0

        if (this.nativeType === 'radio' || (this.nativeType === 'checkbox' && _length === 1)) {
            const _val = checked ? value : null
            this.$lqForm.setElementVal(this.lqForm.name, this.id, _val, false)
        } else if (this.nativeType === 'checkbox' && _length > 1) {
            // console.log('Test', value, checked)
            let __value = this.$helper.getProp(this.lqForm.formValues, this.id, [])
            __value = __value && !this.$helper.isArray(__value) ? [__value] : (__value ? __value : [])
            const index = __value.indexOf(value)
            if (checked) {
                if (index === -1) {
                    __value.push(value)
                }
            } else {
                __value.splice(index, 1)
            }
            this.$lqForm.setElementVal(this.lqForm.name, this.id, __value, false)
        } else if (['select-multiple', 'select'].includes(this.nativeType)) {
            let __value = []
            let selectedLength = event.target.selectedOptions.length
            for (let i = 0; i < selectedLength; i++) {
                __value.push(event.target.selectedOptions[i].value)
            }
            this.$lqForm.setElementVal(this.lqForm.name, this.id, __value, false)
        }
    }

    /**
     * Check dirty Value
     */
    const initializevalue = this.$helper.getProp(this.lqForm.formInitialvalues, this.id, null)
    const dirty = this.$helper.getProp(this.$store.state, ['form', this.formName, 'fields', this.id, 'dirty'], false)
    if (initializevalue && !value) {
        this.$lqForm.addProp(this.formName, this.id, 'dirty', false);
    } else if (initializevalue === value) {
        this.$lqForm.addProp(this.formName, this.id, 'dirty', false);
    } else if (!dirty) {
        this.$lqForm.addProp(this.formName, this.id, 'dirty', true);
    }

    /**
     * Test Validation
     */
    // console.log('asdassaas1')
    if (this.validateOnEvent === 'change') {
        validate.bind(this)(true, true)
    }
}

function whenClick(event) {
    console.log('Test Click')
    if (this.validateOnEvent === 'click') {
        validate.bind(this)(true, true)
    }
    setAsTouch.bind(this)(event)
}
function setAsTouch() {
    const touch = this.$helper.getProp(this.$store.state, ['form', this.formName, 'fields', this.id, 'touch'], false)
    if (!touch) {
        this.$lqForm.touchStatus(this.lqForm.name, this.id, true)
    }
}

async function validate(changeReadyStatus = true, onlyTouchedTest = true) {
    const lqElRules = this.$helper.getProp(this.lqForm.rules, [this.simpleName], null)
    const touch = this.$helper.getProp(this.$store.state, ['form', this.formName, 'fields', this.id, 'touch'], false)
    const value = this.$helper.getProp(this.$store.state, `form.${this.formName}.values.${this.id}`, null)
    if (!lqElRules) {
        removeAllErrors.bind(this)()
        return;
    }
    if (!touch && onlyTouchedTest) {
        return;
    }

    const options = {
        id: this.id,
        formName: this.formName,
        formValues: this.lqForm.formValues
    }

    removeAllErrors.bind(this)()

    this.$lqForm.validatingStatus(this.formName, this.id, true);
    if (changeReadyStatus) {
        this.$lqForm.ready(this.formName, false);
    }

    let validation_rules = {};
    let element_values = {};
    validation_rules[this.id] = lqElRules;
    this.$helper.setProp(element_values, this.id, value)
    const test = await new Promise((resolve) => {
        window.validatejs.async(element_values, validation_rules, options)
            .then(() => resolve())
            .catch((errors) => {
                let _error_messages = {};
                const error_elements = Object.keys(errors);
                error_elements.forEach((error_element) => {
                    const elName = error_element.replaceAll('\\', '')
                    let elErrors = errors[error_element];

                    let err = !this.$helper.isArray(elErrors) ? [elErrors] : elErrors;
                    this.$lqForm.addError(this.formName, elName, err);

                    _error_messages[elName] = elErrors
                })
                resolve(_error_messages);
            })
    });
    if (changeReadyStatus) {
        this.$lqForm.ready(this.formName, true);
    }
    this.$lqForm.validatingStatus(this.formName, this.id, false);
    return test
}

function findErrorKeys(formErrors, id) {
    const keys = formErrors ? Object.keys(formErrors) : [];
    let elementErrorKeys = [];
    keys.forEach((key) => {
        if (key.startsWith(id + '.')) {
            elementErrorKeys.push(key);
        }
        if (key === id) {
            elementErrorKeys.push(id);
        }
    });
    return elementErrorKeys;
}

function removeAllErrors() {
    const formErrors = this.lqForm.formErrors
    const errorInKeys = findErrorKeys(formErrors, this.id)
    if (errorInKeys.length) {
        errorInKeys.forEach((errorKey) => {
            this.$lqForm.removeError(this.formName, this.id);
        })
    }
}


function getForm(context) {
    let lqForm = null
    context.$children && context.$children.every(ctx => {
        if (ctx.formName) {
            lqForm = ctx
            return false
        }
        lqForm = getForm(ctx)
        return true
    })
    return lqForm
}