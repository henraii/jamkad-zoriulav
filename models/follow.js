const followsCollection = require("../db").collection("follows")
const { ObjectId } = require("mongodb")

let Follow = function(followedId, followerId) {  
  this.followedId = followedId;
  this.followerId = followerId;
};

Follow.prototype.create = function() {
  return followsCollection.insertOne({
    authorId: new ObjectId(this.followedId),  
    followerId: new ObjectId(this.followerId) 
  });
};

Follow.prototype.delete = function() {
  console.log("Attempting delete: followedId=", this.followedId, "followerId=", this.followerId);  // Add logging
  return followsCollection.deleteOne({
    authorId: new ObjectId(this.followedId),
    followerId: new ObjectId(this.followerId)
  }).then(result => {
    console.log("Delete result:", result);  
    return result;
  });
};

Follow.isFollowing = async function(followedId, followerId) {  // Renamed param
  let followDoc = await followsCollection.findOne({
    authorId: new ObjectId(followedId),
    followerId: new ObjectId(followerId)
  });
  return !!followDoc;
};

Follow.countFollowers = function(userId) {
  return followsCollection.countDocuments({ authorId: new ObjectId(userId) })
}

Follow.countFollowing = function(userId) {
  return followsCollection.countDocuments({ followerId: new ObjectId(userId) })
}

module.exports = Follow
