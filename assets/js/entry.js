let config;
let apiUrl;
let baseUrl;



let allEntries = [];

let selectedLanguage = "DE";

let excludedAccounts = [
];



async function iniEntryPage() {
  const response = await fetch("./config.json");
  config = await response.json();
  excludedAccounts = config.hiddenAccounts;
  apiUrl = config.api.url;
  const apiVersion = config.api.version;
  baseUrl = config.baseUrl;

  
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;


  const responseEntry = await fetch(apiUrl + apiVersion + id);
  const entryData = await responseEntry.json();



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
  entryData?.parents.forEach(async (parent) => {
    const parentContainer = document.createElement("li");
    const parentLink = document.createElement("a");
    parentLink.href = baseUrl + "/entry.html?id=" + parent;
    const parentCall = await fetch(apiUrl + apiVersion + parent);
    const parentData = await parentCall.json();
    parentLink.innerHTML = parentData.name;
    console.log(parentData)
    parentContainer.appendChild(parentLink);
    parentsList.appendChild(parentContainer);
  });

  // Description
  const descriptionContainer = document.createElement("div");
  descriptionContainer.innerHTML = entryData?.description[selectedLanguage]

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

    headerInfoContainer.appendChild(authorsContainer);
  



  // created
  const created = document.createElement("div")
  created.innerHTML = "<h3>Created: </h3>" + "xx/xx/xxxx";
  headerInfoContainer.appendChild(created);


  if (descriptionContainer.innerHTML !== "undefined") {
    headerInfoContainer.appendChild(descriptionContainer);
  }


  // Contents

  if(entryData.type === 'item') {
    
    const contentCall = await fetch(apiUrl + apiVersion + id + "/render/json");
    const contentData = await contentCall.json();

    console.log(contentData)

    if(contentData?.languages[selectedLanguage]?.content) {
      console.log(contentData?.languages[selectedLanguage]?.content)
      Object.keys(contentData?.languages[selectedLanguage]?.content).forEach((key) => {
        console.log(contentData?.languages[selectedLanguage]?.content[key])
        const contentContainer = document.createElement("div");
        contentContainer.innerHTML = contentData?.languages[selectedLanguage]?.content[key]?.formatted_content;
        contentsContainer.appendChild(contentContainer);

      });
      
    }


  }




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
