import helper from 'vuejs-object-helper';

export default {
	data: function () {
		return {
			elementIdKey: 'id'
		}
	},
	computed: {
		/**
		 * Get the form permission form store.
		 */
		formPermission: function () {
			return helper.getProp(this.$store.state.form, `${this.formName}.permission`, null);
		},

		/**
		 * is need to check the form element permission ?
		 */
		shouldCheckPermission: function () {
			return this.formPermission && this.formPermission.fields && this.formPermission.fields.length && this.formPermission.limitations && this.formPermission.limitations.field_selection ? true : false;
		},

		/**
		 * To check the Authority to read and write the element.
		 */
		hasAccess: function () {
			if (this.shouldCheckPermission) {
				const field = this.getPermittedField;
				if (this.formPermission.limitations.field_selection === 'only') {
					return field ? true : false;
				}
				else {
					field && field.authority !== 'read' ? false : true;
				}
			}
			return true;
		},
		/**
		 * To find the field authority is that read | write | hide
		 */
		fieldAuthority: function () {
			const field = this.getPermittedField;
			return field ? field.authority : null;
		},

		/**
		 * To check that form permission have the current field information.
		 */
		getPermittedField: function () {
			let data = null;
			const client_field = this[this.elementIdKey].replaceAll(new RegExp("\.[0-9]+\."), '.*.');
			if (this.formPermission && this.formPermission.fields && this.formPermission.fields.length) {
				this.formPermission.fields.map((field) => {
					if (field.client_field === client_field) {
						data = field;
					}
				})
			}
			return data;
		},
	},

	/**
	 * To check the element disability
	 */
	active: function () {
		return this.shouldDisabled || this.disabled ? false : true;
	},
	/**
	 * To check that should the current element display ?
	 */
	show: function () {
		return (this.fieldAuthority !== 'hide' && this.hasAccess);
	}
}