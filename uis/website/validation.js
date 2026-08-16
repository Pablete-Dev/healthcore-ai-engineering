(function () {
  const form = document.getElementById("applicationForm");
  if (!form) return;

  const lang = form.dataset.lang === "es" ? "es" : "en";

  const messages = {
    es: {
      required: "Este campo es obligatorio",
      first_name: "El nombre debe contener solo letras y tener al menos 2 caracteres",
      last_name: "El apellido debe contener solo letras y tener al menos 2 caracteres",
      date_of_birth: "Ingresa una fecha de nacimiento válida. El paciente debe tener entre 0 y 120 años",
      email: "Ingresa un correo electrónico válido (ejemplo: nombre@proveedor.com)",
      phone: "El teléfono debe incluir un código de país (ejemplo: +1 305 555 0191)",
      preferred_language: "Selecciona un idioma preferido",
      preferred_clinic: "Selecciona una clínica preferida",
      preferred_date: "Selecciona una fecha válida entre el próximo día hábil y 60 días hacia adelante",
      preferred_time: "Selecciona una franja horaria",
      service_type: "Selecciona un servicio",
      new_patient: "Selecciona si es tu primera visita",
      has_insurance: "Indica si tienes seguro",
      insurance_provider_required: "Ingresa la aseguradora",
      insurance_provider_max: "La aseguradora no puede superar 100 caracteres",
      insurance_member_id_required: "Ingresa el ID de afiliado",
      insurance_member_id_format: "El ID de afiliado debe tener entre 6 y 20 caracteres alfanuméricos",
      patient_id_format: "Si completas el Patient ID, debe seguir el formato HC- seguido de 6 caracteres alfanuméricos",
      health_concern: "La consulta médica debe tener entre 20 y 500 caracteres",
      consent: "Debes autorizar el contacto para enviar la solicitud",
      paediatric_rule:
        "Paediatric Care está disponible para pacientes menores de 18 años. Revisa la fecha de nacimiento o selecciona un servicio diferente.",
      evening_warning:
        "La franja Evening (5pm–8pm) puede tener disponibilidad limitada en esta clínica según su horario de cierre.",
      success:
        "Tu solicitud de consulta fue enviada correctamente. Nuestro equipo de recepción te contactará pronto para coordinar los próximos pasos."
    },
    en: {
      required: "This field is required",
      first_name: "First name must contain letters only and be at least 2 characters long",
      last_name: "Last name must contain letters only and be at least 2 characters long",
      date_of_birth: "Enter a valid date of birth. The patient must be between 0 and 120 years old",
      email: "Enter a valid email address (example: name@provider.com)",
      phone: "Phone must include a country code (example: +1 305 555 0191)",
      preferred_language: "Select a preferred language",
      preferred_clinic: "Select a preferred clinic",
      preferred_date: "Select a valid date between the next business day and 60 days ahead",
      preferred_time: "Select a preferred time window",
      service_type: "Select a service",
      new_patient: "Select whether this is your first visit",
      has_insurance: "Indicate whether you have insurance",
      insurance_provider_required: "Enter the insurance provider",
      insurance_provider_max: "Insurance provider cannot exceed 100 characters",
      insurance_member_id_required: "Enter the insurance member ID",
      insurance_member_id_format: "Insurance member ID must be 6 to 20 alphanumeric characters",
      patient_id_format:
        "If provided, Patient ID must match HC- followed by exactly 6 alphanumeric characters",
      health_concern: "Medical concern must contain between 20 and 500 characters",
      consent: "You must authorize contact before submitting",
      paediatric_rule:
        "Paediatric Care is available for patients under 18 years old. Please review the date of birth or select a different service.",
      evening_warning:
        "The Evening (5pm–8pm) time window may have limited availability at this clinic based on closing hours.",
      success:
        "Your consultation request was submitted successfully. Our reception team will contact you shortly to coordinate next steps."
    }
  };

  const fields = {
    first_name: form.querySelector('[name="first_name"]'),
    last_name: form.querySelector('[name="last_name"]'),
    date_of_birth: form.querySelector('[name="date_of_birth"]'),
    email: form.querySelector('[name="email"]'),
    phone: form.querySelector('[name="phone"]'),
    preferred_language: form.querySelector('[name="preferred_language"]'),
    preferred_clinic: form.querySelector('[name="preferred_clinic"]'),
    preferred_date: form.querySelector('[name="preferred_date"]'),
    preferred_time: form.querySelector('[name="preferred_time"]'),
    service_type: form.querySelector('[name="service_type"]'),
    new_patient: form.querySelectorAll('[name="new_patient"]'),
    has_insurance: form.querySelectorAll('[name="has_insurance"]'),
    insurance_provider: form.querySelector('[name="insurance_provider"]'),
    insurance_member_id: form.querySelector('[name="insurance_member_id"]'),
    health_concern: form.querySelector('[name="health_concern"]'),
    contact_consent: form.querySelector('[name="contact_consent"]'),
    patient_id: form.querySelector('[name="patient_id"]')
  };

  const patientIdWrapper = document.getElementById("patient-id-wrapper");
  const warningEl = document.getElementById("evening-warning");
  const paediatricRuleEl = document.getElementById("paediatric-rule-error");
  const counterEl = document.getElementById("health_concern-counter");
  const successEl = document.getElementById("success-message");
  const formStatusEl = document.getElementById("form-status");
  const wizardStatusEl = document.getElementById("wizard-status");
  const progressTextEl = document.getElementById("progress-text");
  const progressStepNameEl = document.getElementById("progress-step-name");
  const progressBarEl = document.getElementById("progress-bar");
  const stepSections = Array.from(form.querySelectorAll("[data-step]"));
  const nextButtons = Array.from(form.querySelectorAll("[data-next-step]"));
  const prevButtons = Array.from(form.querySelectorAll("[data-prev-step]"));
  const insuranceFieldsWrapper = document.getElementById("insurance-fields-wrapper");

  const errors = new Set();
  const touched = new Set();

  const clinicClosingHour = {
    "HealthCore Austin Central": 20,
    "HealthCore Austin North": 19,
    "HealthCore San Antonio": 18,
    "HealthCore Miami": 20,
    "HealthCore Orlando": 18,
    "HealthCore Atlanta": 19
  };

  const stepConfig = {
    1: ["first_name", "last_name", "date_of_birth", "email", "phone", "preferred_language"],
    2: ["preferred_clinic", "preferred_date", "preferred_time", "service_type"],
    3: ["new_patient", "patient_id", "has_insurance", "insurance_provider", "insurance_member_id"],
    4: ["health_concern", "contact_consent"]
  };

  const stepNames = {
    es: {
      1: "Datos personales",
      2: "Preferencias de consulta",
      3: "Información del paciente",
      4: "Motivo de la consulta"
    },
    en: {
      1: "Personal details",
      2: "Consultation preferences",
      3: "Patient information",
      4: "Reason for consultation"
    }
  };

  let currentStep = 1;

  function normalize(value) {
    return String(value || "").trim();
  }

  function getRadioValue(nodeList) {
    const checked = Array.from(nodeList).find((radio) => radio.checked);
    return checked ? checked.value : "";
  }

  function getStepElement(step) {
    return form.querySelector('[data-step="' + step + '"]');
  }

  function getStepTitleElement(step) {
    return form.querySelector("#step-title-" + step);
  }

  function setVisibility(element, isVisible) {
    if (!element) return;
    if (isVisible) {
      element.hidden = false;
      element.classList.remove("hidden");
    } else {
      element.hidden = true;
      element.classList.add("hidden");
    }
  }

  function updateProgress(step) {
    const totalSteps = 4;
    const percent = (step / totalSteps) * 100;
    if (progressTextEl) {
      progressTextEl.textContent = lang === "es" ? "Paso " + step + " de 4" : "Step " + step + " of 4";
    }
    if (progressStepNameEl) {
      progressStepNameEl.textContent = stepNames[lang][step];
    }
    if (progressBarEl) {
      progressBarEl.style.width = percent + "%";
    }

    for (let i = 1; i <= totalSteps; i += 1) {
      const indicator = document.getElementById("step-indicator-" + i);
      if (!indicator) continue;
      if (i === step) {
        indicator.setAttribute("aria-current", "step");
        indicator.classList.remove("bg-hcNavy/15", "text-hcNavy");
        indicator.classList.add("bg-hcTeal", "text-white");
      } else {
        indicator.removeAttribute("aria-current");
        indicator.classList.remove("bg-hcTeal", "text-white");
        indicator.classList.add("bg-hcNavy/15", "text-hcNavy");
      }
    }
  }

  function showStep(step, moveFocus) {
    currentStep = step;
    stepSections.forEach((section, index) => {
      const isCurrent = index + 1 === step;
      setVisibility(section, isCurrent);
    });

    updateProgress(step);
    if (wizardStatusEl) {
      wizardStatusEl.textContent = (lang === "es" ? "Mostrando " : "Showing ") + stepNames[lang][step];
    }

    if (moveFocus) {
      const heading = getStepTitleElement(step);
      if (heading) {
        heading.focus();
      }
    }
  }

  function updateConditionalVisibility() {
    const newPatient = getRadioValue(fields.new_patient);
    const hasInsurance = getRadioValue(fields.has_insurance);
    setVisibility(patientIdWrapper, newPatient === "No");
    setVisibility(insuranceFieldsWrapper, hasInsurance === "Yes");
  }

  function getFirstInvalidFieldInStep(step) {
    const section = getStepElement(step);
    if (!section) return null;
    return section.querySelector('[aria-invalid="true"]');
  }

  function setFieldError(fieldName, message) {
    const errorEl = document.getElementById(fieldName + "-error");
    if (!errorEl) return;

    const field = fields[fieldName];
    if (field instanceof NodeList || Array.isArray(field) || fieldName === "new_patient" || fieldName === "has_insurance") {
      const list = Array.from(fields[fieldName]);
      list.forEach((el) => {
        el.setAttribute("aria-invalid", "true");
      });
    } else if (field) {
      field.setAttribute("aria-invalid", "true");
    }

    errorEl.textContent = message;
    errors.add(fieldName);
  }

  function clearFieldError(fieldName) {
    const errorEl = document.getElementById(fieldName + "-error");
    if (!errorEl) return;

    const field = fields[fieldName];
    if (fieldName === "new_patient" || fieldName === "has_insurance") {
      Array.from(fields[fieldName]).forEach((el) => {
        el.removeAttribute("aria-invalid");
      });
    } else if (field) {
      field.removeAttribute("aria-invalid");
    }

    errorEl.textContent = "";
    errors.delete(fieldName);
  }

  function calculateAge(dateString) {
    const dob = new Date(dateString + "T00:00:00");
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
      age -= 1;
    }
    return age;
  }

  function isBusinessDay(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  }

  function nextBusinessDay(fromDate) {
    const d = new Date(fromDate);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (!isBusinessDay(d)) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function validateNameField(fieldName, key) {
    const value = normalize(fields[fieldName].value);
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]{2,50}$/;
    if (!regex.test(value)) {
      setFieldError(fieldName, messages[lang][key]);
      return false;
    }
    clearFieldError(fieldName);
    return true;
  }

  function validateDob() {
    const value = normalize(fields.date_of_birth.value);
    if (!value) {
      setFieldError("date_of_birth", messages[lang].required);
      return false;
    }

    const dob = new Date(value + "T00:00:00");
    const now = new Date();
    const age = calculateAge(value);
    if (Number.isNaN(dob.getTime()) || dob > now || age < 0 || age > 120) {
      setFieldError("date_of_birth", messages[lang].date_of_birth);
      return false;
    }

    clearFieldError("date_of_birth");
    return true;
  }

  function validateEmail() {
    const value = normalize(fields.email.value);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!regex.test(value)) {
      setFieldError("email", messages[lang].email);
      return false;
    }
    clearFieldError("email");
    return true;
  }

  function validatePhone() {
    const value = normalize(fields.phone.value);
    const regex = /^\+\d{1,3}(?:[\s-]?\d){6,20}$/;
    if (!regex.test(value)) {
      setFieldError("phone", messages[lang].phone);
      return false;
    }
    clearFieldError("phone");
    return true;
  }

  function validateSelect(fieldName, msgKey) {
    const value = normalize(fields[fieldName].value);
    if (!value) {
      setFieldError(fieldName, messages[lang][msgKey]);
      return false;
    }
    clearFieldError(fieldName);
    return true;
  }

  function validateRadio(fieldName, msgKey) {
    const value = getRadioValue(fields[fieldName]);
    if (!value) {
      setFieldError(fieldName, messages[lang][msgKey]);
      return false;
    }
    clearFieldError(fieldName);
    return true;
  }

  function validatePreferredDate() {
    const value = normalize(fields.preferred_date.value);
    if (!value) {
      setFieldError("preferred_date", messages[lang].required);
      return false;
    }

    const selected = new Date(value + "T00:00:00");
    const minDate = nextBusinessDay(new Date());
    const maxDate = new Date();
    maxDate.setHours(0, 0, 0, 0);
    maxDate.setDate(maxDate.getDate() + 60);

    if (
      Number.isNaN(selected.getTime()) ||
      !isBusinessDay(selected) ||
      selected < minDate ||
      selected > maxDate
    ) {
      setFieldError("preferred_date", messages[lang].preferred_date);
      return false;
    }

    clearFieldError("preferred_date");
    return true;
  }

  function validateHealthConcern() {
    const value = normalize(fields.health_concern.value);
    if (value.length < 20 || value.length > 500) {
      setFieldError("health_concern", messages[lang].health_concern);
      return false;
    }
    clearFieldError("health_concern");
    return true;
  }

  function validateConsent() {
    if (!fields.contact_consent.checked) {
      setFieldError("contact_consent", messages[lang].consent);
      return false;
    }
    clearFieldError("contact_consent");
    return true;
  }

  function validateInsuranceFields() {
    const hasInsurance = getRadioValue(fields.has_insurance);
    const provider = normalize(fields.insurance_provider.value);
    const memberId = normalize(fields.insurance_member_id.value);

    if (hasInsurance === "Yes") {
      setVisibility(insuranceFieldsWrapper, true);
      let ok = true;
      if (!provider) {
        setFieldError("insurance_provider", messages[lang].insurance_provider_required);
        ok = false;
      } else if (provider.length > 100) {
        setFieldError("insurance_provider", messages[lang].insurance_provider_max);
        ok = false;
      } else {
        clearFieldError("insurance_provider");
      }

      if (!memberId) {
        setFieldError("insurance_member_id", messages[lang].insurance_member_id_required);
        ok = false;
      } else if (!/^[A-Za-z0-9]{6,20}$/.test(memberId)) {
        setFieldError("insurance_member_id", messages[lang].insurance_member_id_format);
        ok = false;
      } else {
        clearFieldError("insurance_member_id");
      }

      fields.insurance_provider.setAttribute("required", "required");
      fields.insurance_member_id.setAttribute("required", "required");
      return ok;
    }

    setVisibility(insuranceFieldsWrapper, false);
    fields.insurance_provider.removeAttribute("required");
    fields.insurance_member_id.removeAttribute("required");
    clearFieldError("insurance_provider");
    clearFieldError("insurance_member_id");
    return true;
  }

  function validatePatientId() {
    const newPatient = getRadioValue(fields.new_patient);
    const patientId = normalize(fields.patient_id.value);

    if (newPatient === "No") {
      setVisibility(patientIdWrapper, true);
      if (patientId && !/^HC-[A-Za-z0-9]{6}$/.test(patientId)) {
        setFieldError("patient_id", messages[lang].patient_id_format);
        return false;
      }
    } else {
      setVisibility(patientIdWrapper, false);
      fields.patient_id.value = "";
      clearFieldError("patient_id");
    }

    clearFieldError("patient_id");
    return true;
  }

  function validatePaediatricRule() {
    const service = normalize(fields.service_type.value);
    const dob = normalize(fields.date_of_birth.value);

    paediatricRuleEl.textContent = "";
    if (service === "Paediatric Care") {
      if (!dob) {
        paediatricRuleEl.textContent = messages[lang].date_of_birth;
        return false;
      }
      const age = calculateAge(dob);
      if (age >= 18) {
        paediatricRuleEl.textContent = messages[lang].paediatric_rule;
        return false;
      }
    }

    return true;
  }

  function updateEveningWarning() {
    const clinic = normalize(fields.preferred_clinic.value);
    const time = normalize(fields.preferred_time.value);
    warningEl.textContent = "";
    warningEl.classList.add("hidden");

    if (time === "Evening (5pm–8pm)" && clinic && clinicClosingHour[clinic] < 20) {
      warningEl.textContent = messages[lang].evening_warning;
      warningEl.classList.remove("hidden");
    }
  }

  function validateField(fieldName) {
    switch (fieldName) {
      case "first_name":
        return validateNameField("first_name", "first_name");
      case "last_name":
        return validateNameField("last_name", "last_name");
      case "date_of_birth":
        return validateDob();
      case "email":
        return validateEmail();
      case "phone":
        return validatePhone();
      case "preferred_language":
        return validateSelect("preferred_language", "preferred_language");
      case "preferred_clinic":
        return validateSelect("preferred_clinic", "preferred_clinic");
      case "preferred_date":
        return validatePreferredDate();
      case "preferred_time":
        return validateSelect("preferred_time", "preferred_time");
      case "service_type":
        return validateSelect("service_type", "service_type");
      case "new_patient":
        return validateRadio("new_patient", "new_patient");
      case "has_insurance":
        return validateRadio("has_insurance", "has_insurance");
      case "insurance_provider":
      case "insurance_member_id":
        return validateInsuranceFields();
      case "patient_id":
        return validatePatientId();
      case "health_concern":
        return validateHealthConcern();
      case "contact_consent":
        return validateConsent();
      default:
        return true;
    }
  }

  function updateCounter() {
    const length = fields.health_concern.value.length;
    counterEl.textContent = length + " / 500";
  }

  function validateAll() {
    const checks = [
      validateField("first_name"),
      validateField("last_name"),
      validateField("date_of_birth"),
      validateField("email"),
      validateField("phone"),
      validateField("preferred_language"),
      validateField("preferred_clinic"),
      validateField("preferred_date"),
      validateField("preferred_time"),
      validateField("service_type"),
      validateField("new_patient"),
      validateField("has_insurance"),
      validateField("insurance_provider"),
      validateField("insurance_member_id"),
      validateField("patient_id"),
      validateField("health_concern"),
      validateField("contact_consent"),
      validatePaediatricRule()
    ];

    updateEveningWarning();
    return checks.every(Boolean);
  }

  function validateStep(step) {
    const checks = stepConfig[step].map((fieldName) => validateField(fieldName));

    if (step === 2) {
      checks.push(validatePaediatricRule());
      updateEveningWarning();
    }
    if (step === 3) {
      updateConditionalVisibility();
    }

    return checks.every(Boolean);
  }

  function goToFirstStepWithError() {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (!firstInvalid) {
      if (paediatricRuleEl.textContent.trim()) {
        showStep(2, false);
        fields.service_type.focus();
      }
      return;
    }

    let targetStep = 1;
    for (let step = 1; step <= 4; step += 1) {
      const section = getStepElement(step);
      if (section && section.contains(firstInvalid)) {
        targetStep = step;
        break;
      }
    }

    showStep(targetStep, false);
    const firstErrorInStep = getFirstInvalidFieldInStep(targetStep);
    if (firstErrorInStep) {
      firstErrorInStep.focus();
    }
  }

  function nextStep() {
    if (!validateStep(currentStep)) {
      const firstError = getFirstInvalidFieldInStep(currentStep);
      if (firstError) {
        firstError.focus();
      } else if (currentStep === 2 && paediatricRuleEl.textContent.trim()) {
        fields.service_type.focus();
      }
      return;
    }

    if (currentStep < 4) {
      showStep(currentStep + 1, true);
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      showStep(currentStep - 1, true);
    }
  }

  function clearDynamicState() {
    successEl.classList.add("hidden");
    successEl.textContent = "";
    formStatusEl.textContent = "";
    paediatricRuleEl.textContent = "";
    warningEl.textContent = "";
    warningEl.classList.add("hidden");
  }

  function resetFormUi() {
    clearDynamicState();
    [
      "first_name",
      "last_name",
      "date_of_birth",
      "email",
      "phone",
      "preferred_language",
      "preferred_clinic",
      "preferred_date",
      "preferred_time",
      "service_type",
      "new_patient",
      "has_insurance",
      "insurance_provider",
      "insurance_member_id",
      "patient_id",
      "health_concern",
      "contact_consent"
    ].forEach(clearFieldError);

    touched.clear();
    errors.clear();
    setVisibility(patientIdWrapper, false);
    setVisibility(insuranceFieldsWrapper, false);
    fields.insurance_provider.removeAttribute("required");
    fields.insurance_member_id.removeAttribute("required");
    updateCounter();
    showStep(1, false);
  }

  function bindInput(name, element, eventName) {
    element.addEventListener("blur", () => {
      touched.add(name);
      validateField(name);
      if (name === "date_of_birth" || name === "service_type") {
        validatePaediatricRule();
      }
      if (name === "preferred_time" || name === "preferred_clinic") {
        updateEveningWarning();
      }
    });

    element.addEventListener(eventName, () => {
      if (errors.has(name)) {
        validateField(name);
      }
      if (name === "date_of_birth" || name === "service_type") {
        validatePaediatricRule();
      }
      if (name === "preferred_time" || name === "preferred_clinic") {
        updateEveningWarning();
      }
      if (name === "health_concern") {
        updateCounter();
      }
    });
  }

  bindInput("first_name", fields.first_name, "input");
  bindInput("last_name", fields.last_name, "input");
  bindInput("date_of_birth", fields.date_of_birth, "change");
  bindInput("email", fields.email, "input");
  bindInput("phone", fields.phone, "input");
  bindInput("preferred_language", fields.preferred_language, "change");
  bindInput("preferred_clinic", fields.preferred_clinic, "change");
  bindInput("preferred_date", fields.preferred_date, "change");
  bindInput("preferred_time", fields.preferred_time, "change");
  bindInput("service_type", fields.service_type, "change");
  bindInput("insurance_provider", fields.insurance_provider, "input");
  bindInput("insurance_member_id", fields.insurance_member_id, "input");
  bindInput("patient_id", fields.patient_id, "input");
  bindInput("health_concern", fields.health_concern, "input");

  fields.contact_consent.addEventListener("change", () => {
    if (errors.has("contact_consent")) {
      validateField("contact_consent");
    }
  });

  Array.from(fields.new_patient).forEach((radio) => {
    radio.addEventListener("change", () => {
      validateField("new_patient");
      validateField("patient_id");
      updateConditionalVisibility();
    });
    radio.addEventListener("blur", () => {
      touched.add("new_patient");
      validateField("new_patient");
      validateField("patient_id");
      updateConditionalVisibility();
    });
  });

  Array.from(fields.has_insurance).forEach((radio) => {
    radio.addEventListener("change", () => {
      validateField("has_insurance");
      validateInsuranceFields();
      updateConditionalVisibility();
    });
    radio.addEventListener("blur", () => {
      touched.add("has_insurance");
      validateField("has_insurance");
      validateInsuranceFields();
      updateConditionalVisibility();
    });
  });

  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      nextStep();
    });
  });

  prevButtons.forEach((button) => {
    button.addEventListener("click", () => {
      previousStep();
    });
  });

  // Event delegation makes step navigation resilient if buttons are re-rendered.
  form.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const nextTrigger = target.closest("[data-next-step]");
    if (nextTrigger) {
      event.preventDefault();
      nextStep();
      return;
    }

    const prevTrigger = target.closest("[data-prev-step]");
    if (prevTrigger) {
      event.preventDefault();
      previousStep();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearDynamicState();

    if (currentStep < 4) {
      nextStep();
      return;
    }

    const valid = validateAll();
    if (!valid) {
      formStatusEl.textContent = lang === "es" ? "Hay errores en el formulario" : "There are errors in the form";
      goToFirstStepWithError();
      return;
    }

    successEl.textContent = messages[lang].success;
    successEl.classList.remove("hidden");
    formStatusEl.textContent = messages[lang].success;
    stepSections.forEach((section) => {
      setVisibility(section, false);
    });
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      resetFormUi();
      const firstField = fields.first_name;
      if (firstField) firstField.focus();
    }, 0);
  });

  const today = new Date();
  const minDate = nextBusinessDay(today);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  fields.preferred_date.setAttribute("min", formatDate(minDate));
  fields.preferred_date.setAttribute("max", formatDate(maxDate));
  fields.date_of_birth.setAttribute("max", formatDate(today));

  updateCounter();
  updateConditionalVisibility();
  showStep(1, false);
  resetFormUi();
})();
