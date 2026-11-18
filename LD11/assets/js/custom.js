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