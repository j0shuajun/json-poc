// Lomuto partition: last element as pivot, values <= pivot moved to its left.
function partition(arr, low, high) {
  const pivot = arr[high];
  let boundary = low - 1;

  for (let i = low; i < high; i++) {
    if (arr[i] <= pivot) {
      boundary++;
      [arr[boundary], arr[i]] = [arr[i], arr[boundary]];
    }
  }

  [arr[boundary + 1], arr[high]] = [arr[high], arr[boundary + 1]];
  return boundary + 1;
}

function quicksort(arr, low, high) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    quicksort(arr, low, pivotIndex - 1);
    quicksort(arr, pivotIndex + 1, high);
  }
}

export function sortArray(array) {
  const copy = [...array];
  quicksort(copy, 0, copy.length - 1);
  return copy;
}
