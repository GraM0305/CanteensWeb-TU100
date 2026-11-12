const API_BASE_URL = window.APP_CONFIG.API_BASE_URL;

async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  const result = await response.json();

  if (!response.ok || result.success !== true) {
    throw new Error(
      result.error?.message || `HTTP Error: ${response.status}`
    );
  }

  return result.data;
}

export async function getCanteens() {
  const data = await apiGet("/canteens");

  if (!Array.isArray(data)) {
    throw new Error("Invalid canteen data received from API");
  }

  return data;
}

export function getVendors(canteenId) {
  return apiGet(
    `/vendors?canteenId=${encodeURIComponent(canteenId)}`
  );
}
