const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const API_ENDPOINTS = {
    getAllAssets: `${API_BASE_URL}/assets/getAllAssets`,
    addAsset: `${API_BASE_URL}/assets/addAsset`,
    deleteAsset: `${API_BASE_URL}/assets/deleteAsset`,
    getTransactionsByFilter: (year: number | '', month: string, category: string) =>
        `${API_BASE_URL}/transactions/getTransactionsByFilter?year=${year}&month=${month}&category=${category}`,
    getBalanceByPeriod: (year: number, month: string) =>
        `${API_BASE_URL}/transactions/getBalanceByPeriod?year=${year}&month=${month}`,
    addTransactions: `${API_BASE_URL}/transactions/addTransaction`,
    getAvailableYears: `${API_BASE_URL}/transactions/getAvailableYears`,
    getAvailableCategories: `${API_BASE_URL}/transactions/getAvailableCategories`,
    addCategory: `${API_BASE_URL}/transactions/addCategory`,
    deleteCategory: `${API_BASE_URL}/transactions/deleteCategory`,
    updateCategory: `${API_BASE_URL}/transactions/updateCategory`,
    getCalendarEvents: `${API_BASE_URL}/calendar/events`,
    createCalendarEvent: `${API_BASE_URL}/calendar/events`,
    updateCalendarEvent: (id: number) => `${API_BASE_URL}/calendar/events/${id}`,
    deleteCalendarEvent: (id: number) => `${API_BASE_URL}/calendar/events/${id}`,
};
