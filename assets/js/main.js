const apiUrl = "http://localhost:3009";
const baseUrl = "http://localhost:8001";

let allAuthors = [];

let allEntries = [];

const excludedAccounts = [
  "@rundgang22-bot:content.udk-berlin.de",
  "@rundgang23-bot:content.udk-berlin.de",
  "@donotuse",
  "@rundgaenge-bot:content.udk-berlin.de",
  "@rundgang-bot:content.udk-berlin.de",
];

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

async function iniEntries() {
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
        const entryImg = document.createElement("img");
        entryImg.src = entry.thumbnail;
        entryImgContainer.appendChild(entryImg);
      }

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
    .querySelector("#searchContents > input")
    .addEventListener("input", (e) => {
      search(allEntries, e.target.value);
    });
}

async function iniAuthors() {
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
