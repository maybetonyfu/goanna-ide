let examples:{[key: string]: string } = {}

examples ['Hello world'] = `
message = "hello" + " world"

main = print message`.trim()

examples.simple = `
x :: Int
x = 1.0
`.trim()


examples['ADT example'] =`
data V = X Int | Y Char deriving Show

y :: V
y = X '3'

main = print y
`.trim()

examples['ADT example 2'] = `
data Tree a = Empty | Branch a (Tree a) (Tree a)
leaf x = Branch x Empty Empty

countBranches Empty = 0
countBranches (Branch _ l r) = 1 + l + r
`.trim()

examples[`ADT example 3`] = `
data Shape = Circle Float | Rectangle Float Float

area (Circle r) = pi * r * r
area (Rectangle w h) = w * h

shapes = [Rectangle 2.0, Circle 1.0]`.trim()

examples['Where clause'] = `
test = xs : [4, 5, 6]
       where xs = [1, 2, 3]`.trim()

examples["Type variables"] = `
x :: a -> b -> a
x a b = b
`.trim()

examples['Type variables 2'] = `
seconds :: [(a,b)] -> [b]
seconds xs = map fst xs
`.trim()

examples['Arithmetic'] = `
samples = [3.0, 4.0, 5.0, 6.0]

range xs = length xs

mean xs = sum xs / range xs

sd xs = sqrt (variance xs)

variance xs = map (\\x -> (x - mean xs) ^ 2 / range xs) xs`.trim()

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



examples['List example 1'] = `
applyToAll [] _ = []
applyToAll (x:xs) f = f x : applyToAll f xs
`.trim()

examples['List example 2'] = `
sumEven :: [Int] -> Int
sumEven xs = sum (filter even xs)

integers = filter read ["1", "2", "3", "4"]

sumEvenStringInts :: Int
sumEvenStringInts = sumEven integers`.trim()

examples["List example 3"] = `
getsum [] = 0
getsum [x] = x
getsum (x:xs) = x + getsum xs

check (x:xs)
  | x \`mod\` 3 == 0 || x \`mod\` 5 == 0 = x + check xs
  | otherwise = check xs

y :: [Int]
y = check [1..999]`.trim()

examples['List example 4'] = `
compress = foldr skipDups

skipDups x [] = [x]
skipDups x acc
   | x == head acc = acc
   | otherwise = x : acc

expect = [3,4,5,6]

actual :: [Int]
actual = compress [3,3,4,5,6,6]`.trim()

examples['Type Conversion'] = `
sumEven :: [Int] -> Int
sumEven xs = sum (filter even xs)

stringInts = ["1", "2", "3", "4"]

stringToInt = read

sumEvenStringInts :: Int
sumEvenStringInts = sumEven (map id stringInts)`.trim()

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
sumDistances = distances [1 ,3] [2, 4]`.trim()



examples['Let polymorphism'] = `
-- There is not type error in this example. 
-- The purpose is to show the polymorphic behavior of let-defined names in Goanna,
-- which aligns with GHC's treatment.

x = let y a = a in (y 1, y '2')

main = print x
`.trim()

examples['DropEvery'] = `
divides x y = y \`mod\` x == 0


dropEvery [] _ = []
dropEvery (x:xs) n = dropEvery' (x:xs) n 1

dropEvery' :: [Int] -> Int -> Int -> [Int]
dropEvery' [] _ _ = []
dropEvery' (x:xs) n i =
    let current =
            if n \`divides\` i
                then []
                else [x]
    in current : dropEvery' xs n (i+1)`

examples['Quick sort'] = `
quick :: [Int] -> [Int]
quick []   = []
quick (x:xs)=
 let littlebigs = split xs
 in
   quick (fst littlebigs)
    ++ [x]
    ++  quick (snd littlebigs)
split [] _ result = result
split (x:xs) n (littles, bigs) =
  if x < n
    then split xs n (x:littles, bigs)
    else split xs n (littles, x:bigs)`.trim()


examples['JSON pretty printer'] = `
data JValue = JString String
  | JNumber Float 
  | JBool Bool
  | JNull 
  | JObject [(String, JValue)]
  | JArray  [JValue]

getString :: JValue -> Maybe String 
getString (JString s) = Just s
getString _           = Nothing

getBool :: JValue -> Maybe Bool 
getBool (JBool b) = Just b 
getBool _         = Nothing 

getNumber :: JValue -> Maybe Float
getNumber (JNumber n) = Just n
getNumber _           = Nothing

getObject :: JValue -> Maybe [(String, JValue)]
getObject js = case js of
   JObject xs -> Just xs
   _          -> Nothing 


getArray :: JValue -> Maybe [JValue]
getArray js = case js of
  JArray xs -> Just xs
  _         -> Nothing 

isNull :: JValue -> Bool 
isNull JNull = True
isNull _     = False 

renderJValue :: JValue -> String
renderJValue (JString s)   = show s
renderJValue (JNumber n)   = show n
renderJValue (JBool True)  = "true"
renderJValue (JBool False) = "false"
renderJValue JNull         = "null"

renderJValue (JObject o) = "{" ++ renderPairs o ++ "}"
renderJValue (JArray a) = "[" ++ renderPairs a ++ "]"

renderPair :: (String, JValue) -> String
renderPair (k,v)   = show k ++ ": " ++ renderJValue v

renderPairs [] = ""
renderPairs [p] = renderPair p
renderPairs (p:ps) = renderPair p ++ "," ++ renderPairs ps


renderArrayValues [] = ""
renderArrayValues [v] = renderJValue v
renderArrayValues (v:vs) = renderJValue v ++ "," ++ renderArrayValues vs`.trim()

examples['Expression Interpreter'] = `
data Expr = C Int |
            Comb Expr Expr| 
            V String |
            Let String Expr Expr


eval :: Expr -> [(String, Int)] -> ([(String, Int)], Int)
eval (C x)  env       = (env, x)
eval (Comb e1 e2) env   =  let env1 = fst (eval e1 env)
                               v1 = snd (eval e1 env)
                               env2 = fst (eval e2 env1)
                               v2 = snd (eval e2 env1)
                            in (env2, v1 + v2)

eval (V v)  env       = (env, find v env)
eval (Let v e1 e2) env = let env1 = fst (eval e1 env)
                             v1 = snd (eval e1 env)
                             env2       = extend v v1  
                             ans = eval e2 env2
                         in  ans

find v  []          = undefined
find v1 ((v2,e):es) = if v1 == v2 then e else find v1 es
                     
extend :: String -> Int -> [(String, Int)] -> [(String, Int)]
extend v e env  = (v,e):env

answer :: Expr -> ([(String, Int)], Int)
answer e = eval e []`.trim()

examples['Rock paper scissors'] = `
data Hand = Rock | Paper | Scissors
type Score = (Int, Int)
winsOver :: Hand -> Hand -> Bool
winsOver Rock   Scissors = True
winsOver Paper   Rock     = True
winsOver Scissors Paper    = True
winsOver _    _        = False

computeScore :: Hand -> Hand -> Score
computeScore h1 h2
  | winsOver h1 h2 = (1, 0)
  | winsOver h2 h1 = (0, 1)
  | otherwise        = (0, 0)

combine a b = (fst a + fst b, snd a + snd b)
zip' (a:as) (b:bs) = (a,b) : zip' as bs

pairScore (h1, h2) = computeScore h1 h2

score :: [Hand] -> [Hand] -> Score
score h1 h2 =
    foldl combine (0, 0) (pairScore (zip h1 h2))`.trim()

export default examples