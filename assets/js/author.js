let config;
let apiUrl;
let baseUrl;

let allEntries = [];

let excludedAccounts = [
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

async function iniAuthor() {

  const response = await fetch("./config.json");
  config = await response.json();
  excludedAccounts = config.hiddenAccounts;
  apiUrl = config.api.url;
  baseUrl = config.baseUrl;


  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  console.log(id);

  if (!id) return;

  const call = await fetchGraphQL(
    '{  user(id: "' +
      id +
      '") {    name    id    thumbnail    item {      name      thumbnail      id    }  }}',
  );

  const userData = call?.user;

  if (!userData) return;

  const headerContainer = document.getElementById("authorHeader");
  // const entriesContainer = document.getElementById("authorEntries");

  headerContainer.querySelector("#authorHeader h2").innerHTML = userData?.name;
  // headerContainer.querySelector("#authorHeader img").src = userData?.thumbnail;

  if (userData.thumbnail) {
    const authorImg = document.createElement("img");
    authorImg.src = userData.thumbnail;
    headerContainer.querySelector("figure").appendChild(authorImg);
  }

  userData?.item?.forEach((entry) => {
    const entryContainer = document.createElement("article");
    const entryLink = document.createElement("a");
    const entryImgContainer = document.createElement("figure");
    const entryInfoContainer = document.createElement("p");

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

    document.getElementById("authorEntries").appendChild(entryContainer);
  });
}
