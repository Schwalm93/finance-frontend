import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-modal";

import "./css/CalendarPage.css";

type RecurrenceRule = "none" | "daily" | "weekly" | "monthly" | "yearly";

type CalendarEvent = {
  id: string;
  title: string;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
  allDay: boolean;
  recurrence: RecurrenceRule;
};

type EventDraft = Omit<CalendarEvent, "id">;

const STORAGE_KEY = "finance.calendar.events";
const DAY_NAMES = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_NAMES = [
  "Januar",
  "Februar",
  "Maerz",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const RECURRENCE_LABELS: Record<RecurrenceRule, string> = {
  none: "Einmalig",
  daily: "Taeglich",
  weekly: "Woechentlich",
  monthly: "Monatlich",
  yearly: "Jaehrlich",
};

const DEFAULT_COLORS = ["#1f6feb", "#ef7d57", "#2aa876", "#7b61ff", "#d9485f", "#e0a100"];

const createEmptyDraft = (date: string): EventDraft => ({
  title: "",
  notes: "",
  date,
  startTime: "09:00",
  endTime: "10:00",
  color: DEFAULT_COLORS[0],
  allDay: false,
  recurrence: "none",
});

const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (date: string): Date => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const sameMonth = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

const sameDayOfMonth = (source: Date, target: Date): boolean => source.getDate() === target.getDate();

const occursOnDate = (event: CalendarEvent, dateKey: string): boolean => {
  if (dateKey < event.date) {
    return false;
  }

  if (event.recurrence === "none") {
    return event.date === dateKey;
  }

  const startDate = parseDate(event.date);
  const targetDate = parseDate(dateKey);
  const diffDays = Math.floor((targetDate.getTime() - startDate.getTime()) / 86_400_000);

  switch (event.recurrence) {
    case "daily":
      return diffDays >= 0;
    case "weekly":
      return diffDays >= 0 && diffDays % 7 === 0;
    case "monthly":
      return sameDayOfMonth(startDate, targetDate);
    case "yearly":
      return startDate.getDate() === targetDate.getDate() && startDate.getMonth() === targetDate.getMonth();
    default:
      return false;
  }
};

const formatSelectedDate = (dateKey: string): string => {
  const date = parseDate(dateKey);
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const createSampleEvents = (today: string): CalendarEvent[] => [
  {
    id: "sample-budget-review",
    title: "Budget-Check",
    notes: "Fixer Monatsueberblick fuer Ausgaben und Sparziele.",
    date: today,
    startTime: "19:00",
    endTime: "19:30",
    color: "#1f6feb",
    allDay: false,
    recurrence: "monthly",
  },
  {
    id: "sample-investment",
    title: "Depot-Review",
    notes: "Woechentlicher Blick auf Vermoegen und Positionen.",
    date: today,
    startTime: "08:00",
    endTime: "08:20",
    color: "#2aa876",
    allDay: false,
    recurrence: "weekly",
  },
];

const sortEvents = (events: CalendarEvent[]): CalendarEvent[] =>
  [...events].sort((left, right) => {
    if (left.allDay !== right.allDay) {
      return left.allDay ? -1 : 1;
    }
    return left.startTime.localeCompare(right.startTime);
  });

const buildEventId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const getWeekDays = (dateKey: string, events: CalendarEvent[], todayKey: string) => {
  const anchor = parseDate(dateKey);
  const weekday = (anchor.getDay() + 6) % 7;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - weekday);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = getDateKey(date);
    return {
      key,
      shortLabel: DAY_NAMES[index],
      dayNumber: date.getDate(),
      isToday: key === todayKey,
      items: sortEvents(events.filter((event) => occursOnDate(event, key))),
    };
  });
};

export const CalendarPage = () => {
  const todayKey = getDateKey(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EventDraft>(() => createEmptyDraft(todayKey));
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setEvents(createSampleEvents(todayKey));
      return;
    }

    try {
      const parsed = JSON.parse(raw) as CalendarEvent[];
      setEvents(parsed);
    } catch {
      setEvents(createSampleEvents(todayKey));
    }
  }, [todayKey]);

  useEffect(() => {
    if (events.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const monthDays = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const firstWeekday = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - firstWeekday);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const key = getDateKey(date);
      return {
        date,
        key,
        inMonth: sameMonth(date, currentMonth),
        isToday: key === todayKey,
        items: sortEvents(events.filter((event) => occursOnDate(event, key))),
      };
    });
  }, [currentMonth, events, todayKey]);

  const selectedEvents = useMemo(
    () => sortEvents(events.filter((event) => occursOnDate(event, selectedDate))),
    [events, selectedDate]
  );

  const weekDays = useMemo(() => getWeekDays(selectedDate, events, todayKey), [selectedDate, events, todayKey]);

  const openNewEvent = (dateKey: string) => {
    setSelectedDate(dateKey);
    setEditingId(null);
    setDraft(createEmptyDraft(dateKey));
    setModalOpen(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setSelectedDate(event.date);
    setEditingId(event.id);
    setDraft({
      title: event.title,
      notes: event.notes,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      color: event.color,
      allDay: event.allDay,
      recurrence: event.recurrence,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!draft.title.trim()) {
      return;
    }

    const normalized: CalendarEvent = {
      id: editingId ?? buildEventId(),
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      date: draft.date,
      startTime: draft.allDay ? "" : draft.startTime,
      endTime: draft.allDay ? "" : draft.endTime,
      color: draft.color,
      allDay: draft.allDay,
      recurrence: draft.recurrence,
    };

    setEvents((current) => {
      const next = editingId
        ? current.map((event) => (event.id === editingId ? normalized : event))
        : [...current, normalized];
      return sortEvents(next);
    });

    setSelectedDate(draft.date);
    setCurrentMonth(new Date(parseDate(draft.date).getFullYear(), parseDate(draft.date).getMonth(), 1));
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingId) {
      return;
    }

    setEvents((current) => current.filter((event) => event.id !== editingId));
    setModalOpen(false);
  };

  const goToMonth = (offset: number) => {
    setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayKey);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    goToMonth(deltaX < 0 ? 1 : -1);
  };

  return (
    <div className="calendar-page">
      <section className="calendar-page__surface">
        <section className="calendar-board" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="calendar-board__toolbar">
            <button type="button" className="calendar-board__icon-button" onClick={() => goToMonth(-1)} aria-label="Vorheriger Monat">
              &#8249;
            </button>
            <div className="calendar-board__title">
              <span className="calendar-board__label">{formatSelectedDate(selectedDate)}</span>
              <h2>
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
            </div>
            <div className="calendar-board__controls">
              <button type="button" className="calendar-page__ghost-button" onClick={goToToday}>
                Heute
              </button>
              <button type="button" className="calendar-board__icon-button" onClick={() => goToMonth(1)} aria-label="Naechster Monat">
                &#8250;
              </button>
            </div>
          </div>

          <div className="calendar-week-strip">
            {weekDays.map((day) => (
              <button
                key={day.key}
                type="button"
                className={[
                  "calendar-week-day",
                  selectedDate === day.key ? "calendar-week-day--selected" : "",
                  day.isToday ? "calendar-week-day--today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedDate(day.key)}
              >
                <span className="calendar-week-day__label">{day.shortLabel}</span>
                <strong className="calendar-week-day__number">{day.dayNumber}</strong>
                <span className="calendar-week-day__meta">{day.items.length > 0 ? `${day.items.length}` : ""}</span>
              </button>
            ))}
          </div>

          <div className="calendar-agenda-mobile">
            <div className="calendar-agenda-mobile__header">
              <span className="calendar-board__label">{formatSelectedDate(selectedDate)}</span>
              <button type="button" className="calendar-page__ghost-button" onClick={() => openNewEvent(selectedDate)}>
                Termin
              </button>
            </div>

            <div className="calendar-agenda-mobile__list">
              {selectedEvents.length === 0 ? (
                <button type="button" className="calendar-agenda-mobile__empty" onClick={() => openNewEvent(selectedDate)}>
                  Termin fuer diesen Tag anlegen
                </button>
              ) : (
                selectedEvents.slice(0, 4).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="calendar-agenda-mobile__item"
                    onClick={() => openEditEvent(event)}
                  >
                    <span className="calendar-agenda-mobile__accent" style={{ background: event.color }} />
                    <span className="calendar-agenda-mobile__title">{event.title}</span>
                    <span className="calendar-agenda-mobile__time">
                      {event.allDay ? "Ganztagig" : event.startTime}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="calendar-board__weekdays">
            {DAY_NAMES.map((dayName) => (
              <span key={dayName}>{dayName}</span>
            ))}
          </div>

          <div className="calendar-board__grid">
            {monthDays.map((day) => (
              <button
                key={day.key}
                type="button"
                className={[
                  "calendar-day",
                  day.inMonth ? "" : "calendar-day--muted",
                  day.isToday ? "calendar-day--today" : "",
                  selectedDate === day.key ? "calendar-day--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => openNewEvent(day.key)}
              >
                <div className="calendar-day__header">
                  <span className="calendar-day__number">{day.date.getDate()}</span>
                </div>

                <div className="calendar-day__items">
                  {day.items.slice(0, 3).map((event) => (
                    <span
                      key={`${day.key}-${event.id}`}
                      className="calendar-day__chip"
                      style={{ "--calendar-chip": event.color } as React.CSSProperties}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        setSelectedDate(day.key);
                        openEditEvent(event);
                      }}
                      title={`${event.title} ${event.allDay ? "" : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`}`.trim()}
                    >
                      <span className="calendar-day__chip-dot" />
                      <span className="calendar-day__chip-title">{event.title}</span>
                    </span>
                  ))}
                  {day.items.length > 3 ? <span className="calendar-day__more">+{day.items.length - 3}</span> : null}
                </div>
              </button>
            ))}
          </div>
        </section>
      </section>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        overlayClassName="calendar-modal__overlay"
        className="calendar-modal"
      >
        <div className="calendar-modal__header">
          <div>
            <span className="calendar-page__eyebrow">{editingId ? "Termin bearbeiten" : "Neuer Termin"}</span>
            <h2>{draft.title.trim() || "Kalendereintrag"}</h2>
            <p>{formatSelectedDate(draft.date)}</p>
          </div>
          <button type="button" className="calendar-modal__close" onClick={() => setModalOpen(false)}>
            x
          </button>
        </div>

        <div className="calendar-modal__body">
          <label className="calendar-field">
            <span>Titel</span>
            <input
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Zum Beispiel Haushaltsplanung"
            />
          </label>

          <div className="calendar-modal__grid">
            <label className="calendar-field">
              <span>Datum</span>
              <input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
              />
            </label>

            <label className="calendar-field">
              <span>Wiederholung</span>
              <select
                value={draft.recurrence}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, recurrence: event.target.value as RecurrenceRule }))
                }
              >
                {Object.entries(RECURRENCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="calendar-field calendar-field--checkbox">
            <input
              type="checkbox"
              checked={draft.allDay}
              onChange={(event) => setDraft((current) => ({ ...current, allDay: event.target.checked }))}
            />
            <span>Ganztagiger Termin</span>
          </label>

          {!draft.allDay ? (
            <div className="calendar-modal__grid">
              <label className="calendar-field">
                <span>Start</span>
                <input
                  type="time"
                  value={draft.startTime}
                  onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))}
                />
              </label>

              <label className="calendar-field">
                <span>Ende</span>
                <input
                  type="time"
                  value={draft.endTime}
                  onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))}
                />
              </label>
            </div>
          ) : null}

          <div className="calendar-field">
            <span>Farbe</span>
            <div className="calendar-color-row">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={["calendar-color-swatch", draft.color === color ? "calendar-color-swatch--active" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ background: color }}
                  onClick={() => setDraft((current) => ({ ...current, color }))}
                />
              ))}
              <input
                type="color"
                value={draft.color}
                className="calendar-color-picker"
                onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))}
              />
            </div>
          </div>

          <label className="calendar-field">
            <span>Notiz</span>
            <textarea
              rows={4}
              value={draft.notes}
              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Optionaler Hinweis, Ort oder Aufgabe"
            />
          </label>
        </div>

        <div className="calendar-modal__footer">
          {editingId ? (
            <button type="button" className="calendar-page__danger-button" onClick={handleDelete}>
              Loeschen
            </button>
          ) : (
            <span />
          )}
          <div className="calendar-modal__footer-actions">
            <button type="button" className="calendar-page__ghost-button" onClick={() => setModalOpen(false)}>
              Abbrechen
            </button>
            <button type="button" className="calendar-page__primary-button" onClick={handleSave}>
              Speichern
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarPage;
