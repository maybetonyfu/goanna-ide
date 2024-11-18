let examples:{[key: string]: string } = {}
examples.simple = `
x :: Int
x = 1.0
`.trim()


examples['Abstract data types'] =`
data V = X Int | Y Char

y :: V
y = X '3'
`.trim()


examples['Let expression'] = `
x :: Char
x = let y = 1 in let z = y in let w = z in w
`.trim()


examples["Multiple Errors"] = `
x :: Int
x = 1.0

y :: Float
y = 3 + 2

z = if True then 1 else '2'

`.trim()


examples["Applicative"] = `
x = (+) <$> [1,2,3,4] <*> ['1', '2', '3']

y :: Functor f => f Bool
y = pure True
`.trim()

examples["Monad"] = `
x :: [Char]
x = do
   n <- [1..10]
   return n
`.trim()

examples["List comprehension"] = `
x = [x + y | x <- [1..3], y <- ['1'..'4']]
`.trim()

export default examples