/**
 * Make only the specified properties optional, while leaving the other 
 * properties untouched.
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>

/**
 * Construct a new object by copying over all but the selected properties
 * from the source object
 * 
 * @param from      The source object
 * @param props     The properties to skip while copying into the new object
 * @returns         The newly constructued object
 */
export function omit<T, K extends (keyof T)[]>(from: T, props: K) : Omit<T,K[number]>
{
    const fromProps = Object.getOwnPropertyNames(from) as (keyof T)[]
    return fromProps.reduce((v, k) => {
        if (!props.includes(k))
            v[k as keyof Omit<T,K[number]>] = from[k] as Omit<T,K[number]>[keyof Omit<T,K[number]>]
        return v
    }, {} as Omit<T,K[number]>)
}

/**
 * Construct a new object by copying over the selected properties from
 * the source object
 * 
 * @param from      The source object
 * @param props     The properties to copy into the new object
 * @returns         The newly constructued object
 */
export function pick<T, K extends (keyof T)[]>(from: T, props: K) : Pick<T,K[number]>
{
    const fromProps = Object.getOwnPropertyNames(from) as (keyof T)[]
    return fromProps.reduce((v, k) => {
        if (props.includes(k))
            v[k as keyof Pick<T,K[number]>] = from[k] as Pick<T,K[number]>[keyof Pick<T,K[number]>]
        return v
    }, {} as Pick<T,K[number]>)
}