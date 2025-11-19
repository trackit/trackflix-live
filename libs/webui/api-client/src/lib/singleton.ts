import { useRef } from 'react';

export function singletonFactory<T>(config: InjectableFactoryConfig<T>) {
  let overridden: T | undefined;
  let _instance: T | undefined;

  const get = () => {
    if (overridden !== undefined) {
      return overridden;
    }

    if (_instance !== undefined) {
      return _instance;
    }

    _instance = config.factory();
    return _instance;
  };

  const reset = () => {
    overridden = undefined;
  };

  const override = <OVERRIDE extends T>(instance: OVERRIDE): OVERRIDE => {
    if (overridden !== undefined && !Object.is(overridden, instance)) {
      throw new Error('Cannot re-override singleton');
    }
    overridden = instance;
    return instance;
  };

  const useOverride = <OVERRIDE extends T>(instance: OVERRIDE): OVERRIDE => {
    const repoInstance = useRef(instance);
    return override(repoInstance.current);
  };

  return {
    get,
    reset,
    override,
    useOverride,
  };
}

interface InjectableFactoryConfig<T> {
  factory: () => T;
}
