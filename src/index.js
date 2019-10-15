const express = require('express');
const chat_mensaje = require('./models/chat_mensaje.js')
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport')
const formidable = require('express-formidable')
const pug = require('express-pug')



//Initialization
var expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
const app = express();
require('../src/database.js');
require('../src/config/passport.js')

//Setting
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({/* 
    helpers: require("../src/public/javascript/Loggin/helper.js").helpers, */
    defaultLayout: 'main',
    layouts: 'administrador',
    layoutsDir: path.join(app.get('views'), 'Layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));

app.set('view engine', '.hbs');
/* app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layouts: 'administrador',
    layoutsDir: path.join(app.get('views'), 'Layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
})); */

/* app.set('view engine', '.hbs'); */
//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');
//Middleware
app.use(express.urlencoded({
    extended: false
}));
app.use(methodOverride('_method'));

app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: expiryDate
    }

}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Global variables

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error = req.flash('error')
    app.locals.user = req.user;
    next()
})

app.set('views', path.join(__dirname, '/public'));
//Routes
app.use(require('../src/routes/index.js'));
app.use(require('../src/routes/notes.js'));
app.use(require('../src/routes/users.js'));

//Static Files
app.use(express.static(__dirname + '/public'));

//Server is listening
server = app.listen(app.get('port'), () => {
    console.log('Server on port:', app.get('port'))
});
const fileUpload = require('express-fileupload')
app.use(fileUpload())
app.use(formidable({keepExtensions: true, uploadDir:"images"}));
//app.use(formidable.parse({keepExtensions: true, uploadDir:"images"}))

// Configuración de chat
const io = require("socket.io")(server)
var socketUsers = require('socket.io.users');
var rootUsers = socketUsers.Users;
socketUsers.Session(app);

var pass = {}
var key = 'Orientation Sensor';
//var clients = [];

var clients = [];
var users = [];
var users_connected = [];


var socket_user = io.of('/userchat');
var socket = io.of('/admichat');



/* socket_user.on('connection', function (socket) {

    socket.on('addusuario', function (username) {
        socket.username = username;
        socket.room = username;
        usernames[username] = username;
        io.of('/userchat').emit('updaterooms', usernames);
    })

    socket.on('sendchat', function (data) {
        // io.of('/userchat').in(socket.room).emit('updatechatt', data)
        io.of('/userchat').in(socket.room).emit('updatechatt', data);
        // io.of(socket.room).emit('updatechatt', data);
        // io.of('/userchat').socket(socket.room).emit('updatechatt',data);
        //io.of('/userchat').in(socket.room).emit('updatechatt', data);
    });

    socket.on('switchRoom', function (newroom) {
        socket.leave(socket.room);
        socket.join(newroom);
        //io.of('/admichat').emit('updatechat', 'SERVER', 'you have connected to '+ newroom);

        //socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');

        socket.room = newroom;
        //socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
        //io.of('/admichat').emit('updaterooms', usernames, newroom);
    });
}) */
var newusuarios = {}
var usernames = {};
var ChatsUser = require('../src/models/chat.js')
var SaveChat = require('./models/chat_mensaje.js')
var nameuser = "";
var emailuser = "";
var roleuser = "";
var iduser = "";
var indicador = 0;
//var newroom = "";
var arr2 = [];
socket.on('connection', function (socket) {
    socket.on('GetUser', function (pnameuser, pemailuser, proleuser, piduser) {
        socket.nameuser = pnameuser
        socket.emailuser = pemailuser
        socket.roleuser = proleuser
        socket.room = piduser
        socket.join(socket.room);
        socket.session = indicador
        io.of('/admichat').emit('GetMensajesUser', socket.room);
    })
    socket.on('GetAdmin', async function (pnameuser, pemailuser, proleuser, piduser) {
        socket.nameuser = pnameuser
        socket.emailuser = pemailuser
        socket.roleuser = proleuser
        socket.iduser = piduser
        socket.room = piduser;
        socket.join(socket.room);
        getUsuarios()        
    })
    socket.on('sendchatuser', async function (mensaje, iduser) {
        ChatsUser.find({ id_chat: iduser }, async function (err, chats) {
            if (chats.length == 0) {
                var ChatUser = await new ChatsUser({ id_chat: iduser, name_envia: socket.nameuser })
                var iduse = iduser
                var name = socket.nameuser
                ChatUser.save()       
                arr2 = [iduse, name]                
                io.of('/admichat').emit('updaterooms', arr2);
            }           
        })
        //console.log(socket.room + " " + mensaje  + " "+ socket.room  + " "+ socket.nameuser  + " ")
        var SaveMensaje = await new SaveChat({id_chat:socket.room, mensaje:mensaje, id_usuarioEnvia:socket.room, name_envia:socket.nameuser})
        SaveMensaje.save()  
        io.of('/admichat').in(socket.room).emit('updatechat', socket.nameuser, mensaje);
    });
    async function getUsuarios(){
        ChatsUser.find({},async function (err, chats) {
            chats.forEach(function (chats) {
                arr2 = [chats.id_chat, chats.name_envia]
                io.of('/admichat').emit('updaterooms', arr2);

            });            
        })
    }    
    socket.on('sendchatadmin', async function (mensaje) {
        //console.log(socket.room + " " + mensaje  + " "+ socket.iduser  + " "+ socket.nameuser  + " ")
        var SaveMensaje = await new SaveChat({id_chat:socket.room, mensaje:mensaje, id_usuarioEnvia:socket.iduser, name_envia:socket.nameuser})
        SaveMensaje.save()  
        io.of('/admichat').in(socket.room).emit('updatechat', socket.nameuser, mensaje);
    });
    socket.on('switchRoom',async function (newroom) {
        //console.log("ANTES: " + socket.room )
        var Anterior = socket.room
        var Despues = newroom
        socket.leave(socket.room);
        socket.join(newroom);
        if(Anterior != Despues){
            io.of('/admichat').emit('GetMensajes', newroom);
        }
        //console.log("DESPUES: " + newroom )
        socket.room = newroom; 
    });
})

/* 
socket.on('connection', function (socket) {
    socket.on('adduser', function (username, roleuser) {
        socket.username = username;
        socket.room = username;
        socket.join(socket.room);
        if (roleuser == "usuario") {
            usernames = { "sala": username }
            usernames['ActivadoChat'] = '0'
            //============= console.log(usernames)
            //============= change_na(username)
        } else {
            usernames = { "sala": username }
            usernames['ActivadoChat'] = '0'
        }
        AddUsuarios()        
        //============= console.log(usernames)
        io.of('/admichat').emit('updaterooms', newusuarios);
        
        //============= io.of('/admichat').emit('updaterooms', usernames);
    });

    function AddUsuarios() {
        for (var key in usernames) {
            if (key != "ActivadoChat") {
                newusuarios[usernames[key]] = usernames[key]
            }
            //============= newusuarios[usernames[key]] = usernames[key] 
            //============= console.log(" key is : "   + key + "   and value for key is   " + usernames[key]);
        }
    }

    function DeleteUsuarios(Usuario){
        delete newusuarios[Usuario];
    }

    socket.on('sendchat', function (data) {
        io.of('/admichat').in(socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('switchRoom', function (newroom) {
        socket.leave(socket.room);
        socket.join(newroom);
        //============= io.of('/admichat').emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
        //============= socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
        socket.room = newroom;
        //============= io.of('/admichat').emit('updaterooms', usernames, newroom);
    });

    socket.on('disconnect', function () {
        DeleteUsuarios(socket.username)        
        io.of('/admichat').emit('updaterooms', usernames);
        // ============= socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });

}); */

/*
io.sockets.on('connection', function (socket) {
    var uid = null;
   
    //pass = ({ socketId:socket.id, ID: '101'  })
    //console.log("aqui esta: ")
    //console.log(users)
    
   
    //console.log(someObj);
    //delete users['101'];
    //pass.ID.splice
    //delete pass.ID('101'); 
    //console.log('Aqui no esta:')
    //console.log(users)
    socket.on('register',async function (id_usuario,name) {
        //console.log(users)
        //const chat = new chatmodel({id_usuario, name})
       // const result = await chat.save()
        //console.log(result)
        //console.log(id_usuario)
        //console.log(name)

    })

     socket.on('room', function (room, sala) {
          //pass =  {'usuario':room, 'id':room.id}
          //console.log(pass)
          //console.log(room)
        
          //var myString = JSON.stringify(users);
        
          //console.log(myString.ID)


          /*if(room === users.socketNickName){
            console.log("Existe")
          }else{
            console.log(" No Existe")
          }
          pass = {
              socketId: socket.id,
              socketNickName: room
          };
          users.push(pass)*/
//pass.push(socketInfo);
//console.log("ENTRO:")
//console.log(pass)
/*
          socket.join(room);
    });*/

/* socket.on('disconnect', function () {
     /*console.log("SALIO:")
     console.log(users);

     console.log(console.log(delete users[pass]));
     console.log(users);*/
/*var nuevoid = pass.ID
 
 // console.log(ase)
  delete pass.ID.pass.ID; 
  console.log("SALIO 2: ")
console.log(pass.ID);*/
//users.indexOf(users);
// users.splice(x, users);
// console.log("OTRO:")
//console.log(pass.ID);
/*
});
*/
//console.log("aqui es:" + users)
/*
socket.on('disconnect', function () {
    socket.broadcast.emit('mensaje', { text: 'Un usuario se ha desconectado.' });
});*/

//var clients = socket.client.conn;
//console.log(io.sockets.server.engine.clientsCount);
/*
    socket.login = {}
    socket.on('userconect', function (name) {
       // console.log(name)
        
        socket.nameuser = name.name
        socket.role = name.role
        socket.iduser = name.iduser
        socket.email = name.email
        socket.id_chat = "5d49c4b7559a2b4ba86614dd"
        //socket.login = username;
        //io.sockets.emit('login', { username: socket.login });
    });*/
//socket.username = "Anonymous"
/*socket.on('sendMessage', function (data) {
    session.userId //senderId
});*/

/*socket.on('connectedUser', function (users) {
    socket.name = users;
    io.emit('connectedUser', socket.name);
    // console.log(users + ' has joined the chat.');
});*/
/* socket.on('change_username', function (data) {
     socket.username = data.username
 })
 socket.on('new_message', function (data) {
     io.sockets.emit('new_message', { message: data.message, nameuser: socket.nameuser });
    // guardar_mensaje(socket.id_chat,data.message,socket.iduser, socket.nameuser)
 })*/
//var pep = io.sockets.connected
//var pep = io.sockets.adapter.rooms
//var pep = io.sockets.server.eio.clientsCount
/*Object.keys(io.sockets.sockets);
Object.keys(io.sockets.sockets).forEach(function(id) {
    console.log("ID:",id)  // socketId
})*/




//console.log(pep)

/*io.sockets.sockets['nickname'] = socket.id;
 socket.on("chat", function(data) {      
     var sock_id = io.sockets.sockets['nickname']
     console.log(io.sockets.sockets[sock_id])
 });  */

/*var room = socket.id
var clients_in_the_room = io.sockets.adapter.rooms[room];
for (var clientId in clients_in_the_room) {
  //Seeing is believing
  console.log('client: %s', clientId);  
    var client_socket = io.sockets.connected[clientId.id_usuario];//Do whatever you want with this
    //console.log('client: %s', client_socket);  
}*/


/*
})*/


function guardar_mensaje(id_chat, mensaje, iduser, name) {
    const NewMensaje = new chat_mensaje({ id_chat: id_chat, mensaje: mensaje, id_usuarioEnvia: iduser, name_envia: name })
    NewMensaje.save()
}

//npm i express express-handlebars express-session method-override mongoose passport passport-local bcryptjs connect-flash nodemon -D
// npm list --depth=0 Listar los modulos sin profundidad