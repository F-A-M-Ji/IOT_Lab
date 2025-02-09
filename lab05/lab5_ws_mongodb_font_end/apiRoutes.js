var express = require('express');
var router = express.Router();


let chirpstack  = require('../controllers/api/chirpstack');
let user = require('../controllers/api/mobile/manage_user');
let device = require('../controllers/api/mobile/manage_device');
const foundPersonLogs= require("../src/models/foundPersonLogs");
const managementlog= require("../src/models/managementLog");
const lrlog= require("../src/models/sensorStatus");
//let mobile_device = require('../controllers/api/devices_control');


router.post('/mobile/login', user.login);


router.get("/mobile/login", (req, res) => {
    
    console.log("KKKKKKKKKKKKKKK");
    res.render("test_hbs1") 
    
});

//user
router.post('/mobile/user/change-password', user.user_change_password);
//router.get('/mobile/user/change-password', mobile.user_change_password);

//admin
router.post('/mobile/admin/adduser', user.add_user);
router.post('/mobile/admin/alluser', user.all_user); //all user
router.post('/mobile/admin/infouser/:userId', user.info_user); //user info
router.post('/mobile/admin/edituser', user.edit_user); //user info
router.post('/mobile/admin/update-status', user.update_user_status); //user info


//router.post('/mobile/control/:deviceId', mobile_device.control);

router.post('/chirpstack/http-integration', chirpstack.http_integration);
router.get('/chirpstack/http-integration', chirpstack.http_integration);



//manage device
router.post('/mobile/admin/device/all', device.all_device); //all device
router.post('/mobile/admin/device/add/lora', device.add_device_lora); //add lora device
router.post('/mobile/admin/device/add/mqtt', device.add_device_mqtt); //add mqtt device
router.post('/mobile/admin/device/edit/name', device.edit_name_device); //update name
router.post('/mobile/admin/device/edit/enable', device.enable_disable_device); //enable disable device


router.post('/mobile/admin/sensor/all', device.all_sensor); //all sensor
router.post('/mobile/admin/sensor/add', device.add_sensor); //add sensor device
router.post('/mobile/admin/sensor/edit/name', device.edit_name_sensor); //update name
router.post('/mobile/admin/sensor/edit/enable', device.enable_disable_sensor); //enable disable sensor

router.post('/mobile/admin/sensor/info', device.sensor_info); //sensor info

//cctv

router.post('/mobile/admin/cctv/all', device.all_cctv); //all cctv


router.post('/mobile/admin/logs', user.all_logs); //all logs
//router.post('/mobile/admin/personlogs', user.person_logs); //all logs
router.post('/mobile/admin/user/logs', user.user_logs); //user logs
//router.post('/mobile/admin/user/personlogs', user.person_logs); //person logs
router.post('/mobile/admin/user/personlogs', async(req, res) => {
	var logs={"AAA":"BBBB"};
    logs=[{"name":"xxxx","status":"staff","time":"2021-05-23T23:08:43.091Z","cam" :"xxx"}];
	console.log("DDDDDDDDDDDDDDDDDDDDDDDD");
	///const logs = await foundPersonLogs.find();
    const logs1 = await foundPersonLogs.find();
	console.log(logs1);
	return res.status(200).json({success: true, data: logs1});
 });


 router.post('/mobile/admin/managementlogs', async(req, res) => {
	var logs={"AAA":"BBBB"};
    logs=[{"name":"xxxx","status":"staff","time":"2021-05-23T23:08:43.091Z","cam" :"xxx"}];
	console.log("DDDDDDDDDDDDDDDDDDDDDDDD");
	///const logs = await foundPersonLogs.find();
    const logs1 = await managementlog.find();
	console.log(logs1);
	return res.status(200).json({success: true, data: logs1});
 });

 router.post('/mobile/admin/lrlogs', async(req, res) => {
	var logs={"AAA":"BBBB"};
    logs=[{"name":"xxxx","status":"staff","time":"2021-05-23T23:08:43.091Z","cam" :"xxx"}];
	console.log("DDDDDDDDDDDDDDDDDDDDDDDD");
	///const logs = await foundPersonLogs.find();
    const logs1 = await lrlog.find();
	console.log(logs1);
	return res.status(200).json({success: true, data: logs1});
 });


router.post('/mobile/device/control', device.control_device); //control device


router.post('/mobile/admin/cctv/add', device.add_cctv); //add cctv
router.post('/mobile/admin/cctv/edit', device.edit_cctv); //edit cctv
router.post('/mobile/admin/cctv/update', device.edit_status_cctv); //edit cctv


module.exports = router;