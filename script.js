const forms = document.querySelectorAll("form[data-endpoint]");

function readForm(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  if (!data.name && data.email) {
    data.name = "Newsletter member";
  }

  return data;
}

async function submitForm(form) {
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const defaultLabel = button.textContent;

  status.textContent = "";
  button.disabled = true;
  button.textContent = "Sending...";

  try {
    const response = await fetch(form.dataset.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(readForm(form))
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Something went wrong. Please try again.");
    }

    form.reset();
    status.textContent = result.message || "Thank you. We received your details.";
    status.classList.remove("is-error");
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("is-error");
  } finally {
    button.disabled = false;
    button.textContent = defaultLabel;
  }
}

forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitForm(form);
  });
});
