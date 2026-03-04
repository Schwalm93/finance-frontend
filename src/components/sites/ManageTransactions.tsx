import React, { useState, useEffect } from "react";
import { months } from '../../constants/months';
import { Transaction } from "../../models/transaction";
import { API_ENDPOINTS } from "../../api/apiConfig";
import './css/ManageTransactions.css';
import './css/SiteLayout.css';
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

    const getAmountClass = (transaction: Transaction) => {
        const isPositive = transaction.amount > 0;
        const isDepotDeposit = transaction.purpose === "Depot Einzahlung";

        return isPositive || isDepotDeposit ? 'my-text-green' : 'my-text-red';
    };

    useEffect(() => {
        if (selectedCategory && !availableCategories.includes(selectedCategory)) {
            setSelectedCategory('');
        }
    }, [availableCategories, selectedCategory]);

    return (
        <div className="page-shell">
            <section className="page-card">
                <div className="page-card__header">
                    <h2>Filter und Aktionen</h2>
                </div>
                <div className="page-card__body">
                    <div className="row g-3 align-items-center">
                        <div className="col-12 col-md-6 col-xl-auto">
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
                        <div className="col-12 col-md-6 col-xl-auto">
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
                        <div className="col-12 col-md-6 col-xl-auto">
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
                        <div className="col-12 col-md-6 col-xl">
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Suche"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-md-6 col-xl-auto">
                            <button
                                className="btn btn-primary btn-transaction"
                                type="button"
                                onClick={openAddTransactionModal}
                            >
                                Transaktionen hinzufügen
                            </button>
                        </div>
                        <div className="col-12 col-md-6 col-xl-auto">
                            <button
                                className="btn btn-outline-primary btn-transaction-outline"
                                type="button"
                                onClick={openManageCategoriesModal}
                            >
                                Kategorien verwalten
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="page-card">
                <div className="page-card__body">
                    <div className="transactions-table-shell transactions-table-shell--desktop">
                        <div className="transactions-table-wrap" style={{ maxHeight: '650px' }}>
                        <table className="table transactions-table">
                            <thead>
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
                                    return (
                                        <tr key={index}>
                                            <td>{transaction.date}</td>
                                            <td className="transactions-table__purpose">{transaction.purpose}</td>
                                            <td className="transactions-table__category">{transaction.category}</td>
                                            <td>
                                                <span className="transactions-table__status">{transaction.status}</span>
                                            </td>
                                            <td>
                                                <span className={`transactions-table__amount ${getAmountClass(transaction)}`}>
                                                    {transaction.amount}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="transactions-table__empty">Keine Transaktionen gefunden</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                        </div>
                    </div>

                    <div className="transactions-mobile-list">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction, index) => (
                                <article className="transactions-mobile-card" key={index}>
                                    <div className="transactions-mobile-card__top">
                                        <div className="transactions-mobile-card__copy">
                                            <span className="transactions-mobile-card__label">Begünstigter</span>
                                            <strong className="transactions-mobile-card__purpose">{transaction.purpose}</strong>
                                        </div>
                                        <span className={`transactions-table__amount ${getAmountClass(transaction)}`}>
                                            {transaction.amount}
                                        </span>
                                    </div>

                                    <div className="transactions-mobile-card__meta">
                                        <div className="transactions-mobile-card__item">
                                            <span className="transactions-mobile-card__label">Datum</span>
                                            <span>{transaction.date}</span>
                                        </div>
                                        <div className="transactions-mobile-card__item">
                                            <span className="transactions-mobile-card__label">Kategorie</span>
                                            <span className="transactions-table__category">{transaction.category}</span>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="transactions-mobile-empty">Keine Transaktionen gefunden</div>
                        )}
                    </div>
                </div>
            </section>

            <section className="page-stat-grid page-stat-grid--compact page-stat-grid--align-right">
                <article className="page-stat">
                    <span>Angezeigt</span>
                    <strong>{filteredTransactions.length}</strong>
                </article>
                <article className="page-stat">
                    <span>Gesamtsumme</span>
                    <strong className={totalDisplayedAmount >= 0 ? 'text-success' : 'text-danger'}>
                        {totalDisplayedAmount.toFixed(2)}
                    </strong>
                </article>
            </section>

            {showAddTransaction && <AddTransaction handleFileuploadModal={closeAddTransactionModal} />}
            {showManageCategories && (
                <ManageCategories
                    categories={availableCategories}
                    onClose={closeManageCategoriesModal}
                    onChanged={handleCategoriesChanged}
                />
            )}
        </div>
    );
};

export default ManageTransaction;
