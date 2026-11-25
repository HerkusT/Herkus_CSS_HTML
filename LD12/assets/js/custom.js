const contactForm = document.querySelector("#contact-form");
const formResults = document.querySelector("#form-results");
const submitButton = contactForm && contactForm.querySelector('button[type="submit"]');

if (contactForm && formResults && submitButton) {
  const requiredFields = Array.from(contactForm.querySelectorAll("[required]"));
  let touchedFields = new WeakSet();
  const namePattern = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+$/;
  const phonePattern = /^\+370 6\d{2} \d{5}$/;

  const formatPhoneNumber = (field) => {
    const rawValue = field.value;
    const caretPosition = field.selectionStart === null ? rawValue.length : field.selectionStart;
    const digitsBeforeCaret = rawValue.slice(0, caretPosition).replace(/\D/g, "");
    const allDigits = rawValue.replace(/\D/g, "");
    const localDigits = (allDigits.startsWith("370") ? allDigits.slice(3) : allDigits).slice(0, 8);
    const formattedValue = localDigits
      ? `+370 ${localDigits.slice(0, 3)}${localDigits.length > 3 ? ` ${localDigits.slice(3)}` : ""}`
      : "";
    const localDigitsBeforeCaret = (
      digitsBeforeCaret.startsWith("370") ? digitsBeforeCaret.slice(3) : digitsBeforeCaret
    ).length;

    field.value = formattedValue;

    let newCaretPosition = formattedValue ? 5 : 0;
    let digitsSeen = 0;
    if (localDigitsBeforeCaret > 0) {
      for (let index = 5; index < formattedValue.length; index += 1) {
        if (/\d/.test(formattedValue[index])) {
          digitsSeen += 1;
          if (digitsSeen === localDigitsBeforeCaret) {
            newCaretPosition = index + 1;
            break;
          }
        }
      }
    }

    field.setSelectionRange(newCaretPosition, newCaretPosition);
  };

  const phoneField = contactForm.querySelector('[name="phone"]');
  if (phoneField) {
    phoneField.addEventListener("input", () => formatPhoneNumber(phoneField));
    phoneField.addEventListener("change", () => formatPhoneNumber(phoneField));
    formatPhoneNumber(phoneField);
  }

  const getValidationError = (field) => {
    const value = field.value.trim();

    if (!value) {
      if (field.name.startsWith("rating_")) {
        return "Pasirinkite įvertinimą nuo 1 iki 10.";
      }

      const fieldNames = {
        first_name: "vardą",
        last_name: "pavardę",
        email: "el. pašto adresą",
        phone: "telefono numerį",
        address: "adresą"
      };
      return `Įveskite ${fieldNames[field.name]}.`;
    }

    if ((field.name === "first_name" || field.name === "last_name") && !namePattern.test(value)) {
      return "Galima įvesti tik raides.";
    }

    if (field.name === "email" && field.validity.typeMismatch) {
      return "Įveskite galiojantį el. pašto adresą.";
    }

    if (field.name === "phone" && !phonePattern.test(value)) {
      return "Telefono numeris turi atitikti formatą +370 6xx xxxxx.";
    }

    if (field.name.startsWith("rating_")) {
      const rating = Number(value);
      if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        return "Įvertinimas turi būti sveikasis skaičius nuo 1 iki 10.";
      }
    }

    return "";
  };

  const updateFieldFeedback = (field) => {
    const error = getValidationError(field);
    const showError = touchedFields.has(field) && Boolean(error);
    const feedback = document.getElementById(`${field.id}-error`);

    field.classList.toggle("is-invalid", showError);
    field.setAttribute("aria-invalid", showError ? "true" : "false");
    if (feedback) {
      feedback.textContent = touchedFields.has(field) ? error : "";
    }
  };

  const updateSubmitButtonState = () => {
    submitButton.disabled = requiredFields.some((field) => Boolean(getValidationError(field)));
  };

  contactForm.addEventListener("reset", () => {
    touchedFields = new WeakSet();
    formResults.textContent = "";
    formResults.hidden = true;

    setTimeout(() => {
      requiredFields.forEach((field) => {
        field.classList.remove("is-invalid");
        field.removeAttribute("aria-invalid");
        const feedback = document.getElementById(`${field.id}-error`);
        if (feedback) {
          feedback.textContent = "";
        }
      });

      if (phoneField) {
        formatPhoneNumber(phoneField);
      }
      updateSubmitButtonState();
    }, 0);
  });

  requiredFields.forEach((field) => {
    const validateField = () => {
      touchedFields.add(field);
      updateFieldFeedback(field);
      updateSubmitButtonState();
    };

    field.addEventListener("input", validateField);
    field.addEventListener("change", validateField);
    field.addEventListener("blur", validateField);
  });

  updateSubmitButtonState();

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    requiredFields.forEach((field) => {
      touchedFields.add(field);
      updateFieldFeedback(field);
    });
    updateSubmitButtonState();
    if (submitButton.disabled) {
      return;
    }

    const formData = new FormData(contactForm);
    const formValues = Object.fromEntries(formData.entries());
    const ratingsAverage = (
      Number(formValues.rating_quality) +
      Number(formValues.rating_communication) +
      Number(formValues.rating_recommendation)
    ) / 3;

    console.log(formValues);

    formResults.textContent = [
      `Vardas: ${formValues.first_name}`,
      `Pavardė: ${formValues.last_name}`,
      `El. paštas: ${formValues.email}`,
      `Tel. numeris: ${formValues.phone}`,
      `Adresas: ${formValues.address}`,
      `Žinutė: ${formValues.message || "—"}`,
      `Paslaugų kokybė: ${formValues.rating_quality}`,
      `Bendravimo vertinimas: ${formValues.rating_communication}`,
      `Rekomendavimo vertinimas: ${formValues.rating_recommendation}`,
      `${formValues.first_name} ${formValues.last_name}: ${ratingsAverage.toLocaleString("lt-LT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ].join("\n");
    formResults.hidden = false;
  });
}

const skills = [
  { name: "Išmaniųjų elektros tinklų analizė", status: "Planuojama", xp: 40 },
  { name: "Energijos kaupimo sistemų projektavimas", status: "Planuojama", xp: 35 },
  { name: "KiCad", status: "Mokomasi", xp: 50 },
  { name: "Saulės elektrinių integravimas į tinklą", status: "Mokomasi", xp: 45 },
  { name: "Elektros sistemų modeliavimo pagrindai", status: "Mokomasi", xp: 40 },
  { name: "Elektronikos pagrindai", status: "Atlikta", xp: 60 },
  { name: "Elektros saugos reikalavimai", status: "Atlikta", xp: 55 },
  { name: "Atsinaujinančios energetikos pagrindai", status: "Atlikta", xp: 50 }
];

const skillContainers = {
  "Planuojama": document.querySelector("#planned-skills"),
  "Mokomasi": document.querySelector("#learning-skills"),
  "Atlikta": document.querySelector("#completed-skills")
};
const skillStatusOptions = ["Planuojama", "Mokomasi", "Atlikta"];
const skillStatusesStorageKey = "ld12.skillStatuses";

if (Object.values(skillContainers).every(Boolean)) {
  const getCountLabel = (count) => `${count} įgū${count === 1 ? "dis" : "džiai"}`;

  const restoreSkillStatuses = () => {
    const savedStatuses = localStorage.getItem(skillStatusesStorageKey);
    if (savedStatuses === null) {
      return;
    }

    let parsedStatuses;
    try {
      parsedStatuses = JSON.parse(savedStatuses);
    } catch (error) {
      console.error("Nepavyko atkurti įgūdžių būsenų iš vietinės saugyklos.", error);
      return;
    }

    if (parsedStatuses === null || typeof parsedStatuses !== "object" || Array.isArray(parsedStatuses)) {
      console.error("Vietinėje saugykloje išsaugotos įgūdžių būsenos netinkamo formato.");
      return;
    }

    skills.forEach((skill) => {
      const savedStatus = parsedStatuses[skill.name];
      if (savedStatus === undefined) {
        return;
      }

      if (!skillStatusOptions.includes(savedStatus)) {
        console.error(`Netinkama išsaugota įgūdžio „${skill.name}“ būsena: ${savedStatus}`);
        return;
      }

      skill.status = savedStatus;
    });
  };

  const saveSkillStatuses = () => {
    const statuses = Object.fromEntries(skills.map((skill) => [skill.name, skill.status]));
    localStorage.setItem(skillStatusesStorageKey, JSON.stringify(statuses));
  };

  const renderSkillCards = () => {
    Object.values(skillContainers).forEach((container) => {
      container.replaceChildren();
    });

    skills.forEach((skill) => {
      const card = document.createElement("article");
      card.className = "skill-kanban-card";

      const title = document.createElement("h4");
      title.textContent = skill.name;

      const meta = document.createElement("div");
      meta.className = "skill-kanban-meta";

      const statusSelect = document.createElement("select");
      statusSelect.className = "skill-status";
      statusSelect.setAttribute("aria-label", `Pakeisti „${skill.name}“ būseną`);

      skillStatusOptions.forEach((statusName) => {
        const option = document.createElement("option");
        option.value = statusName;
        option.textContent = statusName;
        option.selected = skill.status === statusName;
        statusSelect.append(option);
      });

      statusSelect.addEventListener("change", () => {
        skill.status = statusSelect.value;
        renderSkills();
        saveSkillStatuses();
      });

      const xp = document.createElement("span");
      xp.className = "skill-xp";
      xp.textContent = `${skill.xp} XP`;

      meta.append(statusSelect, xp);
      card.append(title, meta);
      skillContainers[skill.status].append(card);
    });
  };

  const updateSkillStatistics = () => {
    const categoryCounts = {
      "Planuojama": skills.filter((skill) => skill.status === "Planuojama").length,
      "Mokomasi": skills.filter((skill) => skill.status === "Mokomasi").length,
      "Atlikta": skills.filter((skill) => skill.status === "Atlikta").length
    };
    const completedSkills = skills.filter((skill) => skill.status === "Atlikta");
    const completedCount = completedSkills.length;
    const completedPercent = (completedCount / skills.length) * 100;
    const completedXp = completedSkills.reduce((sum, skill) => sum + skill.xp, 0);

    document.querySelector("#planned-count").textContent = getCountLabel(categoryCounts["Planuojama"]);
    document.querySelector("#learning-count").textContent = getCountLabel(categoryCounts["Mokomasi"]);
    document.querySelector("#completed-count").textContent = getCountLabel(categoryCounts["Atlikta"]);
    document.querySelector("#skill-total-count").textContent = String(skills.length);
    document.querySelector("#skill-completed-count").textContent = String(completedCount);
    document.querySelector("#skill-completed-percent").textContent = `${completedPercent.toFixed(1).replace(".0", "")}%`;

    return completedXp;
  };

  const updateExperienceProgress = (completedXp) => {
    let level = 1;
    let rank = "Pradedantysis";
    let levelStartXp = 0;
    let nextLevelXp = 50;
    if (completedXp >= 300) {
      level = 4;
      rank = "Profesionalas";
      levelStartXp = 300;
      nextLevelXp = 300;
    } else if (completedXp >= 150) {
      level = 3;
      rank = "Specialistas";
      levelStartXp = 150;
      nextLevelXp = 300;
    } else if (completedXp >= 50) {
      level = 2;
      rank = "Praktikantas";
      levelStartXp = 50;
      nextLevelXp = 150;
    }

    const xpPercent = level === 4
      ? 100
      : ((completedXp - levelStartXp) / (nextLevelXp - levelStartXp)) * 100;
    const remainingXp = Math.max(nextLevelXp - completedXp, 0);

    const completedXpElement = document.querySelector("#skill-completed-xp");
    completedXpElement.replaceChildren(document.createTextNode(`${completedXp} `));
    const xpUnit = document.createElement("small");
    xpUnit.textContent = "XP";
    completedXpElement.append(xpUnit);
    document.querySelector("#skill-current-level").textContent = String(level);
    document.querySelector("#skill-current-rank").textContent = rank;
    document.querySelector("#skill-xp-percent").textContent = `${xpPercent.toFixed(0)}%`;
    document.querySelector("#skill-xp-progress-fill").style.width = `${xpPercent}%`;
    document.querySelector("#skill-xp-progress-track").setAttribute("aria-valuenow", String(xpPercent.toFixed(0)));
    document.querySelector("#skill-xp-progress-track").setAttribute(
      "aria-valuetext",
      `${completedXp} iš ${nextLevelXp} XP, liko ${remainingXp} XP`
    );
    document.querySelector("#skill-xp-details").textContent = `${completedXp} / ${nextLevelXp} XP`;
    document.querySelector("#skill-xp-remaining").textContent = remainingXp
      ? `Iki kito lygio: ${remainingXp} XP`
      : "Ketvirtasis lygis pasiektas";

    for (let rankLevel = 1; rankLevel <= 4; rankLevel += 1) {
      const rankRow = document.querySelector(`#rank-row-${rankLevel}`);
      if (!rankRow) {
        continue;
      }

      const isCurrentRank = rankLevel === level;
      rankRow.classList.toggle("current-rank", isCurrentRank);
      if (isCurrentRank) {
        rankRow.setAttribute("aria-current", "true");
        const rankCell = rankRow.cells[2];
        if (!rankCell.querySelector(".current-rank-label")) {
          const rankLabel = document.createElement("span");
          rankLabel.className = "current-rank-label";
          rankLabel.textContent = "Dabartinis rangas";
          rankCell.append(" ", rankLabel);
        }
      } else {
        rankRow.removeAttribute("aria-current");
        rankRow.querySelector(".current-rank-label")?.remove();
      }
    }
  };

  const renderSkills = () => {
    renderSkillCards();
    const completedXp = updateSkillStatistics();
    updateExperienceProgress(completedXp);
  };

  restoreSkillStatuses();
  renderSkills();
}