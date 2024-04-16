const mongoose = require('mongoose');

// Define Subtask Schema
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

// Create Subtask model
const task = mongoose.model('task', taskSchema);

module.exports = task;
