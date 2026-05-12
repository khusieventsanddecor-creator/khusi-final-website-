const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const quoteForm = document.querySelector("#quote-form");
const formNote = document.querySelector("#form-note");
const rsvpForm = document.querySelector("#rsvp-form");
const rsvpNote = document.querySelector("#rsvp-note");

const updateHeader = () => {
  if (!header) {
    return;
  }

  if (!header.classList.contains("is-fixed-light")) {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
};

const closeNav = () => {
  if (!header || !navToggle) {
    return;
  }

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

const getFormAction = (form) => {
  const liveEndpoint = form.dataset.apiEndpoint;

  if (liveEndpoint && window.location.protocol === "file:") {
    return liveEndpoint;
  }

  return form.action || liveEndpoint;
};

const getSupportMessage = (error, fallback) => {
  const isLocalPreview =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost" ||
    window.location.protocol === "file:";

  if (isLocalPreview) {
    return "Local preview cannot send email. Test the form on the live website after Vercel email settings are saved.";
  }

  return `${error.message || fallback} Please email admin@khusi.com.au while we finish the website email setup.`;
};

updateHeader();
if (header) {
  window.addEventListener("scroll", updateHeader, { passive: true });
}

if (navToggle && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    header.classList.toggle("nav-active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

if (quoteForm) {
  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(quoteForm);
    const submitButton = quoteForm.querySelector('button[type="submit"]');

    setSubmitState(submitButton, true);
    setFormMessage("Sending your enquiry to admin@khusi.com.au...", "info");

    try {
      const response = await fetch(getFormAction(quoteForm), {
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
      setFormMessage(getSupportMessage(error, "Unable to send the enquiry right now."), "error");
    } finally {
      setSubmitState(submitButton, false);
    }
  });
}

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(rsvpForm);
    const submitButton = rsvpForm.querySelector('button[type="submit"]');
    const submitLabel = submitButton?.querySelector(".rsvp-submit-label");
    const defaultSubmitText = submitButton?.dataset.defaultLabel || submitLabel?.textContent || submitButton?.textContent || "Submit";

    if (submitButton) {
      submitButton.disabled = true;
      if (submitLabel) {
        submitLabel.textContent = "Sending RSVP...";
      } else {
        submitButton.textContent = "Sending RSVP...";
      }
    }

    if (rsvpNote) {
      rsvpNote.textContent = "Sending your RSVP to Khusi Events & Decor...";
      rsvpNote.dataset.state = "info";
    }

    try {
      const response = await fetch(getFormAction(rsvpForm), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getFormPayload(data)),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Unable to send the RSVP right now.");
      }

      rsvpForm.reset();

      if (rsvpNote) {
        rsvpNote.textContent = "Thank you. Your RSVP has been sent.";
        rsvpNote.dataset.state = "success";
      }
    } catch (error) {
      console.error("RSVP submit failed:", error);

      if (rsvpNote) {
        rsvpNote.textContent = getSupportMessage(error, "Unable to send the RSVP right now.");
        rsvpNote.dataset.state = "error";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        if (submitLabel) {
          submitLabel.textContent = defaultSubmitText;
        } else {
          submitButton.textContent = defaultSubmitText;
        }
      }
    }
  });
}
