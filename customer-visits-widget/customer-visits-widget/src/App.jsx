import { useMemo, useState } from "react";
import { visits } from "./visits";

const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const fullDateFormatter = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const shortDateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const parseDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    filter: <path d="M4 5h16l-6 7v5l-4 2v-7Z"/>,
    left: <path d="m15 18-6-6 6-6"/>,
    right: <path d="m9 18 6-6-6-6"/>,
    close: <path d="M18 6 6 18M6 6l12 12"/>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function App() {
  const initialDate = useMemo(() => {
    const upcoming = visits.map(v => parseDate(v.visitDate)).sort((a, b) => a - b)[0];
    return upcoming || new Date();
  }, []);

  const [visibleMonth, setVisibleMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [query, setQuery] = useState("");
  const [technology, setTechnology] = useState("All technologies");
  const [selectedVisit, setSelectedVisit] = useState(null);

  const technologies = useMemo(() => ["All technologies", ...new Set(visits.map(v => v.technology).filter(Boolean))], []);
  const filteredVisits = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return visits.filter((visit) => {
      const searchable = `${visit.customerName} ${visit.location} ${visit.technology || ""}`.toLowerCase();
      return (!needle || searchable.includes(needle)) &&
        (technology === "All technologies" || visit.technology === technology);
    }).sort((a, b) => parseDate(a.visitDate) - parseDate(b.visitDate));
  }, [query, technology]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const first = new Date(year, month, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - mondayOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [visibleMonth]);

  const visitsByDate = useMemo(() => filteredVisits.reduce((map, visit) => {
    (map[visit.visitDate] ||= []).push(visit);
    return map;
  }, {}), [filteredVisits]);

  const changeMonth = (offset) => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1));
  const todayKey = dateKey(new Date());

  return (
    <main className="min-h-screen bg-[#f6f3fa] p-3 text-[#21182f] sm:p-6">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-purple-100 bg-white shadow-[0_20px_60px_rgba(54,20,92,0.12)]">
        <header className="relative overflow-hidden bg-[#2f0a5f] px-5 py-7 text-white sm:px-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-28 w-72 rounded-full bg-violet-400/15 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-purple-100">
                <Icon name="calendar" className="h-4 w-4" /> Customer engagement calendar
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Upcoming Customer Visits</h1>
              <p className="mt-2 max-w-2xl text-sm text-purple-100 sm:text-base">A clear view of scheduled visits across locations and technology themes.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs text-purple-200">Matching visits</p><p className="text-2xl font-bold">{filteredVisits.length}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs text-purple-200">Locations</p><p className="text-2xl font-bold">{new Set(filteredVisits.map(v => v.location)).size}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-purple-100 bg-white px-4 py-4 sm:px-7">
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search visits</span>
              <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer, location or technology..." className="h-12 w-full rounded-xl border border-purple-200 bg-purple-50/50 pl-12 pr-4 text-sm outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100" />
            </label>
            <label className="relative md:w-64">
              <span className="sr-only">Filter by technology</span>
              <Icon name="filter" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-500" />
              <select value={technology} onChange={(e) => setTechnology(e.target.value)} className="h-12 w-full appearance-none rounded-xl border border-purple-200 bg-purple-50/50 pl-12 pr-9 text-sm font-medium outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100">
                {technologies.map(item => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="p-4 sm:p-7" aria-label="Calendar">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-purple-500">Calendar</p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">{monthFormatter.format(visibleMonth)}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="icon-button" aria-label="Previous month"><Icon name="left" /></button>
                <button onClick={() => setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} className="rounded-xl border border-purple-200 px-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50">Today</button>
                <button onClick={() => changeMonth(1)} className="icon-button" aria-label="Next month"><Icon name="right" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-purple-100 pb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
              {weekdays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day) => {
                const key = dateKey(day);
                const dailyVisits = visitsByDate[key] || [];
                const inMonth = day.getMonth() === visibleMonth.getMonth();
                const isToday = key === todayKey;
                return (
                  <div key={key} className={`calendar-cell ${inMonth ? "bg-white" : "bg-slate-50/70 text-slate-300"} ${dailyVisits.length ? "ring-1 ring-purple-100" : ""}`}>
                    <div className={`day-number ${isToday ? "bg-[#2f0a5f] text-white" : ""}`}>{day.getDate()}</div>
                    <div className="mt-1 space-y-1">
                      {dailyVisits.slice(0, 2).map(visit => (
                        <button key={visit.id} onClick={() => setSelectedVisit(visit)} className="visit-pill" title={`${visit.customerName}, ${visit.location}`}>
                          <span className="hidden truncate sm:block">{visit.customerName}</span><span className="sm:hidden">•</span>
                        </button>
                      ))}
                      {dailyVisits.length > 2 && <p className="text-[9px] font-bold text-purple-600">+{dailyVisits.length - 2} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="border-t border-purple-100 bg-[#fbf9fd] p-5 sm:p-7 lg:border-l lg:border-t-0" aria-label="Visit list">
            <div className="mb-5 flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-purple-500">Next up</p><h2 className="mt-1 text-xl font-bold">Visit schedule</h2></div>
              {(query || technology !== "All technologies") && <button onClick={() => { setQuery(""); setTechnology("All technologies"); }} className="text-xs font-bold text-purple-700 hover:underline">Clear</button>}
            </div>
            <div className="max-h-[590px] space-y-3 overflow-y-auto pr-1">
              {filteredVisits.length ? filteredVisits.map((visit, index) => (
                <button key={visit.id} onClick={() => { setSelectedVisit(visit); const d = parseDate(visit.visitDate); setVisibleMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }} className="visit-card" style={{ animationDelay: `${index * 55}ms` }}>
                  <div className="flex items-start gap-3">
                    <div className="date-tile"><span>{shortDateFormatter.format(parseDate(visit.visitDate)).split(" ")[0]}</span><strong>{shortDateFormatter.format(parseDate(visit.visitDate)).split(" ")[1]}</strong></div>
                    <div className="min-w-0 flex-1 text-left">
                      <h3 className="truncate font-bold text-[#2f0a5f]">{visit.customerName}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Icon name="location" className="h-4 w-4 text-purple-500" />{visit.location}</p>
                      {visit.technology && <span className="mt-2 inline-flex rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold text-purple-700">{visit.technology}</span>}
                    </div>
                  </div>
                </button>
              )) : <div className="rounded-2xl border border-dashed border-purple-200 bg-white p-8 text-center"><Icon name="search" className="mx-auto h-8 w-8 text-purple-300"/><p className="mt-3 font-bold text-purple-900">No matching visits</p><p className="mt-1 text-sm text-slate-500">Try another search or technology.</p></div>}
            </div>
          </aside>
        </div>
      </section>

      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d0a32]/55 p-4 backdrop-blur-sm" onMouseDown={() => setSelectedVisit(null)}>
          <article className="modal-card" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="visit-title">
            <button onClick={() => setSelectedVisit(null)} className="absolute right-4 top-4 rounded-full p-2 text-purple-700 transition hover:bg-purple-100" aria-label="Close"><Icon name="close" /></button>
            <div className="mb-5 inline-flex rounded-2xl bg-purple-100 p-3 text-purple-700"><Icon name="calendar" className="h-7 w-7" /></div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-600">Customer visit</p>
            <h2 id="visit-title" className="mt-2 pr-10 text-2xl font-bold text-[#2f0a5f]">{selectedVisit.customerName}</h2>
            <div className="mt-6 space-y-3 rounded-2xl bg-purple-50 p-4">
              <p className="flex items-center gap-3 text-sm"><Icon name="calendar" className="text-purple-600"/><span><strong className="block text-purple-950">Visit date</strong>{fullDateFormatter.format(parseDate(selectedVisit.visitDate))}</span></p>
              <p className="flex items-center gap-3 text-sm"><Icon name="location" className="text-purple-600"/><span><strong className="block text-purple-950">Location</strong>{selectedVisit.location}</span></p>
              {selectedVisit.technology && <p className="flex items-center gap-3 text-sm"><Icon name="filter" className="text-purple-600"/><span><strong className="block text-purple-950">Technology</strong>{selectedVisit.technology}</span></p>}
            </div>
          </article>
        </div>
      )}
    </main>
  );
}

export default App;
