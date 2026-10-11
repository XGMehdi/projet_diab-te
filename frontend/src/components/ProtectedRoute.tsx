import { Navigate } from "react-router-dom";

interface Props {

    children: React.ReactNode;
}

export default function ProtectedRoute({

    children,

}: Props) {

    /*
    ====================================
    CHECK TOKEN
    ====================================
    */

    const token =
        localStorage.getItem("token");

    /*
    ====================================
    NOT AUTHENTICATED
    ====================================
    */

    if (!token) {

        return <Navigate to="/login" />;
    }

    /*
    ====================================
    AUTHORIZED
    ====================================
    */

    return children;
}