let express = require("express");
let bodyParser = require("body-parser");

let app = express();

let taskList = [];

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
    taskList.push({
        taskName: req.body.taskName,
        taskDue: req.body.taskDue,
        taskDesc: req.body.taskDesc
    })
    res.render('listTasks.html', {list: taskList});
});

app.get('/listAllTasks', function(req, res){
    res.render('listTasks.html', {list: taskList});
});

app.listen(8080);