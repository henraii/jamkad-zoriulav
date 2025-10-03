import Search from "./modules/search.js";

// логин хийгээгүй хүмүүст хайх товчлуур харагдахгүй байх
if (document.querySelector(".header-search-icon")) {
  new Search();
}
