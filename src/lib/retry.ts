async function retry<T>(fn: () => Promise<T>, max: number, delay: number)   {
    let attempt = 0
    let response = null
    while (attempt < max) {
        try {
            response = await fn()
        } catch (e) {
            console.log(e)
            // @ts-ignore
            await new Promise(resolve => setTimeout(resolve, delay))
            attempt++
        }
    }
    if (response === null) {
        throw new Error("Failed to fetch")
    }
    return response
}

export default retry
