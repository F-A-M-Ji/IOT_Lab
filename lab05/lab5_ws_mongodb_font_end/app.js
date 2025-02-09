const Env = require('./models/env');
const express = require('express');
var qs = require('querystring');
const mongoose = require('mongoose');
const hbs = require('hbs');
var path = require('path');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');

var app = express();
// app.use(bodyParser.urlencoded({extended: true }));
app.use(express.json());


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views')
const static_path = path.join(__dirname, "/public")
app.use(express.static(static_path));
console.log(static_path);
const WebSocket = require('ws');
const { env } = require('process');
hbs.registerHelper('iff', function(a, operator, b, opts) {
  var bool = false;
  switch (operator) {
      case '==':
          bool = a == b;
          break;
      case '>':
          bool = a > b;
          break;
      case '<':
          bool = a < b;
          break;
      case '!=':
          bool = a != b;
          break;
      default:
          throw "Unknown operator " + operator;
  }

  if (bool) {
      return opts.fn(this);
  } else {
      return opts.inverse(this);
  }
});

hbs.registerHelper('ifCond', function(v1, options) {
if(v1%3==2) {
  return options.fn(this);
}
return options.inverse(this);
});

hbs.registerHelper('iftime', function(v1,v2, options) {
if(v1==v2) {
  return options.fn(this);
}
return options.inverse(this);
});

hbs.registerHelper('forlist', function(v1,v2 ,options) {
var i;
var cmd="<option selected value="+v2+">"+(v2)+"</option>";
for (i = 0; i < v1.length; i++) {
  if(v1[i]!=v2){
   cmd+="<option value="+v1[i]+">"+(v1[i])+"</option>"

  }   

}
return cmd;
});

const port = 3000;
var hum="30";

//สิ่งที่ต้องเปลี่ยนตอนเปลี่ยนเครื่อง
app.listen(port, () => {
  console.log('Listening at http://192.168.1.39:3000');
});



var appPort=3001;
// Normal HTTP configuration
//let http = require('http').Server(app;

//const wss = new WebSocket.Server({ server:http });
const wss = new WebSocket.Server({ port : appPort});
wss.on('connection', async function connection(wssLocal) {
    console.log('A new client Connected!111111111111111111 11111111111111111111111111');
   // ws.send('node0_status_pir_x');
     

    wss.on('message', function incoming(message) {
      console.log('received: %s', message);
  
      wss.clients.forEach(function each(client) {
        if (client !== wss && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
      
    });
   const query = {};
   const sort = { time: -1 };
   const limit = 3;
   const envs= await Env.find({}).sort(sort).limit(3);
   console.log(envs);
   var test = [{"temperature": envs[0].temperature,"humidity": envs[0].humidity,"ec": envs[0].ec,"ph": envs[0].ph,"wp":envs[0].wp,"N":envs[0].N,"P":envs[0].P,"K":envs[0].K,"device":envs[0].device,"switchs":envs[0].switchs}];
  
   
   var statusAllJson = JSON.stringify(test);
   
   wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
       
      console.log(statusAllJson);
      client.send(statusAllJson);
     
    }
   }); 
    

});


const MQTT_SERVER = "04b676ae30984df98cdf25ea13faaadf.s1.eu.hivemq.cloud";
const MQTT_PORT = "8883";
const MQTT_USER = "hivemq.webclient.1710070635593";
const MQTT_PASSWORD = "ecS.7R8Y:39hUvDC#r%n";
const MQTT_TOPIC =["pump","envs"];
const  client  = mqtt.connect({
  host: MQTT_SERVER,
  port: MQTT_PORT,
  username: MQTT_USER,
  password: MQTT_PASSWORD,
  protocol: 'mqtts'

}); // เปลี่ยน URL ของ MQTT broker ตามที่คุณใช้งาน

// const client = mqtt.connect(MQTT_SERVER, { port: MQTT_PORT });
client.on('connect', function () {
  console.log('Connected to MQTT broker');

  //สั่งจาก server ไป MQTT เพื่อ เปิด/ปิด
  client.publish(MQTT_TOPIC[0], 'open_system');
  // Subscribe เข้าไปยัง topic ที่ต้องการรับข้อมูล
  client.subscribe(MQTT_TOPIC[1], function (err) {
    if (err) {
      console.log('Subscribe error:', err);
    } else {
      console.log('Subscribed to topic:', MQTT_TOPIC[1]);
    }
  });
  client.subscribe(MQTT_TOPIC[0], function (err) {
    if (err) {
      console.log('Subscribe error:', err);
    } else {
      console.log('Subscribed to topic:', MQTT_TOPIC[0]);
    }
  });
});

function publishMessage(message) {
  client.publish(MQTT_TOPIC[0], message);
  console.log('Published message:', message);
}

const axios = require('axios');
// เมื่อมีข้อมูลเข้ามาจาก MQTT broker
client.on('message', async function (topic, message) {
  // console.log( message.toString());
  // ทำสิ่งที่ต้องการกับข้อมูลที่ได้รับ เช่น แสดงผลทางหน้าเว็บ หรือประมวลผลข้อมูลต่อไป
  if(topic==MQTT_TOPIC[1]){
    console.log('Published message:', message);
    var date_ob = new Date();
    var temps = message.toString().split(",");
    axios.post('http://192.168.1.39:3000/envs',{
      temperature:temps[0],
      humidity:temps[1],
      ec:temps[2],
      ph:temps[3],
      wp: "",
      N : "",
      P : "",
      K : "",
      device : "",
      switchs : "",
      time: date_ob,
    })
    .then(function(response){
      console.log(response);
    })
    .catch(function(error){
      console.log(error);
    });
  }else if(topic==MQTT_TOPIC[0]){
    
    console.log("In MQTT_TOPIC = pump");
  }
  
});

// หากมีการตัดการเชื่อมต่อกับ MQTT broker
client.on('close', function () {
  console.log('Disconnected from MQTT broker');
});


// username:piyadapet
// password:F5wHLUpwA0W2X1uP


//สิ่งที่ต้องเปลี่ยนตอนเปลี่ยนเครื่อง
mongoose.connect('mongodb://localhost:27017/iot', {
  useNewUrlParser: true
});

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

app.get('/setting', function(req, res, next) {
  res.render('setting', { title: 'Express' });
});


app.get('/tracking', async function(req, res, next) {
  res.render('tracking', { title: 'Express' });
  
});

app.get('/fetch_data' , async function(req, res, next) {
  // res.render('tracking', { title: 'Express' });
  try {
    const query_data= await Env.find({});
    // console.log(query_data);
    res.json(query_data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/temp', (req, res) => {
    var temp=10;
    var temperature="temp="+temp
    res.send(temperature);
});


app.get('/getenvs', async (req, res) => {
    const envs = await Env.findOne({});
    res.json(envs);
});

// app.post('/ajax_wp', async (req,res)=>{
//   const payload = req.body;
//   var date_ob = new Date();
//   const saveEnvs = new Env({
//     temperature:payload.temperature,
//     humidity: payload.humidity,
//     ec: payload.ec ,
//     ph: payload.ph,
//     wp: payload.wp,
//     N : "",
//     P : "",
//     K : "",
//     device : payload.device,
//     switchs : payload.switchs,
//     time: date_ob,
    
// })
//   await saveEnvs.save();
//   res.status(201).end();
//   console.log("Print envs")
// });

app.post('/ajax_pumpsw', async (req,res)=>{
  
  const payload = req.body;
  var date_ob = new Date();
  if(payload.pumpsw=='on'){
    // var message = "pp";
    // publishMessage(message);
    const saveEnvs = new Env({
      temperature:payload.temperature,
      humidity: payload.humidity,
      ec: payload.ec ,
      ph: payload.ph,
      N : payload.N,
      P : payload.P,
      K : payload.K,
      device : payload.device,
      switchs : payload.switchs,
      wp: payload.wp,
      fert: payload.fert,
      med:payload.med,
      time: date_ob,
      device : "Water Pump",
      switchs : "on",
      time: date_ob,   
    })
    await saveEnvs.save();
  }else{
    const saveEnvs = new Env({
      temperature:payload.temperature,
      humidity: payload.humidity,
      ec: payload.ec ,
      ph: payload.ph,
      N : payload.N,
      P : payload.P,
      K : payload.K,
      wp: payload.wp,
      fert: payload.fert,
      med:payload.med,
      device : "Water Pump",
      switchs : "off",
      time: date_ob,   
    })
    await saveEnvs.save();
  }
  
  
  res.status(201).end();
  console.log("Print envs")
});
app.post('/ajax_puisw', async (req,res)=>{
  const payload = req.body;
  var date_ob = new Date();
  if(payload.puisw=='on'){
    const saveEnvs = new Env({
      temperature:payload.temperature,
      humidity: payload.humidity,
      ec: payload.ec ,
      ph: payload.ph,
      N : payload.N,
      P : payload.P,
      K : payload.K,
      device : payload.device,
      switchs : payload.switchs,
      wp: payload.wp,
      fert: payload.fert,
      med:payload.med,
      time: date_ob,
      device : "Fertilizer",
      switchs : "on",
      time: date_ob,   
    })
    await saveEnvs.save();
  }else{
    const saveEnvs = new Env({
      temperature:payload.temperature,
      humidity: payload.humidity,
      ec: payload.ec ,
      ph: payload.ph,
      N : payload.N,
      P : payload.P,
      K : payload.K,
      wp: payload.wp,
      fert: payload.fert,
      med:payload.med,
      device : "Pui",
      switchs : "off",
      time: date_ob,   
    })
    await saveEnvs.save();
  }
  
  
  res.status(201).end();
  console.log("Print envs")
});
app.post('/ajax_medsw', async (req,res)=>{
  const payload = req.body;
  var date_ob = new Date();
  if(payload.puisw=='on'){
    const saveEnvs = new Env({
      temperature:payload.temperature,
      humidity: payload.humidity,
      ec: payload.ec ,
      ph: payload.ph,
      N : payload.N,
      P : payload.P,
      K : payload.K,
      device : payload.device,
      switchs : payload.switchs,
      wp: payload.wp,
      fert: payload.fert,
      med:payload.med,
      time: date_ob,
      device : "Medicine",
      switchs : "on",
      time: date_ob,   
    })
    await saveEnvs.save();
  }else{
    const saveEnvs = new Env({
      temperature:payload.temperature,
      humidity: payload.humidity,
      ec: payload.ec ,
      ph: payload.ph,
      N : payload.N,
      P : payload.P,
      K : payload.K,
      wp: payload.wp,
      fert: payload.fert,
      med:payload.med,
      device : "Med",
      switchs : "off",
      time: date_ob,   
    })
    await saveEnvs.save();
  }
  
  
  res.status(201).end();
  console.log("Print envs")
});

app.post('/sethum', (req, res) => {
    var data=''
    req.on('data', chunk => {
        console.log('A chunk of data has arrived: ', chunk);
        data=data+chunk;
        console.log(data);
        hum=data;
      });
    req.on('end', () => {
        console.log('No more data');
      })
   res.sendStatus(200);
});


app.post('/submit', function(req,res){
  const my_val = req.body.myInput;
  console.log("From Input: ",my_val);
  res.status(201).end();

});

app.post('/item', function(req,res){
  
});
app.get('/item', function(req,res){
  
});

app.use(express.json());
// mock data
const products = [{}];

app.post('/envs', async (req, res) => {
  const payload = req.body;
  console.log("Start: "+req.body.wp);
  var date_ob = new Date();
  const saveEnvs = new Env({
    temperature:payload.temperature,
    humidity: payload.humidity,
    ec: payload.ec ,
    ph: payload.ph,
    N : payload.N,
    P : payload.P,
    K : payload.K,
    wp: payload.wp,
    fert: payload.fert,
    med:payload.med,
    device : payload.device,
    switchs : payload.switchs,
    time: date_ob,
    
})
  //const product = new Env(payload);
  await saveEnvs.save();
  const query = {};
  const sort = { time: -1 };
  const limit = 1;
  const envs= await Env.find({}).sort(sort).limit(3);
  
  console.log("Print envs")
  // console.log(envs);
  var test = [{"temperature": envs[0].temperature,"humidity": envs[0].humidity,"ec": envs[0].ec,"ph": envs[0].ph,"wp":envs[0].wp,"N":envs[0].N,"P":envs[0].P,"K":envs[0].K,"device":envs[0].device,"switchs":envs[0].switchs}];

  console.log("End envs")
  var statusAllJson = JSON.stringify(test);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
       
      console.log("Next end envs: "+statusAllJson);
      client.send(statusAllJson);
     
    }
   }); 


  res.status(201).end();
});

