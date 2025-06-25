import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Loading states
  loading: {
    global: false,
    dashboard: false,
    fuelReceiving: false,
    fuelConsumption: false,
    invoices: false,
    reports: false,
    auditTrail: false,
  },

  // Error states
  errors: {
    global: null,
    dashboard: null,
    fuelReceiving: null,
    fuelConsumption: null,
    invoices: null,
    reports: null,
    auditTrail: null,
  },

  // Success messages
  successMessages: {
    global: null,
    dashboard: null,
    fuelReceiving: null,
    fuelConsumption: null,
    invoices: null,
    reports: null,
    auditTrail: null,
  },

  // Loading actions
  setLoading: (module, isLoading) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [module]: isLoading,
      },
    })),

  setGlobalLoading: (isLoading) =>
    set((state) => ({
      loading: {
        ...state.loading,
        global: isLoading,
      },
    })),

  // Error actions
  setError: (module, error) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [module]: error,
      },
    })),

  clearError: (module) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [module]: null,
      },
    })),

  clearAllErrors: () =>
    set((state) => ({
      errors: {
        global: null,
        dashboard: null,
        fuelReceiving: null,
        fuelConsumption: null,
        invoices: null,
        reports: null,
        auditTrail: null,
      },
    })),

  // Success message actions
  setSuccessMessage: (module, message) =>
    set((state) => ({
      successMessages: {
        ...state.successMessages,
        [module]: message,
      },
    })),

  clearSuccessMessage: (module) =>
    set((state) => ({
      successMessages: {
        ...state.successMessages,
        [module]: null,
      },
    })),

  clearAllSuccessMessages: () =>
    set((state) => ({
      successMessages: {
        global: null,
        dashboard: null,
        fuelReceiving: null,
        fuelConsumption: null,
        invoices: null,
        reports: null,
        auditTrail: null,
      },
    })),

  // Utility actions
  resetModule: (module) =>
    set((state) => ({
      loading: {
        ...state.loading,
        [module]: false,
      },
      errors: {
        ...state.errors,
        [module]: null,
      },
      successMessages: {
        ...state.successMessages,
        [module]: null,
      },
    })),

  resetAll: () =>
    set(() => ({
      loading: {
        global: false,
        dashboard: false,
        fuelReceiving: false,
        fuelConsumption: false,
        invoices: false,
        reports: false,
        auditTrail: false,
      },
      errors: {
        global: null,
        dashboard: null,
        fuelReceiving: null,
        fuelConsumption: null,
        invoices: null,
        reports: null,
        auditTrail: null,
      },
      successMessages: {
        global: null,
        dashboard: null,
        fuelReceiving: null,
        fuelConsumption: null,
        invoices: null,
        reports: null,
        auditTrail: null,
      },
    })),
}));

export default useAppStore;
