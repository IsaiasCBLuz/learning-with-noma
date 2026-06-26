"""
NOMA Scheduling Service — slots, holidays, business logic.
"""
from datetime import date, timedelta

# All available time slots (1h30 classes)
ALL_SLOTS = [
    "07:30", "09:00", "10:30", "12:00",
    "14:30", "16:00", "17:30",
    "19:00", "20:30", "22:00",
]

# Slots blocked by default (admin must unlock individually)
DEFAULT_BLOCKED_SLOTS = {
    "07:30", "09:00", "10:30", "12:00",
    "14:30", "16:00", "17:30",
}

NATIONAL_HOLIDAYS = {
    # 2025
    "2025-01-01", "2025-03-03", "2025-03-04",
    "2025-04-18", "2025-04-19", "2025-04-21",
    "2025-05-01", "2025-06-19",
    "2025-09-07", "2025-10-12", "2025-11-02",
    "2025-11-15", "2025-11-20",
    "2025-12-25",
    # 2026
    "2026-01-01", "2026-02-16", "2026-02-17",
    "2026-04-03", "2026-04-05", "2026-04-21",
    "2026-05-01", "2026-06-04",
    "2026-09-07", "2026-10-12", "2026-11-02",
    "2026-11-15", "2026-11-20",
    "2026-12-25",
    # 2027
    "2027-01-01", "2027-02-08", "2027-02-09",
    "2027-03-26", "2027-03-28", "2027-04-21",
    "2027-05-01", "2027-05-27",
    "2027-09-07", "2027-10-12", "2027-11-02",
    "2027-11-15", "2027-11-20",
    "2027-12-25",
}

RECESSES = [
    ("2025-07-06", "2025-07-17"),
    ("2025-12-22", "2026-01-05"),
    ("2026-07-06", "2026-07-17"),
    ("2026-12-22", "2027-01-05"),
]


def is_business_day(d: date) -> bool:
    """Check if date is a valid business day (not weekend, holiday, or recess)."""
    if d.weekday() >= 5:
        return False
    iso = d.isoformat()
    if iso in NATIONAL_HOLIDAYS:
        return False
    for start, end in RECESSES:
        if start <= iso <= end:
            return False
    return True


def calc_contract_end(start: date, num_weeks: int) -> date:
    """Calculate contract end date based on number of weeks of classes."""
    current = start
    weeks_counted = 0
    while weeks_counted < num_weeks:
        if is_business_day(current):
            # Count each Monday as a new week
            if current.weekday() == 0 or current == start:
                weeks_counted += 1
                if weeks_counted == num_weeks:
                    # End on the Friday of this week
                    return current + timedelta(days=(4 - current.weekday()))
        current += timedelta(days=1)
    return current


def get_week_dates(reference_date: date = None, offset: int = 0) -> list[date]:
    """Get Monday-to-Friday dates for a given week offset."""
    d = reference_date or date.today()
    monday = d - timedelta(days=d.weekday()) + timedelta(weeks=offset)
    return [monday + timedelta(days=i) for i in range(5)]
