const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("#quote-form");
const formNote = document.querySelector("#form-note");

const updateHeader = () => {
  if (!header.classList.contains("is-fixed-light")) {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
};

const closeNav = () => {
  document.body.classList.remove("nav-open");
  header.classList.remove("nav-active");
  navToggle.setAttribute("aria-expanded", "false");
};

const setFormMessage = (message, state = "info") => {
  if (!formNote) {
    return;
  }

  formNote.textContent = message;
  formNote.dataset.state = state;
};

const setSubmitState = (button, isSubmitting) => {
  if (!button) {
    return;
  }

  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? "Sending enquiry..." : "Send enquiry";
};

const clean = (value) => String(value || "").trim();

const getFormPayload = (data) =>
  Object.fromEntries(Array.from(data.entries()).map(([key, value]) => [key, clean(value)]));

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  header.classList.toggle("nav-active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

if (quoteForm) {
  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(quoteForm);
    const submitButton = quoteForm.querySelector('button[type="submit"]');

    setSubmitState(submitButton, true);
    setFormMessage("Sending your enquiry to khusieventsanddecor@gmail.com...", "info");

    try {
      const response = await fetch(quoteForm.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getFormPayload(data)),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Unable to send the enquiry right now.");
      }

      quoteForm.reset();
      setFormMessage("Thank you. Your enquiry has been sent to Khusi Events & Decor.", "success");
    } catch (error) {
      console.error("Enquiry submit failed:", error);
      const isLocalPreview = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
      const supportMessage = isLocalPreview
        ? "Local preview cannot send email. Test the form on the live website after Vercel email settings are saved."
        : `${error.message} Please email khusieventsanddecor@gmail.com while we finish the website email setup.`;

      setFormMessage(supportMessage, "error");
    } finally {
      setSubmitState(submitButton, false);
    }
  });
}
