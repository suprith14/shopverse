import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Typed versions of the react-redux hooks: use these instead of the plain ones, so
// useAppSelector((state) => state.auth.user) knows the exact type of `state`.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
