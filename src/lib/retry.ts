async function retry<T>(fn: () => Promise<T>, max: number, delay: number)   {
    let attempt = 0
    while (attempt < max) {
        try {
            return await fn()
        } catch (e) {
            console.log(e)
            // @ts-ignore
            await new Promise(resolve => setTimeout(resolve, delay))
            attempt++
        }
    }
}

export default retry
