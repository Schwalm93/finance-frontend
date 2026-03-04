import React from "react";
import CryptoPrices from "../crypto/CryptoPrices";
import "./css/SiteLayout.css";

export const LandingPage: React.FC = () => {
    return (
        <div className="page-shell">
            <section className="page-grid page-grid--two">
                <article className="page-card">
                    <div className="page-card__header">
                        <h2>Kryptowährungen</h2>
                        <p>
                            Aktuelle BTC- und ETH-Werte mit Verlaufsansicht direkt im Startbereich.
                        </p>
                    </div>
                    <div className="page-card__body">
                        <CryptoPrices />
                    </div>
                </article>

                <aside className="page-card">
                    <div className="page-card__header">
                        <h3>Schneller Einstieg</h3>
                        <p>Nutze die Navigation oben für die wichtigsten Arbeitsbereiche.</p>
                    </div>
                    <div className="page-card__body">
                        <p className="page-note">
                            Transaktionen lassen sich direkt hochladen, Kategorien im Modal pflegen
                            und Vermögenswerte in einer separaten Übersicht organisieren.
                        </p>
                    </div>
                </aside>
            </section>
        </div>
    );
};
