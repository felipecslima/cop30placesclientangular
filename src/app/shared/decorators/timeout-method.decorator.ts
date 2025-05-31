// Decorator Factory
export function Timeout(ms: number): MethodDecorator {
  // Decorator Function
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    // override original method
    descriptor.value = function (...args: any[]): void {
      setTimeout(() => {
        originalMethod.apply(this, args);
      }, ms);
    };

    return descriptor;
  };
}
