import LazyLoad from "../../assets/lib/vanilla-lazyload/vanilla-lazyload@19.0.3.js";

let config;
let apiUrl ;
let baseUrl;



let allAuthors = [];

let allEntries = [];

let excludedAccounts = [];

async function fetchGraphQL(query) {
  const req = await fetch(apiUrl + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ operationName: null, variables: {}, query: query }),
  });

  const data = await req.json();
  return data?.data;
}

function search(data, content) {
  if (content === "") {
    data.forEach((entry) => {
      entry.html.style.display = "block";
    });
  }
  data.forEach((entry) => {
    if (entry.name.toLowerCase().includes(content.toLowerCase())) {
      entry.html.style.display = "block";
    } else {
      entry.html.style.display = "none";
    }
  });
}

export async function iniEntries() {
  const response = await fetch('./config.json');
  config = await response.json();
  excludedAccounts = config.hiddenAccounts;
  apiUrl = config.api.url;
  baseUrl = config.baseUrl;

  //fill with content
  const call = await fetchGraphQL(
    "{\n  items {\n    id\n    name\n    thumbnail\n    origin {\n      authors {\n        name\n        id\n      }\n    }\n  }\n}\n"
  );

  const entriesWrapper = document.getElementById("contents");

  call?.items
    ?.sort((a, b) => 0.5 - Math.random())
    .forEach((entry, i) => {
      const entryContainer = document.createElement("article");
      const entryLink = document.createElement("a");
      const entryImgContainer = document.createElement("section");
      const entryInfoContainer = document.createElement("section");

      if (entry?.id?.includes("@donotuse")) return;
      if (!entry?.name) return;

      if (entry.thumbnail) {
        let url = new URL(entry.thumbnail);
        let params = new URLSearchParams(url.search);
        params.set('width', '200');
        params.set('height', '200');
        url.search = params.toString();
        const entryImg = document.createElement("img");
        entryImg.setAttribute("data-src", url.toString());
        entryImg.classList.add('lazy');
        entryImgContainer.appendChild(entryImg);
      }
      //<img alt="A lazy image" class="lazy" data-src="lazy.jpg" />
      entryLink.href = baseUrl + "/entry.html?id=" + entry.id;

      entryInfoContainer.innerHTML = entry.name;

      entryLink.appendChild(entryImgContainer);
      entryLink.appendChild(entryInfoContainer);

      entryContainer.appendChild(entryLink);

      entriesWrapper.appendChild(entryContainer);
      entry.html = entryContainer;

      allEntries.push(entry);
    });

  // add listener

  document
    .querySelector("#search > input")
    .addEventListener("input", (e) => {
      search(allEntries, e.target.value);
    });


    var lazyLoadInstance = new LazyLoad({
      // Your custom settings go here
    });
    lazyLoadInstance.update();
}

export async function iniAuthors() {
  const response = await fetch('./config.json');
  config = await response.json();
  excludedAccounts = config.hiddenAccounts;
  apiUrl = config.api.url;
  baseUrl = config.baseUrl;

  //fill with content
  const call = await fetchGraphQL(
    "{\n  users {\n    id\n    name\n    thumbnail\n    item {\n      id\n    }\n  }\n}\n"
  );

  const authorsWrapper = document.getElementById("contents");
  call?.users
    ?.sort((a, b) => 0.5 - Math.random())
    .forEach((author, i) => {
      const authorContainer = document.createElement("article");
      const authorLink = document.createElement("a");
      const authorImgContainer = document.createElement("section");
      const authorInfoContainer = document.createElement("section");

      if (author?.id?.includes("@donotuse")) return;
      if (!author?.item || author?.item?.length <= 0) return;
      if (!author?.name) return;

      if (author.thumbnail) {
        const authorImg = document.createElement("img");
        authorImg.src = author.thumbnail;
        authorImgContainer.appendChild(authorImg);
      }

      authorLink.href = baseUrl + "/author.html?id=" + author.id;

      authorInfoContainer.innerHTML = author.name;

      authorLink.appendChild(authorImgContainer);
      authorLink.appendChild(authorInfoContainer);

      authorContainer.appendChild(authorLink);

      authorsWrapper.appendChild(authorContainer);
      author.html = authorContainer;

      allAuthors.push(author);
    });

  // add listener

  document
    .querySelector("#searchContents > input")
    .addEventListener("input", (e) => {
      search(allAuthors, e.target.value);
    });
}
