const form = document.querySelector(".search-form");
const input = document.querySelector("#username");
const status = document.querySelector(".status");
const count = document.querySelector(".result-count");
const list = document.querySelector(".repository-list");
const submitButton = form.querySelector("button");

function setLoading(loading) {
  submitButton.disabled = loading;
  submitButton.textContent = loading ? "Searching…" : "Search";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function createRepositoryCard(repository) {
  const article = document.createElement("article");
  article.className = "repository";

  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = repository.html_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = repository.name;
  heading.appendChild(link);

  const description = document.createElement("p");
  description.className = "repository__description";
  description.textContent = repository.description || "No description provided.";

  const details = document.createElement("ul");
  details.className = "repository__details";
  details.innerHTML = `
    <li>${repository.language || "Mixed"}</li>
    <li>★ ${repository.stargazers_count}</li>
    <li>Updated ${formatDate(repository.updated_at)}</li>`;

  article.append(heading, description, details);
  return article;
}

async function getRepositories(username) {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    { headers: { Accept: "application/vnd.github+json" } }
  );

  if (response.status === 404) throw new Error("GitHub user not found.");
  if (response.status === 403) throw new Error("GitHub API limit reached. Please try again later.");
  if (!response.ok) throw new Error("Repositories could not be loaded.");

  return response.json();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = input.value.trim();

  if (!username) {
    status.textContent = "Enter a GitHub username.";
    input.focus();
    return;
  }

  setLoading(true);
  list.replaceChildren();
  count.textContent = "";
  status.hidden = false;
  status.textContent = `Loading repositories for ${username}…`;

  try {
    const repositories = await getRepositories(username);
    list.replaceChildren(...repositories.map(createRepositoryCard));
    count.textContent = `${repositories.length} found`;
    status.textContent = repositories.length
      ? `Showing public repositories for ${username}.`
      : `${username} has no public repositories.`;
    status.hidden = repositories.length > 0;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    setLoading(false);
  }
});