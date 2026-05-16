from datetime import date, timedelta

# Slots available for booking
ALL_SLOTS = ["07:30", "09:00", "10:30", "12:00", "14:30", "16:00", "17:30", "19:00", "20:30", "22:00"]

# Slots blocked by default (admin must unlock individually)
DEFAULT_BLOCKED_SLOTS = {"07:30", "09:00", "10:30", "12:00", "14:30", "16:00", "17:30"}

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
}

RECESSES = [
    ("2025-07-06", "2025-07-17"),
    ("2025-12-22", "2026-01-05"),
]

# System-wide block: all slots before this date appear occupied for everyone
SYSTEM_BLOCK_UNTIL = date(2026, 7, 1)

# Credits per plan
CREDITS_BY_PLAN = {
    "light": 4, "light+": 12, "light++": 24, "light_annual": 48,
    "full": 8, "full+": 24, "full++": 48, "full_annual": 96,
    "bee": 4,
}

# Weekly frequency per plan
WEEKLY_FREQ = {
    "light": 1, "light+": 1, "light++": 1, "light_annual": 1,
    "full": 2, "full+": 2, "full++": 2, "full_annual": 2,
    "bee": 1,
}


def is_business_day(d: date) -> bool:
    if d.weekday() >= 5:
        return False
    iso = d.isoformat()
    if iso in NATIONAL_HOLIDAYS:
        return False
    for start, end in RECESSES:
        if start <= iso <= end:
            return False
    return True


def calc_contract_end(start: date, num_classes: int) -> date:
    used, current = 0, start
    while used < num_classes:
        if is_business_day(current):
            used += 1
            if used == num_classes:
                return current
        current += timedelta(days=1)
    return current
