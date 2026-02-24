/**
 * Hook for computing dashboard statistics from the raw subscriptions array.
 * All calculations are memoized and recalculate only when subscriptions change.
 *
 * Returns:
 *  - totalMonthly  — combined monthly cost (yearly subs are divided by 12)
 *  - totalYearly   — combined yearly cost (monthly subs are multiplied by 12)
 *  - categoryData  — array of { name, value } for the pie chart (monthly cost per category)
 *  - monthlyExpensesData — array of { month, total } for the bar/line chart (Jan–Dec of current year)
 */
import { useMemo } from "react";

export function useSubscriptionStats(subscriptions) {
  // Normalize all prices to a common period so they can be summed together.
  // Monthly view: yearly subs contribute price/12.  Yearly view: monthly subs contribute price*12.
  const { totalMonthly, totalYearly } = useMemo(() => {
    const monthly = subscriptions.reduce((sum, sub) => {
      const price = parseFloat(sub.price) || 0;
      if (sub.billing === "Monthly") return sum + price;
      if (sub.billing === "Yearly") return sum + price / 12;
      return sum;
    }, 0);

    const yearly = subscriptions.reduce((sum, sub) => {
      const price = parseFloat(sub.price) || 0;
      if (sub.billing === "Monthly") return sum + price * 12;
      if (sub.billing === "Yearly") return sum + price;
      return sum;
    }, 0);

    return { totalMonthly: monthly, totalYearly: yearly };
  }, [subscriptions]);

  // Group subscriptions by category and sum their normalized monthly cost.
  // Used by CategoryPieChartModal.
  const categoryData = useMemo(() => {
    const categoryMap = {};
    subscriptions.forEach((sub) => {
      const category = sub.category?.trim() || "Uncategorized";
      const price = parseFloat(sub.price) || 0;
      const monthlyCost = sub.billing === "Yearly" ? price / 12 : price;
      categoryMap[category] = (categoryMap[category] || 0) + monthlyCost;
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  // Build a 12-element array (Jan–Dec) showing total monthly expenses for the current year.
  // Each subscription only counts from the month it became active onward.
  // Used by MonthlyExpensesChartModal for the trend line.
  const monthlyExpensesData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const subInfo = subscriptions.map((sub) => {
      const start = new Date(sub.dueDate);
      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      // Determine from which month (0-11) this subscription is active in the current year
      const activeFrom =
        startYear < currentYear ? 0 : startYear === currentYear ? startMonth : 12;
      return { price: parseFloat(sub.price) || 0, billing: sub.billing, activeFrom };
    });
    return Array.from({ length: 12 }, (_, month) => ({
      month,
      total: subInfo.reduce((sum, sub) => {
        if (month < sub.activeFrom) return sum;
        if (sub.billing === "Monthly") return sum + sub.price;
        if (sub.billing === "Yearly") return sum + sub.price / 12;
        return sum;
      }, 0),
    }));
  }, [subscriptions]);

  return { totalMonthly, totalYearly, categoryData, monthlyExpensesData };
}
