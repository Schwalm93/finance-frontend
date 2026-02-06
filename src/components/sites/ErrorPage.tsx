import React from "react";

export const ErrorPage: React.FC<{}> = () => {

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "25px"}}>
            <div>
                <img src="/pagenotfound.png" alt="404 - Page not found" />             
            </div>
        </div>
    );
};