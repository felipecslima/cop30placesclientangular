/**
 * REFERENCE
 * https://medium.com/@2muchcoffee/trick-or-unsubscribe-in-rxjs-a-custom-angular-decorator-c10d4afad71c
 *
 * **/

// Decorator Factory
import { Unsubscribable } from 'rxjs';
import 'reflect-metadata';

export function AutoUnsubscribe(params?) {
  return function (target) {
    params = {
      destroyFunc: 'ngOnDestroy',
      ...params,
    };
    const unsubscribableLike: {
      subscriptions: Unsubscribable[];
      unsubscribe: () => void;
    } = {
      subscriptions: [],
      unsubscribe,
    };

    const subscriber: string = Reflect.getMetadata(
      'subscription:name',
      target.prototype,
      'subscriber',
    );

    Object.defineProperty(
      target.prototype,
      subscriber ? subscriber : 'subscriber',
      {
        get: () => unsubscribableLike,
        set: subscription =>
          unsubscribableLike.subscriptions.push(subscription),
      },
    );

    if (typeof target.prototype[params.destroyFunc] !== 'function') {
      throw new Error(
        `${ target.prototype.constructor.name } must implement ${ params.destroyFunc }() lifecycle hook`,
      );
    }

    target.prototype[params.destroyFunc] = ngOnDestroyDecorator(
      target.prototype[params.destroyFunc],
    );

    function ngOnDestroyDecorator(f: any) {
      return function () {
        unsubscribe();
        // eslint-disable-next-line prefer-rest-params
        return f.apply(this, arguments);
      };
    }

    function unsubscribe() {
      do {
        const sub: Unsubscribable = unsubscribableLike.subscriptions.shift();
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      } while (unsubscribableLike.subscriptions.length);
    }

    return target;
  };
}

/**
 * When used, MUST follow pattern
 * .
 * @CombineSubscriptions()
 * private subscriptions: Unsubscribable;
 * .
 * @constructor
 */
export function CombineSubscriptions() {
  return function (target: any, propertyKey: 'subscriptions') {
    Reflect.defineMetadata(
      'subscription:name',
      propertyKey,
      target,
      'subscriber',
    );
  };
}
