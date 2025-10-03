const e = require("connect-flash");
const Post = require("../models/Post");
exports.viewCreatePost = (req, res) => {
  res.render("create-post");
};

exports.createPost = (req, res) => {
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then((newPostId) => {
      req.flash("success", "Бичлэг амжилттай үүслээ!");
      req.session.save(() => {
        res.redirect(`/post/${newPostId}`);
      });
    })
    .catch((errors) => {
      req.flash("errors", errors);
      req.session.save(() => {
        res.redirect(`/create-post`);
      });
    });
};

exports.viewSinglePost = async (req, res) => {
  try {
    let post = await Post.findSinglePostById(req.params.id);
    console.log("🚀 ~ post:", post);
    res.render("single-post", { post: post });
  } catch {
    res.status(404).render("404");
  }
};

exports.viewEditPost = async (req, res) => {
  try {
    let post = await Post.findSinglePostById(req.params.id);
    res.render("edit-post", { post: post });
  } catch {
    res.status(404).render("404");
  }
};

exports.edit = (req, res) => {
  let post = new Post(req.body, req.session.user._id);
  post
    .update(req.params.id)
    .then((status) => {
      if (status == "success") {
        console.log("success---");
        req.flash("success", "Бичлэг амжилттай шинэчлэгдлээ");
        req.session.save(() => {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      } else {
        console.log("errors---");
        req.flash("errors", post.errors);
        req.session.save(() => {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      }
    })
    .catch((errors) => {
      console.log("catch ---");
      req.flash("errors", errors);
      req.session.save(() => {
        res.redirect(`/post/${req.params.id}/edit`);
      });
    });
};

exports.delete = (req, res) => {
  Post.delete(req.params.id, req.session.user._id)
    .then(() => {
      req.flash("success", "Амжилттай устгалаа");
      req.session.save(() => {
        res.redirect(`/profile/${req.session.user.username}`);
      });
    })
    .catch((err) => {
      req.flash("errors", err);
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.search = (req, res) => {
  console.log("Search term:", req.body.searchTerm);
  Post.search(req.body.searchTerm)
    .then((posts) => {
      console.log("Found", posts.length, "posts");
      res.json(posts);
    })
    .catch((err) => {
      console.error("Search error:", err);
      res.status(500).json({ error: "Техникийн алдаа гарлаа." });
    });
};
