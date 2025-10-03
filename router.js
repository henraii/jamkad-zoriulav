let express = require("express");
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const router = express.Router();

router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);

// post route
router.get(
  "/create-post",
  userController.checkLogin,
  postController.viewCreatePost
);

router.post(
  "/create-post",
  userController.checkLogin,
  postController.createPost
);

router.get("/post/:id", postController.viewSinglePost);

router.get(
  "/profile/:username",
  userController.checkUserExists,
  userController.viewProfile
);

router.get(
  "/post/:id/edit",
  userController.checkLogin,
  postController.viewEditPost
);

router.post("/post/:id/edit", userController.checkLogin, postController.edit);
router.post(
  "/post/:id/delete",
  userController.checkLogin,
  postController.delete
);

router.post("/search", postController.search);

router.post("/logout", userController.logout);

router.post("/follow/:username", userController.checkLogin, userController.follow);
router.post("/unfollow/:username", userController.checkLogin, userController.unfollow);
router.get("/check-follow/:username", userController.checkLogin, userController.checkFollow);


module.exports = router;
