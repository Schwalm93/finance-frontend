import React from "react";
import CryptoPrices from "../crypto/CryptoPrices";

export const LandingPage: React.FC<{}> = () => {

    return (
        <>
            <div style={{ display: "flex", justifyContent: "center", padding: "25px" }}>
                <div>
                    <h1>Willkommen</h1>
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start", padding: "45px", height: "100vh" }}>
                <div style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <h3>Kryptowährungen</h3>
                    <CryptoPrices />
                </div>
                <div style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h1></h1>
                </div>
            </div>
        </>
    );
};