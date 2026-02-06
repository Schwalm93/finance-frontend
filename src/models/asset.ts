export interface asset {
    id: number;
    name: string;
    value: number;
    purchaseDate: string;
    saleDate: string;
    assetTag: assetTag;
}

export interface assetTag {
    id: number;
    tagName: string;
    subTypes: string[];
}

export interface assetDetail {
    name: string;
    value: number;
}

export interface assetDetails {
    [key: string]: {
        totalValue: number;
        details: assetDetail[]; // Speichert Namen und Werte der Assets
        subTypes: string[];
    };
}

export interface chartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }>;
}
