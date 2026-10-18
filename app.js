const DEFAULT_SYSTEMS = ["m365", "hardware", "shared"];

const els = {
  name: document.getElementById("name"),
  date: document.getElementById("date"),
  systems: document.getElementById("systems"),
  title: document.getElementById("out-title"),
  progress: document.getElementById("progress"),
  checklist: document.getElementById("checklist"),
};

els.date.valueAsDate = new Date();

for (const sys of SYSTEMS) {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${sys.id}"> ${sys.label}`;
  label.querySelector("input").checked = DEFAULT_SYSTEMS.includes(sys.id);
  els.systems.appendChild(label);
}

function mode() {
  return document.querySelector('input[name="mode"]:checked').value;
}

function chosenSystems() {
  const ids = [...els.systems.querySelectorAll("input:checked")].map((i) => i.value);
  return SYSTEMS.filter((s) => ids.includes(s.id));
}

function fill(step) {
  return step.replaceAll("{name}", els.name.value.trim() || "the employee");
}

// Returns [{heading, steps}] for the current form state.
function buildSections() {
  const m = mode();
  return [
    { heading: "Before you start", steps: GENERAL[m].map(fill) },
    ...chosenSystems().map((s) => ({ heading: s.label, steps: s[m].map(fill) })),
  ];
}

function titleText() {
  const who = els.name.value.trim();
  const kind = mode() === "offboarding" ? "Offboarding" : "Onboarding";
  return `${kind} checklist${who ? " for " + who : ""}${els.date.value ? " (" + els.date.value + ")" : ""}`;
}

function render() {
  els.title.textContent = titleText();
  els.checklist.innerHTML = "";
  for (const section of buildSections()) {
    const h = document.createElement("h3");
    h.textContent = section.heading;
    const ul = document.createElement("ul");
    for (const step of section.steps) {
      const li = document.createElement("li");
      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.addEventListener("change", updateProgress);
      label.append(box, " " + step);
      li.appendChild(label);
      ul.appendChild(li);
    }
    els.checklist.append(h, ul);
  }
  updateProgress();
}

function updateProgress() {
  const boxes = els.checklist.querySelectorAll("input");
  const done = [...boxes].filter((b) => b.checked).length;
  els.progress.textContent = `${done} of ${boxes.length} steps done`;
}

function asText() {
  const lines = [titleText(), ""];
  for (const section of buildSections()) {
    lines.push(section.heading);
    for (const step of section.steps) lines.push(`[ ] ${step}`);
    lines.push("");
  }
  return lines.join("\n");
}

document.getElementById("form").addEventListener("input", render);
document.getElementById("print").addEventListener("click", () => window.print());
document.getElementById("copy").addEventListener("click", async (e) => {
  try {
    await navigator.clipboard.writeText(asText());
    e.target.textContent = "Copied";
  } catch {
    e.target.textContent = "Copy failed";
  }
  setTimeout(() => (e.target.textContent = "Copy as text"), 1500);
});

render();
