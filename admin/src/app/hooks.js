// import = bring in code from another file or package
// useDispatch = gives dispatch() to send actions from a component
// useSelector = read a value from the Redux store; redraws when it changes
import { useDispatch, useSelector } from 'react-redux';

// Typed versions of the react-redux hooks: use these instead of the plain ones, so
// useAppSelector((state) => state.auth.user) knows the exact type of `state`.
// export = other files can import this
// const = a name for a value that is never reassigned
// useAppDispatch = our useDispatch (app/hooks.js)
// useDispatch = gives dispatch() to send actions from a component
export const useAppDispatch = useDispatch.withTypes();
// export = other files can import this
// const = a name for a value that is never reassigned
// useAppSelector = our useSelector (app/hooks.js)
// useSelector = read a value from the Redux store; redraws when it changes
export const useAppSelector = useSelector.withTypes();
