// import validate from 'validate.js';
import helper, { isImage, checkFileExtensions } from 'vuejs-object-helper';
import errorLang from './fileErrorLang';

/**
 * To Print the error Message
 * @param {String} type 
 * @param {Object} attribues 
 * @param {String | Function} message 
 */
export function generateErrorMessage(type, attribues, message) {
    let error_rule = '[::file:' + type + '::]'
    if (message) {

        if (typeof message === 'function') {
            return message(type, attribues) + error_rule;
        } else if (typeof message === 'object') {
            if (message[type]) {
                return window.validatejs.format(message[type].toString(), attribues) + error_rule;
            } else {
                return window.validatejs.format(errorLang[type], attribues) + error_rule;
            }
        }
        return window.validatejs.format(message.toString(), attribues) + error_rule;
    }
    return window.validatejs.format(errorLang[type], attribues) + error_rule;
}

/**
 * To validate the file.
 * @param {Object} value 
 * @param {Object} rules 
 * @param {Object} element Values 
 */
function fileValidation(value, rules, elementName, values, options) {

    // if (!helper.isObject(value)) {
    //     return new Promise(function(resolve) {resolve('')});
    // }

    const {
        maxFileSize,
        minFileSize,
        acceptedFiles,
        minImageDimensions,
        maxImageDimensions,
        exactImageDimensions,
        required,
        message,
        max,
        crop
    } = rules;
    let id, cropped, file = null;

    if (value instanceof File || value instanceof Blob) {
        id = null;
        cropped = null;
        file = value
    } else if (typeof value === 'string' || value === null) {
        return (!value && required) ? generateErrorMessage('required', {}, message) : ''

    } else {
        value = value ? value : {};
        id = value.id;
        cropped = value.cropped;
        file = value.file;
    }

    let maxFileSizeBytes = maxFileSize ? maxFileSize * 1000000 : null;
    let minFileSizeBytes = minFileSize ? minFileSize * 1000000 : null;
    let acceptedFilesArr = acceptedFiles ? (helper.isArray(acceptedFiles) ? acceptedFiles : acceptedFiles.split(',')) : null;


    return new Promise(function (resolve) {

        if (!file && !id && required) {
            resolve([generateErrorMessage('required', {}, message)]);
            return;
        }
        if (!file) {
            resolve('')
            return
        }
        let errors = [];
        if (max) {
            let nameArr = elementName.split('\.');
            let valueIndex = parseInt(nameArr.splice(nameArr.length - 1, 1)[0]) + 1;
            if (max && valueIndex > max) {
                errors.push(generateErrorMessage('max', { max }, message));
            }
        }
        let fReader = new FileReader();

        fReader.onload = function (e) {

            let attribues = { maxFileSize, minFileSize, fileSize: parseFloat(e.total / 1000000).toFixed(2), acceptedFiles: acceptedFiles };

            /**
             * Checking file extensions
             */
            if (acceptedFilesArr && !checkFileExtensions(acceptedFilesArr, file)) {
                errors.push(generateErrorMessage('acceptedFiles', attribues, message));
            }
            /**
             * Checking file size for max size validation
             */
            if (maxFileSizeBytes && e.total > maxFileSizeBytes) {
                errors.push(generateErrorMessage('maxFileSize', attribues, message));
            }
            /**
             * Checking file size for min validation
             */
            if (minFileSizeBytes && e.total < minFileSizeBytes) {
                errors.push(generateErrorMessage('minFileSize', attribues, message));
            }
            /**
             * Checking File type is Image
             */
            if (isImage(e.target.result)) {

                let img = new Image();
                img.onload = function (imgEvent) {
                    const imgE = imgEvent.srcElement ? imgEvent.srcElement : imgEvent.path[0];
                    /**
                     * Min Dimensions validation
                     */
                    if (minImageDimensions && minImageDimensions[0] && !minImageDimensions[1] && imgE.width < minImageDimensions[0]) {

                        attribues.minImageWidth = minImageDimensions[0];
                        attribues.imageWidth = imgE.width
                        errors.push(generateErrorMessage('minImageWidth', attribues, message));
                    }
                    else if (minImageDimensions && minImageDimensions[1] && !minImageDimensions[0] && imgE.height < minImageDimensions[1]) {

                        attribues.minImageHeight = minImageDimensions[1];
                        attribues.imageHeight = imgE.height
                        errors.push(generateErrorMessage('minImageHeight', attribues, message));
                    }
                    else if (minImageDimensions && minImageDimensions[1] && minImageDimensions[0] && (imgE.height < minImageDimensions[1] || imgE.width < minImageDimensions[0])) {

                        attribues.minImageHeight = minImageDimensions[1];
                        attribues.minImageWidth = minImageDimensions[0];
                        attribues.imageHeight = imgE.height
                        attribues.imageWidth = imgE.width
                        errors.push(generateErrorMessage('minImageWidthHeight', attribues, message));
                    }
                    /**
                     * Max Dimensions Validation
                     */
                    if (maxImageDimensions && maxImageDimensions[0] && !maxImageDimensions[1] && imgE.width > maxImageDimensions[0]) {

                        attribues.maxImageWidth = maxImageDimensions[0];
                        attribues.imageWidth = imgE.width
                        errors.push(generateErrorMessage('maxImageWidth', attribues, message));
                    }
                    else if (maxImageDimensions && maxImageDimensions[1] && !maxImageDimensions[0] && imgE.height > maxImageDimensions[1]) {

                        attribues.maxImageHeight = maxImageDimensions[1];
                        attribues.imageHeight = imgE.height
                        errors.push(generateErrorMessage('maxImageHeight', attribues, message));
                    }
                    else if (maxImageDimensions && maxImageDimensions[1] && maxImageDimensions[0] && (imgE.height > maxImageDimensions[1] || imgE.width > maxImageDimensions[0])) {

                        attribues.maxImageWidth = maxImageDimensions[0];
                        attribues.maxImageHeight = maxImageDimensions[1];
                        attribues.imageHeight = imgE.height
                        attribues.imageWidth = imgE.width
                        errors.push(generateErrorMessage('maxImageWidthHeight', attribues, message));
                    }
                    /**
                     * exact Image Dimensions validation
                     */
                    if (exactImageDimensions && exactImageDimensions[0] && !exactImageDimensions[1] && imgE.width != exactImageDimensions[0]) {
                        attribues.imageWidth = exactImageDimensions[0];
                        errors.push(generateErrorMessage('imageWidth', attribues, message));
                    }
                    else if (exactImageDimensions && exactImageDimensions[1] && !exactImageDimensions[0] && imgE.height != exactImageDimensions[1]) {

                        attribues.imageHeight = exactImageDimensions[1];
                        errors.push(generateErrorMessage('imageHeight', attribues, message));
                    }
                    else if (exactImageDimensions && exactImageDimensions[1] && exactImageDimensions[0] && (imgE.height != exactImageDimensions[1] || imgE.width != exactImageDimensions[0])) {

                        attribues.imageWidth = exactImageDimensions[0];
                        attribues.imageHeight = exactImageDimensions[1];
                        errors.push(generateErrorMessage('imageWidthHeight', attribues, message));
                    }

                    if (crop && !cropped) {
                        errors.push(generateErrorMessage('crop', null, message));
                    }
                    /**
                     * Resolving the promise instance
                     */
                    resolve(errors.length ? errors : '');
                }

                img.src = e.target.result;
            }
            else {
                /**
                 * Resolving the promise instance
                 */
                resolve(errors.length ? errors : '');
            }

        }

        fReader.readAsDataURL(file);
    });
}

export default fileValidation;