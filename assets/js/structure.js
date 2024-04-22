let config;
let apiUrl;
let baseUrl;
let apiVersion;

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



async function getLevel(id) {
  const response = await fetch(apiUrl + apiVersion + id);
  const data = await response.json();
  return data;
}

function populateLevel(level, data) {
  level.innerHTML = "";
  const ul = document.createElement("ul");
  console.log(data)
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.innerHTML = data?.name;

  let sortedContext = [...data.context].sort((a, b) => a.name.localeCompare(b.name));
  sortedContext.forEach((context) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.addEventListener("click", (e) => contextHandleClick(e, li, context?.id));

    a.innerHTML = context?.name;
    li.appendChild(a);
    ul.appendChild(li);
  });

  details.appendChild(summary);
  details.appendChild(ul);
  level.appendChild(details);
}

function updateItemView(itemsContainer, items) {
  itemsContainer.innerHTML = "";

  items
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

      itemsContainer.appendChild(entryContainer);
    });
}

async function contextHandleClick(element, parent, id) {
  element.preventDefault();


  const data = await getLevel(id);

  if (!data) return;
  updateItemView(document.getElementById("structureItems"), data?.item);
  populateLevel(parent, data);
}

export async function iniStructure() {
  const response = await fetch("./config.json");
  config = await response.json();
  apiUrl = config.api.url;
  apiVersion = config.api.version;
  excludedAccounts = config.hiddenAccounts;
  baseUrl = config.baseUrl;


  const initialData = await getLevel(config.api.rootId);


  const ul = document.createElement("ul");
  const li = document.createElement("li");
  populateLevel(li, initialData);
  ul.appendChild(li);

  document.getElementById("structureMenu").appendChild(ul);

  const entriesWrapper = document.getElementById("contents");

  // add listener
}