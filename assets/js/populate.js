let config;
let apiUrl;
let baseUrl;
let apiVersion;

let id;

let excludedAccounts = [];

async function getLevel(id) {
  const response = await fetch(apiUrl + apiVersion + id);
  const data = await response.json();
  return data;
}

function populateItems(itemsContainer, items) {
  itemsContainer.innerHTML = "";
  console.log(items);
  items
    ?.sort((a, b) => 0.5 - Math.random())
    .forEach((entry, i) => {
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

      itemsContainer.appendChild(entryContainer);
    });
}

export async function ini(type) {
  switch (type) {
    case "explore":
      return iniExplore();
    case "author":
      return iniAuthor();
  }
}

async function iniExplore() {
  const response = await fetch("./config.json");
  config = await response.json();
  apiUrl = config.api.url;
  apiVersion = config.api.version;
  excludedAccounts = config.hiddenAccounts;
  baseUrl = config.baseUrl;

  const urlParams = new URLSearchParams(window.location.search);
  id = urlParams.get("id");

  if (!id) {
    const response = await fetch(`${apiUrl}${apiVersion}`);
    const data = await response.json();
    id = data?.rootId;
  }

  if (!id) return;

  const sectionWrapper = document.createElement("section");

  const pathContainer = document.createElement("section");
  sectionWrapper.appendChild(pathContainer);

  const exploreContent = document.createElement("section");
  exploreContent.id = "exploreContent";
  sectionWrapper.appendChild(exploreContent);
  

  const main = document.querySelector('main')
  
  


  const itemsWrapper = document.createElement("section");
  itemsWrapper.id = "exploreItems";
  itemsWrapper.classList.add("grid");
  itemsWrapper.classList.add("column");
  const contextWrapper = document.createElement("section");
  contextWrapper.id = "exploreContexts";

  
  populatePath(await getPath(id),pathContainer);
  const level = await getLevel(id);

  if (level.item.length <= 0 && level.context.length <= 0) {
    const code = document.createElement("code");
    code.innerHTML = "¯\\_(ツ)_/¯";
    itemsWrapper.appendChild(code);
    return;
  }
  populateContexts(contextWrapper, level);
  populateItems(itemsWrapper, level.item);

  exploreContent.appendChild(contextWrapper);
  exploreContent.appendChild(itemsWrapper);

  main.appendChild(sectionWrapper);
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


function populateContexts(contextContainer, data) {
  const ul = document.createElement("ul");
  let sortedContext = [...data.context].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  sortedContext.forEach((context) => {
    const li = document.createElement("li");
    const contextLink = document.createElement("a");
    contextLink.href = baseUrl + "/explore.html?id=" + context?.id;
    contextLink.innerHTML = context?.name;

    li.appendChild(contextLink);
    ul.appendChild(li);

    contextContainer.appendChild(ul);
  });

  
}

function populatePath(data,pathContainer) {

  pathContainer.innerHTML = "";
  pathContainer.id = 'explorePath'

  const ul = document.createElement("ul");

  if (data.length <= 1) {
    return;
  }

  data.forEach((path) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.innerHTML = path?.name;
    a.href = baseUrl + "/explore.html?id=" + path?.id;

    li.appendChild(a);
    ul.appendChild(li);
  });

  pathContainer.appendChild(ul);
}

async function getPath(id) {
  const response = await fetch(`${apiUrl}${apiVersion}${id}/pathList`);
  const data = await response.json();
  return data;
}



// HELPER FUNCTIONS

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