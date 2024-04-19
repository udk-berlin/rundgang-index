const apiUrl = "http://localhost:3009";
const baseUrl = "http://localhost:8001";

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

async function iniAuthorPage() {
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
  const entriesContainer = document.getElementById("authorEntries");

  headerContainer.querySelector("aside >  h2").innerHTML = userData?.name;
  headerContainer.querySelector("img").src = userData?.thumbnail;

  userData?.item?.forEach((entry) => {
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

    document.getElementById("contents").appendChild(entryContainer);
  });
}
