let express = require("express");
let bodyParser = require("body-parser");
let mongodb = require("mongodb");
let mongoose = require("mongoose");

let Task = require('./models/task');
let Developer = require('./models/developer');

let app = express();
//let mongoDBClient = mongodb.MongoClient;

// class Task {
//     constructor (newName, assignTo, dueDate, newStatus, newDesc) {
//         this.id = Math.ceil(Math.random() * 1000);
//         this.name = newName;
//         this.person = assignTo;
//         this.date = dueDate;
//         this.status = newStatus == "inProgress" ? "In-Progress" : "Completed";
//         this.desc = newDesc;
//     }
// };

// let db = null;
// let col = null;
let url = "mongodb://" + process.argv[2] + ":27017/week7lab";

// mongoDBClient.connect(url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }, function (err, client) {

//     db = client.db("week6lab");
//     col = db.collection("tasks");
// });

mongoose.connect(url, { useNewUrlParser: true }, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("connected");
    }
});

app.use(express.static("img"));
app.use(express.static("css"));
let filePath = __dirname + '/views/';

// Setup view engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Parse post request
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(filePath + 'index.html');
});

app.get('/error', function(req, res) {
    res.sendFile(filePath + 'error.html');
});

app.get('/addTask', function(req, res) {
    res.sendFile(filePath + 'addTask.html');
});

app.post('/addTask', function(req, res) {
    let dueDate = new Date(req.body.taskDue);
    dueDate.setHours(0);

    let targetId = parseInt(req.body.taskAssignTo);

    Developer.findOne().where('devId').equals(targetId).exec(function(err, data) {
        if (err) {
            console.log(err);
        } else if (!data) {
            res.redirect('/error');
        } else {
            console.log(data);
            let randId = Math.ceil(Math.random() * 1000);
            let newStatus = (req.body.taskStatus == 'completed') ? 'Completed' : 'In-Progress';

            let task = new Task({
                _id: new mongoose.Types.ObjectId(),
                taskId: randId,
                name: req.body.taskName,
                assignTo: data.id,
                dueDate: dueDate,
                status: newStatus,
                description: req.body.taskDesc
            });

            task.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("task added");
                }
            });

            res.redirect('/listAllTasks');
        }
    });

    
});

app.get('/addDev', function(req, res) {
    res.sendFile(filePath + 'addDev.html');
});

app.post('/addDev', function(req, res) {
    let randId = Math.ceil(Math.random() * 1000);

    let developer = new Developer({
        _id: new mongoose.Types.ObjectId(),
        devId: randId,
        name: {
            firstName: req.body.devFName,
            lastName: req.body.devLName
        },
        level: req.body.devLevel,
        address: {
            state: req.body.devState,
            suburb: req.body.devSuburb,
            street: req.body.devStreet,
            unit: req.body.devUnit
        }
    });

    developer.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Developer saved");
        }
    })

    res.redirect('/listAllDevs');
});

app.get('/listAllTasks', function(req, res){
    Task.find().populate('assignTo').exec(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log();
            res.render('listTasks.html', {list: data});
        }
    });
});

app.get('/listAllDevs', function(req, res) {
    Developer.find({}, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            res.render('listDevs.html', {list: data});
        }
    });
});

app.get('/deleteTasks', function (req, res) {
    res.sendFile(filePath + 'deleteTasks.html');
});

app.post('/deleteTaskById', function(req, res) {
    Task.deleteOne({taskId: parseInt(req.body.taskId)}, function(err, data) {
        res.redirect('/listAllTasks');
    });
});

app.get('/deleteCompleted', function(req, res) {
    Task.deleteMany({"status": "Completed"}, function(err, obj) {
        res.redirect('/listAllTasks');
    });
});

app.get('/updateStatus/:taskId/:newStatus', function(req, res) {
    let newStatus = "";
    if (req.params.newStatus == "Completed") {
        newStatus = "Completed";
    } else if (req.params.newStatus == "InProgress") {
        newStatus = "In-Progress";
    }

    Task.updateOne({ id: {$eq: parseInt(req.params.taskId)} }, { $set: { status: newStatus } }, { upsert: false }, function (err, result) {
    });
    res.redirect('/listAllTasks');
});

app.get('/findNotTommorow', function(req, res) {
    let today = new Date();
    let tomDate = today.getDate() + 1;
    let tomMonth = today.getMonth() + 1;
    let tomYear = today.getFullYear();
    let tommorow =  new Date(`${tomYear}-${tomMonth}-${tomDate}`);

    tommorow.setHours(0);
    console.log(tommorow);
    
    Task.find().where('dueDate').ne(tommorow).exec(function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data[0].assignTo);
            res.render('listTasks.html', {list: data});
        }
    });
});

app.get('/updateName/:oldFirstName/:newFirstName', function(req, res) {
    Developer.updateMany({'name.firstName': req.params.oldFirstName}, {$set: {'name.firstName' : req.params.newFirstName}}, function(err) {
        res.redirect('/listAllDevs');
    });
});

app.listen(8080);