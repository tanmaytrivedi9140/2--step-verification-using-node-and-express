const express = require('express');
const bodyparser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const exphbs = require('express-handlebars');
const exp = require('constants');
const async = require('async');

// initialize redis
const redis = require("redis");
require('dotenv').config();
const port = process.env.port|| 3000;

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});
 
client.on("error", function(error) {
  console.error(error);
});


const app = express();


app.engine('handlebars',exphbs.engine({extname: "hbs", defaultLayout: false , layoutsDir: "views/ "}));
app.set('view engine' , 'handlebars');

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use('/public',express.static(path.join(__dirname, 'public')));
 

// app.get('/' ,(req,res)=>{
//     res.send("two step auth using node and express");
// })
app.listen(port , (req,res)=>{
    console.log('server started at port 3000');
})
app.get('/',function(req,res){
    res.render('contact');
});



var email;

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    service : 'Gmail',
    
    auth: {
      user: process.env.email,
      pass: process.env.password,
    }
    
});

var email;


app.post('/send',function(req,res){
    email=req.body.email;

     // send mail with defined transport object
     var otp = Math.random();
     otp = otp * 1000000;
      otp = parseInt(otp);
      console.log(otp);

      
    var mailOptions={
        to: req.body.email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
        res.render('otp');
    });
});

app.post('/verify',function(req,res){

    if(req.body.otp==otp){
        res.send("You has been successfully registered");
    }
    else{
        res.render('otp',{msg : 'otp is incorrect'});
    }
});  

app.post('/resend',function(req,res){
    var mailOptions={
        to: email,
       subject: "Otp for registration is: ",
       html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('otp',{msg:"otp has been sent"});
    });

});
