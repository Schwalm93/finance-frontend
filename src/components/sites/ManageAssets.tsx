import React, { useState, useEffect, useMemo } from "react";
import { Pie } from 'react-chartjs-2';
import Modal from 'react-modal';

import { asset, assetDetails, chartData } from '../../models/asset';
import { colorPalette } from '../../constants/colors';
import { API_ENDPOINTS } from "../../api/apiConfig";
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
        <div className="manage-assets">
            <div className="chart-container">
                <h2>Aufteilung der Vermögenswerte</h2>
                <div className="piechart-container">{chartData.datasets.length > 0 ? <Pie data={chartData} options={tooltipOptions} /> : <p>Loading...</p>} </div>
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


                {/* Buttons */}
                <div className="button-container">
                    <button className="btn btn-secondary m-2 btn-uniform" onClick={() => setIsDeleteModalOpen(true)}>Bearbeiten</button>
                </div>



                {/* Modale */}
                <Modal isOpen={isAddModalOpen} onRequestClose={() => setIsAddModalOpen(false)}>
                    <div className="modal-header">
                        <h2>Hinzufügen</h2>
                        <button type="button" className="close" onClick={() => setIsAddModalOpen(false)}>&times;</button>
                    </div>
                    {/* Weitere Inhalte hier */}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-success">Speichern</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Abbrechen</button>
                    </div>
                </Modal>

                <Modal
                    isOpen={isDeleteModalOpen}
                    onRequestClose={() => setIsDeleteModalOpen(false)}
                    style={{
                        content: {
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            maxWidth: '800px',
                        }
                    }}
                >
                    <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Überschrift */}
                        <div className="modal-header">
                            <h2>Vermögenswerte bearbeiten</h2>
                            <button type="button" className="close" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
                        </div>

                        {/* Hauptbereich für Tabelle und Formular */}
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'row', gap: '20px', flex: 1 }}>
                            {/* Tabelle mit Assets */}
                            <div style={{ flex: 3, overflowX: 'auto' }}>
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

                            {/* Trenner */}
                            <div style={{ width: '1px', backgroundColor: 'grey', alignSelf: 'stretch' }}></div>

                            {/* Formular mit Inputs und Dropdown */}
                            <div style={{ flex: 1 }}>
                                <h4>Hinzufügen</h4>
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
                                    className="form-control mb-2"
                                    value={assetTag}
                                    onChange={(e) => setAssetTag(e.target.value)}
                                >
                                    <option value="" disabled>Bitte auswählen</option>
                                    {tagNames.map(tagName => (
                                        <option key={tagName} value={tagName}>{tagName}</option>
                                    ))}
                                </select>

                                {/* Container für die Ausrichtung des Buttons */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-success" onClick={handleSubmit}>Hinzufügen</button>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <button className="btn btn-danger m-2" onClick={handleRemoveSelected}>Entfernen</button>
                            <button className="btn btn-secondary m-2" onClick={() => setIsDeleteModalOpen(false)}>Abbrechen</button>
                        </div>
                    </div>
                </Modal>




            </div>
        </div>
    );
};

export default ManageAssets;
