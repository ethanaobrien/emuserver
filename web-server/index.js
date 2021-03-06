const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const killable = require('killable');
const config = require('./config.json');

let nofusers = 0;
let window;
var servers = []
global.data = {}
global.users = {}
global.userData = {}
global.passwords = {}
global.isOwner = {}
var mainserver = config.defaultserverstate;

function startservermain(){
    terminateServers();
    makeServer(process.env.PORT);
}
if(mainserver == true){
	makeServer(process.env.PORT);
}else if(mainserver == false){
	startserverpage();			
}else{
   console.error("Error: Default server status no set!");	
}

function stopservermain(){
    terminateServers();
	startserverpage();
}

function startserverpage(){
	const app = express();
	const router = express.Router();
	var server;
app.use(express.urlencoded());
app.use(express.json());
app.use(cors());
router.get('/', (req, res) => {
	const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }
  const authorization = req.headers.authorization
  if(!authorization) {
    return reject()
  }
  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')
  if(! (username === 'admin' && password === config.passwordforserver)) {
    return reject()
  }
  res.sendFile(path.join(__dirname+'/index.html'));
});
router.get('/img/:imageName', function(req, res) {
  var image = req.params['imageName'];
	try {
  res.sendFile(path.join(__dirname+'/img/'+image));
	}
	catch(err) {
  res.sendStatus(401)
	}
});
app.use('/', router);
app.post('/startstop', (req, res) => {
	const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }
  const authorization = req.headers.authorization
  if(!authorization) {
    return reject()
  }
  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')
  if(! (username === 'admin' && password === config.passwordforserver)) {
    return reject()
  }
  if(req.body.function == "start"){
	  mainserver = true;
	  server.kill(function () {
    startservermain();
  });
	  res.end('true');
	}else{
	res.end('false');	
	}
});
app.post('/check', (req, res) => {
	const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }
  const authorization = req.headers.authorization
  if(!authorization) {
    return reject()
  }
  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')
  if(! (username === 'admin' && password === config.passwordforserver)) {
    return reject()
  }
  if(mainserver == false){
	  res.end('false');
	}else if(mainserver == true){
		res.end('true');
	}
});
app.post('/numusers', (req, res) => {
	const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }
  const authorization = req.headers.authorization
  if(!authorization) {
    return reject()
  }
  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')
  if(! (username === 'admin' && password === config.passwordforserver)) {
    return reject()
  }
res.end('{ "users": '+nofusers+" }");
});
var server = app.listen(process.env.PORT || 3000, () => {
  console.log('The Page Server is running on port :' + (process.env.PORT || 3000));
});
killable(server);
}
function defineArrayPaths(data, args) {
    if (! global.data[data.extra.domain]) {
        global.data[data.extra.domain] = {}
    }
    if (! global.data[data.extra.domain][data.extra.game_id]) {
        global.data[data.extra.domain][data.extra.game_id] = {}
    }
    if (! global.users[data.extra.domain]) {
        global.users[data.extra.domain] = {}
    }
    if (! global.users[data.extra.domain][data.extra.game_id]) {
        global.users[data.extra.domain][data.extra.game_id] = {}
    }
    if (! global.users[data.extra.domain][data.extra.game_id][args.sessionid]) {
        global.users[data.extra.domain][data.extra.game_id][args.sessionid] = []
    }
    if (! global.isOwner[data.extra.domain]) {
        global.isOwner[data.extra.domain] = {}
    }
    if (! global.isOwner[data.extra.domain][data.extra.game_id]) {
        global.isOwner[data.extra.domain][data.extra.game_id] = {}
    }
    if (! global.isOwner[data.extra.domain][data.extra.game_id][args.sessionid]) {
        global.isOwner[data.extra.domain][data.extra.game_id][args.sessionid] = {}
    }
    if (! global.userData[data.extra.domain]) {
        global.userData[data.extra.domain] = {}
    }
    if (! global.userData[data.extra.domain][data.extra.game_id]) {
        global.userData[data.extra.domain][data.extra.game_id] = {}
    }
    if (! global.userData[data.extra.domain][data.extra.game_id][args.sessionid]) {
        global.userData[data.extra.domain][data.extra.game_id][args.sessionid] = {}
    }
    if (! global.passwords[data.extra.domain]) {
        global.passwords[data.extra.domain] = {}
    }
    if (! global.passwords[data.extra.domain][data.extra.game_id]) {
        global.passwords[data.extra.domain][data.extra.game_id] = {}
    }
}

function terminateServers() {
    global.data = {}
    global.users = {}
    global.userData = {}
    global.passwords = {}
    global.isOwner = {}
    for (var i=0; i<servers.length; i++) {
        servers[i].destroy()
    }
    servers = [];
	nofusers = 0;
	console.log('Switching Servers!');
}

function makeServer(port) {
    const app = express();
    const server = http.createServer(app);
    const io = require("socket.io")(server);
	 const router = express.Router();
	var servermain;
app.use(express.urlencoded());
app.use(express.json());
router.get('/', (req, res) => {
	const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }
  const authorization = req.headers.authorization
  if(!authorization) {
    return reject()
  }
  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')
  if(! (username === 'admin' && password === config.passwordforserver)) {
    return reject()
  }
  res.sendFile(path.join(__dirname+'/index.html'));
});
router.get('/img/:imageName', function(req, res) {
  var image = req.params['imageName'];
	try {
  res.sendFile(path.join(__dirname+'/img/'+image));
	}
	catch(err) {
  res.sendStatus(401)
	}
});
app.use('/', router);
app.post('/startstop', (req, res) => {
	const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }
  const authorization = req.headers.authorization
  if(!authorization) {
    return reject()
  }
  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')
  if(! (username === 'admin' && password === config.passwordforserver)) {
    return reject()
  }
  if(req.body.function == "stop"){
		mainserver = false;
		servermain.kill();
		stopservermain();
		res.end('true');
	}else{
	res.end('false');	
	}
});
app.post('/check', (req, res) => {
	const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }
  const authorization = req.headers.authorization
  if(!authorization) {
    return reject()
  }
  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')
  if(! (username === 'admin' && password === config.passwordforserver)) {
    return reject()
  }
  if(mainserver == false){
	  res.end('false');
	}else if(mainserver == true){
		res.end('true');
	}
});
app.post('/numusers', (req, res) => {
	const reject = () => {
    res.setHeader('www-authenticate', 'Basic')
    res.sendStatus(401)
  }
  const authorization = req.headers.authorization
  if(!authorization) {
    return reject()
  }
  const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')
  if(! (username === 'admin' && password === config.passwordforserver)) {
    return reject()
  }
res.end('{ "users": '+nofusers+" }");
});
    app.use(cors())
    app.get('/list', function(req, res) {
        var args = transformArgs(req.url)
        if (! args.game_id || ! args.domain) {
            res.end('{}')
            return
        }
        if (! global.data[args.domain]) {
            global.data[args.domain] = {}
        }
        if (! global.data[args.domain][args.game_id]) {
            global.data[args.domain][args.game_id] = {}
        }
        res.end(JSON.stringify(global.data[args.domain][args.game_id]))
    })
  setInterval(function () {addreuser("remove", io.engine.clientsCount)}, 1000);
    io.on('connection', (socket) => {
		 addreuser("add", io.engine.clientsCount);
        var url = socket.handshake.url
        var args = transformArgs(url)
        var room = ''
        var extraData = JSON.parse(args.extra)
        function disconnect() {
            io.to(room).emit('user-disconnected', args.userid)
            var newArray = []
            for (var i=0; i<global.users[extraData.domain][extraData.game_id][args.sessionid].length; i++) {
                if (global.users[extraData.domain][extraData.game_id][args.sessionid][i] !== args.userid) {
                    newArray.push(global.users[extraData.domain][extraData.game_id][args.sessionid][i])
                }
            }
            delete global.userData[extraData.domain][extraData.game_id][args.sessionid][args.userid]
            if (global.isOwner[extraData.domain][extraData.game_id][args.sessionid][args.userid]) {
                for (var k in global.userData[extraData.domain][extraData.game_id][args.sessionid]) {
                    if (k !== args.userid) {
                        global.isOwner[extraData.domain][extraData.game_id][args.sessionid][k] = true;
                        global.userData[extraData.domain][extraData.game_id][args.sessionid][k].socket.emit('set-isInitiator-true', args.sessionid)
                    }
                    break;
                }
            }
            global.users[extraData.domain][extraData.game_id][args.sessionid] = newArray;
            global.data[extraData.domain][extraData.game_id][args.sessionid].current = global.users[extraData.domain][extraData.game_id][args.sessionid].length;
            global.isOwner[extraData.domain][extraData.game_id][args.sessionid][args.userid] = false;
            if (global.data[extraData.domain][extraData.game_id][args.sessionid].current === 0) {
                delete global.data[extraData.domain][extraData.game_id][args.sessionid];
                delete global.passwords[extraData.domain][extraData.game_id][args.sessionid];
                delete global.userData[extraData.domain][extraData.game_id][args.sessionid];
                delete global.users[extraData.domain][extraData.game_id][args.sessionid];
                delete global.isOwner[extraData.domain][extraData.game_id][args.sessionid]
            }
            socket.leave(room)
            room = ''
          addreuser("remove", io.engine.clientsCount);
        }
        socket.on('disconnect', () => {
			  addreuser("remove", io.engine.clientsCount);
            disconnect()
        });
        socket.on('close-entire-session', function(cb) {
            io.to(room).emit('closed-entire-session', args.sessionid, extraData)
            if (typeof cb == 'function') {
                cb(true)
            }
			  addreuser("remove", io.engine.clientsCount);
        })
        socket.on('open-room', function(data, cb) {
            defineArrayPaths(data, args)
            global.data[data.extra.domain][data.extra.game_id][args.sessionid] = {
                owner_name: data.extra.name,
                room_name: data.extra.room_name,
                country: 'US',
                max: parseInt(args.maxParticipantsAllowed) || 2,
                current: 1,
                password: (data.password === '' ? 0 : 1)
            }
            global.passwords[data.extra.domain][data.extra.game_id][args.sessionid] = (data.password === '' ? null : data.password);
            socket.emit('extra-data-updated', null, global.data[data.extra.domain][data.extra.game_id][args.sessionid])
            
            socket.emit('extra-data-updated', args.userid, global.data[data.extra.domain][data.extra.game_id][args.sessionid])
            
            global.userData[data.extra.domain][data.extra.game_id][args.sessionid][args.userid] = {
                "socket": socket,
                "extra": data.extra
            }
            global.users[data.extra.domain][data.extra.game_id][args.sessionid].push(args.userid)
            room = data.extra.domain+':'+data.extra.game_id+':'+args.sessionid
            socket.join(room)
            global.isOwner[data.extra.domain][data.extra.game_id][args.sessionid][args.userid] = true;
            cb(true, undefined);
          addreuser("remove", io.engine.clientsCount);
        })
        socket.on('check-presence', function(roomid, cb) {
          addreuser("remove", io.engine.clientsCount);
            if (global.data[data.extra.domain][data.extra.game_id][roomid]) {
                cb(true, roomid, null)
                return
            }
            cb(false, roomid, null)
            return
        })
        socket.on('join-room', function(data, cb) {
            defineArrayPaths(data, args)
            if (global.passwords[data.extra.domain][data.extra.game_id][args.sessionid]) {
                var password = global.passwords[data.extra.domain][data.extra.game_id][args.sessionid]
                if (password !== data.password) {
                    cb(false, 'INVALID_PASSWORD')
                    return
                }
            }
            if (! global.users[data.extra.domain][data.extra.game_id][args.sessionid]) {
                cb(false, 'USERID_NOT_AVAILABLE')
                return
            }
            if (global.data[data.extra.domain][data.extra.game_id][args.sessionid].current >= global.data[data.extra.domain][data.extra.game_id][args.sessionid].max) {
                cb(false, 'ROOM_FULL')
                return
            }
            room = data.extra.domain+':'+data.extra.game_id+':'+data.sessionid
            
            for (var i=0; i<global.users[data.extra.domain][data.extra.game_id][args.sessionid].length; i++) {
                socket.to(room).emit('netplay', {
                    "remoteUserId": global.users[data.extra.domain][data.extra.game_id][args.sessionid][i],
                    "message": {
                        "newParticipationRequest": true,
                        "isOneWay": false,
                        "isDataOnly": true,
                        "localPeerSdpConstraints": {
                            "OfferToReceiveAudio": false,
                            "OfferToReceiveVideo": false
                        },
                        "remotePeerSdpConstraints": {
                            "OfferToReceiveAudio": false,
                            "OfferToReceiveVideo": false
                        }
                    },
                    "sender": args.userid,
                    "extra": extraData
                })
            }
            
            global.userData[data.extra.domain][data.extra.game_id][args.sessionid][args.userid] = {
                "socket": socket,
                "extra": data.extra
            }
            global.data[data.extra.domain][data.extra.game_id][data.sessionid].current++
            
            socket.to(room).emit('user-connected', args.userid)
            socket.join(room)
            
            for (var i=0; i<global.users[data.extra.domain][data.extra.game_id][args.sessionid].length; i++) {
                socket.emit('user-connected', global.users[data.extra.domain][data.extra.game_id][args.sessionid][i])
            }
            global.users[data.extra.domain][data.extra.game_id][args.sessionid].push(args.userid)
            global.isOwner[data.extra.domain][data.extra.game_id][args.sessionid][args.userid] = false;
            cb(true, null);
          addreuser("remove", io.engine.clientsCount);
        })
        socket.on('set-password', function(password, cb) {
            if (password && password !== '') {
                global.passwords[data.extra.domain][data.extra.game_id][args.sessionid] = password;
                global.data[data.extra.domain][data.extra.game_id][args.sessionid].password = 1;
            }
            if (typeof cb == 'function') {
                cb(true)
            }
          addreuser("remove", io.engine.clientsCount);
        });
        socket.on('changed-uuid', function(newUid, cb) {
            var a = global.users[extraData.domain][extraData.game_id][args.sessionid]
            if (a.includes(args.userid)) {
                for (var i=0; i<a.length; i++) {
                    if (global.users[extraData.domain][extraData.game_id][args.sessionid][i] === args.userid) {
                        global.users[extraData.domain][extraData.game_id][args.sessionid][i] = newUid
                        break;
                    }
                }
            }
            args.userid = newUid;
			  addreuser("remove", io.engine.clientsCount);
        });
        socket.on('disconnect-with', function(userid, cb) {
            for (var k in global.userData[extraData.domain][extraData.game_id][args.sessionid]) {
                if (k === userid) {
                    global.userData[extraData.domain][extraData.game_id][args.sessionid][k].socket.emit('closed-entire-session', args.sessionid, extraData)
                    disconnect()
                }
            }
            if (typeof cb == 'function') {
                cb(true)
            }
			  addreuser("remove", io.engine.clientsCount);
        })
        socket.on('netplay', function(msg) {
            if (msg && msg.message && msg.message.userLeft === true) {
                disconnect()
            }
            var outMsg = JSON.parse(JSON.stringify(msg))
            outMsg.extra = extraData
            socket.to(room).emit('netplay', outMsg)
          addreuser("remove", io.engine.clientsCount);
        })
        socket.on('extra-data-updated', function(msg) {
            var outMsg = JSON.parse(JSON.stringify(msg))
            outMsg.country = 'US'
            extraData = outMsg
            if (global.userData[extraData.domain] && global.userData[extraData.domain][extraData.game_id] && global.userData[extraData.domain][extraData.game_id][args.sessionid] && global.userData[extraData.domain][extraData.game_id][args.sessionid][args.userid]) {
                global.userData[extraData.domain][extraData.game_id][args.sessionid][args.userid].extra = extraData
            } else if (args.userid) {
                if (! global.userData[extraData.domain]) {
                    global.userData[extraData.domain] = {}
                }
                if (! global.userData[extraData.domain][extraData.game_id]) {
                    global.userData[extraData.domain][extraData.game_id] = {}
                }
                if (! global.userData[extraData.domain][extraData.game_id][args.sessionid]) {
                    global.userData[extraData.domain][extraData.game_id][args.sessionid] = {}
                }
                global.userData[extraData.domain][extraData.game_id][args.sessionid][args.userid] = {
                    "socket": socket,
                    "extra": extraData
                }
            }
            
            io.to(room).emit('extra-data-updated', args.userid, outMsg);
          addreuser("remove", io.engine.clientsCount);
        })
        socket.on('get-remote-user-extra-data', function(id) {
            socket.emit('extra-data-updated', global.userData[extraData.domain][extraData.game_id][args.sessionid][id].extra)
        })
    });
servermain = server.listen(port || 3000, () => {
        console.log('The Main Server is now running on port :'+(port || 3000));
    });
killable(servermain);
    var connections = {}
    server.on('connection', function(e) {
        var k = e.remoteAddress + ':' + e.remotePort;
        connections[k] = e;
        e.on('close', function() {
            delete connections[k];
        });
    });
    server.destroy = function(cb) {
        server.close(cb);
        for (var k in connections) {
            connections[k].destroy();
        }
    };
    servers.push(server)
}

function transformArgs(url) {
    var args = {}
    var idx = url.indexOf('?')
    if (idx != -1) {
        var s = url.slice(idx+1)
        var parts = s.split('&')
        for (var i=0; i<parts.length; i++) {
            var p = parts[i]
            var idx2 = p.indexOf('=')
            args[decodeURIComponent(p.slice(0,idx2))] = decodeURIComponent(p.slice(idx2+1,s.length))
        }
    }
    return args
}
function addreuser(trf, num){
	if(trf == "add"){
			nofusers = num;
	}else if(trf == "remove"){
		nofusers = num;
	}
}
