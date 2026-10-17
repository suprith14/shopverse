import { useDispatch, useSelector } from 'react-redux';

// Typed versions of the react-redux hooks: use these instead of the plain ones, so
// useAppSelector((state) => state.auth.user) knows the exact type of `state`.
export const useAppDispatch = useDispatch.withTypes();
export const useAppSelector = useSelector.withTypes();
