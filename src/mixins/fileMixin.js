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
                    if(!helper.isFloat( v.width ) || !helper.isFloat( v.height ) ){
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
    data: function () {
        return {
            validateArrayIndex: true,
        }
    },
    methods: {

		handleFileChange: async function(event)  {
            this.$lqForm.touchStatus(this.formName, this.id, true);            
            const fileLenght = event.target.files.length;
            for (var i = 0; i < fileLenght; i++) {
                const file = event.target.files[i];
                const uid = (Date.now() + i);
                this.setValue(file, uid);
            }
            this.$emit('changed', this.LQElement);
            this.validate();
        },
        remove: function (elementName) {
            this.$store.dispatch('form/removeElement', {formName: this.formName, elementName: elementName});
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
        }
	}
}

export default fileMixin;