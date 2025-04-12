import axios, { AxiosError } from 'axios';
import { User, Owner, Collection, Bid, ApiError } from '../Interfaces/interface';

const API_URL = 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// User API
export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
    try {
        const response = await api.post<User>('/users', user);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const loginUser = async (data: { username: string; password: string }): Promise<{ token: string; user: User }> => {
    try {
        const response = await api.post<{ token: string; user: User }>('/login', data);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const forgotPassword = async (data: { email: string }): Promise<void> => {
    try {
        await api.post('/forgot-password', data);
    } catch (error) {
        throw handleError(error);
    }
};

export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await api.get<User[]>('/users');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getUserById = async (id: string): Promise<User> => {
    try {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
    try {
        const response = await api.put<User>(`/users/${id}`, user);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteUser = async (id: string): Promise<void> => {
    try {
        await api.delete(`/users/${id}`);
    } catch (error) {
        throw handleError(error);
    }
};

// Owner API
export const createOwner = async (owner: Omit<Owner, 'id'>): Promise<Owner> => {
    try {
        const response = await api.post<Owner>('/owners', owner);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getOwners = async (): Promise<Owner[]> => {
    try {
        const response = await api.get<Owner[]>('/owners');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getOwnerById = async (id: string): Promise<Owner> => {
    try {
        const response = await api.get<Owner>(`/owners/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateOwner = async (id: string, owner: Partial<Owner>): Promise<Owner> => {
    try {
        const response = await api.put<Owner>(`/owners/${id}`, owner);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteOwner = async (id: string): Promise<void> => {
    try {
        await api.delete(`/owners/${id}`);
    } catch (error) {
        throw handleError(error);
    }
};

// Collection API
export const createCollection = async (collection: Omit<Collection, 'id'>): Promise<Collection> => {
    try {
        const response = await api.post<Collection>('/collections', collection);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getCollections = async (): Promise<Collection[]> => {
    try {
        const response = await api.get<Collection[]>('/collections');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getCollectionById = async (id: number): Promise<Collection> => {
    try {
        const response = await api.get<Collection>(`/collections/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateCollection = async (id: number, collection: Partial<Collection>): Promise<Collection> => {
    try {
        const response = await api.put<Collection>(`/collections/${id}`, collection);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteCollection = async (id: number): Promise<void> => {
    try {
        await api.delete(`/collections/${id}`);
    } catch (error) {
        throw handleError(error);
    }
};

// Bid API
export const createBid = async (bid: Omit<Bid, 'id'>): Promise<Bid> => {
    try {
        const response = await api.post<Bid>('/bids', bid);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getBids = async (): Promise<Bid[]> => {
    try {
        const response = await api.get<Bid[]>('/bids');
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getBidsByCollection = async (collectionId: number): Promise<Bid[]> => {
    try {
        const response = await api.get<Bid[]>(`/bids/by-collection/${collectionId}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateBid = async (id: string, bid: Partial<Bid>): Promise<Bid> => {
    try {
        const response = await api.put<Bid>(`/bids/${id}`, bid);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteBid = async (id: string): Promise<void> => {
    try {
        await api.delete(`/bids/${id}`);
    } catch (error) {
        throw handleError(error);
    }
};

export const acceptBid = async (collectionId: number, bidId: string): Promise<Bid> => {
    try {
        const response = await api.post<Bid>('/bids/accept', { collection_id: collectionId, bid_id: bidId });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const rejectBid = async (collectionId: number, bidId: string): Promise<Bid> => {
    try {
        const response = await api.post<Bid>('/bids/reject', { collection_id: collectionId, bid_id: bidId });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getUserClosedBids = async (userId: string): Promise<Bid[]> => {
    try {
        const response = await api.get<Bid[]>(`/bids/closed/${userId}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

const handleError = (error: unknown): Error => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        return new Error(axiosError.response?.data.error || 'An error occurred');
    }
    return new Error('An unexpected error occurred');
};