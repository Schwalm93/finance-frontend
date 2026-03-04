import React from "react";
import "./css/SiteLayout.css";

export const ErrorPage: React.FC = () => {

    return (
        <div className="page-shell">
            <section className="page-hero">
                <span className="page-hero__eyebrow">Fehler</span>
                <h1>Seite nicht gefunden</h1>
                <p>Der angeforderte Bereich existiert nicht oder ist aktuell nicht verfügbar.</p>
            </section>

            <section className="page-card">
                <div className="page-card__body d-flex justify-content-center">
                    <img src="/pagenotfound.png" alt="404 - Page not found" />
                </div>
            </section>
        </div>
    );
};
