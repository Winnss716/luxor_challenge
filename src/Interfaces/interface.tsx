export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    login_pin?: string;
    role?: 'user';
}

export interface Owner {
    id: string;
    name: string;
    email: string;
    username: string;
    role?: 'owner';
}

export interface Collection {
    id: number;
    name: string;
    description?: string;
    stocks: number;
    price: number;
}

export interface Bid {
    id: string; // Changed to string for UUID
    collection_id: number;
    price: number;
    user_id: string; // Changed to string for UUID
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | null;
    number_bids?: number;
    date?: string;
}

export interface ApiError {
    error: string;
}