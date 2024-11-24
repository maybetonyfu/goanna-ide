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

examples["Type variables"] = `
x :: a -> b -> a
x a b = b
`.trim()

examples['Let expression'] = `
x :: Char
x = let y = 1 in let z = y in let w = z in w
`.trim()

examples['Case expression'] = `
parsingStringFlat flag =
  case flag of
        "True" -> 1
        False -> 2
        "True1" -> 3
        "False2" -> 4
        _ -> 0
        `.trim()

examples["Multiple Errors"] = `
x :: Int
x = 1.0

y :: Float
y = 3 + 2

z = if True then 1 else '2'

`.trim()


examples['List 1'] = `
applyToAll [] _ = []
applyToAll (x:xs) f = f x : applyToAll f xs
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

examples["Function composition"] = `
x = (=="10") . length .  map (+1) $ [1..10]
`.trim()


examples["ZipWith"] = `
distance x y = (x + y) * (x - y)

distances xs ys = zipWith distance xs ys

sumDistances :: Int
sumDistances = distances [1 ,3] [2, 4]`


export default examples