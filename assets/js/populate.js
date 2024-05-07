import LazyLoad from "../../assets/lib/vanilla-lazyload/vanilla-lazyload@19.0.3.js";

let config;
let apiUrl;
let baseUrl;
let apiVersion;
let selectedLanguage = "en";
let id;

let locales;
let excludedAccounts = [];

export async function ini(type) {
  const response = await fetch("./config.json");
  config = await response.json();
  excludedAccounts = config.hiddenAccounts;
  apiUrl = config.api.url;
  baseUrl = config.baseUrl;
  apiVersion = config.api.version;

  const params = new URLSearchParams(window.location.search);
  id = params.get("id");

  await languageSelector();

  switch (type) {
    case "explore":
      return iniExplore();
    case "author":
      return iniAuthor();
    case "authors":
      return iniAuthors();
    case "entries":
      return iniEntries();
    case "entry":
      return iniEntry();
    case "index":
      return iniIndex();
  }
}

async function languageSelector() {
  if (!localStorage.getItem("lang")) {
    localStorage.setItem("lang", selectedLanguage);
  } else {
    selectedLanguage = localStorage.getItem("lang");
    document.querySelector("header select").value = selectedLanguage;
  }

  document.querySelector("header select").addEventListener("change", (e) => {
    selectedLanguage = e.target.value;
    localStorage.setItem("lang", selectedLanguage);
    location.reload();
  });

  if (selectedLanguage === "en") return;
  locales = await fetch("./assets/locales/" + selectedLanguage + ".json").then(
    (response) => response.json(),
  );
}

function generateHTMLStructure(data, header = true) {
  const sectionWrapper = document.createElement("section");
  let headerContainer;

  if (data.path && data.path.length > 1) {
    const pathContainer = document.createElement("section");
    populatePath(data.path, pathContainer);
    sectionWrapper.appendChild(pathContainer);
  }

  if (header) {
    headerContainer = document.createElement("section");
    sectionWrapper.appendChild(headerContainer);
    headerContainer.id = "header";
    headerContainer.classList.add("grid");

    const headerArticle = document.createElement("article");
    headerContainer.appendChild(headerArticle);

    const titleLink = document.createElement("a");
    if (id.includes("@")) {
      titleLink.href = baseUrl + "/author.html?id=" + data.id;
    } else {
      titleLink.href = baseUrl + "/entry.html?id=" + data.id;
    }

    const imgFigure = document.createElement("figure");
    if (data?.thumbnail) {
      const img = document.createElement("img");
      img.src = data.thumbnail;
      imgFigure.appendChild(img);
    }
    titleLink.appendChild(imgFigure);
    const title = document.createElement("h2");
    title.innerHTML = data.name;
    titleLink.appendChild(title);

    headerArticle.appendChild(titleLink);

    if (data.authors || data.parents || data.created) {
      //metadata

      headerContainer.appendChild(generateMetaData(data));
    }
  }

  if (data.hasOwnProperty("description")) {
    const descriptionContainer = document.createElement("section");
    descriptionContainer.id = "description";
    const descriptionH3 = document.createElement("h3");
    descriptionH3.innerHTML = locales ? locales["Description"] : "Description";
    descriptionContainer.appendChild(descriptionH3);
    const descriptionP = document.createElement("p");

    if (data.description.hasOwnProperty(selectedLanguage.toUpperCase())) {
      descriptionP.innerHTML = data.description[selectedLanguage.toUpperCase()];
      descriptionContainer.appendChild(descriptionP);
    }

    if (descriptionP.innerHTML.length > 0) {
      sectionWrapper.appendChild(descriptionContainer);
    }
  }

  // contexts

  const contextsContainer = document.createElement("section");
  contextsContainer.id = "contexts";

  const entryUlContainer = document.createElement("ul");
  entryUlContainer.innerHTML =
    "<h3>" + (locales ? locales["Sub-Contexts"] : "Sub-Contexts") + ": </h3>";
  data?.context?.forEach((context) => {
    const entryContainer = document.createElement("li");
    const entryLink = document.createElement("a");

    entryLink.href = baseUrl + "/entry.html?id=" + context?.id;

    entryLink.innerHTML = context?.name;

    entryContainer.appendChild(entryLink);

    entryUlContainer.appendChild(entryContainer);
  });

  contextsContainer.appendChild(entryUlContainer);

  if (data?.context?.length > 0) {
    sectionWrapper.appendChild(contextsContainer);
  }

  // items

  const itemsContainer = document.createElement("section");
  itemsContainer.id = "items";
  itemsContainer.classList.add("grid");

  data?.item?.forEach((item) => {
    const entryContainer = document.createElement("article");
    const entryLink = document.createElement("a");
    const entryImgContainer = document.createElement("figure");
    const entryInfoContainer = document.createElement("p");

    if (item?.id?.includes("@donotuse")) return;
    if (!item?.name) return;

    if (item?.thumbnail) {
      const entryImg = document.createElement("img");
      entryImg.src = item?.thumbnail;
      entryImgContainer.appendChild(entryImg);
    }
    entryLink.appendChild(entryImgContainer);
    entryLink.href = baseUrl + "/entry.html?id=" + item.id;

    entryInfoContainer.innerHTML = item.name;

    entryLink.appendChild(entryInfoContainer);

    entryContainer.appendChild(entryLink);

    itemsContainer.appendChild(entryContainer);
  });

  if (data?.item?.length > 0) {
    sectionWrapper.appendChild(itemsContainer);
  }

  //contents
  const contentContainer = document.createElement("section");
  contentContainer.id = "content";

  // contents
  if (data.type === "item" && data.contentData && data.contentData?.languages) {
    if (
      data.contentData?.languages[selectedLanguage.toUpperCase()]?.content &&
      Object.keys(
        data.contentData?.languages[selectedLanguage.toUpperCase()]?.content,
      ).length > 0
    ) {
      const contentH3 = document.createElement("h3");
      contentH3.innerHTML = locales ? locales["Content"] : "Content";
      contentContainer.appendChild(contentH3);
      Object.keys(
        data.contentData?.languages[selectedLanguage.toUpperCase()]?.content,
      ).forEach((key) => {
        contentContainer.insertAdjacentHTML(
          "beforeend",
          data.contentData?.languages[selectedLanguage.toUpperCase()]?.content[
            key
          ]?.formatted_content,
        );
      });
    }
  }

  if (contentContainer.innerHTML.length > 0) {
    sectionWrapper.appendChild(contentContainer);
  }

  // exception for pages like author.html
  if (
    headerContainer &&
    sectionWrapper.querySelectorAll("section").length === 2 &&
    data.type !== "item"
  ) {
    const hr = document.createElement("hr");
    headerContainer.appendChild(hr);
  }

  return sectionWrapper;
}

// ini functions

function iniIndex() {
  document.querySelector("h2").innerHTML = locales
    ? locales["Archived Rundgang web experiences"]
    : "Archived Rundgang web experiences";
}

async function iniEntry() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const responseEntry = await fetch(apiUrl + apiVersion + id);
  const entryData = await responseEntry.json();

  if (!entryData) return;

  const contentCall = await fetch(apiUrl + apiVersion + id + "/render/json");
  const contentData = await contentCall.json();

  entryData.contentData = contentData;

  const generatedStructure = generateHTMLStructure(entryData);
  document.querySelector("main").appendChild(generatedStructure);
}

async function iniAuthor() {
  if (!id) return;

  const call = await fetchGraphQL(
    '{ user(id: "' + id + '") { name id thumbnail item { name thumbnail id } } }',
  );

  const userData = call?.user;

  if (!userData) return;

  const generatedStructure = generateHTMLStructure(userData);
  document.querySelector("main").appendChild(generatedStructure);
}

async function iniExplore() {
  let data = {};
  if (!id) {
    const response = await fetch(`${apiUrl}${apiVersion}`);
    const d = await response.json();
    data = d;
    id = d.rootId;
  }

  const response = await fetch(`${apiUrl}${apiVersion}${id}`);
  const d = await response.json();
  data = d;
  data.path = await getPath(id);

  if (!id) return;

  const generatedStructure = generateHTMLStructure(data, false);

  if (generatedStructure.querySelector("#contexts")) {
    generatedStructure.querySelector("#contexts").innerHTML = "";
    populateContextsExplore(
      generatedStructure.querySelector("#contexts"),
      data,
    );
  }

  if (data.item?.length <= 0 && data.context?.length <= 0) {
    const code = document.createElement("code");
    code.innerHTML = "¯\\_(ツ)_/¯";
    const notFoundSection = document.createElement("section");
    notFoundSection.appendChild(code);
    generatedStructure.querySelector("section").appendChild(notFoundSection);
  }

  document.querySelector("main").appendChild(generatedStructure);
}

async function iniAuthors() {
  const allAuthors = [];

  const section = generateSearchForm(allAuthors);
  const authorsWrapper = section.querySelector("#contents");

  //fill with content
  const call = await fetchGraphQL(
    "{ users { id name thumbnail item { id } } }",
  );

  call?.users
    ?.sort((a, b) => 0.5 - Math.random())
    .forEach((author, i) => {
      const authorContainer = document.createElement("article");
      const authorLink = document.createElement("a");
      const authorImgContainer = document.createElement("figure");
      const authorInfoContainer = document.createElement("p");

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

  document.querySelector("main").appendChild(section);
}

async function iniEntries() {
  //fill with content
  const allEntries = [];

  const section = generateSearchForm(allEntries);
  const entriesWrapper = section.querySelector("#contents");

  const call = await fetchGraphQL(
    "{ items { id name thumbnail origin { authors { name id } } } }",
  );

  call?.items
    ?.sort((a, b) => 0.5 - Math.random())
    .forEach((entry, i) => {
      const entryContainer = document.createElement("article");
      const entryLink = document.createElement("a");
      const entryImgContainer = document.createElement("figure");
      const entryInfoContainer = document.createElement("p");

      if (entry?.id?.includes("@donotuse")) return;
      if (!entry?.name) return;

      if (entry.thumbnail) {
        let url = new URL(entry.thumbnail);
        let params = new URLSearchParams(url.search);
        params.set("width", "200");
        params.set("height", "200");
        url.search = params.toString();
        const entryImg = document.createElement("img");
        entryImg.setAttribute("data-src", url.toString());
        entryImg.classList.add("lazy");
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
  document.querySelector("main").appendChild(section);

  let lazyLoadInstance = new LazyLoad({});
  lazyLoadInstance.update();
}

// HELPER FUNCTIONS

function generateSearchForm(dataSet) {
  const section = document.createElement("section");
  const searchForm = document.createElement("form");
  searchForm.id = "search";
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.name = "search";
  searchInput.placeholder = locales ? locales["Search …"] : "Search …";
  const searchButton = document.createElement("button");
  searchButton.type = "reset";
  searchButton.innerHTML = locales ? locales["Clear"] : "Clear";
  searchForm.appendChild(searchInput);
  searchForm.appendChild(searchButton);
  section.appendChild(searchForm);
  const contents = document.createElement("section");
  contents.id = "contents";
  contents.classList.add("grid");
  section.appendChild(contents);

  searchInput.addEventListener("input", (e) => {
    search(dataSet, e.target.value);
  });

  return section;
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

function populateContextsExplore(contextContainer, data) {
  if (!data.context) return;
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

function populatePath(data, pathContainer) {
  pathContainer.innerHTML = "";
  pathContainer.id = "path";

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

function generateMetaData(entryData) {
  const headerInfoContainer = document.createElement("aside");

  // parents
  const parentsContainer = document.createElement("div");
  parentsContainer.innerHTML =
    "<h3>" + (locales ? locales["Published in"] : "Published in") + ": </h3>";
  const parentsList = document.createElement("ul");
  parentsContainer.appendChild(parentsList);
  entryData?.parents.forEach(async (parent) => {
    const parentContainer = document.createElement("li");
    const parentLink = document.createElement("a");
    parentLink.href = baseUrl + "/entry.html?id=" + parent;
    const parentCall = await fetch(apiUrl + apiVersion + parent);
    const parentData = await parentCall.json();
    parentLink.innerHTML = parentData.name;

    parentContainer.appendChild(parentLink);
    parentsList.appendChild(parentContainer);
  });

  // authors
  const authorsContainer = document.createElement("div");

  if (entryData.type === "item") {
    authorsContainer.innerHTML =
      "<h3>" + (locales ? locales["Authors"] : "Authors") + ": </h3>";
  } else {
    authorsContainer.innerHTML =
      "<h3>" + (locales ? locales["Moderators"] : "Moderators") + ": </h3>";
  }

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

  if (authorsList.innerHTML.length > 0) {
    headerInfoContainer.appendChild(authorsContainer);
  }

  headerInfoContainer.appendChild(parentsContainer);

  // created
  const created = document.createElement("div");
  if(entryData?.origin?.created){
  created.innerHTML =
    "<h3>" +
    (locales ? locales["Created on"] : "Created on") +
    ": </h3>" +
    "<time>"+entryData?.origin?.created+"</time>";

    headerInfoContainer.appendChild(created);
  }
  

  return headerInfoContainer;
}

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
