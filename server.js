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
let url = "mongodb://" + process.argv[2] + ":27017/";

mongoDBClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err, client) {

    db = client.db("week6lab");
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
    let dueDate = new Date(req.body.taskDue);
    dueDate.setHours(0);

    let newDoc = new Task(req.body.taskName, req.body.taskPerson, dueDate, req.body.taskStatus, req.body.taskDesc);

    col.insertOne(newDoc);
    res.redirect('/listAllTasks');
});

app.get('/listAllTasks', function(req, res){
    col.find({}).toArray(function (err, data) {
        res.render('listTasks.html', {list: data});
    })
});

app.get('/deleteTasks', function (req, res) {
    res.sendFile(filePath + 'deleteTasks.html');
});

app.post('/deleteTaskById', function(req, res) {
    col.deleteOne({id: {$eq: parseInt(req.body.taskId)}}, function(err, data) {
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

app.get('/findNotTommorow', function(req, res) {
    let today = new Date();
    let tomDate = today.getDate() + 1;
    let tomMonth = today.getMonth() + 1;
    let tomYear = today.getFullYear();
    let tommorow =  new Date(`${tomYear}-${tomMonth}-${tomDate}`);

    tommorow.setHours(0);
    console.log(tommorow);
    
    col.find({date: {$ne: tommorow}}).toArray(function (err, data) {
        res.render('listTasks.html', {list: data});
    });
});

app.listen(8080);