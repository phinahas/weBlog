const db = require('../config/database-connection')
const collection = require('./collectionNames')
var objectId = require('mongodb').ObjectID;

module .exports={
    createUser:(userDetailes)=>{
            // console.log(userDetailes);
             return new Promise(async(resolve,reject)=>{
             let user = await db.get().collection(collection.USER).findOne({email:userDetailes.email})
            // console.log(user);
             if(!user){
                 let newUser = await db.get().collection(collection.USER).insertOne(userDetailes)
                 let response = newUser.ops[0]
                 response.status = true
                 //console.log(response);
                 resolve(response)
             }else{
                
                  if(user.email===userDetailes.email){
                      let obj={status:false,statusMessage:"user with same email exist"}
                      resolve(obj)
                  }

             }

             })
    }
}
