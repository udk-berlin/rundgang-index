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
  console.log(items)
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

export async function iniExplore() {
  const response = await fetch("./config.json");
  config = await response.json();
  apiUrl = config.api.url;
  apiVersion = config.api.version;
  excludedAccounts = config.hiddenAccounts;
  baseUrl = config.baseUrl;

  

  const urlParams = new URLSearchParams(window.location.search);
   id = urlParams.get('id');

  if (!id) {
    const response = await fetch(`${apiUrl}${apiVersion}`);
    const data = await response.json();
    id = data?.rootId;
  }

  if(!id) return;



  populatePath(await getPath(id));
  const level = await getLevel(id);

  populateContexts(level);
  populateItems(document.getElementById("exploreItems"), level.item);


}

function populateContexts(data) {
  console.log(data)

  const contextContainer = document.getElementById("exploreContexts");
  const ul = document.createElement("ul");
  let sortedContext = [...data.context].sort((a, b) => a.name.localeCompare(b.name));
  sortedContext.forEach((context) => {
    const li = document.createElement("li");
    const contextLink = document.createElement("a");
    contextLink.href = baseUrl + "/explore.html?id=" + context?.id;
    contextLink.innerHTML = context?.name;

    li.appendChild(contextLink);
    ul.appendChild(li);


    contextContainer.appendChild(ul);
  })
}


function populatePath(data) {
  const pathContainer = document.getElementById("explorePath");
  pathContainer.innerHTML = "";

  const ul = document.createElement("ul");

  if(data.length  <= 1 ) {
    return
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
