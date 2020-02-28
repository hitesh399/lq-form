import Vue from 'vue';
Vue.directive('lqModel', {

    inserted: function (el, binding, vnode) {
        let id = binding.value ? binding.value.id : (vnode.data.attrs.id || vnode.data.attrs.name)
        let value = el.value
        const { context } = vnode
        // console.log(el, binding, vnode, 'Bnode')

        let lqForm = null
        context.$children.every(ctx => {
            if (ctx.formName) {
                lqForm = ctx
                return false
            }
            return true
        })
        if (!lqForm) return
        const isChoosable = ['checkbox', 'radio', 'select-multiple'].includes(el.type)
        if (value) {
            if (isChoosable && el.checked && el.type !== 'select-multiple') {
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
            } else if (el.type === 'select-multiple') {
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

        el.addEventListener('change', whenChange.bind(_this))
        el.addEventListener('focus', setAsTouch.bind(_this))
        el.addEventListener('click', whenClick.bind(_this))
        el.addEventListener('blur', whenBlur.bind(_this))
        el.addEventListener('keyup', whenKeyUp.bind(_this))

    },
    // bind: function () { },
    // update: function () { },
    unbind: function (el) {
        // console.log('I am unbind')
        el.removeEventListener('change', whenChange)
        el.removeEventListener('focus', setAsTouch)
        el.removeEventListener('click', whenClick)
        el.removeEventListener('blur', whenBlur)
        el.removeEventListener('keyup', whenKeyUp)
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
    const value = event.target.value
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
        } else if (this.nativeType === 'select-multiple') {
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
    if (this.validateOnEvent === 'keyup') {
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
    console.log('Middle')
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