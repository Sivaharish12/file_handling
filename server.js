require('dotenv').config()
const express=require('express')
const app=express()
const user_route=require('./Router/user');
const token_route=require('./Router/token');
const { errors } = require('celebrate');
const EventEmitter=require('events')
const fs=require('fs');
const { error } = require('console');
const fileroute=require('./Router/files')


const errorEmitter = new EventEmitter();
app.use(express.json());
app.use((req, res, next) => {
    // Attach the errorEmitter to the request object
    req.errorEmitter = errorEmitter;
    next();
});

app.use(errors());

app.use('/uploads', express.static('uploads'));
app.use('/user',user_route);
app.use('/file',fileroute);
app.use('/',token_route);




const errorFilePath = __dirname + '/uploads/error.txt';
// Event listener for the 'error' event
errorEmitter.on('error', (err) => {
    console.error(err);
    fs.appendFile(errorFilePath, `${new Date().toISOString()} - ${err.stack}\n`, (appendErr) => {
        if (appendErr) {
            console.error("Error writing to error file:", appendErr);
        }
    });
});

app.use('/',(err,req,res,next)=>{
    if (err.name === 'CelebrationError') {
        req.errorEmitter.emit('error',err.validation.message);
        return res.status(400).send(err.validation.message);
    }
    if(err) req.errorEmitter.emit('error',err.stack);
    res.status(400).send(err.message);
});


app.listen(5000);
