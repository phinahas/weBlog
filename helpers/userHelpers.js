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
                 userDetailes.post=[]
                 userDetailes.followers=[]
                 userDetailes.following=[]
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
    },



    login:(userInfo)=>{
        return new Promise(async (resolve,reject)=>{
            //console.log(userInfo);
            let user = await db.get().collection(collection.USER).findOne({email:userInfo.email})
             if(!user){
                resolve({status:false,statusMessage:"No such user"})
            }
            else if(user.password===userInfo.password && user.email===userInfo.email){
                let userDetailes=user
                userDetailes.status=true
                //console.log(userDetailes);
                resolve(user)
            }
           
            else if(user.password!=userInfo.password && user.email===userInfo.email){
                resolve({status:false,statusMessage:"Password is wrong"})
            }

        })
    },

    profilePageDetailes:(userId)=>{
        return new Promise(async(resolve,reect)=>{
            let user =await db.get().collection(collection.USER).findOne({_id:objectId(userId)})
            var postCount = (user.post).length;
            var followersCount=(user.followers).length;
            var followingCount=(user.following).length;
            user.postCount=postCount
            user.followersCount=followersCount
            user.followingCount=followingCount
            resolve(user)
        })
    },

    addNewPost:(userId,post)=>{
        return new Promise(async(resolve,reject)=>{
            post.user=objectId(userId)
            post.comments=[]
            let time= new Date()
            time=time+""
            time=time.substring(0,15)
            post.time=time
            post.likes=0
            post.likedBy=[]
            db.get().collection(collection.POST).insertOne(post).then((response)=>{
                var postId=response.ops[0]._id;
                db.get().collection(collection.USER).updateOne({_id:objectId(userId)},{$push:{"post":objectId(postId)}}).then(()=>{
                   // console.log("Done!!!");
                    resolve()
                })
            })

        })
    },

    getPosts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let posts=[]

            let user = await db.get().collection(collection.USER).findOne({_id:objectId(userId)})
            let postIds=user.post;
            let name = user.username;
           
            for(i=0;i<postIds.length;i++){
                //console.log("in for loop");
               // console.log(postIds[i]);
                await db.get().collection(collection.POST).findOne({_id:objectId(postIds[i])}).then((response)=>{
                   // console.log(response);
                   response.name=name
                    posts.push(response)
                    //console.log(posts);
                })
            }
           
           // console.log("posts");
            //console.log(posts);
            resolve(posts)
        })
        
    },

    getBloggers:(name)=>{

        return new Promise(async(resolve,reject)=>{
            console.log("name is"+name);
            let bloggers =  await db.get().collection(collection.USER).find({username:name}).toArray()
            //console.log(bloggers);
            resolve(bloggers)
        })

    },

    getBloggerProfile:(bloggerId)=>{

        return new Promise(async(resolve,reect)=>{
            let user =await db.get().collection(collection.USER).findOne({_id:objectId(bloggerId)})
            var postCount = (user.post).length;
            var followersCount=(user.followers).length;
            var followingCount=(user.following).length;
            user.postCount=postCount
            user.followersCount=followersCount
            user.followingCount=followingCount
            resolve(user)
        })

    },

    isFollowing:(userId,bloggerId)=>{

          
        return new Promise(async(resolve,reject)=>{

            let user= await db.get().collection(collection.USER).findOne({_id:objectId(userId)})
            let following = user.following
            let status = 0;
           // console.log(following);
            for(i=0;i<following.length;i++){
                //console.log(bloggerId);
               // console.log(following[i]);
                following[i]=following[i]+""
                if( bloggerId===following[i])
                status=1;

            }
         // console.log(status);
            if(status===0)
                resolve(false)
            else
                resolve(true)    

        })

    },


    followBlogger:(userId,bloggerId)=>{
        return new Promise((resolve,reject)=>{

            db.get().collection(collection.USER).updateOne({_id:objectId(userId)},{$push:{"following":objectId(bloggerId)}}).then(()=>{

                db.get().collection(collection.USER).updateOne({_id:objectId(bloggerId)},{$push:{"followers":objectId(userId)}}).then(()=>{

                         resolve()
                })
                
            })



        })
    },

    unfollowBlogger:(userId,bloggerId)=>{



        return new Promise((resolve,reject)=>{
            console.log("poping");

            db.get().collection(collection.USER).updateOne({_id:objectId(userId)},{$pull:{"following":objectId(bloggerId)}}).then(()=>{

                db.get().collection(collection.USER).updateOne({_id:objectId(bloggerId)},{$pull:{"followers": objectId(userId)}}).then(()=>{
                    //console.log("done");

                         resolve()
                })
                
            })



        })

    },



}
