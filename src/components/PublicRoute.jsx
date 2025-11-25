import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { HashLoader } from "react-spinners";

const PublicRoute = ({ children }) => {
    const { user, isAuthChecking } = useSelector((state) => state.auth);

    if (isAuthChecking) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <HashLoader color="#4F46E5" size={50} />
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;