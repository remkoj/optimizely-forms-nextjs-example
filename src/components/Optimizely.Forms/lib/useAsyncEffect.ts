import { useEffect, type EffectCallback, type DependencyList } from 'react'

export type AsyncEffectCallback = (
    /**
     * An abort signal that may be provided to supporting async operations
     * to cancel when aborted. Use the "aborted" flag inside this signal to
     * prevent further execution after async operations that cannot be 
     * aborted.
     */
    abortSignal: AbortSignal
) => ReturnType<EffectCallback>

/**
 * Accepts a function that contains imperative, possibly effectful code. Provides
 * an AbortSignal to the effectful code to correctly abort async operations.
 * 
 * @param effectCallback    Imperative function that can return a cleanup function
 * @param deps              If present, effect will only activate if the values in the list change.              
 */
export function useAsyncEffect(effectCallback: AsyncEffectCallback, deps: DependencyList) {
    useEffect(() => {
        const abortController = new AbortController();
        const cleanup = effectCallback(abortController.signal);
        return () => {
            abortController.abort();
            if (typeof cleanup == 'function')
                cleanup();
        }
    }, deps)
}

export default useAsyncEffect