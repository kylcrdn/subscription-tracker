import { useMemo } from "react";

export function useSubscriptionStats(subscriptions) {
  const { totalMonthly, totalYearly } = useMemo(() => {
    const monthly = subscriptions.reduce((sum, sub) => {
      if (sub.billing === "Monthly") return sum + sub.price;
      if (sub.billing === "Yearly") return sum + sub.price / 12;
      return sum;
    }, 0);

    const yearly = subscriptions.reduce((sum, sub) => {
      if (sub.billing === "Monthly") return sum + sub.price * 12;
      if (sub.billing === "Yearly") return sum + sub.price;
      return sum;
    }, 0);

    return { totalMonthly: monthly, totalYearly: yearly };
  }, [subscriptions]);

  const categoryData = useMemo(() => {
    const categoryMap = {};
    subscriptions.forEach((sub) => {
      const category = sub.category?.trim() || "Uncategorized";
      const monthlyCost = sub.billing === "Yearly" ? sub.price / 12 : sub.price;
      categoryMap[category] = (categoryMap[category] || 0) + monthlyCost;
    });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [subscriptions]);

  const monthlyExpensesData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const subInfo = subscriptions.map((sub) => {
      const start = new Date(sub.dueDate);
      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      const activeFrom =
        startYear < currentYear ? 0 : startYear === currentYear ? startMonth : 12;
      return { price: sub.price, billing: sub.billing, activeFrom };
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
