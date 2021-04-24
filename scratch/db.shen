(package ext [shen.dict shen.<-dict shen.>-dict]
(define db
    -> (shen.dict 1000))
(define <-db
    Db Id -> (shen.<-dict Db Id))
(define db->
    Db Id Value -> (shen.dict-> Db Id Value))
(define db.loadDefault
    Db -> (do
        (db-> Db textGetters [schema [oneOf [cons [id textGetters]] [cons []]]])
        (db-> Db text [schema [oneOf [string [cons [string textGetters]]]]])
        (db-> Db componentDom [schema [properties [tag string attributes [propertyMap text] children [arrayOf component]]]])
        (db-> Db componentInstance [schema [instance componentClass]])
        (db-> Db component [schema [oneOf [componentDom text]]])
        (db-> Db componentClass [schema [properties [schema schema component component]]])
        Db
    ))
(define db.loadComponents
    Db -> (do
        (db-> Db confirm-dialog [componentClass [
            schema
            [properties [body component buttonOk component buttonCancel component]]
            component
            [tag "div" children [
                [tag "div" children [
                    \\ body
                    [tag "div" children [
                        [tag "div" children [
                            [parameter body]
                        ]]
                    ]]
                    \\ buttons
                    [tag "div" children [
                        [parameter buttonOk]
                        [parameter buttonCancel]
                    ]]
                ]]
            ]]
        ]])
        Db
    ))
(define transformProperties
    _ [] _ _ -> []
    Db [Key Schema | Next] Value State -> (if (hasProp Key Value)
        [Key (transform Db Schema (getProp Key Value) State) | (transformProperties Db Next Value State)]
        (transformProperties Db Next Value State)
    )
)
(define transformOneOf
    _ [] _ _ -> []
    Db [Schema | Next] Value State -> (if (check Db Schema Value)
        (transform Db Schema Value State)
        (transformOneOf Db Next Value State)
    )
)
(define transformCons
    _ [] [_ | _] _ -> (fail)
    _ [] [] _ -> []
    Db [Schema | Next] [Item | NextItem] State -> [(transform Db Schema Item State) | (transformCons Db Next NextItem State)]
    Db Id Value State -> (if (symbol? Id)
        (transformCons Db (<-db Db Id) Value State)
        (fail)
    )
)
(define transformElements
    _ _ [] _ -> []
    Db Element [Item | Next] State -> [(transform Db Element Item State) | (transformElements Db Element Next State)]
)
(define transformSchema
    Db [] Value State -> Value
    Db [properties Schema | Next] Value State -> (transformSchema Db Next (js.obj (transformProperties Db Schema Value State)) State)
    Db [oneOf Schema | Next] Value State -> (transformSchema Db Next (transformOneOf Db Schema Value State) State)
    Db [cons Schema | Next] Value State -> (transformSchema Db Next (toArray (transformCons Db Schema Value State)) State)
    Db [elements Schema | Next] Value State -> (transformSchema Db Next (toArray (transformElements Db Schema Value State)) State)
)
(define transformComponent
    Props -> ...
)
(define transformCase
    Db [] State -> []
    Db [CaseTest Result | Next] State -> (if (transformTest Db CaseTest State) (transform Db Result State) (transformCase Db Next State))
)
(define transform
    Db [Schema Value] State -> (transformSchema Db Schema Value State)
    Db Value State -> (if (symbol? Value) (transform Db (<-db Db Value) State) (fail))
    Db component Value State -> (transformComponent (transform Db (<-db Db component) Value State))
    Db case Case State -> (transformCase Db (<-db Db Case) State)
    Db [Type Schema | Next] Value State -> (transformSchema Db Type (<-db Db Schema) (<-db Db Value) State)
    Db Schema Value State -> (if (symbol? Schema)
        (transform Db (<-db Db Schema) Value State)
        (fail)
    )
)
(define hasProp
    Key [] -> false
    Key [Key _ | _] -> true
    Key [_ _ | Next] -> (hasProp Key Next)
)
(define getProp
    Key [] -> (fail)
    Key [Key Value | _] -> Value
    Key [_ _ | Next] -> (getProp Key Next)
)
(define getPropOr
    Key [] Default -> Default
    Key [Key Value | _] _ -> Value
    Key [_ _ | Next] Default -> (getPropOr Key Next Default)
)
(define checkProperties
    _ [] _ -> true
    Db [Key Schema | Next] Props -> (and
        (if (hasProp Key Props) (check Db Schema (getProp Key Props)) true)
        (checkProperties Db Next Props)
    )
)
(define checkOneOf
    _ [] _ -> (fail)
    Db [Schema | _] Value <- (check Db Schema Value)
    Db [_ | Next] Value -> (checkOneOf Db Next Value)
)
(define checkCons
    _ [] _ -> true
    Db [Schema | Next] [Value | NextValue] -> (and
        (check Db Schema Value)
        (checkCons Db Next NextValue)
    )
)
(define checkElements
    _ _ [] -> true
    Db Schema [Value | Next] -> (and
        (check Db Schema Value)
        (checkElements Db Schema Next)
    )
)
(define checkSchema
    Db properties Props Value -> (checkProperties Db Props Value)
    Db oneOf OneOf Value -> (checkOneOf Db OneOf Value)
    Db cons Cons Value -> (checkCons Db Cons Value)
    Db elements Element Value -> (checkElements Db Element Value)
)
(define check
    _ id Value -> (symbol? Value)
    _ string Value -> (string? Value)
    _ [] _ -> true
    Db [Type Schema | Next] Value -> (and
        (checkSchema Db Type Schema Value)
        (check Db Next Value)
    )
    Db Schema Value -> (check Db (<-db Db Schema) Value)
)
)
