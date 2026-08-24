import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "attendance-settings";

export interface AttendanceSettings {
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  lateToleranceMinutes: number;
}

interface AttendanceSettingsContextValue {
  settings: AttendanceSettings;
  updateSettings: (value: AttendanceSettings) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AttendanceSettings = {
  morningStart: "08:30",
  morningEnd: "12:00",
  afternoonStart: "13:30",
  afternoonEnd: "17:30",
  lateToleranceMinutes: 5,
};

const AttendanceSettingsContext = createContext<AttendanceSettingsContextValue | undefined>(
  undefined,
);

const readFromStorage = (): AttendanceSettings => {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      morningStart: parsed.morningStart ?? DEFAULT_SETTINGS.morningStart,
      morningEnd: parsed.morningEnd ?? DEFAULT_SETTINGS.morningEnd,
      afternoonStart: parsed.afternoonStart ?? DEFAULT_SETTINGS.afternoonStart,
      afternoonEnd: parsed.afternoonEnd ?? DEFAULT_SETTINGS.afternoonEnd,
      lateToleranceMinutes: parsed.lateToleranceMinutes ?? DEFAULT_SETTINGS.lateToleranceMinutes,
    };
  } catch (error) {
    console.error("Unable to read attendance settings:", error);
    return DEFAULT_SETTINGS;
  }
};

export const AttendanceSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AttendanceSettings>(readFromStorage);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (value: AttendanceSettings) => {
    setSettings(value);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
    }),
    [settings],
  );

  return (
    <AttendanceSettingsContext.Provider value={value}>
      {children}
    </AttendanceSettingsContext.Provider>
  );
};

export const useAttendanceSettings = () => {
  const context = useContext(AttendanceSettingsContext);
  if (!context) {
    throw new Error("useAttendanceSettings must be used within an AttendanceSettingsProvider");
  }
  return context;
};

