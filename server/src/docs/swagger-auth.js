(() => {
  const STORAGE_KEY = "clipsphere.swagger.jwt";
  const AUTH_SCHEME = "bearerAuth";

  const cleanToken = (value) => {
    if (typeof value !== "string") return "";
    return value.replace(/^Bearer\s+/i, "").trim();
  };

  const getUi = () => window.ui || null;

  const applyTokenToSwagger = (rawToken) => {
    const token = cleanToken(rawToken);
    if (!token) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, token);
    } catch {
      // ignore storage errors
    }

    const swaggerUi = getUi();
    if (swaggerUi && typeof swaggerUi.preauthorizeApiKey === "function") {
      swaggerUi.preauthorizeApiKey(AUTH_SCHEME, token);
    }
  };

  const restoreToken = () => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) applyTokenToSwagger(saved);
    } catch {
      // ignore storage errors
    }
  };

  const installFetchInterceptor = () => {
    if (typeof window.fetch !== "function") return;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      try {
        const requestUrl = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
        const isAuthRequest = /\/api\/v1\/auth\/(login|register)\b/i.test(requestUrl);

        if (isAuthRequest) {
          const cloned = response.clone();
          const payload = await cloned.json().catch(() => null);
          const token = payload?.token;
          if (token) applyTokenToSwagger(token);
        }
      } catch {
        // ignore parse/interception errors
      }

      return response;
    };
  };

  installFetchInterceptor();

  window.addEventListener("load", () => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (getUi()) {
        restoreToken();
        window.clearInterval(interval);
        return;
      }

      if (Date.now() - startedAt > 7000) {
        window.clearInterval(interval);
      }
    }, 200);
  });
})();
