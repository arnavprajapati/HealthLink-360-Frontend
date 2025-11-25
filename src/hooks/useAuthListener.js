import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig"; 
import { setUser, setAuthChecking } from "../app/reducers/authSlice";

const useAuthListener = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setAuthChecking(true));

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                }));
            } else {
                dispatch(setUser(null));
            }
            dispatch(setAuthChecking(false));
        });

        return () => unsubscribe();
    }, [dispatch]);
};

export default useAuthListener;