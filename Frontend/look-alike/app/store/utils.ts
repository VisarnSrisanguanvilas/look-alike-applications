export const getRiskLevel = (score: number) => {
  if (score >= 4) return { label: "HIGH", textColor: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
  if (score >= 2) return { label: "MEDIUM", textColor: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "LOW", textColor: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
};

export const getOfficialStyles = () => {
  return {
    label: "OFFICIAL",
    textColor: "text-sky-800",
    bg: "bg-sky-100",
    border: "border-sky-300",
    iconColor: "text-sky-600"
  };
};

