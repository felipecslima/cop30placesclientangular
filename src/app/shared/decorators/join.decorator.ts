// Decorator Factory
export function Join(aggregator: string = '/'): PropertyDecorator {
  // Decorator Function
  return (target: any, propertyName: string) => {
    let value = target[propertyName];

    const getter = () => {
      if (Array.isArray(value)) {
        return value.join(aggregator) ?? '';
      }
      return value;
    };

    const setter = newValue => {
      value = newValue;
    };

    // override property definition
    Object.defineProperty(target, propertyName, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}
