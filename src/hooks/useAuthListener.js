import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "../app/reducers/authSlice";

const useAuthListener = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getCurrentUser());
    }, [dispatch]);
};

export default useAuthListener;