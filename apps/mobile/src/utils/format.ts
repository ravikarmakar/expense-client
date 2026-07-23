/**
 * Formats a raw number string into a premium currency string with Indian formatting (e.g. 2,00,000.00).
 * Returns null if the text is invalid.
 */
export const formatRupees = (text: string): string | null => {
  const cleanText = text.replace(/,/g, '');

  // Validate raw decimal value structure (allow empty, optional single decimal point, up to 2 decimal places, max 7 integer digits)
  if (cleanText === '' || /^\d{0,7}\.?\d{0,2}$/.test(cleanText)) {
    const parts = cleanText.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    let formattedInteger = '';
    if (integerPart) {
      if (integerPart.length <= 3) {
        formattedInteger = integerPart;
      } else {
        const lastThree = integerPart.substring(integerPart.length - 3);
        const otherNumbers = integerPart.substring(0, integerPart.length - 3);
        formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
      }
    }

    let formattedValue = formattedInteger;
    if (cleanText.includes('.')) {
      formattedValue =
        decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : `${formattedInteger}.`;
    }
    return formattedValue;
  }

  return null;
};
