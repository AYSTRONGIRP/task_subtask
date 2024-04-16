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


        const newTask = new Task({
            title,
            description,
            parentTaskId:parentTaskId
        });

        await newTask.save();
        var parentTask;
        if (parentTaskId) {
            // Find the parent task by its _id
            parentTask = await Task.findById(parentTaskId);

            // If the parent task is found, add the new task to its childrenTaskIds
            if (parentTask) {
                parentTask.childrenTaskIds.push(newTask._id); // Assuming childrenTaskIds is an array of ObjectIds
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

         
            const children = await Promise.all(task.childrenTaskIds.map(findChildren));

 
            return [{ ...task.toObject(), children }];
        };

        // Find all children and subchildren of the main task
        const taskWithChildren = await findChildren(mainTask._id);

        res.json({ success: true, data: taskWithChildren });
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ success: false, message: "Failed to fetch task" });
    }

})

app.listen(8080);