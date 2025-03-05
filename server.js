require('dotenv').config();

//access modules
const express = require('express'), 
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors');

app = express();

app.use(cors())

app.use(bodyParser.json());

//create log stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'}); 

//logstream middleware
app.use(morgan('combined', {stream: accessLogStream})); 

app.use(express.static('public'));

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal server error');
  });

//routes
app.use('/api', require('./routes/routes'));

const port = process.env.PORT || 8080;
app.listen(port,'0.0.0.0', () => {
    console.log('Listening on port: ' + port);
})