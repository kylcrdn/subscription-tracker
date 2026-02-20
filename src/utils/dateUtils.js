export const TIMEZONE = "Europe/Madrid";

/** Converts a Date to midnight in Europe/Madrid, avoiding UTC offset issues. */
export function getSpainDate(date = new Date()) {
  const spainDateStr = date.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
  const [year, month, day] = spainDateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculate the next renewal date for a subscription (timezone-aware).
 * @param {string} dueDate - The subscription start date
 * @param {string} billing - "Monthly" or "Yearly"
 * @returns {Date} The next renewal date
 */
export function calculateNextRenewal(dueDate, billing) {
  const today = getSpainDate();
  const startDate = getSpainDate(new Date(dueDate));
  let nextRenewal = new Date(startDate);

  if (billing === "Monthly") {
    nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    while (nextRenewal <= today) {
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
    }
  } else if (billing === "Yearly") {
    nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    while (nextRenewal <= today) {
      nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
    }
  }

  return nextRenewal;
}
