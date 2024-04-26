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


  const sectionWrapper = document.createElement("section");


  // const headerContainer = document.getElementById("entryHeader");
  const headerContainer = document.createElement("section");
  headerContainer.id = "header";
  headerContainer.classList.add("grid");
  headerContainer.classList.add("column");
  sectionWrapper.appendChild(headerContainer);

  const linkWrapper = document.createElement("a");
  linkWrapper.href = baseUrl + "/entry.html?id=" + id;
  const article = document.createElement("article");
  const figure = document.createElement("figure");
  const img = document.createElement("img");
  const titelname = document.createElement("p");

  article.appendChild(linkWrapper);
  headerContainer.appendChild(article);


  titelname.innerHTML = entryData?.name;

  if(entryData?.thumbnail) {
    img.src = entryData?.thumbnail;
    figure.appendChild(img);
  
  } 
  linkWrapper.appendChild(figure);
  linkWrapper.appendChild(titelname);

  //const headerInfoContainer = headerContainer.querySelector("aside");
  const headerInfoContainer = document.createElement("aside");
  headerContainer.appendChild(headerInfoContainer);

  const descriptionSectionContainer = document.createElement("section");
  descriptionSectionContainer.id = "description";
  sectionWrapper.appendChild(descriptionSectionContainer);

  const contentsContainer = document.createElement("section");
  contentsContainer.id = "contents";
  sectionWrapper.appendChild(contentsContainer);

  const contextsContainer = document.createElement("section");
  contextsContainer.id = "contexts";
  sectionWrapper.appendChild(contextsContainer);

  const itemsContainer = document.createElement("section");
  itemsContainer.id = "items";
  itemsContainer.classList.add("grid");
  itemsContainer.classList.add("column");
  sectionWrapper.appendChild(itemsContainer);












  


  // Parents
  const parentsContainer = document.createElement("div");
  parentsContainer.innerHTML = "<h3>Published in: </h3>";
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



  // Authors
  const authorsContainer = document.createElement("div");

  if(entryData.type === 'item') {
    authorsContainer.innerHTML = "<h3>Authors: </h3>";
  } else {
    authorsContainer.innerHTML = "<h3>Moderators: </h3>";
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

  

  if(entryData?.origin?.authors?.length > 0) {
    headerInfoContainer.appendChild(authorsContainer);
  }
    
  headerInfoContainer.appendChild(parentsContainer);



  // created
  const created = document.createElement("div")
  created.innerHTML = "<h3>Created on: </h3>" + "<time>01/01/1970</time>";
  headerInfoContainer.appendChild(created);


  if (entryData?.description[selectedLanguage]) {
    descriptionSectionContainer.innerHTML = entryData?.description[selectedLanguage]
  } else {
    descriptionSectionContainer.remove();
  }


  // Contents

  if(entryData.type === 'item') {
    
    const contentCall = await fetch(apiUrl + apiVersion + id + "/render/json");
    const contentData = await contentCall.json();

    if(contentData?.languages[selectedLanguage]?.content &&  Object.keys(contentData?.languages[selectedLanguage]?.content).length > 0) {

      Object.keys(contentData?.languages[selectedLanguage]?.content).forEach((key) => {

        // const contentContainer = document.createElement("div");
        // contentContainer.innerHTML = contentData?.languages[selectedLanguage]?.content[key]?.formatted_content;
        // contentsContainer.appendChild(contentContainer);

        contentsContainer.insertAdjacentHTML('beforeend',contentData?.languages[selectedLanguage]?.content[key]?.formatted_content)

      });
      
    } else {
      contentsContainer.remove();
    }


  }else {
    contentsContainer.remove();
  }




  // Items
  entryData?.item?.forEach((item) => {
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

  if (entryData?.item?.length <= 0) {
    itemsContainer.remove();
  }

  // Contexts
  const entryUlContainer = document.createElement("ul");
  entryData?.context?.forEach((context) => {
    const entryContainer = document.createElement("li");
    const entryLink = document.createElement("a");


    entryLink.href = baseUrl + "/entry.html?id=" + context?.id;

    entryLink.innerHTML = context?.name;


    entryContainer.appendChild(entryLink);

    entryUlContainer.appendChild(entryContainer);
  });

  contextsContainer.appendChild(entryUlContainer);

  if (entryData?.context?.length <= 0) {
    contextsContainer.remove();
  }


  document.body.querySelector('main').appendChild(sectionWrapper);
}
