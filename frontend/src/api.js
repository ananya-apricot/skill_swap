const BASE = import.meta.env.VITE_API_URL;

export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token"); // the "wristband" saved at login

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Show zod's field errors if present, otherwise the plain message
    const detail = data.errors?.map((e) => `${e.field}: ${e.message}`).join(", ");
    throw new Error(detail || data.message || "Something went wrong");
  }
  return data;
}