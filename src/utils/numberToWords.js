// src/utils/numberToWords.js

// Simple number to words for QAR (supports up to billions)
const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];
const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];
const scales = [
  '', 'Thousand', 'Million', 'Billion'
];

function chunkNumber(n) {
  const chunks = [];
  while (n > 0) {
    chunks.unshift(n % 1000);
    n = Math.floor(n / 1000);
  }
  return chunks;
}

function chunkToWords(chunk) {
  let str = '';
  if (chunk >= 100) {
    str += ones[Math.floor(chunk / 100)] + ' Hundred ';
    chunk %= 100;
  }
  if (chunk >= 20) {
    str += tens[Math.floor(chunk / 10)] + ' ';
    chunk %= 10;
  }
  if (chunk > 0) {
    str += ones[chunk] + ' ';
  }
  return str.trim();
}

export function numberToWords(num) {
  if (typeof num === 'string') num = parseFloat(num.replace(/,/g, ''));
  if (isNaN(num)) return '';
  if (num === 0) return 'Zero Riyals Only';

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  const chunks = chunkNumber(integerPart);
  let words = '';
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i] !== 0) {
      words += chunkToWords(chunks[i]) + ' ' + scales[chunks.length - 1 - i] + ' ';
    }
  }
  words = words.trim() + ' Riyals';

  if (decimalPart > 0) {
    words += ' and ' + chunkToWords(decimalPart) + ' Dirhams';
  } else {
    words += ' Only';
  }
  return words;
}