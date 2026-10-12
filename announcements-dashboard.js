export function renderAnnouncements(container, announcements) {
  container.replaceChildren();

  if (announcements.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No announcements yet.";
    container.append(empty);
    return;
  }

  for (const a of announcements) {
    const card = document.createElement("article");
    card.className = "announcement-card";

    const title = document.createElement("h3");
    title.textContent = a.title;

    const meta = document.createElement("small");
    const date = a.createdAt?.toDate?.().toLocaleString() ?? "";
    meta.textContent = [a.category, a.site, date].filter(Boolean).join(" \u00b7 ");

    const body = document.createElement("p");
    body.textContent = a.description;

    card.append(title, meta, body);
    container.append(card);
  }
}