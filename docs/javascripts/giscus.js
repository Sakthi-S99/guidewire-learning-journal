// Giscus comment widget — GitHub Discussions based
// Generated from: https://giscus.app
//
// SETUP STEPS:
// 1. Go to https://giscus.app
// 2. Enter repo: Sakthi-S99/guidewire-learning-journal
// 3. Select "Discussions" as page ↔ discussion mapping
// 4. Pick category: "General" or create "Page Feedback"
// 5. Replace the placeholder values below with what Giscus gives you

document.addEventListener("DOMContentLoaded", function () {
  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", "Sakthi-S99/guidewire-learning-journal");
  script.setAttribute("data-repo-id", "R_kgDOTGPiug");           // from giscus.app
  script.setAttribute("data-category", "General");
  script.setAttribute("data-category-id", "IC_kwDOTGPius4DASPd");   // from giscus.app
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", "preferred_color_scheme");            // auto dark/light
  script.setAttribute("data-lang", "en");
  script.setAttribute("crossorigin", "anonymous");
  script.async = true;

  // Inject into page — MkDocs Material renders content into [data-md-component="content"]
  const content = document.querySelector("[data-md-component='content']");
  if (content) {
    const container = document.createElement("div");
    container.className = "giscus-container";
    container.style.marginTop = "2rem";
    content.appendChild(container);
    container.appendChild(script);
  }
});
