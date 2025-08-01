// Iterator utilities for schedule calculation
export function createCyclicIterator<T>(items: T[]) {
  return (function* () {
    let index = 0;
    while (true) {
      yield items[index % items.length];
      index++;
    }
  })();
}

export function createDateIterator(startDate: Date) {
  return (function* () {
    let currentDate = new Date(startDate);
    while (true) {
      yield new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  })();
}