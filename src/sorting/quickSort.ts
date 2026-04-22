function quickSort<T>(arr: T[]): T[] {
  if (arr.length <= 1) {
    return [...arr];
  }

  const result = [...arr];
  sort(result, 0, result.length - 1);
  return result;
}

function sort<T>(arr: T[], low: number, high: number): void {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    sort(arr, low, pivotIndex - 1);
    sort(arr, pivotIndex + 1, high);
  }
}

function partition<T>(arr: T[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

export default quickSort;
