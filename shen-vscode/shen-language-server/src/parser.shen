(package parser
(define alphalower?
    C -> (and (<= C "z") (>= C "a"))
)
(define alphaupper?
    C -> (and (<= C "Z") (>= C "A"))
)
(define alpha?
    C -> (or
        (alphalower? C)
        (alphaupper? C)
    )
)
(define numeral?
    C -> (and (<= C "9") (>= C "0"))
)
(define wordsymbol?
    ":" -> true
    _ -> false
)
(define wordheadchar?
    C -> (or (alpha? C) (wordsymbol? C))
)
(define wordtailchar?
    C -> (or (wordheadchar? C) (numeral? C))
)
(define tokenizeUntil
    TermId Term Content (@s Term S) -> [Content TermId | (tokenize S)]
    TermId Term Content
)
(define tokenize
    (@s " " S) -> (tokenize S)
    (@s "c#10;" S) -> (tokenize S)
    (@s "\\" S) -> [lineCommentTerm | (tokenizeUntil "c#10;" S)]
    (@s "\*" S) -> [multiComentTerm | ]
    (@s )
)
(define parseFile
    (@s " " S) -> (parseFile S)
    (@s "\\" S) -> (let
        Comment (parseLineComment S)
    (@s "(" S) -> 
)
)
