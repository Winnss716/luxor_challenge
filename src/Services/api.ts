import { Platform } from 'react-native';
import { User, Owner, Collection, Bid, ApiError } from '../Interfaces/interface';

// Set API_URL based on platform
const API_URL =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : // Android emulator
        Platform.OS === 'ios' ? 'http://localhost:3000' :     // iOS simulator
            'http://192.168.x.x:3000';                           // Replace with your machine's IP for physical devices

const defaultHeaders = {
    'Content-Type': 'application/json',
};

// User API
export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(user),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: User = await response.json();
        return data;
    } catch (error) {
        console.log('API createUser error:', error);
        throw handleError(error);
    }
};

export const loginUser = async (data: { username: string; password: string }): Promise<{ token: string; user: User }> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const result: { token: string; user: User } = await response.json();
        return result;
    } catch (error) {
        console.log('API loginUser error:', error);
        throw handleError(error);
    }
};

export const forgotPassword = async (data: { email: string }): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
    } catch (error) {
        console.log('API forgotPassword error:', error);
        throw handleError(error);
    }
};

export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: User[] = await response.json();
        return data;
    } catch (error) {
        console.log('API getUsers error:', error);
        throw handleError(error);
    }
};

export const getUserById = async (id: string): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: User = await response.json();
        return data;
    } catch (error) {
        console.log('API getUserById error:', error);
        throw handleError(error);
    }
};

export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: defaultHeaders,
            body: JSON.stringify(user),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: User = await response.json();
        return data;
    } catch (error) {
        console.log('API updateUser error:', error);
        throw handleError(error);
    }
};

export const deleteUser = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
    } catch (error) {
        console.log('API deleteUser error:', error);
        throw handleError(error);
    }
};

// Owner API
export const createOwner = async (owner: Omit<Owner, 'id'>): Promise<Owner> => {
    try {
        const response = await fetch(`${API_URL}/owners`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(owner),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Owner = await response.json();
        return data;
    } catch (error) {
        console.log('API createOwner error:', error);
        throw handleError(error);
    }
};

export const getOwners = async (): Promise<Owner[]> => {
    try {
        const response = await fetch(`${API_URL}/owners`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Owner[] = await response.json();
        return data;
    } catch (error) {
        console.log('API getOwners error:', error);
        throw handleError(error);
    }
};

export const getOwnerById = async (id: string): Promise<Owner> => {
    try {
        const response = await fetch(`${API_URL}/owners/${id}`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Owner = await response.json();
        return data;
    } catch (error) {
        console.log('API getOwnerById error:', error);
        throw handleError(error);
    }
};

export const updateOwner = async (id: string, owner: Partial<Owner>): Promise<Owner> => {
    try {
        const response = await fetch(`${API_URL}/owners/${id}`, {
            method: 'PUT',
            headers: defaultHeaders,
            body: JSON.stringify(owner),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Owner = await response.json();
        return data;
    } catch (error) {
        console.log('API updateOwner error:', error);
        throw handleError(error);
    }
};

export const deleteOwner = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/owners/${id}`, {
            method: 'DELETE',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
    } catch (error) {
        console.log('API deleteOwner error:', error);
        throw handleError(error);
    }
};

// Collection API
export const createCollection = async (collection: Omit<Collection, 'id'>): Promise<Collection> => {
    try {
        const response = await fetch(`${API_URL}/collections`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(collection),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Collection = await response.json();
        return data;
    } catch (error) {
        console.log('API createCollection error:', error);
        throw handleError(error);
    }
};

export const getCollections = async (): Promise<Collection[]> => {
    try {
        const response = await fetch(`${API_URL}/collections`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Collection[] = await response.json();
        return data;
    } catch (error) {
        console.log('API getCollections error:', error);
        throw handleError(error);
    }
};

export const getCollectionById = async (id: number): Promise<Collection> => {
    try {
        const response = await fetch(`${API_URL}/collections/${id}`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Collection = await response.json();
        return data;
    } catch (error) {
        console.log('API getCollectionById error:', error);
        throw handleError(error);
    }
};

export const updateCollection = async (id: number, collection: Partial<Collection>): Promise<Collection> => {
    try {
        const response = await fetch(`${API_URL}/collections/${id}`, {
            method: 'PUT',
            headers: defaultHeaders,
            body: JSON.stringify(collection),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Collection = await response.json();
        return data;
    } catch (error) {
        console.log('API updateCollection error:', error);
        throw handleError(error);
    }
};

export const deleteCollection = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/collections/${id}`, {
            method: 'DELETE',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
    } catch (error) {
        console.log('API deleteCollection error:', error);
        throw handleError(error);
    }
};

// Bid API
export const createBid = async (bid: Omit<Bid, 'id'>): Promise<Bid> => {
    try {
        const response = await fetch(`${API_URL}/bids`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(bid),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Bid = await response.json();
        return data;
    } catch (error) {
        console.log('API createBid error:', error);
        throw handleError(error);
    }
};

export const getBids = async (): Promise<Bid[]> => {
    try {
        const response = await fetch(`${API_URL}/bids`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Bid[] = await response.json();
        return data;
    } catch (error) {
        console.log('API getBids error:', error);
        throw handleError(error);
    }
};

export const getBidsByCollection = async (collectionId: number): Promise<Bid[]> => {
    try {
        const response = await fetch(`${API_URL}/bids/by-collection/${collectionId}`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Bid[] = await response.json();
        return data;
    } catch (error) {
        console.log('API getBidsByCollection error:', error);
        throw handleError(error);
    }
};

export const updateBid = async (id: string, bid: Partial<Bid>): Promise<Bid> => {
    try {
        const response = await fetch(`${API_URL}/bids/${id}`, {
            method: 'PUT',
            headers: defaultHeaders,
            body: JSON.stringify(bid),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Bid = await response.json();
        return data;
    } catch (error) {
        console.log('API updateBid error:', error);
        throw handleError(error);
    }
};

export const deleteBid = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/bids/${id}`, {
            method: 'DELETE',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
    } catch (error) {
        console.log('API deleteBid error:', error);
        throw handleError(error);
    }
};

export const acceptBid = async (collectionId: number, bidId: string): Promise<Bid> => {
    try {
        const response = await fetch(`${API_URL}/bids/accept`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({ collection_id: collectionId, bid_id: bidId }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Bid = await response.json();
        return data;
    } catch (error) {
        console.log('API acceptBid error:', error);
        throw handleError(error);
    }
};

export const rejectBid = async (collectionId: number, bidId: string): Promise<Bid> => {
    try {
        const response = await fetch(`${API_URL}/bids/reject`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({ collection_id: collectionId, bid_id: bidId }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Bid = await response.json();
        return data;
    } catch (error) {
        console.log('API rejectBid error:', error);
        throw handleError(error);
    }
};

export const getUserClosedBids = async (userId: string): Promise<Bid[]> => {
    try {
        const response = await fetch(`${API_URL}/bids/closed/${userId}`, {
            method: 'GET',
            headers: defaultHeaders,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }
        const data: Bid[] = await response.json();
        return data;
    } catch (error) {
        console.log('API getUserClosedBids error:', error);
        throw handleError(error);
    }
};

const handleError = (error: unknown): Error => {
    if (error instanceof Error) {
        return error;
    }
    return new Error('An unexpected error occurred');
};