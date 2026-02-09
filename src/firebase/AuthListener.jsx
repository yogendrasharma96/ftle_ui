import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useDispatch } from "react-redux";
import { setUser, logout } from "../slice/authSlice";
import { useEffect } from "react";

export default function AuthListener({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(logout());
        return;
      }
  
      const tokenResult = await firebaseUser.getIdTokenResult();
      const role = tokenResult.claims.role || "USER";
  
      dispatch(
        setUser({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photo: firebaseUser.photoURL,
          },
          role,
        })
      );
    });
  
    return () => unsub();
  }, [dispatch]);
  
  return children;
}