const contactForm = document.querySelector("#contact-form");
const formResults = document.querySelector("#form-results");
const submitButton = contactForm && contactForm.querySelector('button[type="submit"]');

if (contactForm && formResults && submitButton) {
  const updateSubmitButtonState = () => {
    submitButton.disabled = !contactForm.checkValidity();
  };

  contactForm.addEventListener("input", updateSubmitButtonState);
  contactForm.addEventListener("change", updateSubmitButtonState);
  updateSubmitButtonState();

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

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