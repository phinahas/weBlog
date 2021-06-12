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


    getPostsOfFollowing:(userId)=>{
        return new Promise(async(resolve,reject)=>{

            const posts=[];
            let user = await db.get().collection(collection.USER).findOne({_id:objectId(userId)})

            let following = user.following //store the ids of following people by the user
            //console.log(following);

            for(i=0;i<following.length;i++){

                let followingUser=await db.get().collection(collection.USER).findOne({_id:objectId(following[i])})
                let name = followingUser.username
                let profileImage = followingUser.profileImage
                console.log(name , profileImage);
                let post = await db.get().collection(collection.POST).find({user:objectId(following[i])}).toArray()
               // console.log(post);
                for(j=0;j<post.length;j++){
                    post[j].name=name
                    post[j].profileImage=profileImage
                    posts.push(post[j])
                }
                //console.log(post);
                

            }
            //posts=posts.reverse()
            let reversedPosts = posts.reverse()
           // console.log(reversedPosts);
            resolve(reversedPosts)



        })
    },


    likeOrDislike:(userId,postId)=>{
        return new Promise(async(resolve,reject)=>{
            let post =  await db.get().collection(collection.POST).findOne({_id:objectId(postId)})
            let likedBy = post.likedBy
            let presentStatus=0
            console.log(likedBy);
            let currentLikes = post.likes
            console.log(currentLikes);

            for(i=0;i<likedBy.length;i++)
            {
                likedBy[i]=likedBy[i]+""
                if(likedBy[i]===userId)
                {
                   
                    presentStatus=1;

                }
            }
            

            if(presentStatus===1){
                await db.get().collection(collection.POST).updateOne({_id:objectId(postId)},{$inc:{'likes':-1}}).then(async()=>{
                    
                    await db.get().collection(collection.POST).updateOne({_id:objectId(postId)},{$pull:{"likedBy":objectId(userId)}})
                    resolve({status:true})

                })
               

            }else if(presentStatus===0){
                await db.get().collection(collection.POST).updateOne({_id:objectId(postId)},{$inc:{'likes':1}}).then(async()=>{
                    
                    await db.get().collection(collection.POST).updateOne({_id:objectId(postId)},{$push:{"likedBy":objectId(userId)}})
                    resolve({status:false})

                })
                

            }
        })
    },


    addComment:(user,postId,comment)=>{


      // console.log(user,postId,comment);
        return new Promise((resolve,reject)=>{

        let commentDetails = {
            user:user,
            comment:comment
        }

        db.get().collection(collection.POST).updateOne({_id:objectId(postId)},{$push:{"comments":commentDetails}}).then(()=>{
           // console.log("Done");
            resolve()
        }
            )




        })
    },


    getFollowers:(userId)=>{

        return new Promise(async(resolve,reject)=>{

            let user = await db.get().collection(collection.USER).findOne({_id:objectId(userId)})

            let followersIds = user.followers

            let followersList=[];

            for(i=0;i<followersIds.length;i++){

                let  userFollower = await db.get().collection(collection.USER).findOne({_id:objectId(followersIds[i])})

                let follower = {
                    id:userFollower._id,
                    name:userFollower.username,
                    profileImage:userFollower.profileImage
                }

                followersList.push(follower)


            }
            console.log(followersList);
            resolve(followersList)
            



        })
    },


    getFollowing:(userId)=>{

        return new Promise(async(resolve,reject)=>{

            let user = await db.get().collection(collection.USER).findOne({_id:objectId(userId)})

            let followingsIds = user.following

            let followingList=[];

            for(i=0;i<followingsIds.length;i++){

                let  userFollowing = await db.get().collection(collection.USER).findOne({_id:objectId(followingsIds[i])})

                let following = {
                    id:userFollowing._id,
                    name:userFollowing.username,
                    profileImage:userFollowing.profileImage
                }

                followingList.push(following)


            }
            console.log(followingList);
            resolve(followingList)
            



        })
    },






}
