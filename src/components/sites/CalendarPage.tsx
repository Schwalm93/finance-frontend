import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-modal";

import { API_ENDPOINTS } from "../../api/apiConfig";
import "./css/CalendarPage.css";

type RecurrenceRule = "none" | "daily" | "weekly" | "monthly" | "yearly";

type CalendarEvent = {
  id: number;
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
type WasteType = "none" | "gelbe-tonne" | "gruene-tonne" | "schwarze-tonne" | "bio";
type ModalVariant = "default" | "waste";

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
const WASTE_TYPE_OPTIONS = [
  { value: "gelbe-tonne", label: "Gelbe Tonne", color: "#e0a100" },
  { value: "gruene-tonne", label: "Gruene Tonne", color: "#2aa876" },
  { value: "schwarze-tonne", label: "Schwarze Tonne", color: "#2f3640" },
  { value: "bio", label: "Bio", color: "#8a6a3f" },
] as const satisfies ReadonlyArray<{ value: Exclude<WasteType, "none">; label: string; color: string }>;

const WASTE_TYPE_BY_TITLE = new Map<string, WasteType>(WASTE_TYPE_OPTIONS.map((option) => [option.label, option.value]));
const WASTE_CONFIG_BY_TYPE = new Map<Exclude<WasteType, "none">, (typeof WASTE_TYPE_OPTIONS)[number]>(
  WASTE_TYPE_OPTIONS.map((option) => [option.value, option])
);

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

const getWasteType = (event: Pick<CalendarEvent, "title">): WasteType => WASTE_TYPE_BY_TITLE.get(event.title.trim()) ?? "none";

const isWasteEvent = (event: Pick<CalendarEvent, "title">): boolean => getWasteType(event) !== "none";

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

const sortEvents = (events: CalendarEvent[]): CalendarEvent[] =>
  [...events].sort((left, right) => {
    const leftIsWaste = isWasteEvent(left);
    const rightIsWaste = isWasteEvent(right);

    if (leftIsWaste !== rightIsWaste) {
      return leftIsWaste ? -1 : 1;
    }
    if (left.allDay !== right.allDay) {
      return left.allDay ? -1 : 1;
    }
    return left.startTime.localeCompare(right.startTime);
  });

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
  const [modalVariant, setModalVariant] = useState<ModalVariant>("default");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<EventDraft>(() => createEmptyDraft(todayKey));
  const [wasteTypeDraft, setWasteTypeDraft] = useState<Exclude<WasteType, "none">>("gelbe-tonne");
  const [menuOpen, setMenuOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.getCalendarEvents);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as CalendarEvent[];
        setEvents(sortEvents(data));
      } catch (error) {
        console.error("Fehler beim Laden der Kalenderdaten", error);
      }
    };

    void fetchEvents();
  }, []);

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
        wasteItems: sortEvents(events.filter((event) => occursOnDate(event, key) && isWasteEvent(event))),
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
    setModalVariant("default");
    setDraft(createEmptyDraft(dateKey));
    setModalOpen(true);
  };

  const openNewWasteEvent = () => {
    const wasteConfig = WASTE_CONFIG_BY_TYPE.get("gelbe-tonne");
    if (!wasteConfig) {
      return;
    }

    setMenuOpen(false);
    setSelectedDate(selectedDate);
    setEditingId(null);
    setModalVariant("waste");
    setWasteTypeDraft("gelbe-tonne");
    setDraft({
      ...createEmptyDraft(selectedDate),
      title: wasteConfig.label,
      color: wasteConfig.color,
      allDay: true,
      startTime: "",
      endTime: "",
    });
    setModalOpen(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setSelectedDate(event.date);
    setEditingId(event.id);
    setModalVariant(isWasteEvent(event) ? "waste" : "default");
    setWasteTypeDraft(getWasteType(event) === "none" ? "gelbe-tonne" : (getWasteType(event) as Exclude<WasteType, "none">));
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
    const saveEvent = async () => {
      if (!draft.title.trim()) {
        return;
      }

      const normalized = {
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      date: draft.date,
      startTime: draft.allDay ? "" : draft.startTime,
      endTime: draft.allDay ? "" : draft.endTime,
      color: draft.color,
      allDay: draft.allDay,
      recurrence: draft.recurrence,
      };

      try {
        const response = await fetch(
          editingId ? API_ENDPOINTS.updateCalendarEvent(editingId) : API_ENDPOINTS.createCalendarEvent,
          {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(normalized),
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const saved = (await response.json()) as CalendarEvent;
        setEvents((current) => {
          const next = editingId
            ? current.map((event) => (event.id === editingId ? saved : event))
            : [...current, saved];
          return sortEvents(next);
        });

        setSelectedDate(saved.date);
        setCurrentMonth(new Date(parseDate(saved.date).getFullYear(), parseDate(saved.date).getMonth(), 1));
        setModalOpen(false);
      } catch (error) {
        console.error("Fehler beim Speichern des Kalendereintrags", error);
      }
    };

    void saveEvent();
  };

  const handleDelete = () => {
    const deleteEvent = async () => {
      if (!editingId) {
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.deleteCalendarEvent(editingId), {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        setEvents((current) => current.filter((event) => event.id !== editingId));
        setModalOpen(false);
      } catch (error) {
        console.error("Fehler beim Loeschen des Kalendereintrags", error);
      }
    };

    void deleteEvent();
  };

  const goToMonth = (offset: number) => {
    setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayKey);
  };

  const showWasteControls = modalVariant === "waste";

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
              <div className="calendar-board__menu">
                <button
                  type="button"
                  className="calendar-board__icon-button"
                  aria-label="Kalender-Menue"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((current) => !current)}
                >
                  &#9776;
                </button>
                {menuOpen ? (
                  <div className="calendar-board__menu-popover">
                    <button type="button" className="calendar-board__menu-item" onClick={openNewWasteEvent}>
                      <span className="calendar-board__menu-dot" />
                      <span>Abfall Termin</span>
                    </button>
                  </div>
                ) : null}
              </div>
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
                    className={[
                      "calendar-agenda-mobile__item",
                      isWasteEvent(event) ? "calendar-agenda-mobile__item--waste" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
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
                  {day.wasteItems[0] ? (
                    <span
                      className="calendar-day__waste-dot"
                      style={{ "--calendar-chip": day.wasteItems[0].color } as React.CSSProperties}
                      title={day.wasteItems.map((event) => event.title).join(", ")}
                    />
                  ) : null}
                </div>

                <div className="calendar-day__items">
                  {day.items
                    .filter((event) => !isWasteEvent(event))
                    .slice(0, 3)
                    .map((event) => (
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
                  {day.items.filter((event) => !isWasteEvent(event)).length > 3 ? (
                    <span className="calendar-day__more">+{day.items.filter((event) => !isWasteEvent(event)).length - 3}</span>
                  ) : null}
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
          {showWasteControls ? null : (
            <label className="calendar-field">
              <span>Titel</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Zum Beispiel Haushaltsplanung"
              />
            </label>
          )}

          <div className="calendar-modal__grid">
            {showWasteControls ? (
              <label className="calendar-field">
                <span>Tonne</span>
                <select
                  value={wasteTypeDraft}
                  onChange={(event) => {
                    const nextType = event.target.value as Exclude<WasteType, "none">;
                    const wasteConfig = WASTE_CONFIG_BY_TYPE.get(nextType);
                    if (!wasteConfig) {
                      return;
                    }

                    setWasteTypeDraft(nextType);
                    setDraft((current) => ({
                      ...current,
                      title: wasteConfig.label,
                      color: wasteConfig.color,
                      allDay: true,
                      startTime: "",
                      endTime: "",
                    }));
                  }}
                >
                  {WASTE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="calendar-field">
              <span>Datum</span>
              <input
                type="date"
                value={draft.date}
                onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}
              />
            </label>

            {showWasteControls ? null : (
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
            )}
          </div>

          {showWasteControls ? null : (
            <label className="calendar-field calendar-field--checkbox">
              <input
                type="checkbox"
                checked={draft.allDay}
                onChange={(event) => setDraft((current) => ({ ...current, allDay: event.target.checked }))}
              />
              <span>Ganztagiger Termin</span>
            </label>
          )}

          {!draft.allDay && !showWasteControls ? (
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

          {showWasteControls ? null : (
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
          )}

          {showWasteControls ? null : (
            <label className="calendar-field">
              <span>Notiz</span>
              <textarea
                rows={4}
                value={draft.notes}
                onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Optionaler Hinweis, Ort oder Aufgabe"
              />
            </label>
          )}
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
