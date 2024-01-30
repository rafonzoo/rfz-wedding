type Infer<T extends Zod.ZodType> = Zod.infer<T>

type Param<T = {}, S = {}> = { params: T & { locale: string }; searchParams: S }

type Page<T = {}> = React.FC<T & Param>

type State<T> = [T, React.Dispatch<React.SetStateAction<T>>]

type Ref<T> = React.MutableRefObject<T>

type Nullable<T> = T | null

type Nullish<T> = Nullable<T | undefined>

type IElement<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>

type Child<T = {}> = T & { children?: React.ReactNode }

type Tag<T extends React.ElementType> = IElement<T>

type RFC<T = {}> = React.FC<{ className?: string } & T>

type RFZ<T = {}> = React.FC<React.PropsWithChildren<T>>

type RF<T = {}> = React.FC<T>
