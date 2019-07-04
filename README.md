tets
maxFileSize: {
    type: Number,
    required: false,
    default: () => { return null; }
},
minFileSize: {
    type: Number,
    required: false,
    default : () => { return null; }
},
acceptedFiles: {
    type: [String, Arcreateray],
    required: false,
    default: () => { return null; }
},
minImageDimensions: {
    type: Array,
    required: false,
    default: () => { return null; },
    validator: (value) => {
        return value ? (value.length == 2) : true
    }	
},
maxImageDimensions: {
    type: Array,
    required: false,
    default: () => { return null; },
    validator: (value) => {
        return value ? (value.length == 2) : true
    }	
},
exactImageDimensions: {
    type: Array,
    required: false,
    default: () => { return null; },
    validator: (value) => {
        return value ? (value.length == 2) : true
    }	
},
