import axios from "axios";
import DOMPurify from "dompurify";

export default class Search {
  constructor() {
    this.injectSearchHTML();
    this.searchIcon = document.querySelector(".header-search-icon");
    this.overlay = document.querySelector(".search-overlay");
    this.closeIcon = document.querySelector(".close-live-search");
    this.searchField = document.querySelector("#live-search-field");
    this.loaderIcon = document.querySelector(".circle-loader");
    this.resultsArea = document.querySelector(".live-search-results");
    this.typingWaitTimer;
    this.previousValue = "";
    this.events();
  }

  events() {
    this.searchField.addEventListener("keyup", () => this.keyPressHandler());
    this.closeIcon.addEventListener("click", () => {
      this.closeOverlay();
    });
    this.searchIcon.addEventListener("click", (e) => {
      e.preventDefault();
      this.openOverlay();
    });
  }

  keyPressHandler() {
    let value = this.searchField.value;

    if (value == "") {
      this.hideLoaderIcon();
      this.hideResultsArea();
    }

    if (value != "" && value != this.previousValue) {
      // Үсэг дарагдсан тул таймерийг цуцална
      clearTimeout(this.typingWaitTimer);
      // Ачааллах дүрсийг харуулна
      this.hideResultsArea();
      this.showLoaderIcon();

      // 2 секунд хүлээхээр шинэ таймер эхлүүлнэ
      this.typingWaitTimer = setTimeout(() => this.sendRequest(), 700);
    } else {
      this.hideLoaderIcon();
    }
    // Өмнөх утганд одоогийн утгыг хадгална
    this.previousValue = value;
  }

  hideLoaderIcon() {
    this.loaderIcon.classList.remove("circle-loader--visible");
  }

  sendRequest() {
  axios.post("/search", { searchTerm: this.searchField.value })
    .then((response) => {
      console.log("Search response:", response.data);  // Add: Check array length/content
      this.renderResultsHTML(response.data);
    })
    .catch((err) => {
      console.error("Axios error:", err.response?.data || err.message);  // Better error
      alert("Техникийн алдаа гарлаа. Дахин оролдоно уу. " + (err.response?.data?.error || err));
    });
}

  renderResultsHTML(posts) {
    console.log("posts", posts);
    if (posts.length) {
      this.resultsArea.innerHTML =
        DOMPurify.sanitize(`<div class="list-group shadow-sm">
            <div class="list-group-item active"><strong>Search Results</strong> (${posts.length} items found)</div>


            ${posts
              .map((post) => {
                return ` <a href="/post/${
                  post._id
                }" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128"> <strong>${
                post.title
              }</strong>
              <span class="text-muted small">by ${
                post.author.username
              } on  ${new Date(post.createDate).toLocaleDateString()}</span>
            </a>`;
              })
              .join("")}  
          </div>`);
    } else {
      this.resultsArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm">Хайлт илэрцгүй байна. Өөр үгээр оролдоно уу.</p>`;
    }
    this.hideLoaderIcon();
    this.showResultsArea();
  }

  showResultsArea() {
    this.resultsArea.classList.add("live-search-results--visible");
  }

  hideResultsArea() {
    this.resultsArea.classList.remove("live-search-results--visible");
  }

  showLoaderIcon() {
    this.loaderIcon.classList.add("circle-loader--visible");
  }

  closeOverlay() {
    this.overlay.classList.remove("search-overlay--visible");
  }

  openOverlay() {
    this.overlay.classList.add("search-overlay--visible");
    setTimeout(() => this.searchField.focus(), 50);
  }

  injectSearchHTML() {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
  <div class="search-overlay">
    <div class="search-overlay-top shadow-sm">
      <div class="container container--narrow">
        <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
        <input type="text" id="live-search-field" class="live-search-field" placeholder="Хайх үгээ бичнэ үү...">
        <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
      </div>
    </div>

    <div class="search-overlay-bottom">
      <div class="container container--narrow py-3">
        <div class="circle-loader"></div>
        <div class="live-search-results">
          
        </div>
      </div>
    </div>
  </div>
  `
    );
  }
}
