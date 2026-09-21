const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // el cuerpo no era JSON, se usa el statusText
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

function qs(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}

export const api = {
  mediaUrl: (relativeUrl) =>
    relativeUrl?.startsWith("http") ? relativeUrl : `${API_URL}${relativeUrl}`,

  listUsers: () => request("/users"),
  getUser: (id) => request(`/users/${id}`),
  createUser: (data) =>
    request("/users", { method: "POST", body: JSON.stringify(data) }),

  uploadFile: async (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/uploads", { method: "POST", body: form });
  },

  listContent: (params = {}) => request(`/content${qs(params)}`),
  getContent: (id) => request(`/content/${id}`),
  publishContent: (data) =>
    request("/content", { method: "POST", body: JSON.stringify(data) }),
  moderateContent: (id, adminId, approve) =>
    request(`/content/${id}/moderate`, {
      method: "POST",
      body: JSON.stringify({ admin_id: adminId, approve }),
    }),

  listRequests: (params = {}) => request(`/requests${qs(params)}`),
  getRequest: (id) => request(`/requests/${id}`),
  createRequest: (data) =>
    request("/requests", { method: "POST", body: JSON.stringify(data) }),
  closeRequest: (id) => request(`/requests/${id}/close`, { method: "POST" }),

  createOffer: (data) =>
    request("/offers", { method: "POST", body: JSON.stringify(data) }),
  listOffersForRequest: (requestId) => request(`/offers${qs({ request_id: requestId })}`),
  listOffersMade: (offererId) => request(`/offers${qs({ offerer_id: offererId })}`),
  listOffersReceived: (requesterId) => request(`/offers${qs({ requester_id: requesterId })}`),

  sendMessage: (fromUserId, contentId, body) =>
    request("/messages", {
      method: "POST",
      body: JSON.stringify({ from_user_id: fromUserId, content_id: contentId, body }),
    }),

  checkout: (buyerId, contentId) =>
    request("/purchases/checkout", {
      method: "POST",
      body: JSON.stringify({ buyer_id: buyerId, content_id: contentId }),
    }),
  confirmPurchase: (purchaseId, buyerId) =>
    request(`/purchases/${purchaseId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ buyer_id: buyerId }),
    }),
  listPurchases: (buyerId) => request(`/purchases${qs({ buyer_id: buyerId })}`),
  listSales: (sellerId) => request(`/purchases${qs({ seller_id: sellerId })}`),

  adminOverview: (adminId) => request(`/admin/overview?admin_id=${adminId}`),
  adminPending: (adminId) => request(`/admin/pending?admin_id=${adminId}`),
};
