const {Schema,model}=require('mongoose')

const usuariosSchema= new Schema({
nombre:{type:String},
id_socket:{type:String,default:null},
friends:{type:Array,default:[]},
messageFriends:{type:Array,default:[]},
inRoom:{type:String,default:null},
connected:{type:Boolean,default:false}
})

module.exports =model('Usuarios',usuariosSchema)