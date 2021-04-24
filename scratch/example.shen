(define abc X -> X)

(
define
def
1
->
1
)

(synonyms id symbol)
(synonyms test symbol --> list --> boolean)

(datatype case
    _______________________________
    Id : id; Test : test; Value : symbol; Next : case;
    _______________________________
    (@p Id Test [(@p Value Nest) | Next])) : case;)

(define getvalue
    Key [] -> (fail)
    Key [(@p Key Value) | _] -> Value
    Key [(@p _ _) | Next] -> (getvalue Key Next)
    Key [Obj | _] <- (getvalue Key Obj)
    Key [_ | Parent] -> (getvalue Key Parent))

(define renderCase
    [] State -> []
    [(@p Id Test Nest) | Next] State -> (if (Test State) (Nest State) (renderCase Next State)))
