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

  const response = await fetch("./config.json");
  config = await response.json();
  excludedAccounts = config.hiddenAccounts;
  apiUrl = config.api.url;
  baseUrl = config.baseUrl;
  apiVersion = config.api.version;


  const params = new URLSearchParams(window.location.search);
  id = params.get("id");


  switch (type) {
    case "explore":
      return iniExplore();
    case "author":
      return iniAuthor();
    case "authors":
      return iniAuthors();
  }
}



function generateHTMLStructure(data, header = true) {

  const sectionWrapper = document.createElement("section");

  if(data.path && data.path.length > 1) {
    const pathContainer = document.createElement("section");
    populatePath(data.path,pathContainer)
    sectionWrapper.appendChild(pathContainer);
  }

  if(header) {
    const headerContainer = document.createElement("section");
    sectionWrapper.appendChild(headerContainer);
    headerContainer.id = "header";
    headerContainer.classList.add("grid");
    headerContainer.classList.add("column");
  
    const headerArticle = document.createElement("article");
    headerContainer.appendChild(headerArticle);
  
    const titleLink = document.createElement("a");
    titleLink.href = baseUrl + "/author.html?id=" + data.id;
    if(data?.thumbnail) {
    
      const imgFigure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = data.thumbnail;
      imgFigure.appendChild(img);
      titleLink.appendChild(imgFigure);
    }
    const title = document.createElement("p");
    title.innerHTML = data.name;
    titleLink.appendChild(title);
  
    headerArticle.appendChild(titleLink);
  
    if(data.authors || data.parents || data.created) {
      //metadata
  
      const headerAside = document.createElement("aside"); 
      headerContainer.appendChild(headerAside);
    }
  }



    
  const descriptionContainer = document.createElement("section");

  if (descriptionContainer.innerHTML.length > 0) {
    sectionWrapper.appendChild(descriptionContainer);
  }
  

  // contexts

  const contextsContainer = document.createElement("section");
  contextsContainer.id = "contexts";





  if (data?.context?.length > 0) {
    sectionWrapper.appendChild(contextsContainer);
  }
  


  

  // items

  const itemsContainer = document.createElement("section");
  itemsContainer.id = "items";
  itemsContainer.classList.add("grid");
  itemsContainer.classList.add("column");

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

  if (contentContainer.innerHTML.length > 0) {
    sectionWrapper.appendChild(contentContainer);
  }



 // exception for pages like author.html
 if((sectionWrapper.querySelectorAll('section').length  === 2)) {
  const hr = document.createElement('hr');
  sectionWrapper.insertBefore(hr,sectionWrapper.querySelector('section').nextSibling);
 }


  return sectionWrapper;

}

// ini functions

async function iniAuthor() {
  if (!id) return;

  const call = await fetchGraphQL(
    '{  user(id: "' +
      id +
      '") {    name    id    thumbnail    item {      name      thumbnail      id    }  }}',
  );

  const userData = call?.user;

  if (!userData) return;

  const generatedStructure = generateHTMLStructure(userData);
  document.querySelector("main").appendChild(generatedStructure);
}

async function iniExplore() {
  let data = {}
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

  const generatedStructure = generateHTMLStructure(data,false);


  console.log(generatedStructure)
  if(generatedStructure.querySelector('#contexts')) {
   populateContextsExplore(generatedStructure.querySelector('#contexts'), data)
  }

  if (data.item?.length <= 0 && data.context?.length <= 0) {
    console.log('no data')
    const code = document.createElement("code");
    code.innerHTML = "¯\\_(ツ)_/¯";
    const notFoundSection = document.createElement('section');
    notFoundSection.appendChild(code);
    generatedStructure.querySelector('section').appendChild(notFoundSection);
    return;
  }

  document.querySelector("main").appendChild(generatedStructure);
}



 async function iniAuthors() {

  const allAuthors = [];


  const section = document.createElement("section");
  const searchForm = document.createElement("form");
  searchForm.id = "search";
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.name = "search";
  searchInput.placeholder = "Search …";
  const searchButton = document.createElement("button");
  searchButton.type = "reset";
  searchButton.innerHTML = "Clear";
  searchForm.appendChild(searchInput);
  searchForm.appendChild(searchButton);
  section.appendChild(searchForm);
  const authorsWrapper = document.createElement("section");
  authorsWrapper.id = "contents";
  authorsWrapper.classList.add("grid");
  authorsWrapper.classList.add("column");
  section.appendChild(authorsWrapper);
  

  



  //fill with content
  const call = await fetchGraphQL(
    "{\n  users {\n    id\n    name\n    thumbnail\n    item {\n      id\n    }\n  }\n}\n",
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

  // add listener

  searchInput.addEventListener("input", (e) => {
      search(allAuthors, e.target.value);
    });


    document.querySelector("main").appendChild(section);
}



// HELPER FUNCTIONS

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
  if(!data.context) return 
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