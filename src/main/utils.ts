// src/main/utils.ts

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined;

  return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}