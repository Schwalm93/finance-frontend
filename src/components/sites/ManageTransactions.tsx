import React, { useState, useEffect } from "react";
import { months } from '../../constants/months';
import { Transaction } from "../../models/transaction";
import { API_ENDPOINTS } from "../../api/apiConfig";
import './css/ManageTransactions.css';
import { AddTransaction } from "../popups/AddTransaction";
import { ManageCategories } from "../popups/ManageCategories";

export const ManageTransaction: React.FC<{}> = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | ''>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [showManageCategories, setShowManageCategories] = useState(false);

    const openAddTransactionModal = () => {
        setShowAddTransaction(true);
    };

    const closeAddTransactionModal = () => {
        setShowAddTransaction(false);
    };

    const openManageCategoriesModal = () => {
        setShowManageCategories(true);
    };

    const closeManageCategoriesModal = () => {
        setShowManageCategories(false);
    };

    const handleCategoriesChanged = () => {
        fetchAvailableCategories();
        fetchTransactions();
    };

    type AvailableYearsResponse = {
        years: number[];
    };

    type AvailableCategoriesResponse = {
        categories: string[];
    };

    useEffect(() => {
        fetchTransactions();
        fetchAvailableYears();
        fetchAvailableCategories();
    }, [selectedYear, selectedMonth, selectedCategory, showAddTransaction, showManageCategories]);

    const fetchTransactions = () => {
        fetch(API_ENDPOINTS.getTransactionsByFilter(selectedYear, selectedMonth, selectedCategory))
            .then(response => response.json())
            .then(data => {
                setTransactions(data);

                // if (availableYears.length === 0) {
                //     const years: number[] = Array.from(
                //         new Set(
                //             data.map((transaction: Transaction) => new Date(transaction.date).getFullYear())
                //         )
                //     );
                //     setAvailableYears(years);
                // }

                if (availableCategories.length === 0) {
                    const categories: string[] = Array.from(
                        new Set(data.map((transaction: Transaction) => transaction.category))
                    );
                    setAvailableCategories(categories);
                }
            })
            .catch(error => console.error('Fehler beim Abrufen der Transaktionen:', error));
    };

    const fetchAvailableYears = () => {
        fetch(API_ENDPOINTS.getAvailableYears)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json() as Promise<AvailableYearsResponse>;
            })
            .then((data) => {
                const years = Array.isArray(data?.years)
                    ? data.years
                          .map((y) => Number(y))
                          .filter((y) => Number.isFinite(y))
                    : [];

                setAvailableYears(years.length > 0 ? years : [new Date().getFullYear()]);
            })
            .catch((error) => {
                console.error("Fehler beim Abrufen der verfügbaren Jahre:", error);
                setAvailableYears([new Date().getFullYear()]);
            });
    };

    const fetchAvailableCategories = () => {
        fetch(API_ENDPOINTS.getAvailableCategories)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json() as Promise<AvailableCategoriesResponse>;
            })
            .then((data) => {
                const categories = Array.isArray(data?.categories)
                    ? data.categories
                          .map((c) => String(c).trim())
                          .filter((c) => c.length > 0)
                    : [];

                setAvailableCategories(categories.length > 0 ? categories : ["Sonstiges"]);
            })
            .catch((error) => {
                console.error("Fehler beim Abrufen der verfügbaren Kategorien:", error);
                setAvailableCategories(["Sonstiges"]);
            });
    };


    const filterTransactions = () => {
        if (!transactions || !Array.isArray(transactions)) {
            return [];
        }
        const lowercasedText = searchText.toLowerCase();
        return transactions.filter(transaction =>
            (!searchText || transaction.purpose.toLowerCase().includes(lowercasedText)) &&
            (!selectedCategory || transaction.category === selectedCategory)
        );
    };

    const filteredTransactions = filterTransactions();
    const totalDisplayedAmount = filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);

    useEffect(() => {
        if (selectedCategory && !availableCategories.includes(selectedCategory)) {
            setSelectedCategory('');
        }
    }, [availableCategories, selectedCategory]);

    return (
        <div className="container mt-5">
            <div className="row g-3 align-items-center justify-content-center">
                <div className="col-auto">
                    <select
                        className="form-select"
                        value={selectedYear}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedYear(value === '' ? '' : Number(value));
                        }}
                    >
                        <option value="">Jahr auswählen</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-auto">
                    <select
                        className="form-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        <option value="">Monat auswählen</option>
                        {months.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-auto">
                    <select
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Kategorie auswählen</option>
                        {availableCategories.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-auto">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Suche"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <div className="col-auto">
                    <button
                        className="btn btn-primary btn-transaction"
                        type="button"
                        onClick={openAddTransactionModal}
                    >
                        Transaktionen hinzufügen
                    </button>
                </div>
                <div className="col-auto">
                    <button
                        className="btn btn-outline-primary btn-transaction-outline"
                        type="button"
                        onClick={openManageCategoriesModal}
                    >
                        Kategorien verwalten
                    </button>
                </div>

                {showAddTransaction && <AddTransaction handleFileuploadModal={closeAddTransactionModal} />}
                {showManageCategories && (
                    <ManageCategories
                        categories={availableCategories}
                        onClose={closeManageCategoriesModal}
                        onChanged={handleCategoriesChanged}
                    />
                )}
            </div>
            <div className="table-responsive mt-3" style={{ maxHeight: '650px', overflowY: 'auto' }}>
                <table className="table table-striped table-hover rounded-table">
                    <thead className="table-dark">
                    <tr>
                        <th>Buchungsdatum</th>
                        <th>Begünstigter</th>
                        <th>Kategorie</th>
                        <th>Status</th>
                        <th style={{ minWidth: '113px' }}>Betrag</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction, index) => {
                            const isPositive = transaction.amount > 0;
                            const isDepotDeposit = transaction.purpose === "Depot Einzahlung";
                            const amountClass = isPositive || isDepotDeposit ? 'my-text-green' : 'my-text-red';

                            return (
                                <tr key={index}>
                                    <td>{transaction.date}</td>
                                    <td>{transaction.purpose}</td>
                                    <td>{transaction.category}</td>
                                    <td>{transaction.status}</td>
                                    <td className={amountClass}>{transaction.amount}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center">Keine Transaktionen gefunden</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <div className="mt-3">
                <h5>Gesamtsumme der angezeigten Beträge: <span
                    className={totalDisplayedAmount >= 0 ? 'text-success' : 'text-danger'}>
          {totalDisplayedAmount.toFixed(2)}
        </span>
                </h5>
            </div>
        </div>
    );
};

export default ManageTransaction;
