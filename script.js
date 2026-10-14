// Atualize estes campos quando os canais oficiais estiverem definidos.
const contactConfig = {
  email: "",
  whatsapp: ""
};

const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const currentYear = document.querySelector("#current-year");
const contactPlaceholder = document.querySelector("#contact-placeholder");
const contactLinks = document.querySelector("#contact-links");

currentYear.textContent = String(new Date().getFullYear());

menuButton.addEventListener("click", () => {
  const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isExpanded));
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  }
});

const channels = [];
if (contactConfig.email.trim()) {
  const email = contactConfig.email.trim();
  channels.push({ label: email, href: `mailto:${email}`, symbol: "✉" });
}
if (contactConfig.whatsapp.trim()) {
  const phone = contactConfig.whatsapp.replace(/\D/g, "");
  if (!phone) {
    throw new Error("O WhatsApp deve conter ao menos um dígito com o código do país.");
  }
  channels.push({
    label: "WhatsApp",
    href: `https://wa.me/${phone}`,
    symbol: "↗"
  });
}

if (channels.length) {
  contactPlaceholder.hidden = true;
  contactLinks.hidden = false;
  for (const channel of channels) {
    const link = document.createElement("a");
    link.href = channel.href;
    link.textContent = `${channel.symbol} ${channel.label}`;
    if (channel.href.startsWith("https://")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    contactLinks.append(link);
  }
}
