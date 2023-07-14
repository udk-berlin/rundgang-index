const apiUrl = "http://localhost:3009";
const baseUrl = "http://localhost:8001";

let allEntries = [];

let selectedLanguage = "DEFAULT";

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

async function iniEntryPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const call = await fetchGraphQL(
    '{  entry(id: "' +
      id +
      '") {    name    id    thumbnail    description {      language      content    }    origin {      application {        name      }      authors {        name        id      }    }    parents {      name      id    }    content {      name      id    }    item {      name      id      thumbnail    }    context {      name      id      thumbnail    }  }}'
  );

  const entryData = call?.entry;

  if (!entryData) return;

  const headerContainer = document.getElementById("entryHeader");
  const headerInfoContainer = headerContainer.querySelector("aside");
  const contentsContainer = document.getElementById("entryContents");
  const itemsContainer = document.getElementById("items");
  const contextsContainer = document.getElementById("contexts");

  const itemsEntriesContainer = document.createElement("div");
  itemsContainer.appendChild(itemsEntriesContainer);
  itemsEntriesContainer.id = "contents";

  const contextsEntriesContainer = document.createElement("div");
  contextsContainer.appendChild(contextsEntriesContainer);
  contextsEntriesContainer.id = "contextsEntries";

  headerContainer.querySelector("aside >  h2").innerHTML = entryData?.name;

  if (!entryData?.thumbnail) {
    headerContainer.querySelector("img").remove();
  } else {
    headerContainer.querySelector("img").src = entryData?.thumbnail;
  }

  // Parents
  const parentsContainer = document.createElement("div");
  parentsContainer.innerHTML = "<h3>Can be found in: </h3>";
  const parentsList = document.createElement("ul");
  parentsContainer.appendChild(parentsList);
  entryData?.parents.forEach((parent) => {
    const parentContainer = document.createElement("li");
    const parentLink = document.createElement("a");
    parentLink.href = baseUrl + "/entry.html?id=" + parent.id;
    parentLink.innerHTML = parent.name;
    parentContainer.appendChild(parentLink);
    parentsList.appendChild(parentContainer);
  });

  // Description
  const descriptionContainer = document.createElement("div");
  descriptionContainer.innerHTML = entryData?.description?.find(
    ({ language }) => language === selectedLanguage
  )?.content;

  // Authors
  const authorsContainer = document.createElement("div");
  authorsContainer.innerHTML = "<h3>Authors: </h3>";
  const authorsList = document.createElement("ul");
  authorsContainer.appendChild(authorsList);
  entryData?.origin?.authors?.forEach((author) => {
    if (!author) return;
    if (author?.name?.lenght < 1) return;
    if (excludedAccounts.some((f) => author?.id.includes(f))) return;

    const authorContainer = document.createElement("li");
    const authorLink = document.createElement("a");
    authorLink.href = baseUrl + "/author.html?id=" + author?.id;
    authorLink.innerHTML = author?.name;
    authorContainer.appendChild(authorLink);
    authorsList.appendChild(authorContainer);
  });

  headerInfoContainer.appendChild(parentsContainer);
  if (!authorsList.innerHTML === "") {
    headerInfoContainer.appendChild(authorsContainer);
  }
  if (descriptionContainer.innerHTML !== "undefined") {
    headerInfoContainer.appendChild(descriptionContainer);
  }

  // Contents

  if (entryData?.content?.length <= 0) {
    contentsContainer.remove();
  }

  // will be added later

  // Items
  entryData?.item?.forEach((item) => {
    const entryContainer = document.createElement("article");
    const entryLink = document.createElement("a");
    const entryImgContainer = document.createElement("section");
    const entryInfoContainer = document.createElement("section");

    if (item?.id?.includes("@donotuse")) return;
    if (!item?.name) return;

    if (item?.thumbnail) {
      const entryImg = document.createElement("img");
      entryImg.src = item?.thumbnail;
      entryImgContainer.appendChild(entryImg);
    }

    entryLink.href = baseUrl + "/entry.html?id=" + item.id;

    entryInfoContainer.innerHTML = item.name;

    entryLink.appendChild(entryImgContainer);
    entryLink.appendChild(entryInfoContainer);

    entryContainer.appendChild(entryLink);

    itemsEntriesContainer.appendChild(entryContainer);
  });

  if (entryData?.item?.length <= 0) {
    itemsContainer.remove();
  }

  // Contexts
  entryData?.context?.forEach((context) => {
    const entryContainer = document.createElement("article");
    const entryLink = document.createElement("a");
    const entryImgContainer = document.createElement("section");
    const entryInfoContainer = document.createElement("section");

    if (context?.id?.includes("@donotuse")) return;
    if (!context?.name) return;

    if (context?.thumbnail) {
      const entryImg = document.createElement("img");
      entryImg.src = context?.thumbnail;
      entryImgContainer.appendChild(entryImg);
    }

    entryLink.href = baseUrl + "/entry.html?id=" + context?.id;

    entryInfoContainer.innerHTML = context?.name;

    entryLink.appendChild(entryImgContainer);
    entryLink.appendChild(entryInfoContainer);

    entryContainer.appendChild(entryLink);

    contextsEntriesContainer.appendChild(entryContainer);
  });

  if (entryData?.context?.length <= 0) {
    contextsContainer.remove();
  }
}
