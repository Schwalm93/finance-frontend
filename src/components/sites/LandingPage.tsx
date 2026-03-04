import React from "react";
import CryptoPrices from "../crypto/CryptoPrices";
import "./css/SiteLayout.css";

export const LandingPage: React.FC<{}> = () => {
    return (
        <div className="page-shell">
            <section className="page-hero">
                <span className="page-hero__eyebrow">Dashboard</span>
                <h1>Willkommen bei GoFinance</h1>
                <p>
                    Verwalte Transaktionen, Vermögen und Marktindikatoren in einer
                    klaren Oberfläche mit derselben visuellen Sprache wie in den neuen Modals.
                </p>
            </section>

            <section className="page-stat-grid">
                <article className="page-stat">
                    <span>Fokus</span>
                    <strong>Transaktionen</strong>
                </article>
                <article className="page-stat">
                    <span>Bereich</span>
                    <strong>Vermögen</strong>
                </article>
                <article className="page-stat">
                    <span>Live Daten</span>
                    <strong>Krypto Preise</strong>
                </article>
            </section>

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
