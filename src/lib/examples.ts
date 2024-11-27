let examples:{[key: string]: string } = {}
examples.simple = `
x :: Int
x = 1.0
`.trim()


examples['Abstract data types'] =`
data V = X Int | Y Char deriving Show

y :: V
y = X '3'

main = print y
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
sumDistances = distances [1 ,3] [2, 4]`.trim()



examples['Let polymorphism'] = `
x = let y a = a in (y 1, y '2')

main = print x
`.trim()


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
export default examples