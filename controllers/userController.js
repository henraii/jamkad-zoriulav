const Post = require("../models/Post");
let User = require("../models/User");
const Follow = require("../models/follow")

exports.checkLogin = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "Та нэвтэрсэн байх шаардлагатай");
    req.session.save(function () {
      res.redirect("/");
    });
  }
};

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard");
    return;
  } else {
    res.render("home-guest");
  }
};

exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { username: user.data.username, _id: user._id };
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch(function (err) {
      req.flash("errors", err);
      res.redirect("/");
    });
};

exports.register = function (req, res) {
  let user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = { username: user.data.username, _id: user._id, myColor: "red" };  // Include _id
      req.session.save(function () {
        req.flash("success", "Бүртгэл амжилттай боллоо!");  // Optional: Use flash for feedback
        res.redirect("/");
      });
    })
    .catch((errors) => {
      req.flash("errors", errors);
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.checkUserExists = function (req, res, next) {
  User.findByUsername(req.params.username)
    .then(function (userDocument) {
      // viewProfile руу дамжуулж өгнө
      req.profileUser = userDocument;
      next();
    })
    .catch(function () {
      res.render("404");
    });
};

exports.viewProfile = async function (req, res) {
  try {
    let posts = await Post.findPostsByAuthorId(req.profileUser._id);
    let isFollowing = false;
    if (req.session.user && req.profileUser.username !== req.session.user.username) {
      isFollowing = await Follow.isFollowing(req.profileUser._id, req.session.user._id);
    }
    res.render("profile-posts", {
      posts: posts,
      profileUsername: req.profileUser.username,
      isFollowing: isFollowing  // Pass to template
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.render("404");
  }
};


exports.follow = async function(req, res) {
  try {
    let followedUser = await User.findByUsername(req.params.username);
    if (!followedUser) throw new Error("User not found");
    if (followedUser._id.toString() === req.session.user._id.toString()) {
      throw new Error("Cannot follow yourself");
    }
    let follow = new Follow(followedUser._id, req.session.user._id);  
    await follow.create();
    req.flash("success", "Амжилттай дагалаа");
  } catch (err) {
    console.error("Follow error:", err);
    req.flash("errors", err.message || "Дагах үед алдаа гарлаа");
  }
  req.session.save(() => res.redirect(`/profile/${req.params.username}`));
};

exports.unfollow = async function(req, res) {
  try {
    let followedUser = await User.findByUsername(req.params.username);
    if (!followedUser) throw new Error("User not found");
    let follow = new Follow(followedUser._id, req.session.user._id);
    let deleteResult = await follow.delete();  
    if (deleteResult.deletedCount === 0) {
      throw new Error("Follow relationship not found");
    }
    req.flash("success", "Дагахыг зогсоолоо");
  } catch (err) {
    console.error("Unfollow error:", err);
    req.flash("errors", err.message || "Зогсооход алдаа гарлаа");
  }
  req.session.save(() => res.redirect(`/profile/${req.params.username}`));
};


exports.checkFollow = async function(req, res) {
  let followedUser = await User.findByUsername(req.params.username);
  if (!followedUser) return res.json(false);
  let isFollowing = await Follow.isFollowing(followedUser._id, req.session.user._id);
  res.json(isFollowing);
};
