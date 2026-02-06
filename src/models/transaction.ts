export interface Transaction {
    id: number;               // Go's int64 entspricht number in TypeScript
    date: string;             // time.Time wird als ISO-String übermittelt (z. B., "2024-11-06T10:30:00Z")
    amount: number;           // float64 wird in TypeScript ebenfalls als number dargestellt
    purpose: string;          // string entspricht string
    status: string;           // Go's Status-Enum als Union-Typ in TypeScript
    category: string;
}
