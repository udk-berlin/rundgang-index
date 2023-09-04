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


async function getLevel(id) {
  const call = await fetchGraphQL(
    "{\n  context(id: \""+id+"\") {\n    name\n    id\n    context {\n      id\n      name\n    }\n    item {\n      id\n      name\n      thumbnail\n    }\n  }\n}"
  );
  return call?.context
}

function populateLevel(level,data) {
  level.innerHTML = data?.name
  const ul = document.createElement('ul')
  data?.context?.forEach(context => {
    const li = document.createElement('li')
    const a = document.createElement('a')

    a.addEventListener('click', (e) => contextHandleClick(e,li,context?.id))

    a.innerHTML= context?.name
    li.appendChild(a)
    ul.appendChild(li)
  })

  level.appendChild(ul)
}

function updateItemView(itemsContainer, items) {
  itemsContainer.innerHTML = ""

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

async function contextHandleClick(element,parent,id) {
  element.preventDefault()
  console.log(element)
  console.log(parent)
  console.log(id)
  console.log('--------')

  const data = await getLevel(id)
  console.log(data)
  if(!data) return
  updateItemView(document.getElementById("structureItems"),data?.item)
  populateLevel(parent,data)
}

async function iniStructure() {
  //fill with content

  const initialData = await getLevel("!iHhRSbqDkETnSEjRWv:content.udk-berlin.de")
  console.log(initialData)

  const ul = document.createElement('ul')
  const li = document.createElement('li')
  populateLevel(li,initialData)
  ul.appendChild(li)

  document.getElementById('structureMenu').appendChild(ul)

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
