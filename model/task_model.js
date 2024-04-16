const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({

    title: {
        type: String,
    },
    description: {
        type: String
    },

    childrenTaskIds: [{
        type: String,

    }],

    parentTaskId: {
        type: String,
    }
});

const task = mongoose.model('task', taskSchema);

module.exports = task;
