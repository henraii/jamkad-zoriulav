const { ObjectId } = require("mongodb");
const sanitizeHTML = require("sanitize-html");

const postsCollection = require("../db").collection("posts");

let Post = function (data, userid) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
};

// 🔍 Нэг пост авах
Post.findSinglePostById = async function (id) {
  try {
    let posts = await Post.getPostWithAuthorQuery([
      { $match: { _id: new ObjectId(id) } },
    ]);
    if (posts.length) {
      return posts[0];
    } else {
      throw "Post not found";
    }
  } catch (err) {
    throw err;
  }
};

// 📦 Author-г populate хийж авах
Post.getPostWithAuthorQuery = async function (operations, sortOperations = []) {
  let aggOperations = operations
    .concat([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDocument",
        },
      },
      {
        $project: {
          title: 1,
          body: 1,
          createDate: 1,
          author: { $arrayElemAt: ["$authorDocument", 0] },
        },
      },
    ])
    .concat(sortOperations);

  return await postsCollection.aggregate(aggOperations).toArray();
};

// ✍️ Author-ийн бүх пост
Post.findPostsByAuthorId = async function (authorId) {
  return Post.getPostWithAuthorQuery(
    [{ $match: { author: new ObjectId(authorId) } }],
    [{ $sort: { createDate: -1 } }]
  );
};

// ✅ Validate + clean
Post.prototype.validate = function () {
  this.data = {
    title: sanitizeHTML(this.data.title ? this.data.title.trim() : "", {
      allowedTags: [],
      allowedAttributes: {},
    }),
    body: sanitizeHTML(this.data.body ? this.data.body.trim() : "", {
      allowedTags: [],
      allowedAttributes: {},
    }),
    author: new ObjectId(this.userid),
    createDate: new Date(),
  };

  if (!this.data.title || this.data.title.length < 2) {
    this.errors.push("Та гарчиг оруулна уу");
  }
  if (!this.data.body || this.data.body.length < 2) {
    this.errors.push("Та бичлэгийн агуулгаа оруулна уу");
  }
};

// 🆕 Пост үүсгэх
Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.validate();
    if (this.errors.length) {
      return reject(this.errors);
    }
    postsCollection
      .insertOne(this.data)
      .then((info) => resolve(info.insertedId))
      .catch(() => reject(["Алдаа гарлаа. Дахин оролдоно уу"]));
  });
};

// ✏️ Пост шинэчлэх
Post.prototype.update = function (id) {
  return new Promise((resolve, reject) => {
    this.validate();
    if (this.errors.length) {
      return reject(this.errors);
    }
    postsCollection
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { title: this.data.title, body: this.data.body } }
      )
      .then(() => resolve("success"))
      .catch((err) =>
        reject(["Алдаа гарлаа. Дахин оролдоно уу: " + err])
      );
  });
};

// ❌ Пост устгах
Post.delete = async function (postId, currentUserId) {
  try {
    let post = await Post.findSinglePostById(postId);
    if (
      post.author &&
      post.author._id.toString() === new ObjectId(currentUserId).toString()
    ) {
      await postsCollection.deleteOne({ _id: new ObjectId(postId) });
      return;
    } else {
      throw "Та зөвшөөрөлгүй байна";
    }
  } catch (err) {
    throw err;
  }
};

// 🔍 Хайлт хийх
Post.search = async function (searchTerm) {
  if (typeof searchTerm !== "string") throw "Invalid search term";
  try {
    let posts = await Post.getPostWithAuthorQuery(
      [
        {
          $match: {
            $text: { $search: searchTerm },
          },
        },
      ],
      [{ $sort: { score: { $meta: "textScore" } } }]
    );
    return posts;
  } catch (err) {
    console.log("Search error: " + err);
    return [];
  }
};

module.exports = Post;
