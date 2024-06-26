const express = require('express')
const app = express()
const cors = require("cors");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Task = require('./model/task_model');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cors());

mongoose.connect("mongodb://localhost:27017/task").then(()=>{console.log("connection done")});

app.post('/task',async(req,res)=>{
    console.log(req.body);
    try {

        const { title, description, childrenTaskIds, parentTaskId } = req.body;

        //creating  new task input to db
        const newTask = new Task({
            title,
            description,
            parentTaskId:parentTaskId
        });

        await newTask.save();
        var parentTask;

        // updating the parent that it got new child , else parent will be unaware of it .
        if (parentTaskId) {
            
            parentTask = await Task.findById(parentTaskId);

            if (parentTask) {
                parentTask.childrenTaskIds.push(newTask._id); 
                await parentTask.save();
            } else {
                return res.status(404).json({ success: false, message: "Parent task not found" });
            }
        }

        res.status(201).json({ success: true, data: {newTask , parentTask }});
    } catch (error) {
        console.error("Error saving task:", error);
        res.status(500).json({ success: false, message: "Failed to save task" });
    }
})

app.get('/task',async(req,res)=>{
    try {
        const { title } = req.query;

      
        const mainTask = await Task.findOne({ title });

        if (!mainTask) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

       
        const findChildren = async (taskId) => {
            const task = await Task.findById(taskId);
            if (!task) return [];
            console.log(typeof task)

            
            const children = await Promise.all(task.childrenTaskIds.map(findChildren));

 
            return [{ ...task.toObject(), children: children.flat() }];
        };

        
        const taskWithChildren = await findChildren(mainTask._id);

        res.json({ success: true, data: taskWithChildren });
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ success: false, message: "Failed to fetch task" });
    }

})

app.listen(8080);