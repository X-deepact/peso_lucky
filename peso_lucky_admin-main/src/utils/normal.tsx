/**
 * 数字精度转换 k m b转换
 */
function formatNumber(_num: number | string) {
  const num = +_num;
  const units = [
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ] as const;

  for (const unit of units) {
    if (num >= unit.value) {
      const formatted = (num / unit.value).toFixed(1);
      return formatted.endsWith('.0')
        ? formatted.slice(0, -2) + unit.suffix
        : formatted + unit.suffix;
    }
  }

  return num.toString();
}

export { formatNumber };
