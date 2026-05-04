interface BuildLaunchWhatsAppUrlParams {
  url: string;
  text: string;
}

interface BuildSignupUrlParams {
  ref?: string | null;
}

function hasAbsoluteProtocol(url: string) {
  return /^https?:\/\//i.test(url);
}

function toOutputUrl(baseUrl: string, parsedUrl: URL) {
  if (hasAbsoluteProtocol(baseUrl)) {
    return parsedUrl.toString();
  }

  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}

export function buildLaunchUrl(baseUrl: string, ref?: string | null) {
  const parsedUrl = new URL(baseUrl, "https://landing.local");

  if (ref && ref.trim()) {
    parsedUrl.searchParams.set("ref", ref.trim());
  } else {
    parsedUrl.searchParams.delete("ref");
  }

  return toOutputUrl(baseUrl, parsedUrl);
}

export function buildLaunchWhatsAppUrl({
  url,
  text,
}: BuildLaunchWhatsAppUrlParams) {
  const payload = encodeURIComponent(`${text}\n\n${url}`);
  return `https://api.whatsapp.com/send?text=${payload}`;
}

export function buildSignupUrl({ ref }: BuildSignupUrlParams) {
  const params = new URLSearchParams({
    mode: "signup",
    next: "/voluntario",
  });

  if (ref && ref.trim()) {
    params.set("ref", ref.trim());
  }

  return `/auth?${params.toString()}`;
}

export async function copyToClipboardSafe(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
