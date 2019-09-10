import helper from 'vuejs-object-helper';

const fileMixin = {
    props: {
        multiple: {
            type: Boolean,
            default: () => { return true; }
        },
        thumbs: {
            type: Array,
            default: () => { return null; },
            validator: (value) => {
                let isValid = true;
                value.map(function (v) {
                    if (!helper.isFloat(v.width) || !helper.isFloat(v.height)) {
                        isValid = false;
                    }
                })
                return isValid;
            }
        },
        /**
         * Base Url of Storage
         */
        storageUrl: String,
        /**
         * The key path where the upload file name.
         */
        valueKey: {
            type: String,
            required: true
        }
    },
    // data: function () {
    //     return {
    //         validateArrayIndex: true,
    //     }
    // },
    computed: {
        validateArrayIndex: function () {
            return window.validatejs.isEmpty(this.LQElement) ? false : true;
        }
    },
    methods: {

        handleFileChange: async function (event, index) {
            this.$lqForm.touchStatus(this.formName, this.id, true);
            const fileLenght = event.target.files.length;
            for (var i = 0; i < fileLenght; i++) {
                const file = event.target.files[i];
                const uid = (Date.now() + i);
                console.log('I am here index 1232', typeof index)
                if (index !== undefined) {
                    console.log('Update 2')
                    this.setValueOnIndex(file, uid, index)
                } else {
                    console.log('Update 1')
                    this.setValue(file, uid);
                }
            }
            this.$emit('changed', this.LQElement);
            this.validate();
        },
        remove: function (elementName) {
            this.$store.dispatch('form/removeElement', { formName: this.formName, elementName: elementName });
            this.validate();
        },
        /**
         * To remove Only File Not inded
         */
        onlyRemoveFile(elementName) {
            this.$store.dispatch('form/removeElement', { formName: this.formName, elementName: `${elementName}.file` });
            this.$store.dispatch('form/removeElement', { formName: this.formName, elementName: `${elementName}.original` });
            this.$store.dispatch('form/removeElement', { formName: this.formName, elementName: `${elementName}.uid` });
            this.$store.dispatch('form/removeElement', { formName: this.formName, elementName: `${elementName}.status` });
            this.validate();
        },
        /**
         * To set the file value in store
         * @param {File} file 
         */
        setValue: function (file, uid) {

            const defaultValue = this.multiple ? [] : {};

            const value = file ? {
                file: file,
                original: file,
                uid: uid,
                status: 'ready'
            } : defaultValue;

            const data = {
                formName: this.formName,
                elementName: this.id,
                value: value
            }
            const action = this.multiple ? 'form/addNewElement' : 'form/setElementValue';
            this.$store.dispatch(action, data);
        },
        setValueOnIndex(file, uid, index) {
            this.$store.dispatch('form/setElementValue', {
                formName: this.formName,
                elementName: `${this.id}.${index}.file`,
                value: file
            });
            this.$store.dispatch('form/setElementValue', {
                formName: this.formName,
                elementName: `${this.id}.${index}.original`,
                value: file
            });
            this.$store.dispatch('form/setElementValue', {
                formName: this.formName,
                elementName: `${this.id}.${index}.status`,
                value: 'ready'
            });
            this.$store.dispatch('form/setElementValue', {
                formName: this.formName,
                elementName: `${this.id}.${index}.uid`,
                value: uid
            });
            this.$store.dispatch('form/setElementValue', {
                formName: this.formName,
                elementName: `${this.id}.${index}.cropped`,
                value: false
            });
        }
    }
}

export default fileMixin;