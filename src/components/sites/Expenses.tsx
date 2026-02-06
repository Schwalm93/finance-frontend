import React from 'react';

const Expenses: React.FC = () => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Date2</th>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>2022-01-01</td>
                    <td>Groceries</td>
                    <td>$50</td>
                </tr>
                <tr>
                    <td>2022-01-02</td>
                    <td>Gas</td>
                    <td>$30</td>
                </tr>
                <tr>
                    <td>2022-01-03</td>
                    <td>Restaurant</td>
                    <td>$40</td>
                </tr>
            </tbody>
        </table>
    );
};

export default Expenses;