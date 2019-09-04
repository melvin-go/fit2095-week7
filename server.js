let express = require("express");
let bodyParser = require("body-parser");
let mongodb = require("mongodb");

let app = express();
let mongoDBClient = mongodb.MongoClient;

let taskList = [];

class Task {
    constructor (newName, assignTo, dueDate, newStatus, newDesc) {
        this.id = Math.ceil(Math.random() * 1000);
        this.name = newName;
        this.person = assignTo;
        this.date = dueDate;
        this.status = newStatus == "inProgress" ? "In-Progress" : "Completed";
        this.desc = newDesc;
    }
};

let db = null;
let col = null;
let url = "mongodb://localhost:27017";

mongoDBClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err, client) {

    db = client.db("week6lab");
    // 4. get collection
    col = db.collection("tasks");
});

//app.use(express.static("views"));
app.use(express.static("img"));
app.use(express.static("css"));
let filePath = __dirname + '/views/';

// Setup view engine
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Parse post request
app.use(bodyParser.urlencoded({
    extended:false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(filePath + 'index.html');
});

app.get('/addTask', function(req, res) {
    res.sendFile(filePath + 'addTask.html');
});

app.post('/addTask', function(req, res) {
    let newDoc = new Task(req.body.taskName, req.body.taskPerson, req.body.taskDue, req.body.taskStatus, req.body.taskDesc);
    col.insertOne(newDoc);
    // taskList.push({
    //     taskName: req.body.taskName,
    //     taskDue: req.body.taskDue,
    //     taskDesc: req.body.taskDesc
    // })
    res.redirect('/listAllTasks');
});

app.get('/listAllTasks', function(req, res){
    // res.render('listTasks.html', {list: taskList});
    col.find({}).toArray(function (err, data) {
        res.render('listTasks.html', {list: data});
    })
});

app.get('/deleteTaskById/:taskId', function(req, res) {
    console.log(req.params.taskId);
    col.deleteOne({id: {$eq: parseInt(req.params.taskId)}}, function(err, data) {
    });
    res.redirect('/listAllTasks');
});

app.get('/deleteCompleted', function(req, res) {
    col.deleteMany({status: "Completed"}, function(err, obj) {
    });
    res.redirect('/listAllTasks');
});

app.get('/updateStatus/:taskId/:newStatus', function(req, res) {
    let newStatus = "";
    if (req.params.newStatus == "Completed") {
        newStatus = "Completed";
    } else if (req.params.newStatus == "InProgress") {
        newStatus = "In-Progress";
    }

    col.updateOne({ id: {$eq: parseInt(req.params.taskId)} }, { $set: { status: newStatus } }, { upsert: false }, function (err, result) {
    });
    res.redirect('/listAllTasks');
});

app.listen(8080);