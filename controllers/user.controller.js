const { response } = require('express');
const Users= require('../models/User')
const fs = require('fs')
const util = require('util');
const readFile = util.promisify(fs.readFile);

user = {}

user.register =async (req,res)=>{

    const { nombre } = req.body;

    const user = await Users.findOne({ nombre: nombre });

    if(!user){
        newUser = new Users({ nombre })
        await newUser.save();
        res.send({message: 'registrado',error:0})
    }
    else{
        res.send({message: 'ya existe el usuario',error:1})
    }
}

user.add = async (req,res)=>{

    const { owner,nombre } = req.body;

    const user = await Users.findOne({ nombre: nombre });
    const me = await Users.findOne({nombre:owner})

    if(user){
      if(me.friends.includes(nombre)){
        res.send({message: 'Oh! ya tienes este usuario',error:1})
      }else{
        await Users.updateOne({nombre:owner},
        {$addToSet:{friends:nombre}})
        res.send({message: 'Vamos! amigo registrado',error:0})
      }
    }
    else{
        res.send({message: 'Nain! no existe este usuario',error:1})
    }
}

user.info = async (req,res)=>{
    
    let response = [] 
    const {owner} = req.body;
    const user = await Users.findOne({ nombre: owner });
    if(user){

      user.friends.forEach(element => {
        if(user.messageFriends.includes(element)){
          response.push([element,true])
        }else{
          response.push([element,false])
        }
      });
      
    }
    res.send(response) 
}

user.updateConnection = async (data,socketId)=>{

    const {owner} = data.fields;
    const user = await Users.findOne({ nombre: owner });
    if(user){
        await Users.updateOne({nombre:owner},
        {id_socket:socketId,connected:true})
    }

}


user.saveMessage = async (data) => {
    try {
      let owner = data.fields.owner;
      let friend = data.fields.friend;
      let message = data.fields.message;
  
      const file1 = `./conversation/${owner}&${friend}.txt`;
      const file2 = `./conversation/${friend}&${owner}.txt`;
  
      const accessFile = util.promisify(fs.access);
      const writeFile = util.promisify(fs.writeFile);
      const appendFile = util.promisify(fs.appendFile);
  
      try {
        await accessFile(file1, fs.constants.F_OK);
        await appendFile(file1, `\n${owner}:${message}`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          try {
            await accessFile(file2, fs.constants.F_OK);
            await appendFile(file2, `\n${owner}:${message}`);
          } catch (error) {
            if (error.code === 'ENOENT') {
              console.log('Estoy aquí');
              await writeFile(file2, `${owner}:${message}`);
            } else {
              throw error;
            }
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  
user.addFriendAlert = async (data)=>{

    let owner = data.fields.owner;
    let friend = data.fields.friend;

    const user = await Users.findOne({ nombre: friend });

    if(user && user.inRoom != owner){

        await Users.updateOne({nombre:friend},
        {$addToSet:{messageFriends:owner}})
        console.log('en principio lo ha agregado')
    }



}

user.addInroom = async (data)=>{

    let owner = data.fields.owner;
    let friend = data.fields.friend;

    await Users.updateOne({nombre:owner},
        {inRoom:friend})

}

user.dropInroom = async (data)=>{
    
    let owner = data.fields.owner;

    await Users.updateOne({nombre:owner},
        {inRoom:null},{new:true})

}

user.dropAlerts =async (data)=>{

    let owner = data.fields.owner;
    let friend = data.fields.friend;

    await Users.updateOne(
        { nombre: owner },
        { $pull: { messageFriends:friend } })

}

user.getAlerts = async (data) =>{

    let finalList = [];
    let owner = data.fields.owner;
    let friend = data.fields.friend;

    let response = await Users.findOne({'nombre':owner})

    friend.forEach(e=>{
      if(response.messageFriends.includes(e)){
        finalList.push([e,true])
      }else{
        finalList.push([e,false])
      }
    })

    return finalList
}

user.getConvers = async (data) => {
    try {
      let convers = [];
      let owner = data.fields.owner;
      let friend = data.fields.friend;
  
      const file1 = `./conversation/${owner}&${friend}.txt`;
      const file2 = `./conversation/${friend}&${owner}.txt`;
  
      let data1;
      try {
        data1 = await readFile(file1, 'utf-8');
        let lines1 = data1.split('\n');
        lines1.forEach(element => {
          let separated = element.split(':');
          convers.push(separated);
        });
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
  
      if (convers.length === 0) {
        try {
          let data2 = await readFile(file2, 'utf-8');
          let lines2 = data2.split('\n');
          lines2.forEach(element => {
            let separated = element.split(':');
            convers.push(separated);
          });
        } catch (error) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      }
  
      return convers;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

user.friendOnConnect= async(data)=>{
  let friend = data.fields.friend;
  let owner = data.fields.owner
  const user = await Users.findOne({ nombre: friend });
  if(user.inRoom == owner){
        return true
  }else{
    return false
  }
}

user.nowInroom=async(data)=>{
  let friend = data.fields.friend;
  let owner = data.fields.owner
  const user = await Users.findOne({ nombre: friend });
  if(user.inRoom != owner && user.connected){
        return [true,user.id_socket]
  }else{
    return [false]
  }
}
user.disconnect = async(data)=>{
  await Users.updateOne({id_socket:data},
    {inRoom:null},{new:true})

  console.log('ya se ha ejecutado esta')
}

user.getFriendSocket=async(data)=>{

  let friend = data.fields.friend;
  console.log(friend)
  const user =await Users.findOne({nombre:friend})
  if(user){
    return user.id_socket
  }

}

module.exports = user