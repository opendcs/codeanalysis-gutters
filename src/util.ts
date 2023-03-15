

/**
 * Filter for Array.prototype.filter to get unique elements
 * @param item 
 * @param index 
 * @param arr 
 * @returns 
 */
export function unique<T>(item: T,index: number, arr: Array<T>): boolean {
    return arr.indexOf(item) !== index;
}