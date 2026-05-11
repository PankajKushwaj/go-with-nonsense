export const isValidEmail = (email = "") => /\S+@\S+\.\S+/.test(email);

export const isValidPhone = (phone = "") => /^[0-9+\-\s()]{7,20}$/.test(phone);

export const compactString = (value = "") => String(value).trim();

export const parseImages = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((entry) => parseImages(entry));

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(compactString).filter(Boolean);
      }
    } catch {
      return value
        .split(/\r?\n|,/)
        .map(compactString)
        .filter(Boolean);
    }
  }

  return [];
};

export const isMongoId = (value = "") => /^[a-f\d]{24}$/i.test(value);
