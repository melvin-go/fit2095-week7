let mongoose = require('mongoose');

let taskSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    taskId: {
        type: Number
    },
    name: {
        type: String,
        required: true
    },
    assignTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DevCollection'
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    description: String
});

module.exports = mongoose.model("TaskCollection", taskSchema, 'Task');