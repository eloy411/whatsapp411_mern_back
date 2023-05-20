const {updateConnection,saveMessage,addFriendAlert,getAlerts,dropAlerts,addInroom,dropInroom,getConvers,nowInroom,disconnect,friendOnConnect,getFriendSocket} = require('./controllers/user.controller')



Socket = {}


Socket.connection = (io) => {

    const adapter = io.of('/').adapter;

    io.on('connection',(socket)=>{

        socket.on('setConnection',(data)=>{
            updateConnection(data,socket.id)
        })

        socket.on('openRoom',async(data)=>{

            let owner = data.fields.owner;
            let friend = data.fields.friend;

            let room1 = adapter.rooms.get(`${owner}&${friend}`);
            let room2 = adapter.rooms.get(`${friend}&${owner}`);

            if(room1){
                room1 = `${owner}&${friend}`
                socket.join(room1)
                dropAlerts(data)
                addInroom(data)
                let convers = await getConvers(data)
                let connect = await friendOnConnect(data)

                io.to(room1).emit('convers',{con:convers,inroom:owner,on:connect})
            }else{
                room2 = `${friend}&${owner}`
                socket.join(room2)
                dropAlerts(data)
                addInroom(data)
                let convers = await getConvers(data)
                let connect = await friendOnConnect(data)

                io.to(room2).emit('convers',{con:convers,inroom:owner,on:connect})
            }
        })

        socket.on('exitChat',async (data)=>{
            await dropInroom(data)
            let socketId = await getFriendSocket(data)
            console.log(socketId)
            io.to(socketId).emit('friend-disconected',{friendDisconected:true})
        })

        socket.on('sendMessage',async (data)=>{

            let owner = data.fields.owner;
            let friend = data.fields.friend;

            await saveMessage(data,socket.id)
            await addFriendAlert(data)
            let friendConnected = await nowInroom(data)

            let room1 = adapter.rooms.get(`${owner}&${friend}`);
            let room2 = adapter.rooms.get(`${friend}&${owner}`);

            if(room1){
                room1 = `${owner}&${friend}`
                let convers = await getConvers(data)
                if(friendConnected[0]){
                    console.log(friendConnected)
                    io.to(friendConnected[1]).emit('message')
                }else{
                    io.to(room1).emit('convers',{con:convers,inroom:owner})
                }
                io.to(room1).emit('convers',{con:convers,inroom:owner})
            }else{
                room2 = `${friend}&${owner}`
                let convers = await getConvers(data)
                // console.log(room2.size)
                if(friendConnected[0]){
                    console.log(friendConnected)
                    io.to(friendConnected[1]).emit('message')
                }else{
                    io.to(room2).emit('convers',{con:convers,inroom:owner})
                }
                io.to(room2).emit('convers',{con:convers,inroom:owner})
            }
        })

        socket.on('getAlert',async(data)=>{
              let response = await getAlerts(data)
              console.log(data)
              socket.emit('alert',{alert:response})
        })


        socket.on('disconnect',()=>{
            disconnect(socket.id)
        })
    })

    
}


module.exports = Socket