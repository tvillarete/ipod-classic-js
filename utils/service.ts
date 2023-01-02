export const SELECTED_SERVICE_KEY = "ipodSelectedService";

export const supportedServices = {
  apple: "apple",
  spotify: "spotify",
};

/**
 * Looks for a 'service' query parameter in the URL.
 * If a supported service is detected, save the selected service to localStorage.
 */
export const getServiceParam = () => {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  const serviceParam = params.get("service")?.toLowerCase();

  if (!serviceParam || !(serviceParam in supportedServices)) {
    return;
  }

  localStorage.setItem(SELECTED_SERVICE_KEY, serviceParam);

  params.delete("service");

  const hasParams = Array.from(params).length > 0;
  const paramsStr = hasParams ? `?${params.toString()}` : "";
  const newUrl = `${location.origin}${location.pathname}${paramsStr}`.trim();

  window.history.replaceState({}, "", newUrl);

  return serviceParam as keyof typeof supportedServices | undefined;
};
