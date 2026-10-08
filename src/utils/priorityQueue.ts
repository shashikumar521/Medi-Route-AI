/**
 * Generic Min-Heap Priority Queue for Uniform Cost Search
 * Always pops the element with the lowest priority value (cumulative path cost).
 */
export class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  constructor() {}

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): { item: T; priority: number } | undefined {
    if (this.isEmpty()) return undefined;
    const min = this.heap[0];
    const end = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return min;
  }

  peek(): { item: T; priority: number } | undefined {
    return this.heap[0];
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  getSnapshot(): { item: T; priority: number }[] {
    return [...this.heap].sort((a, b) => a.priority - b.priority);
  }

  private bubbleUp(index: number): void {
    const element = this.heap[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];
      if (element.priority >= parent.priority) break;
      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let swapIndex: number | null = null;

      if (leftChildIndex < length) {
        if (this.heap[leftChildIndex].priority < element.priority) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        const compareIndex = swapIndex === null ? index : swapIndex;
        if (this.heap[rightChildIndex].priority < this.heap[compareIndex].priority) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === null) break;
      this.heap[index] = this.heap[swapIndex];
      this.heap[swapIndex] = element;
      index = swapIndex;
    }
  }
}
