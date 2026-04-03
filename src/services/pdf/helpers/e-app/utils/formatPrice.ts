export const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return '0.00';
  return price.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
