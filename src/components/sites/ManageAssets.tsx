import React, { useState, useEffect, useMemo } from "react";
import { Pie } from 'react-chartjs-2';
import Modal from 'react-modal';

import { asset, assetDetails, chartData } from '../../models/asset';
import { colorPalette } from '../../constants/colors';
import { API_ENDPOINTS } from "../../api/apiConfig";
import '../popups/ModalTheme.css';
import './css/SiteLayout.css';
import './css/ManageAssets.css';

const ManageAssets: React.FC = () => {
    const [chartData, setChartData] = useState<chartData>({
        labels: [],
        datasets: [],
    });
    const [assetDetails, setAssetDetails] = useState<assetDetails>({});
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
    const tagNames = Object.keys(assetDetails);
    const today = new Date().toISOString().split('T')[0]; // Erhält das heutige Datum im Format YYYY-MM-DD

    // Formularfelder für das Hinzufügen von Assets
    const [assetName, setAssetName] = useState('');
    const [assetValue, setAssetValue] = useState('');
    const [assetPurchaseDate, setAssetPurchaseDate] = useState(today);
    const [assetTag, setAssetTag] = useState('');

    useEffect(() => {
        fetchAssets();
    }, []);

    const totalSum = useMemo(() => {
        return Object.values(assetDetails).reduce((sum, { totalValue }) => sum + totalValue, 0);
    }, [assetDetails]);

    const fetchAssets = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.getAllAssets);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            processData(data);
        } catch (error) {
            console.error("Es gab ein Problem beim Abrufen der Assets: ", error);
        }
    };

    const handleRemoveSelected = async () => {
        try {
            await Promise.all(selectedForDeletion.map(name =>
                fetch(`${API_ENDPOINTS.deleteAsset}?name=${encodeURIComponent(name)}`, {
                    method: 'DELETE',
                    mode: 'cors',
                })
            ));
            console.log('Erfolgreich entfernt');
            // Zustand der Asset-Liste aktualisieren oder Benutzerfeedback geben
            // Möglicherweise die Asset-Liste erneut abrufen, um die UI zu aktualisieren
            fetchAssets();
        } catch (error) {
            console.error("Fehler beim Entfernen: ", error);
        }
        setSelectedForDeletion([]); // Zurücksetzen der Auswahl nach dem Entfernen
    };



    const handleSubmit = async () => {
        // URL-Parameter vorbereiten
        const params = new URLSearchParams({
            name: assetName,
            value: assetValue,
            purchaseDate: assetPurchaseDate,
            tagName: assetTag,
        });

        try {
            const response = await fetch(`${API_ENDPOINTS.addAsset}?${params}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Asset erfolgreich hinzugefügt:', data);
            // Reset der Eingabefelder nach erfolgreichem Hinzufügen
            setAssetName('');
            setAssetValue('');
            setAssetPurchaseDate(today);
            setAssetTag('');
            await fetchAssets();
        } catch (error) {
            console.error("Es gab ein Problem beim Hinzufügen des Assets: ", error);
        }
    };



    const generateUniqueColors = (count: number, palette: string[]): string[] => {
        let colors: string[] = [];
        for (let i = 0; i < count; i++) {
            colors.push(palette[i % palette.length]);
        }
        return colors;
    };

    const processData = (assets: asset[]) => {
        const groupedAssets = assets.reduce((acc: assetDetails, asset: asset) => {
            const tag = asset.assetTag.tagName;
            if (!acc[tag]) {
                acc[tag] = { totalValue: 0, details: [], subTypes: asset.assetTag.subTypes };
            }
            acc[tag].totalValue += asset.value;
            acc[tag].details.push({ name: asset.name, value: asset.value });
            return acc;
        }, {});

        const labels = Object.keys(groupedAssets);
        const data = labels.map(label => groupedAssets[label].totalValue);
        const colors = generateUniqueColors(labels.length, colorPalette); // Verwenden Sie hier die generierten einzigartigen Farben

        const newChartData: chartData = {
            labels,
            datasets: [{
                label: 'Asset Wert nach Tag',
                data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
            }],
        };

        setChartData(newChartData);
        setAssetDetails(groupedAssets);
    };

    const tooltipOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const label = context.chart.data.labels[context.dataIndex];
                        const assetInfo = assetDetails[label];
                        const detailsText = assetInfo.details.map(d => `${d.name} ${d.value}`).join(", ");
                        return `${label}: [${detailsText}]`;
                    }
                }
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="page-shell manage-assets">
            <section className="page-hero">
                <span className="page-hero__eyebrow">Vermögen</span>
                <h1>Assets strukturiert verwalten</h1>
                <p>
                    Verfolge die Verteilung deiner Vermögenswerte, prüfe Kategorien und öffne
                    die Bearbeitung in einem durchgängigen Interface.
                </p>
            </section>

            <section className="page-grid page-grid--two">
                <article className="page-card">
                    <div className="page-card__header">
                        <h2>Aufteilung der Vermögenswerte</h2>
                        <p>Die Chartansicht zeigt die Summen pro Tag und unterstützt die Detailprüfung.</p>
                    </div>
                    <div className="page-card__body">
                        <div className="chart-container">
                            <div className="piechart-container">{chartData.datasets.length > 0 ? <Pie data={chartData} options={tooltipOptions} /> : <p>Loading...</p>} </div>
                        </div>
                    </div>
                </article>

                <aside className="page-card">
                    <div className="page-card__header">
                        <h3>Kurzübersicht</h3>
                        <p>Wichtige Kennzahlen auf einen Blick.</p>
                    </div>
                    <div className="page-card__body">
                        <div className="page-stat-grid">
                            <article className="page-stat">
                                <span>Kategorien</span>
                                <strong>{tagNames.length}</strong>
                            </article>
                            <article className="page-stat">
                                <span>Assets</span>
                                <strong>{Object.values(assetDetails).reduce((sum, entry) => sum + entry.details.length, 0)}</strong>
                            </article>
                            <article className="page-stat">
                                <span>Gesamt</span>
                                <strong>{totalSum}€</strong>
                            </article>
                        </div>
                        <div className="button-container">
                            <button className="btn btn-secondary m-2 btn-uniform" onClick={() => setIsDeleteModalOpen(true)}>Bearbeiten</button>
                        </div>
                    </div>
                </aside>
            </section>

            <section className="page-card">
                <div className="page-card__header">
                    <h2>Asset-Liste</h2>
                    <p>Alle Vermögenswerte mit Wert und Kategorie in einer zentralen Tabelle.</p>
                </div>
                <div className="page-card__body">
                    <div className="table-wrapper-on-site">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Vermögenswert</th>
                                    <th>Wert</th>
                                    <th>Kategorie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(assetDetails).map(([key, value]) => value.details.map((detail, index) => (
                                    <tr key={index}>
                                        <td>{detail.name}</td>
                                        <td>{detail.value}€</td>
                                        <td>{key}</td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                    <div className="total-sum">Gesamt: {totalSum}€</div>
                </div>
            </section>

            {/* Modale */}
                <Modal
                    isOpen={isAddModalOpen}
                    onRequestClose={() => setIsAddModalOpen(false)}
                    overlayClassName="asset-modal__overlay"
                    className="asset-modal asset-modal--compact"
                >
                    <div className="asset-modal__header">
                        <div className="app-modal__title-wrap">
                            <span className="app-modal__eyebrow">Vermögen</span>
                            <h2 className="app-modal__title">Asset hinzufügen</h2>
                            <p className="app-modal__subtitle">
                                Lege einen neuen Vermögenswert an und ergänze ihn später bei Bedarf.
                            </p>
                        </div>
                        <button type="button" className="asset-modal__close" onClick={() => setIsAddModalOpen(false)}>&times;</button>
                    </div>
                    <div className="asset-modal__body">
                        <div className="app-modal__surface">
                            <p className="app-modal__section-copy">
                                Dieses Modal ist aktuell nicht im Workflow verdrahtet, nutzt aber jetzt
                                dasselbe Designsystem wie die übrigen Modals.
                            </p>
                        </div>
                    </div>
                    <div className="asset-modal__footer">
                        <div className="app-modal__actions">
                            <button type="button" className="btn app-modal__button-outline" onClick={() => setIsAddModalOpen(false)}>Abbrechen</button>
                            <button type="button" className="btn app-modal__button">Speichern</button>
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={isDeleteModalOpen}
                    onRequestClose={() => setIsDeleteModalOpen(false)}
                    overlayClassName="asset-modal__overlay"
                    className="asset-modal"
                >
                    <div className="asset-modal__content">
                        <div className="asset-modal__header">
                            <div className="app-modal__title-wrap">
                                <span className="app-modal__eyebrow">Vermögen</span>
                                <h2 className="app-modal__title">Vermögenswerte bearbeiten</h2>
                                <p className="app-modal__subtitle">
                                    Pflege bestehende Assets und ergänze neue Werte in derselben Ansicht.
                                </p>
                            </div>
                            <button type="button" className="asset-modal__close" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
                        </div>

                        <div className="asset-modal__body asset-modal__body--split">
                            <div className="app-modal__surface asset-modal__panel asset-modal__panel--table">
                                <div className="asset-modal__panel-copy">
                                    <h3 className="app-modal__section-title">Bestehende Assets</h3>
                                    <p className="app-modal__section-copy">
                                        Wähle Einträge für die Entfernung aus oder prüfe die aktuelle Verteilung.
                                    </p>
                                </div>
                                <div className="table-wrapper">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Vermögenswert</th>
                                                <th>Wert</th>
                                                <th>Kategorie</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(assetDetails).map(([key, value]) => value.details.map((detail, index) => (
                                                <tr key={index}>
                                                    <td>{detail.name}</td>
                                                    <td>{detail.value}€</td>
                                                    <td>{key}</td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            onChange={(e) => {
                                                                const newSelection = e.target.checked
                                                                    ? [...selectedForDeletion, detail.name]
                                                                    : selectedForDeletion.filter(name => name !== detail.name);
                                                                setSelectedForDeletion(newSelection);
                                                            }}
                                                            checked={selectedForDeletion.includes(detail.name)}
                                                        />
                                                    </td>
                                                </tr>
                                            )))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="app-modal__surface asset-modal__panel">
                                <div className="asset-modal__panel-copy">
                                    <h3 className="app-modal__section-title">Neues Asset anlegen</h3>
                                    <p className="app-modal__section-copy">
                                        Ergänze Name, Kaufdatum, Wert und Kategorie für einen neuen Eintrag.
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="form-control mb-2"
                                    value={assetName}
                                    onChange={(e) => setAssetName(e.target.value)}
                                />
                                <input
                                    type="date"
                                    placeholder="Datum"
                                    className="form-control mb-2"
                                    value={assetPurchaseDate}
                                    onChange={(e) => setAssetPurchaseDate(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Wert in €"
                                    className="form-control mb-2"
                                    value={assetValue}
                                    onChange={(e) => setAssetValue(e.target.value)}
                                />
                                <select
                                    className="form-select mb-2"
                                    value={assetTag}
                                    onChange={(e) => setAssetTag(e.target.value)}
                                >
                                    <option value="" disabled>Bitte auswählen</option>
                                    {tagNames.map(tagName => (
                                        <option key={tagName} value={tagName}>{tagName}</option>
                                    ))}
                                </select>

                                <div className="asset-modal__inline-action">
                                    <button className="btn app-modal__button" onClick={handleSubmit}>Hinzufügen</button>
                                </div>
                            </div>
                        </div>

                        <div className="asset-modal__footer">
                            <div className="app-modal__actions">
                                <button className="btn app-modal__button-danger" onClick={handleRemoveSelected}>Entfernen</button>
                                <button className="btn app-modal__button-outline" onClick={() => setIsDeleteModalOpen(false)}>Abbrechen</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
    );
};

export default ManageAssets;
