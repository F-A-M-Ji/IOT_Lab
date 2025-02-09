
require('dotenv').config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
var multer = require('multer')();
const FormData = require('form-data');
const Axios = require('axios');
const mongoose = require("mongoose");
const Fs = require('fs');
const { Client } = require('ssh2');
const path = require("path");
const hbs = require("hbs");
const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")
const Register = require("../src/models/registers")
const ModelLocation = require("../src/models/modelLocation")
const ModelLocationPerPerson = require("../src/models/modelLocationPerPerson")
const ipLink = require("../src/models/ipLink")
const sensorDBModel = require("../src/models/Sensors")
const loging = require("../src/models/loging")
const recordModel = require("../src/models/recording")
const foundPersonLogs= require("../src/models/foundPersonLogs")
const unknownLog= require("../src/models/unknown")
const staff= require("../src/models/staff")
//const cctv= require("../src/models/CCTV")
const sensorstatus= require("../src/models/sensorStatus");
const managementlog= require("../src/models/managementLog");
let mqttConnection = require("../src/connectMQTT");


let alert = require('alert'); 

let app = require("../src/app");
const fs = require('fs');
const shell = require('shelljs')

let chirpstack  = require('../controllers/api/chirpstack');
let user = require('../controllers/api/mobile/manage_user');
let device = require('../controllers/api/mobile/manage_device');

const {auth,auth_del_model,auth_add_model,auth_admin,auth_executive,auth_attendant,auth_guard} = require('../src/middleware/auth.js')
router = express()
//console.log(process.env.SECRET_KEY);
router.use(express.json());
router.use(cookieParser());
router.use(express.urlencoded({ extended: false }));
router.use(express.static(static_path));
router.use(express.static('/images'));
router.set("view engine", "hbs");
router.set("views", template_path);
hbs.registerPartials(partials_path);



var node0_status_old={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};
var node1_status_old={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};
var node2_status_old={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};
var node3_status_old={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};



var node0_status={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};
var node1_status={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};
var node2_status={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};
var node3_status={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};

var node0_sum=[{count:"",wifimacaddr:"",wifiRSSI:"",time:""}];
var node1_sum=[{count:"",wifimacaddr:"",wifiRSSI:"",time:""}];
var node2_sum=[{count:"",wifimacaddr:"",wifiRSSI:"",time:""}];
var node3_sum=[{count:"",wifimacaddr:"",wifiRSSI:"",time:""}];

var node0_wifimacaddrs=[];
var node1_wifimacaddrs=[];
var node2_wifimacaddrs=[];
var node3_wifimacaddrs=[];

var node0_RSSI=[];
var node1_RSSI=[];
var node2_RSSI=[];
var node3_RSSI=[];


var node0_time=[];
var node1_time=[];
var node2_time=[];
var node3_time=[];

var node0_count=[];
var node1_count=[];
var node2_count=[];
var node3_count=[];
var count0=0;
var count1=0;
var count2=0;
var count3=0;


router.get("/personloging",auth_admin,async (req, res) => {
    //const log = await loging.find();
    const log = await foundPersonLogs.find();
   // console.log(log);
    res.render("admin/foundpersonlog",{user:req.user,log:log})
});


router.get("/playback",auth_admin,async (req, res) => {
    //const log = await loging.find();
    //const log = await recordModel.find();
    const log = await recordModel.find({name: req.query.cctv});
   // console.log(log);
    res.render("admin/playback",{user:req.user,log:log})
});


router.get("/show_image",auth_admin,async (req, res) => {
    //const log = await loging.find();
    console.log("AAAAAAAAAAAAAAAAAAAAAAA0000");
    console.log(req.query.id);
    console.log("AAAAAAAAAAAAAAAAAAAAAAA11111");
    res.render("admin/admin_show_image",{user:req.user,id:req.query.id})
});

router.get("/play_video",auth_admin,async (req, res) => {
    //const log = await loging.find();
    console.log("AAAAAAAAAAAAAAAAAAAAAAA0000");
    console.log(req.query.id);
    console.log("AAAAAAAAAAAAAAAAAAAAAAA11111");
    res.render("admin/admin_play_video",{user:req.user,cctv:req.query.cctv,filename:req.query.filename})
});

router.get("/video",auth_admin,async (req, res) => {
    console.log("AAAAAAAAAAAAAAAAAAAAAAA0000VVVVVVVVVVV",req.query.cctv);  
    console.log("AAAAAAAAAAAAAAAAAAAAAAA0000VVVVVVVVVVVFFFFF",req.query.filename); 
  const path = "/home/imb/new_version/V10/rec_part/videoCCTV/"+req.query.cctv+"/V"+req.query.filename+".mp4";
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : fileSize-1
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
});

router.get("/sensorlog",auth_admin,async (req, res) => {
    //const log = await loging.find();
    const log = await sensorstatus.find();
    //console.log(log);
    res.render("admin/sensorlog",{user:req.user,log:log})
});
router.get("/managementloging",auth_admin,async (req, res) => {
    //const log = await loging.find();
    const log = await managementlog.find();
    //console.log(log)
    res.render("admin/managementlog",{user:req.user,log:log})
});




router.get("/test_hbs", (req, res) => { 
    var templog=[];
    var log=[];
    for(var i = 0; i < 50;i++){
        templog = {name: "AAA"};
        templog.time="\""+i+"\"";
        templog.cam="ASD";
        if(log==[]){
            log=templog;
        }else{
            log.push(templog);
        }
       
    
       // console.log(log)
        
    }
   //console.log(log);
    res.render("test_hbs",{log:log}) 

});

router.get("/test_hbs1", (req, res) => { 
    
    
    res.render("test_hbs1") 

});

router.get("/", (req, res) => { 
     res.render("login") 
});
router.get("/aboutus", (req, res) => { res.render("aboutus"), { title: "aboutus" } });
router.get("/register", (req, res) => { res.render("register", { title: "register" }) });
router.get("/forgotpsw", (req, res) => { res.render("forgotpsw", { title: "forgotpsw" }) });
router.get("/logout", auth, async(req, res) => {
   // console.log("loggout111111");
   // console.log(req.user.name);
   // console.log("loggout22222");
    try {
        //logout from current device
        // req.user.tokens = req.user.tokens.filter((currElement) => {
        //     return currElement.token !== req.token
        // })

        //logout from all devices
        req.user.tokens = []
        res.clearCookie("jwt");
       // console.log("logout successfull");
        await req.user.save();
        res.redirect("/");
    } catch (error) {
        res.status(500).send(error);
    }
})


//admin page
router.get("/mobile_admin_home",async (req, res) => {
    const cameras = await ipLink.find();
    //console.log("11111111111111111111111111 "+cameras);
    var camerasNew=[];
    var temp;
    var tempLink;
    for (const cam of cameras) {  
        
        try {
            temp = {name: cam.name}
            temp._id=cam._id;
            temp.time=cam.time;
            temp.rtspLink=cam.rtspLink;
            temp.rtspPredLink=cam.rtspPredLink;
            temp.apiLink=cam.apiLink;
            temp.__v=cam.__v;

            tempLink="http://"+myaddress+":5000/video_feed/";
                //   console.log(typeof(camera[0]));
            temp["apiShortLink"]=tempLink+temp.name;
            //console.log(temp);
            if(camerasNew!=[]){
                camerasNew.push(temp);
            }else{
                camerasNew=temp;
            }
        } catch (error) {
            
        }
    }
    
   // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    //console.log(camerasNew);
    //console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
    res.render("admin/mobile_admin_home",{user:req.user,camera:camerasNew})
});


//admin page
router.get("/mobile_admin_lrmon",async (req, res) => {
    
    res.render("admin/mobile_admin_home_longrangesensors",{user:req.user,node0_status:node0_status,node1_status:node1_status,node2_status:node2_status,node3_status:node3_status,node0_sum,node1_sum,node2_sum,node3_sum})
});




//admin page
router.get("/admin_home", auth_admin,async (req, res) => {
//router.get("/admin_home", async (req, res) => {

    const conn = new Client();
    conn.on('ready', () => {
       // console.log('Client :: ready');
        conn.shell((err, stream) => {
                if (err) throw err;
                    stream.on('close', () => {
                    console.log('Stream :: close');
                    conn.end();
                }).on('data', (data) => {
                    console.log('OUTPUT: ' + data);
                });
              
                stream.end('/home/imb/new_version/V10/stream/pyrtsp/stop_start_streaming\n');

            });
        }).connect({
            host: '127.0.0.1',
            port: 22,
            username: 'imb',
            password: 'roboteng',
    });


    /////////////////


   




    const cameras = await ipLink.find();
    console.log(cameras);
    var camerasNew=[];
    var temp;
    var tempLink;
    for (const cam of cameras) {  
        
        try {
            temp = {name: cam.name}
            temp._id=cam._id;
            temp.time=cam.time;
            temp.rtspLink=cam.rtspLink;
            temp.rtspPredLink=cam.rtspPredLink;
            temp.apiLink=cam.apiLink;
            temp.__v=cam.__v;

            tempLink="http://"+myaddress+":5000/video_feed/";
                //   console.log(typeof(camera[0]));
            temp["apiShortLink"]=tempLink+temp.name;
            console.log(temp);
            if(camerasNew!=[]){
                camerasNew.push(temp);
            }else{
                camerasNew=temp;
            }
        } catch (error) {
            
        }
    }
    
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    console.log(camerasNew);
    console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
    res.render("admin/admin_home",{user:req.user,camera:camerasNew})
});

var proc="";

async function init() {
    console.log("11111111111111111111111111111111111111111");
    await sleep(10000);
    console.log("222222222222222222222222222222222222222");
}

function sleep(ms) {
return new Promise((resolve) => {
    setTimeout(resolve, ms);
});
}

router.get("/cam_streaming_init", auth_admin,async (req, res) => {
    ///
    const conn = new Client();
    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.shell((err, stream) => {
                if (err) throw err;
                    stream.on('close', () => {
                    console.log('Stream :: close');
                    conn.end();
                }).on('data', (data) => {
                    console.log('OUTPUT: ' + data);
                });
              
                stream.end('/home/imb/new_version/V10/stream/pyrtsp/stop_start_streaming\n');

            });
        }).connect({
            host: '127.0.0.1',
            port: 22,
            username: 'imb',
            password: 'roboteng',
    });
    res.render("admin/admin_home",{user:req.user})
});


router.get("/admin_home_4", auth_admin,async (req, res) => {
    //router.get("/admin_home", async (req, res) => {

    //start Streaming 
 /*
    const conn = new Client();
    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.shell((err, stream) => {
                if (err) throw err;
                    stream.on('close', () => {
                    console.log('Stream :: close');
                    conn.end();
                }).on('data', (data) => {
                    console.log('OUTPUT: ' + data);
                });
                stream.end('python3 /home/imb/V10/stream/pyrtsp/web_streaming_http.py \n');
            });
        }).connect({
            host: '127.0.0.1',
            port: 22,
            username: 'imb',
            password: 'roboteng',
    });
*/

    

    



    /// sleep 


    
/* clear unknown
    //const unknown2 = await unknownLog.drop();
    
    const unknowns = await unknownLog.find();
    
    for (const ulog of unknowns) { 
        console.log(ulog);
        await unknownLog.updateOne({_id: ulog._id}, {
            $set: { count: 0 },
            function(err, res) {
                if (err) throw err;
            }
        });

    }
*/    
    console.log("HHHHHHHHHHHHHHHHHHHHHHHHH");

        const cameras = await ipLink.find();
       // console.log(cameras);
        var camerasNew=[];
        var temp;
        var tempLink;
        for (const cam of cameras) {  
            
            try {
                temp = {name: cam.name}
                temp._id=cam._id;
                temp.time=cam.time;
                temp.rtspLink=cam.rtspLink;
                temp.rtspPredLink=cam.rtspPredLink;
                temp.apiLink=cam.apiLink;
                temp.__v=cam.__v;
    
                tempLink="http://"+myaddress+":5000/video_feed/";
                    //   console.log(typeof(camera[0]));
                temp["apiShortLink"]=tempLink+temp.name;
               // console.log(temp);
                if(camerasNew!=[]){
                    camerasNew.push(temp);
                }else{
                    camerasNew=temp;
                }
            } catch (error) {
                
            }
        }
        
       // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
       // console.log(camerasNew);
       // console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
        res.render("admin/admin_home_4",{user:req.user,camera:camerasNew})
    });



function get_status(sensors){
    var current_time = Number(Math.floor(new Date() / 1000))
        
        check0=0;
        check1=0;
        check2=0;
        check3=0; 
       
        node0_status_old=node0_status;
        node1_status_old=node1_status;
        node2_status_old=node2_status;
        node3_status_old=node3_status;
        
        node0_status={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};
        node1_status={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};  
        node2_status={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};
        node3_status={pir:"",speech:"",cam:"",wifimacaddr:"",wifiRSSI:"",time:""};


        for (const sensor of sensors) {  
           
            let record_time=Number(sensor.timesecond);
            //console.log(record_time);
            //console.log(current_time);
            let timediff=(current_time-record_time)/60;
            if(timediff <3.0) {
                //console.log(sensor.pir+"  time:  ", sensor.time+ "  "+timediff);
                if ((sensor.id=='0')&&(check0==0)){
                    node0_status.pir=sensor.pir;
                    node0_status.speech=sensor.speech;
                    node0_status.cam=sensor.cam;
                    node0_status.wifimacaddr=sensor.wifimacaddr;
                    node0_status.RSSI=sensor.wifiRSSI;
                    node0_status.time=sensor.time;
                    check0='1';
                    
                }
                if ((sensor.id=='1')&&(check1==0)){
                    node1_status.pir=sensor.pir;
                    node1_status.speech=sensor.speech;
                    node1_status.cam=sensor.cam;
                    node1_status.wifimacaddr=sensor.wifimacaddr;
                    node1_status.RSSI=sensor.wifiRSSI;
                    node1_status.time=sensor.time;
                    check1='1';      
                }
                if ((sensor.id=='2')&&(check2==0)){
                    node2_status.pir=sensor.pir;
                    node2_status.speech=sensor.speech;
                    node2_status.cam=sensor.cam;
                    node2_status.wifimacaddr=sensor.wifimacaddr;
                    node2_status.RSSI=sensor.wifiRSSI;
                    node2_status.time=sensor.time;
                    check2='1';      
                }
                if ((sensor.id=='3')&&(check3==0)){
                    node3_status.pir=sensor.pir;
                    node3_status.speech=sensor.speech;
                    node3_status.cam=sensor.cam;
                    node3_status.wifimacaddr=sensor.wifimacaddr;
                    node3_status.RSSI=sensor.wifiRSSI;
                    node3_status.time=sensor.time;
                    check3='1';      
                }
            }   
        }    
        if(check0=='0'){
            if((node0_status_old.time-current_time)/60<3.0){

                node0_status=node0_status_old;
            }
        }
        if(check1=='0'){
            if((node1_status_old.time-current_time)/60<3.0){

                node1_status=node1_status_old;
            }
        }
        if(check2=='0'){
            if((node2_status_old.time-current_time)/60<3.0){

                node2_status=node2_status_old;
            }
        }

        if(check3=='0'){
            if((node3_status_old.time-current_time)/60<3.0){

                node3_status=node3_status_old;
            }
        }
        //WIFI mac addr list 
        node0_wifimacaddrs=[];
        node1_wifimacaddrs=[];
        node2_wifimacaddrs=[];
        node3_wifimacaddrs=[];
        node0_RSSI=[];
        node1_RSSI=[];
        node2_RSSI=[];
        node3_RSSI=[];
        node0_time=[];
        node1_time=[];
        node2_time=[];
        node3_time=[];
        node0_count=[];
        node1_count=[];
        node2_count=[];
        node3_count=[];
        count0=0;
        count1=0;
        count2=0;
        count3=0;
        for (const sensor of sensors) {  
            let record_time=Number(sensor.timesecond);
            let timediff=(current_time-record_time)/60;
            if(timediff <3.0) {
                if (sensor.id=='0'){
                    node0_wifimacaddrs.push(sensor.wifimacaddr);
                    node0_RSSI.push(sensor.wifiRSSI);
                    node0_time.push(sensor.time);
                    count0=count0+1;
                    node0_count.push(count0);
                }
                if (sensor.id=='1'){
                    node1_wifimacaddrs.push(sensor.wifimacaddr);
                    node1_RSSI.push(sensor.wifiRSSI);
                    node1_time.push(sensor.time);
                    count1=count1+1;
                    node1_count.push(count1);
                }
                if (sensor.id=='2'){
                    node2_wifimacaddrs.push(sensor.wifimacaddr);
                    node2_RSSI.push(sensor.wifiRSSI);
                    node2_time.push(sensor.time);
                    count2=count2+1;
                    node2_count.push(count2);
                }
                if (sensor.id=='3'){
                    node3_wifimacaddrs.push(sensor.wifimacaddr);
                    node3_RSSI.push(sensor.wifiRSSI);
                    node3_time.push(sensor.time);
                    count3=count3+1;
                    node3_count.push(count3);
                }
            }
        }
        //console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1111");
        //console.log(node0_time);
        node0_sum=[];
        for (let item of node0_count) {
            let temp={count:item,wifimacaddr:node0_wifimacaddrs[item-1],wifiRSSI:node0_RSSI[item-1],time:node0_time[item-1].substring(0,24)}; 
            ///console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            node0_sum.push(temp)
            //console.log(temp);

        }

        node1_sum=[];
        for (let item of node1_count) {
            let temp={count:item,wifimacaddr:node1_wifimacaddrs[item-1],wifiRSSI:node1_RSSI[item-1],time:node1_time[item-1]}; 
            ///console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            node1_sum.push(temp)
            //console.log(temp);

        }  

        node2_sum=[];
        for (let item of node2_count) {
            let temp={count:item,wifimacaddr:node2_wifimacaddrs[item-1],wifiRSSI:node2_RSSI[item-1],time:node2_time[item-1]}; 
            ///console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            node2_sum.push(temp)
            //console.log(temp);

        }
        
        node3_sum=[];
        for (let item of node3_count) {
            let temp={count:item,wifimacaddr:node3_wifimacaddrs[item-1],wifiRSSI:node3_RSSI[item-1],time:node3_time[item-1]}; 
            ///console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            node3_sum.push(temp)
            //console.log(temp);

        }   



        //////
        //console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
       // console.log("node0");
       // console.log(node0_status);
       // console.log("node1");
       // console.log(node1_status);
       // console.log("node2");
       // console.log(node2_status);
       // console.log("node3");
       // console.log(node3_status);

}


router.get("/admin_home_longrangesensors", auth_admin,async (req, res) => {



        //const sensors = await sensorstatus.find().limit(100).sort({_id: -1});
        //const sensors = await sensorstatus.find({id:'3'}).limit(5).sort({_id: -1});
        //console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
        //console.log(sensors);
        //console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK111111111111111111111");
        //get_status(sensors);
        //filter winthin 1 minute for PIR
        //var node_status;
        //node_status.
        
        
        //res.render("admin/admin_home_longrangesensors",{user:req.user,node0_status:node0_status,node1_status:node1_status,node2_status:node2_status,node3_status:node3_status,node0_wifimacaddrs:node0_wifimacaddrs,node1_wifimacaddrs:node1_wifimacaddrs,node2_wifimacaddrs:node2_wifimacaddrs,node3_wifimacaddrs:node3_wifimacaddrs,node0_RSSI:node0_RSSI,node1_RSSI:node1_RSSI,node2_RSSI:node2_RSSI,node3_RSSI:node3_RSSI,node0_time:node0_time,node1_time:node1_time,node2_time:node2_time,node3_time:node3_time,node0_count:node0_count,node1_count:node1_count,node2_count:node2_count,node3_count:node3_count});
        res.render("admin/admin_home_longrangesensors",{user:req.user,node0_status:node0_status,node1_status:node1_status,node2_status:node2_status,node3_status:node3_status,node0_sum,node1_sum,node2_sum,node3_sum})
});

router.get("/admin_home_longrangesensors_4", auth_admin,async (req, res) => {
    const cameras = await ipLink.find();
   //    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    res.render("admin/admin_home_longrangesensors_4",{user:req.user,camera:cameras})
});
   
       

//system setting for admin
router.get("/admin_cctv", auth_admin, async(req, res) => {
    try {
        
        const result = await ipLink.find();
        res.render("admin_cctv",{ user: req.user, result: result });
         
    } catch (error) {
        //console.log(error);
        res.send("Bad request");
    }
});

router.get("/mobile_admin_cctv",async(req, res) => {
    try {
        
        const result = await ipLink.find();
        res.render("mobile_admin_cctv",{ user: req.user, result: result });
         
    } catch (error) {
        //console.log(error);
        res.send("Bad request");
    }
});


router.get("/admin_user", auth_admin, async(req, res) => {
    try {
        const member = await Register.find();
        
        res.render("admin_user",{ user: req.user, member: member});
         
    } catch (error) {
       // console.log(error);
        res.send("Bad request");
    }
});


router.get("/admin_sensor", auth_admin, async(req, res) => {
    try {
     
        const sensors = await sensorDBModel.find();
        res.render("admin_sensor",{ user: req.user, sensor: sensors});
         
    } catch (error) {
        //console.log(error);
        res.send("Bad request");
    }
});


router.get("/mobile_admin_sensor", async(req, res) => {
    try {
     
        const sensors = await sensorDBModel.find();
        res.render("mobile_admin_sensor",{ user: req.user, sensor: sensors});
         
    } catch (error) {
        //console.log(error);
        res.send("Bad request");
    }
});


router.get("/admin_staff", auth_admin, async(req, res) => {
    try {
       
        const result = await staff.find();
        res.render("admin_staff",{ user: req.user,result: result});
         
    } catch (error) {
       // console.log(error);
        res.send("Bad request");
    }
});

router.get("/admin_model", auth_admin, async(req, res) => {
    try {
        
        const result = await ModelLocation.find();
        
        
        res.render("admin_model",{ user: req.user, result: result});
         
    } catch (error) {
       // console.log(error);
        res.send("Bad request");
    }
});


router.get("/admin_training", auth_admin, async(req, res) => {
    
    const conn = new Client();
    conn.on('ready', () => {
        console.log('Client :: ready');
        conn.shell((err, stream) => {
                if (err) throw err;
                    stream.on('close', () => {
                    console.log('Stream :: close');
                    conn.end();
                }).on('data', (data) => {
                    console.log('OUTPUT: ' + data);
                });
                stream.end('/home/imb/new_version/V10/Training_Server/stop_start_training\n');
                

            });
        }).connect({
            host: '127.0.0.1',
            port: 22,
            username: 'imb',
            password: 'roboteng',
    });
   

      

    /////////////////////////////////

    try {
        const result = await ModelLocation.find();
        //console.log("Admin Traing11111");
       // console.log(req.user);
        //console.log("Admin Traing2222");

        res.render("admin_training",{ user: req.user, result: result});
         
    } catch (error) {
        console.log(error);
        res.send("Bad request");
    }
});



router.get("/admin_recording", auth_admin, async(req, res) => {
    
    
    /////////////////////////////////

    try {
        const result = await ipLink.find();
        //console.log("Admin Traing11111");
       // console.log(req.user);
        //console.log("Admin Traing2222");

        res.render("admin_recording",{ user: req.user, result: result});
         
    } catch (error) {
        console.log(error);
        res.send("Bad request");
    }
});


router.get("/admin_training_per_person", auth_admin, async(req, res) => {
    try {
        const result = await ModelLocationPerPerson.find();
        //console.log("Admin Traing11111");
       // console.log(req.user);
        //console.log("Admin Traing2222");

        res.render("admin_training_per_person",{ user: req.user, result: result});
         
    } catch (error) {
        console.log(error);
        res.send("Bad request");
    }
});



//updatePositon post (update position)
router.post("/updatePositon", auth_admin, async(req, res) => {
    try {
        const email = req.body.email;
        console.log(email);
        const position = req.body.position;
        console.log(position);
        const user2 = await Register.findOne({ email: email });
        await Register.updateOne({ email: user2.email }, {
            $set: { position: position },
            function(err, res) {
                if (err) throw err;
            }
        });
        res.redirect("/adreq")
    } catch (error) {
        res.redirect("/adreq")
    }
});


//delete model post many ERROR 9/04
//router.post("/delete_model/:_id", auth_del_model, async(req, res) => {    
router.post("/delete_model/:_id", auth_admin, async(req, res) => {         
    const check = await ModelLocation.countDocuments();
    if(check>=1){
        const id = req.params._id;
        const user = await ModelLocation.findOne({ _id: id });
        /*const response = await Axios.post('http://127.0.0.1:9997/delete/'+user.name, { responseType: 'stream'}).then(() => 
        { 
            const p = path.resolve("../stream/pyrtsp/"+'trained_knn_model.clf')
            const writer = Fs.createWriteStream(p)

            return Axios({
                method: 'get',
                url: 'http://192.168.43.21:9997/download_model',
                responseType: 'stream',
            }).then(response => {

                //ensure that the user can call `then()` only when the file has
                //been downloaded entirely.

                return new Promise((resolve, reject) => {
                    response.data.pipe(writer);
                    let error = null;
                    writer.on('error', err => {
                        error = err;
                        writer.close();
                        reject(err);
                    });
                    writer.on('close', () => {
                        if (!error) {
                        resolve(true);
                        }
                        //no need to call the reject here, as it will have been called in the
                        //'error' stream;
                    });

                    ModelLocation.deleteOne(user).then(() => { res.status(201) })
                });
            });

        });*/
        ModelLocation.deleteOne(user).then(() => { res.status(201) })
    }else{
            res.redirect("/admin_training")
    }      

});



router.post("/clean_model", auth_admin, async(req, res) => {         
    
  //  console.log('CLLLLLLLLLLLLLL');

    const dir = '../Training_Server/PicForTrain';
    if (fs.existsSync(dir)){
      //  console.log("rmmmm "+dir);
        fs.rm(dir, { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
        });
    }
    if (!fs.existsSync(dir)){
      //  console.log("CRrrrr "+dir);
        fs.mkdirSync(dir);
    }

    var query = {};
    ModelLocation.deleteMany(query , (err , collection) => {
		if(err) throw err;
		
	});    

    res.redirect("/admin_training");
    
});



router.post("/delete_model_per_person/:_id", auth_admin, async(req, res) => {         
    const check = await ModelLocationPerPerson.countDocuments();
    if(check>=1){
        const id = req.params._id;
        const user = await ModelLocationPerPerson.findOne({ _id: id });
        /*const response = await Axios.post('http://127.0.0.1:9997/delete/'+user.name, { responseType: 'stream'}).then(() => 
        { 
            const p = path.resolve("../stream/pyrtsp/"+'trained_knn_model.clf')
            const writer = Fs.createWriteStream(p)

            return Axios({
                method: 'get',
                url: 'http://192.168.43.21:9997/download_model',
                responseType: 'stream',
            }).then(response => {

                //ensure that the user can call `then()` only when the file has
                //been downloaded entirely.

                return new Promise((resolve, reject) => {
                    response.data.pipe(writer);
                    let error = null;
                    writer.on('error', err => {
                        error = err;
                        writer.close();
                        reject(err);
                    });
                    writer.on('close', () => {
                        if (!error) {
                        resolve(true);
                        }
                        //no need to call the reject here, as it will have been called in the
                        //'error' stream;
                    });

                    ModelLocation.deleteOne(user).then(() => { res.status(201) })
                });
            });

        });*/
        ModelLocationPerPerson.deleteOne(user).then(() => { res.status(201) })
    }else{
            res.redirect("/admin_training_per_person")
    }      

});



//iplinksave post
router.post("/ipLinkSave", auth_admin, async(req, res) => {
    
    try {
       // console.log(req.body.apilink)
        //console.log(req.body.cctv_name)

        const saveIp = new ipLink({
            name: req.body.cctv_name,
            apiLink: req.body.apilink,
            recordStatus:'0',
         })
        ///console.log(saveIp);
        
        const ipSaved = await saveIp.save();
        var date_ob = new Date();  
        const saveLog = new managementlog({
            username:req.user.email,
            devicename: req.body.cctv_name,
            type: "cctv",
            time: date_ob,
            action: "เพิ่ม "+req.body.apilink,
            
        })
        ///console.log(saveIp);
        
        const logSaved = await saveLog.save();

        //console.log(ipSaved);
       // console.log("Added");
        res.redirect("/admin_cctv");

        

    } catch (error) {
        console.log("errorpart", error);
        res.status(400).send(error).end();
    }
});



//edit_cam post
router.post("/edit_cam", auth_admin, async(req, res) => {
    try {
        const time = req.body.time;
        const time_del = req.body.time_del;
        const time_edit = await ipLink.find({}, { "_id": 0, "rtspLink": 0, "__v": 0, "name": 0, "apiLink": 0 })
        await ipLink.updateMany({}, {
            $set: {
                time: time,
                time_del: time_del
            },
            function(err, res) {
                if (err) throw err;
            }
        }).then(() => { res.status(201).redirect("/adreq") })
    } catch (error) {
        res.send("Edit cam error");
    }
});



//delete camera
router.post("/delete_cam/:_id",auth_admin,async(req, res) => {

   // console.log("req.params._id  " +req.params._id);
    try {
        const id = req.params._id;
        const cam = await ipLink.findOne({ _id: id });
     //   console.log(cam)
        await ipLink.deleteOne(cam)
            //.then(() => { res.status(201).redirect("/adreq") })
        
        var date_ob = new Date();   
        const saveLog = new managementlog({
            username:req.user.email,
            devicename:cam.name,
            type: "cctv",
            time: date_ob,
            action: "ลบ "+cam.apiLink,
            
        })
        const logSaved = await saveLog.save();

    } catch (error) {
        res.send("Delete cam error");
    }
});


//delete sensor
router.post("/delete_sensor/:_id",auth_admin,async(req, res) => {
   // console.log("sensorLLLL");
    try {
        const id = req.params._id;
        const sensor_obj = await sensorDBModel.findOne({ _id: id });
     //   console.log(sensor_obj)
        await sensorDBModel.deleteOne(sensor_obj)
            //.then(() => { res.status(201).redirect("/adreq") })
            
        var date_ob = new Date();   
        const saveLog = new managementlog({
            username:req.user.email,
            devicename:sensor_obj.ADDR,
            type: "Long Range Sensor",
            time: date_ob,
            action: "ลบ "+sensor_obj.ADDR,
            
        })
        const logSaved = await saveLog.save();
    } catch (error) {
        res.send("Delete sensor error");
    }
});


//delete user
router.post("/delete_member/:_id",auth_admin,async(req, res) => {
   // console.log("sensorLLLL");
    try {
        const id = req.params._id;
        const member_obj = await Register.findOne({ _id: id });
     //   console.log(member_obj)
        await Register.deleteOne(member_obj)
            //.then(() => { res.status(201).redirect("/adreq") })
        
        var date_ob = new Date();  
        const saveLog = new managementlog({
            username:req.user.email,
            devicename: member_obj.email,
            type: "user",
            time: date_ob,
            action: "ลบ "+ member_obj.email,
            
        })
        ///console.log(saveIp);
        
        const logSaved = await saveLog.save();

    } catch (error) {
        res.send("Delete member error");
    }
});


//delete staff
router.post("/delete_staff/:_id",auth_admin,async(req, res) => {
   // console.log("sensorLLLL");
    try {
        const id = req.params._id;
        const staff_obj = await staff.findOne({ _id: id });
     //   console.log(staff_obj)
        await staff.deleteOne(staff_obj)
            //.then(() => { res.status(201).redirect("/adreq") })
            
        var date_ob = new Date();  
        const saveLog = new managementlog({
            username:req.user.email,
            devicename: staff_obj.name,
            type: "staff",
            time: date_ob,
            action: "ลบ "+staff_obj.name + "  "+staff_obj.surname,
            
        })
        const logSaved = await saveLog.save();
        
    } catch (error) {
        res.send("Delete staff error");
    }
});

//delete model
router.post("/delete_model/:_id",auth_admin,async(req, res) => {
   // console.log("sensorLLLL");
    try {
        const id = req.params._id;
        const model_obj = await ModelLocation.findOne({ _id: id });
     //   console.log(model_obj)
        await ModelLocation.deleteOne(model_obj)
            //.then(() => { res.status(201).redirect("/adreq") })
            

    } catch (error) {
        res.send("Delete model error");
    }
});





//delete user(ban)
router.post("/ban/:_id", auth_admin, async(req, res) => {
    try {
        const userId = req.params._id;
       // console.log(userId);
        const user = await Register.findOne({ _id: userId });
        await Register.deleteOne({ email: user.email })
            //.then(() => { res.status(201).redirect("/adreq") })
            .catch((err) => {
                console.log(err);
            });

    } catch (error) {
        res.send("Ban user error");
    }
});



//////////////////////////////////////////////////////////////////////////////////////////////////////






//executive page
router.get("/executive_home", auth_executive,async (req, res) => {
    const camera = await ipLink.find();
    const result = await ModelLocation.find();
    res.render("executive/executive_home", { result: result, user: req.user, camera: camera })
});

//attendant page
router.get("/attendant_home", auth_attendant,async (req, res) => {
    const camera = await ipLink.find();
    const result = await ModelLocation.find();
    res.render("attendant/attendant_home", { result: result, user: req.user, camera: camera })
});

//guard page
router.get("/guard_home", auth_guard,async (req, res) => {
    const camera = await ipLink.find();
    res.render("guard/guard_home", { user: req.user, camera: camera })
});






















/*var nodemailer = require("nodemailer");
var rand;
var host;
var mailOptions;*/

//register post
router.post("/register", async(req, res) => {
    vemail = req.body.email;
    try {
        rand = Math.floor((Math.random() * 100) + 54);
        //console.log(req.body.name);
       // console.log("Number is: " + rand);
        const psw = req.body.psw;
        const pswrepeat = req.body.pswrepeat;

        if (psw === pswrepeat) {
            const registerEmployee = new Register({
                    email: req.body.email,
                    name: req.body.name,
                    position: "",
                    psw: psw,
                    pswrepeat: pswrepeat,
                    isVerified: true,
                    verifyNumber: rand,
                    isPwResetRequested: false
                })
                //console.log("Number is: " + verifyNumber);
            console.log(registerEmployee);

            const token = await registerEmployee.gentok(req, res);
            console.log(token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true,
                secure: true
            });
            //console.log(cookie); //{
            //  expires: new Date(Date.now() + 3000),
            //})

            const registered = await registerEmployee.save();
            console.log(registered);
            //host = req.get('host');
            //var link = "https://fierce-ridge-08779.herokuapp.com" + "/verify?id=" + rand + "&e=" + vemail;
            

            
            alert('Account succsessfully registered');
            //res.status(201).send("<h1>Account succsessfully registered</h1>");
            
            //res.redirect("/login")
            return res.redirect('/');


        } else {
            res.send("Password not matching")
        }
    } catch (error) {
        console.log("errorpart", error);
        res.status(400).send(error);
    }



});


router.post("/admin_register", auth_admin,async(req, res) => {
    //vemail = req.body.email;
    try {
        rand = Math.floor((Math.random() * 100) + 54);
        //console.log(req.body.name);
        console.log("Number is: " + rand);
        const psw = req.body.psw;
        const pswrepeat = req.body.pswrepeat;

        if (psw === pswrepeat) {
            const registerEmployee = new Register({
                    email: req.body.email,
                    name: req.body.name,
                    position: "",
                    psw: psw,
                    pswrepeat: pswrepeat,
                    isVerified: true,
                    verifyNumber: rand,
                    isPwResetRequested: false
                })
                //console.log("Number is: " + verifyNumber);
            console.log(registerEmployee);

            /*const token = await registerEmployee.gentok(req, res);
            console.log(token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true,
                secure: true
            }); */
            //console.log(cookie); //{
            //  expires: new Date(Date.now() + 3000),
            //})

            const registered = await registerEmployee.save();
            console.log(registered);
            //host = req.get('host');
            //var link = "https://fierce-ridge-08779.herokuapp.com" + "/verify?id=" + rand + "&e=" + vemail;
            

            

            var date_ob = new Date();  
            const saveLog = new managementlog({
                username:req.user.email,
                devicename: req.body.email,
                type: "user",
                time: date_ob,
                action: "เพิ่ม "+req.body.email,
                
            })
            ///console.log(saveIp);
            
            const logSaved = await saveLog.save();

            //alert('Account succsessfully registered');
            //res.status(201).send("<h1>Account succsessfully registered</h1>");
            
            //res.redirect("/login")
            


        } else {
            res.send("Password not matching")
        }
        return res.redirect('/admin_user');
    } catch (error) {
        console.log("errorpart", error);
        res.status(400).send(error);
    }



});


/*
router.post("/ajax_admin_camera", auth_admin, async(req, res) => {
    try {
        console.log(req.body.apilink)
        console.log(req.body.cctv_name)

        const saveIp = new ipLink({
            name: req.body.cctv_name,
            time: "900",
            rtspLink: req.body.apilink,
            rtspPredLink:req.body.apilink,
            apiLink: req.body.apilink,
            time_del: "3"
        })
        console.log(saveIp);

        const ipSaved = await saveIp.save();
        console.log(ipSaved);
        console.log("Added");
        res.redirect("/admin_cctv");
        //return res.status(200).json({status: true, data: req.body.name})

    } catch (error) {
        console.log("errorpart", error);
        res.status(400).send(error).end();
    }

});*/


router.post("/ajax_admin_register", auth_admin, async(req, res) => {
    vemail = req.body.email;

    console.log("Number is1111111111111111111111111111111111111111111111: " + vemail);
    try {
        rand = Math.floor((Math.random() * 100) + 54);
        //console.log(req.body.name);
        console.log("Number is1111111111111111111111111111111111111111111111: " + rand);
        const psw = req.body.pswN;
        const pswrepeat = req.body.pswrepeatN;

        if (psw === pswrepeat) {
            const registerEmployee = new Register({
                    email: req.body.emailN,
                    name: req.body.nameN,
                    position: "",
                    psw: psw,
                    pswrepeat: pswrepeat,
                    isVerified: false,
                    verifyNumber: rand,
                    isPwResetRequested: false
                })
                //console.log("Number is: " + verifyNumber);
            console.log(registerEmployee);

            const token = await registerEmployee.gentok(req, res);
            console.log(token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true,
                secure: true
            });
            //console.log(cookie); //{
            //  expires: new Date(Date.now() + 3000),
            //})

            const registered = await registerEmployee.save();
            console.log(registered);
           

            const ipSaved = await saveIp.save();
            var date_ob = new Date();  
            const saveLog = new managementlog({
                username:req.user.email,
                devicename: req.body.emailN,
                type: "user",
                time: date_ob,
                action: "เพิ่ม "+req.body.emailN,
                
            })
            ///console.log(saveIp);
            
            const logSaved = await saveLog.save();







            //res.redirect("/login")
            return res.status(200).json({status: true, data: req.body.name})


        } else {
            res.send("Password not matching")
        }
    } catch (error) {
        console.log("errorpart", error);
        res.status(400).send(error);
    }



});





router.get('/verify',async function(req,res){
    try{
        const email = req.query.e;
        const user = await Register.findOne({ email: email });
        await Register.updateOne({ email: user.email }, {
            $set: { isVerified: true },
            function(err, res) {
                if (err) throw err;
            }
        });
        if(req.query.id==user.verifyNumber)
        {
            console.log("email is verified");
            res.end("<h1>Email "+email+" is been Successfully verified");
        }
        else
        {
            console.log(req.query.id);
            console.log(user.verifyNumber);
            console.log("email is not verified");
            res.end("<h1>Bad Request</h1>");
        }
    
    }    
    catch(error)
    {
        console.log(error);
        res.end("Contact Guy");
    }
    
});  

router.get("/resetpsw", (req, res) => { 
    email = req.query.e;
    res.render("resetpsw", { title: "resetpsw" }) });

router.post("/resetpsw", async(req, res) => {
    try {
        const psw = req.body.psw;
        const pswrepeat = req.body.pswrepeat;
        const user = await Register.findOne({ email: email }).then(console.log(email));
        if (psw === pswrepeat) {
            if(user.isPwResetRequested==false)
                {
                   
                    res.end("You just tried to change someone else's password hacker!, your account has been deleted");
                }
            else{
            var temp = await bcrypt.hash(psw, 10);
            await Register.updateOne({ email: user.email }, {
                $set: { psw: temp,isPwResetRequested:false },
                function1(err, res) {
                    if (err) throw err;
                }
            });
        }
        res.status(201).end("Password succsessfully updated, you may now login using the new password");
        }
    } catch (error) {
        console.log(error)
        res.send("Something went wrong,Contact guy");
    }
});

//login post
router.post("/login", async(req, res) => {
    try {

        const email = req.body.email;
        const psw = req.body.psw;
        const user = await Register.findOne({ email: email });
        if (user.isVerified == false) {
            res.end("Please verify your email")
        }
        const ismatch = await bcrypt.compare(psw, user.psw);
        const token = await user.gentok();
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 300000000),
            httpOnly: true,
            secure: true
        });
        console.log("aaaaaa+ user"+user.position+"  "+ismatch);
        if (ismatch && user.position === "admin") {
            res.redirect("/admin_home")

        } else if (ismatch && user.position === "executive") {
            res.redirect("/executive_home")
          
        } else if (ismatch && user.position === "attendant") {
            res.redirect("/attendant_home")
        } else if (ismatch && user.position === "guard") {
            res.redirect("/guard_home")
        } else if (ismatch && user.position === "") {
            res.send("Please wait for admin approval your position <a href='/'>Please wait and login again</a>");
        } else {
            res.send("email or password is incorrect <a href='/'>Try again</a>");
        }
    } catch (error) {
        res.send("invalid credentials")
        console.log(error)
    }
});







//forgot password
router.post("/forgotpsw", async(req, res) => {
    try {
        const email = req.body.email;
        const user = await Register.findOne({ email: email }).then(console.log(email));
        await Register.updateOne({ email: user.email }, {
            $set: { isPwResetRequested: true },
            function(err, res) {
                if (err) throw err;

            }
        });
        var smtpTransport = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: process.env.verifyEmail,
                pass: process.env.verifyPW
            }
        });
        //var link = "https://fierce-ridge-08779.herokuapp.com" + "/forgotpsw?e=" + email;
        var link = "https://"+myaddress+":3000" + "/resetpsw?e=" + email;

        //link = "https://" + req.get('host') + "/verify?id=" + rand + "&e=" + vemail;
        mailOptions = {
            from: "verify.facereco@gmail.com",
            to: email,
            subject: "Reset password link",
            html: "Greetings from Facial Recognition system,<br> Click on the following link to reset your password.<br><a href=" + link + ">Click here to verify</a>"
        }
        console.log(mailOptions);
        smtpTransport.sendMail(mailOptions, function(error, response) {
            if (error) {
                console.log(error);
                res.end("error");
            } else {
                console.log("Message sent: " + response.message);
                //res.end("sent");
            }
            smtpTransport.close();
        });
        res.status(201).send("<h1>Pasword reset link sent to email address, Reset password and proceed to <a href='https://"+myaddress+":3000/'>Login</a></h1>");
        //res.status(201).render("login", { title: "CCTV", user: user3 });
    } catch (error) {
        console.log(error)
        res.send("Email doesn't exist on the database");
    }
});

var ran;
//record cctv post (role:attendant,executive,admin)
//router.post("/record_cctv", auth, async(req, res) => {
router.post("/record_cctv",  async(req, res) => {
    try {
        var CCTV;
        var URL;
        URL = req.body.button
        console.log(URL)
        const Recorder = require('node-rtsp-recorder').Recorder
        ran = String(Math.floor((Math.random() * 100) + 54));
        console.log(ran)
        var rec = new Recorder({
                url: URL,
                timeLimit: 60, // time in seconds for each segmented video file
                folder: __dirname,
                name: ran,
            })
            // Starts Recording
        var filePath = rec.getMediaTypePath()
        var fileResponsePath=rec.getFilename(filePath)
        var fileName= path.basename(fileResponsePath);
        rec.startRecording();
        
         await setTimeout(() => {
            console.log('Stopping Recording')
            rec.stopRecording()
            rec=null
            setTimeout(()=>{
                res.setHeader('Content-Type', 'video/mp4');
                res.setHeader("Content-Length", fileName.length);
                res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
                res.download(fileResponsePath,fileName)

                setTimeout(()=>{
                    Fs.rmdirSync(__dirname+"/"+ran, { recursive: true });
                },2000)
            },1000)
            
        }, 20000)


    } catch (error) {
        res.send("invalid credentials")
    }
});

//train model by upload video to api (role:attendant,executive,admin)
//router.post("/upload", auth_add_model, multer.single('file'), async(req, res) => {

//}





router.post("/upload_all",auth_admin, multer.single('file'), async(req, res) => {

    const fileRecievedFromClient = req.file;
    //Pause streaming for memmory reuse
   

    var nameinmodel="name"+String(Math.floor((Math.random() * 100) + 54));
    let form = new FormData();
    form.append('file', fileRecievedFromClient.buffer, fileRecievedFromClient.originalname);
    form.append('name', nameinmodel);
    form.append('fname', req.body.path);
    form.append('ftype', req.body.ftype);
    const p = path.resolve("../stream/pyrtsp/"+'trained_knn_model.clf')
    console.log("UUUUULL  "+req.body.path);
    console.log(req.body);
    const writer = Fs.createWriteStream(p)
    var url="http://127.0.0.1:9997/upload_all";
    //var url="http://127.0.0.1:9997/"
    console.log(url);
    const response = await Axios.post(url, form, {
        headers: {
            'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            'Content-Disposition': 'attachment;',
        },
        responseType: 'stream'
    }).then(function(resp) {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA00000");
        console.log(resp);
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        resp.data.pipe(writer)      
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        })
    })
     //resume streaming for memmory reuse
    

    

  /////////////////////////////////*/

    const data = new ModelLocation({
        name: req.body.name,
        surname: req.body.surname,
        nameinmodel:nameinmodel,
        location: req.body.path+".clf",
        status: req.body.status,
        type: "ALL"

    })

    //const modelsSaved = await saveModels.save();
    const registered = await data.save()
        .then(() => { 
        var x = req.user.position
        console.log(x)
	    if(x=="admin"){
		    res.redirect("/admin_training")}
        if(x=="executive"){
            res.redirect("/executive_home")}
        if(x=="attendant"){
            res.redirect("/attendant_home")}
        })
        .catch((err) => {
            console.log(err);
        });

});




router.post("/upload_per_person",auth_admin, multer.single('file'), async(req, res) => {

    const fileRecievedFromClient = req.file;
    let form = new FormData();
    form.append('file', fileRecievedFromClient.buffer, fileRecievedFromClient.originalname);
    form.append('name', req.body.name);
    form.append('fname', req.body.path);
    const p = path.resolve("../stream/pyrtsp/"+'trained_knn_model.clf')
    console.log("UUUUULL  "+req.body.path);
    console.log(req.body);
    const writer = Fs.createWriteStream(p)
    var url="http://127.0.0.1:9997/upload_per_person";
    //var url="http://127.0.0.1:9997/"
    console.log(url);
    const response = await Axios.post(url, form, {
        headers: {
            'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
            'Content-Disposition': 'attachment;',
        },
        responseType: 'stream'
    }).then(function(resp) {
        ///console.log(resp);
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        resp.data.pipe(writer)
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        })
    })


    const data = new ModelLocationPerPerson({
        name: req.body.name,
        location: "person/"+req.body.path+".clf",
        status: req.body.status,
        type: "INDIVIDUAL"

    })

    //const modelsSaved = await saveModels.save();
    const registered = await data.save()
        .then(() => { 
        var x = req.user.position
        console.log(x)
	    if(x=="admin"){
		    res.redirect("/admin_training_per_person")}
        if(x=="executive"){
            res.redirect("/executive_home_per_person")}
        if(x=="attendant"){
            res.redirect("/attendant_home_per_person")}
        })
        .catch((err) => {
            console.log(err);
        });

});



///////////////////SmartrPLant
router.post("/sensorSave", auth_admin, async(req, res) => {
    console.log(req.body);
    try {
        

        const savedSensor = new sensorDBModel({
            id: req.body.id,
            ADDR:req.body.ADDR,
            DEVEUI:req.body.DEVEUI,
            APPSKEY:req.body.APPSKEY,
            NWKSKEY:req.body.NWKSKEY,
            GWID:req.body.GWID,
            description: req.body.description,
            location: req.body.location,
            soundThr: req.body.soundThr,
            cameraThr: req.body.cameraThr,
            timeOut: req.body.timeOut,
            

        })
        console.log(savedSensor);

        const result = await savedSensor.save();
        //console.log(result);
        //console.log("Added");

        var date_ob = new Date();  
        const saveLog = new managementlog({
            username:req.user.email,
            devicename: req.body.ADDR,
            type: "Long range Sensor",
            time: date_ob,
            action: "เพิ่ม "+req.body.ADDR,
            
        })
        const logSaved = await saveLog.save();


        res.redirect("/admin_sensor");

    } catch (error) {
        console.log("errorpart", error);
        res.status(400).send(error).end();
    }
});




router.post("/modelSave", auth_admin, async(req, res) => {
    try {
        const saveModels = new ModelLocation({
            name: req.body.name,
            status: req.body.status,
            location: req.body.location
        })
        console.log(saveModels);

        const modelsSaved = await saveModels.save();
        console.log(modelsSaved);
        console.log("Added");
        res.redirect("/admin_model");

    } catch (error) {
        console.log("errorpart", error);
        res.status(400).send(error).end();
    }
});


router.post("/staffSave", auth_admin, async(req, res) => {
    try {
        const saveStaff = new staff({
            name: req.body.name,
            surname: req.body.surname,
            wifimacaddr: req.body.wifimacaddr,
            description: req.body.description
        })
        console.log(saveStaff);

        const staffSaved = await saveStaff.save();
        //console.log(staffSaved);
        //console.log("Added");

        var date_ob = new Date();  
        const saveLog = new managementlog({
            username:req.user.email,
            devicename: req.body.name,
            type: "staff",
            time: date_ob,
            action: "เพิ่ม "+req.body.name + "  "+req.body.surname,
            
        })
        const logSaved = await saveLog.save();
        res.redirect("/admin_staff");

    } catch (error) {
        console.log("errorpart", error);
        res.status(400).send(error).end();
    }
});


router.post("/cctvSave", auth_admin, async(req, res) => {
    try {
        const saveCctv = new cctv({
            name: req.body.name,
            ip: req.body.ip,
            port: req.body.port,
            user: req.body.user,
            password: req.body.password,
        })
        console.log(saveCctv);

        const cctvSaved = await saveCctv.save();
        console.log(cctvSaved);
        console.log("Added");
        res.redirect("/admin_cctv");

    } catch (error) {
        console.log("errorpart", error);
        res.status(400).send(error).end();
    }
});

router.post("/delete_sensors/:_id",auth_admin,async(req, res) => {
    try {
        const id = req.params._id;
        const sensor_obj = await sensor.findOne({ _id: id });
        console.log(sensor)
        await sensor.deleteOne(sensor_obj)
            //.then(() => { res.status(201).redirect("/adreq") })
            

    } catch (error) {
        res.send("Delete cam error");
    }
});



///////////Ajaxx


router.post("/ajax_update_soundThr", auth_admin, async(req, res) => {
    //console.log("AAAAAAAAAAAAAAA jaxtest");
    //Save in DB for tx after receive from endnode
    //mqttConnection.setSoundThreshold("41","F75AF5EF","dragino-202b9c");  //worked
    var nodeParas={id:"",soundThr:""};
    try {
        console.log(req.body.id);
        console.log(req.body.soundThr);
        nodeParas.soundThr=req.body.soundThr;
        nodeParas.id=req.body.id;
        //console.log("req sound thr  nodeid  "+reg.body.id);
        //console.log("req sound thr  thr   "+reg.body.soundThr);
        const result = await sensorDBModel.find({}, { "_id": req.body.id})
        await sensorDBModel.updateMany({}, {
            $set: {
                soundThr: req.body.soundThr,
            },
            function(err, res) {
                if (err) throw err;
            }
        });
        return res.status(200).json({status: true, data: nodeParas.soundThr})
    } catch (error) {
        res.send("Set Sound Thr error");
    }
    //return res.status(200).json({status: true, data: "100"});
});



router.post("/ajax_update_cameraThr", auth_admin, async(req, res) => {
    //console.log("AAAAAAAAAAAAAAA jaxtest");
    //Save in DB for tx after receive from endnode
    //mqttConnection.setSoundThreshold("41","F75AF5EF","dragino-202b9c");  //worked
    try {
        
        
        const result = await sensorDBModel.find({}, { "_id": req.body.id})
        await sensorDBModel.updateMany({}, {
            $set: {
                cameraThr: req.body.cameraThr,
            },
            function(err, res) {
                if (err) throw err;
            }
        });
        return res.status(200).json({status: true, data: req.body.cameraThr})
    } catch (error) {
        res.send("Set Camera Thr error");
    }
    //return res.status(200).json({status: true, data: "100"});
});



router.post("/ajax_updateStatus", auth_admin, async(req, res) => {
    //console.log("AAAAAAAAAAAAAAA jaxtest");
    //Save in DB for tx after receive from endnode
    //mqttConnection.setSoundThreshold("41","F75AF5EF","dragino-202b9c");  //worked


   console.log("EEEEEEEEEEEEEEEEEEEEEE ="+req.body.nameN);

    try {
        
            const id = req.body.idN;
            console.log(id);
            const status = req.body.status;
            console.log(status);
            const user2 = await ModelLocation.findOne({ _id: id });
            await ModelLocation.updateOne({ _id: user2._id }, {
                $set: { status: status },
                function(err, res) {
                    if (err) throw err;
                }
            });
            //console.log("EEEEEEEEEEEEEEEEEEEEEE 000000="+req.body.nameN);
            var date_ob = new Date();  
            const saveLog = new managementlog({
                username:req.user.email,
                devicename: user2.name,
                type: "model",
                time: date_ob,
                action: "แก้ "+user2.name + " สถานะเป็น  " + status,
                
            })
            ///console.log(saveIp);
            
            const logSaved = await saveLog.save();

        return res.status(200).json({status: true, data: req.body.status})
    } catch (error) {
        res.send("Set Status error");
    }

    //console.log("EEEEEEEEEEEEEEEEEEEEEE111111111111");
    //return res.status(200).json({status: true, data: "100"});
});

router.post("/ajax_updateRecordStatus", auth_admin, async(req, res) => {
    //console.log("AAAAAAAAAAAAAAA jaxtest");
    //Save in DB for tx after receive from endnode
    //mqttConnection.setSoundThreshold("41","F75AF5EF","dragino-202b9c");  //worked
    
    //SSH to record or stop 

    //////////
   console.log("EEEEEEEEEEEEEEEEEEEEEE ="+req.body.idN);

    try {
        
            const id = req.body.idN;
            console.log(id);
            let status="0";
            if(req.body.status=="record"){
                status = "1";
            }else{
                status = "0";
            }
          
            console.log(status);
            const user2 = await ipLink.findOne({ _id: id });
            await ipLink.updateOne({ _id: user2._id }, {
                $set: { recordStatus: status },
                function(err, res) {
                    if (err) throw err;
                }
            });

            if(req.body.status=="record"){
                //start record
                let cctvName=user2.name;
                let cctvIP="rtsp://"+user2.apiLink.substring(36); //http://192.168.1.11:5000/video_feed/admin:roboteng2021@192.168.1.200
                let fileName=Number(Math.floor(new Date() / 1000));
                const conn = new Client();
                conn.on('ready', () => {
                console.log('Client :: ready');
                conn.shell((err, stream) => {
                        if (err) throw err;
                            stream.on('close', () => {
                            console.log('Stream :: close');
                            conn.end();
                        }).on('data', (data) => {
                            console.log('OUTPUT: ' + data);
                        });
                        stream.end('python3 /home/imb/new_version/V10/rec_part/record_v2.py '+ cctvName +' '+cctvIP+ ' '+fileName+'\n');
                    });
                }).connect({
                    host: '127.0.0.1',
                    port: 22,
                    username: 'imb',
                    password: 'roboteng',
                });
                
            }else{
                //stop record
        
            }


            //console.log("EEEEEEEEEEEEEEEEEEEEEE 000000="+req.body.nameN);
            var date_ob = new Date();  
            const saveLog = new managementlog({
                username:req.user.email,
                devicename: user2.name,
                type: "cctv",
                time: date_ob,
                action: "แก้ "+user2.name + " สถานะบันทึกเป็น  " + status,
                
            })
            ///console.log(saveIp);
            
            const logSaved = await saveLog.save();

        return res.status(200).json({status: true, data: req.body.status})
    } catch (error) {
        res.send("Set Status error");
    }

    //console.log("EEEEEEEEEEEEEEEEEEEEEE111111111111");
    //return res.status(200).json({status: true, data: "100"});
});



router.post("/ajax_updatePosition", auth_admin, async(req, res) => {
    //console.log("AAAAAAAAAAAAAAA jaxtest");
    //Save in DB for tx after receive from endnode
    //mqttConnection.setSoundThreshold("41","F75AF5EF","dragino-202b9c");  //worked


   console.log("EEEEEEEEEEEEEEEEEEEEEE ="+req.body.nameN);

    try {
        
            const id = req.body.idN;
            console.log(id);
            const position = req.body.positionN;
            console.log(position);
            const user2 = await Register.findOne({ _id: id });
            await Register.updateOne({ _id: user2._id }, {
                $set: { position: position },
                function(err, res) {
                    if (err) throw err;
                }
            });
            //console.log("EEEEEEEEEEEEEEEEEEEEEE 000000="+req.body.nameN);
            var date_ob = new Date();  
            const saveLog = new managementlog({
                username:req.user.email,
                devicename: user2.email,
                type: "user",
                time: date_ob,
                action: "แก้ "+user2.email + " ตำแหน่งเป็น " + position,
                
            })
            ///console.log(saveIp);
            
            const logSaved = await saveLog.save();

        return res.status(200).json({status: true, data: req.body.position})
    } catch (error) {
        res.send("Set Position error");
    }

    //console.log("EEEEEEEEEEEEEEEEEEEEEE111111111111");
    //return res.status(200).json({status: true, data: "100"});
});


//Websocket 





///////for find a person


router.post("/found_people", async(req, res) => {

     
   console.log(req.body.api_name);
   console.log(req.body.api_cam);

   var saveFound;
   var foundInfo="";
   var date_ob = new Date(); 
   if(req.body.api_name=="unknown"){
        saveFound = new foundPersonLogs({
            id:req.body.id,
            name:req.body.api_name,
            surname:req.body.api_name,
            cam: req.body.api_cam,
            status: "unknown",
            time: date_ob,  
        });
        //More Than N times per camera, must warning in 10s
        const unknown2 = await unknownLog.findOne({camera: req.body.api_cam });
        if(!unknown2){
            saveUnknown = new unknownLog({
                count:1,
                camera:req.body.api_cam,
                time: Math.floor(new Date() / 1000), 
            });
            const logSaved = await saveUnknown.save();
        }else{
            
            const currentTime=Math.floor(new Date() / 1000);
            if((currentTime-parseInt(unknown2.time)) >10){
               // console.log("seeeet 1111111111111111111");
                await  unknownLog.updateMany({ camera: req.body.api_cam  }, {
                    $set: { count: 1,time: Math.floor(new Date() / 1000)},
                    function(err, res) {
                        console.log("eeeee"+err);
                        if (err) throw err;
                    }
                });

            }else{
                await  unknownLog.updateOne({ camera: req.body.api_cam  }, {
                    $set: { count: parseInt(unknown2.count)+1 },
                    function(err, res) {
                        if (err) throw err;
                    }
                });


            }



            if((parseInt(unknown2.count))>=5){
                foundInfo={cam:req.body.api_cam,status:unknown2.status,name:unknown2.name,surname:unknown2.surname,type:'unknown'};
                app.foundPeople(foundInfo);
                await  unknownLog.updateMany({ camera: req.body.api_cam  }, {
                    $set: { count: 1,time: Math.floor(new Date() / 1000)},
                    function(err, res) {
                        console.log("eeeee"+err);
                        if (err) throw err;
                    }
                });


            }
        }
        

           // foundInfo={cam:req.body.api_cam,status:user2.status,name:user2.name,surname:user2.surname,type:'gray'};
            //app.foundPeople(foundInfo);

   }else{
        try {
            const user2 = await ModelLocation.findOne({nameinmodel: req.body.api_name });
             console.log(user2.name);
            if(user2.status=="blacklist"){
                //send Found people to the client
                foundInfo={cam:req.body.api_cam,status:user2.status,name:user2.name,surname:user2.surname,type:'black'};
                app.foundPeople(foundInfo);


            }

            if (user2.status=="graylist"){
                //send Found people to the client
                foundInfo={cam:req.body.api_cam,status:user2.status,name:user2.name,surname:user2.surname,type:'gray'};
                app.foundPeople(foundInfo);


            }

            saveFound = new foundPersonLogs({
                id:req.body.id,
                name:user2.name,
                surname:user2.surname,
                cam: req.body.api_cam,
                status: user2.status,
                time: date_ob,  
            });
        }catch (error) {
            console.log("errorpart", error);
        }
   }

   ///console.log(saveIp);
   try {
    const logSaved = await saveFound.save();
   }catch (error) {
        console.log("errorpart", error);
    }
   res.send("good boy");

});






router.post("/recordingInfo", async(req, res) => {

     
    
    console.log("111111111111111111111111111111111"+req.body.api_cam);
    console.log("2222222222222222222222222222"+req.body.id);
    recordInfo = new recordModel({
        name:req.body.api_cam,
        filename:req.body.id,
        date: new Date(),
    });
    try {
        const recordSaved = await recordInfo.save();
    }catch (error) {
            console.log("errorpart", error);
    }
    res.send("good boy");
 });
 
 









module.exports = router;
