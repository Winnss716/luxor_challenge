import React, { useState, useEffect } from 'react';
import { getBids, getCollections, acceptBid, rejectBid } from '../Services/api';
import { useUser } from '../Services/UserContext';
import './Bid.css';

interface Bid {
    id: string;
    collection_id: number;
    price: number;
    user_id: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | null;
    number_bids?: number;
    date?: string;
}

interface Collection {
    id: number;
    name: string;
    description?: string;
    stocks: number;
    price: number | string | null;
}

const ManageBid: React.FC = () => {
    const [bids, setBids] = useState<Bid[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeView, setActiveView] = useState<'pending' | 'accepted' | 'rejected'>('pending');
    const [expandedCollections, setExpandedCollections] = useState<number[]>([]);
    const [selectedMarket, setSelectedMarket] = useState<string>('All');
    const { userId, role } = useUser();

    console.log('ManageBid: userId from useUser:', userId, 'role:', role);

    useEffect(() => {
        const fetchData = async () => {
            console.log('ManageBid: Fetching bids and collections');
            setIsLoading(true);
            setError(null);
            try {
                const [bidsData, collectionsData] = await Promise.all([getBids(), getCollections()]);
                console.log('ManageBid: Received bids:', bidsData);
                console.log('ManageBid: Received collections:', collectionsData);
                setBids(bidsData);
                setCollections(collectionsData);
            } catch (err) {
                const errorMessage = (err as Error).message || 'Failed to fetch data.';
                console.log('ManageBid: Error fetching data:', errorMessage);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAcceptBid = async (bid: Bid) => {
        console.log('ManageBid: Accepting bid:', bid.id);
        try {
            await acceptBid(bid.collection_id, bid.id);
            setBids((prevBids) =>
                prevBids.map((b) =>
                    b.id === bid.id ? { ...b, status: 'accepted' } : b
                )
            );
            setError(null);
            console.log('ManageBid: Bid accepted:', bid.id);
        } catch (err) {
            const errorMessage = (err as Error).message || 'Failed to accept bid.';
            console.log('ManageBid: Error accepting bid:', errorMessage);
            setError(errorMessage);
        }
    };

    const handleRejectBid = async (bid: Bid) => {
        console.log('ManageBid: Rejecting bid:', bid.id);
        try {
            await rejectBid(bid.collection_id, bid.id);
            setBids((prevBids) =>
                prevBids.map((b) =>
                    b.id === bid.id ? { ...b, status: 'rejected' } : b
                )
            );
            setError(null);
            console.log('ManageBid: Bid rejected:', bid.id);
        } catch (err) {
            const errorMessage = (err as Error).message || 'Failed to reject bid.';
            console.log('ManageBid: Error rejecting bid:', errorMessage);
            setError(errorMessage);
        }
    };

    const getMarket = (collectionName: string): string => {
        const name = collectionName.toLowerCase();
        if (name.includes('eu')) return 'Europe';
        if (name.includes('asia')) return 'Asia Market';
        if (name.includes('us')) return 'US';
        if (name.includes('global')) return 'Global';
        return 'Other';
    };

    const groupedByMarket = collections.reduce((acc, collection) => {
        const market = getMarket(collection.name);
        if (!acc[market]) {
            acc[market] = [];
        }
        acc[market].push({
            collection,
            bids: bids.filter((bid) => {
                const matchesCollection = bid.collection_id === collection.id;
                if (activeView === 'pending') {
                    return matchesCollection && (bid.status === 'pending' || bid.status === null);
                }
                return matchesCollection && bid.status === activeView;
            }),
        });
        return acc;
    }, {} as Record<string, { collection: Collection; bids: Bid[] }[]>);

    const filteredGroups = selectedMarket === 'All'
        ? Object.values(groupedByMarket).flat()
        : groupedByMarket[selectedMarket] || [];

    const visibleGroups = filteredGroups.filter((group) => group.bids.length > 0);

    const handleToggleView = (view: 'pending' | 'accepted' | 'rejected') => {
        console.log('ManageBid: Toggling view to:', view);
        setActiveView(view);
        setError(null);
        setExpandedCollections([]);
    };

    const toggleCollection = (collectionId: number) => {
        console.log('ManageBid: Toggling collection:', collectionId);
        setExpandedCollections((prev) =>
            prev.includes(collectionId)
                ? prev.filter((id) => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    const handleMarketChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log('ManageBid: Changing market to:', event.target.value);
        setSelectedMarket(event.target.value);
        setExpandedCollections([]);
    };

    const formatPrice = (price: number | string | null | undefined): string => {
        if (price === null || price === undefined) {
            console.warn('Price is null or undefined, using 0');
            return '0.00';
        }
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    if (!userId) {
        console.log('ManageBid: Rendering no-login message');
        return (
            <div className="bid-page">
                <h2>Manage Bids</h2>
                <p>Please log in to manage bids.</p>
            </div>
        );
    }

    if (role !== 'owner') {
        console.log('ManageBid: Rendering no-owner message');
        return (
            <div className="bid-page">
                <h2>Manage Bids</h2>
                <p>Only owners can manage bids.</p>
            </div>
        );
    }

    if (isLoading) {
        console.log('ManageBid: Rendering loading message');
        return (
            <div className="bid-page">
                <h2>Manage Bids</h2>
                <p>Loading bids...</p>
            </div>
        );
    }

    console.log('ManageBid: Rendering bid list, visibleGroups:', visibleGroups);

    return (
        <div className="bid-page">
            <h2>Manage Bids</h2>
            {error && <p className="error">{error}</p>}
            <div className="market-selector">
                <label htmlFor="market-select">Select Market: </label>
                <select
                    id="market-select"
                    value={selectedMarket}
                    onChange={handleMarketChange}
                    disabled={isLoading}
                >
                    <option value="All">All Markets</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia Market">Asia Market</option>
                    <option value="US">US</option>
                    <option value="Global">Global</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className="toggle-buttons">
                <button
                    onClick={() => handleToggleView('pending')}
                    className={`toggle-button ${activeView === 'pending' ? 'active' : ''}`}
                    disabled={isLoading}
                >
                    Pending Bids
                </button>
                <button
                    onClick={() => handleToggleView('accepted')}
                    className={`toggle-button ${activeView === 'accepted' ? 'active' : ''}`}
                    disabled={isLoading}
                >
                    Accepted Bids
                </button>
                <button
                    onClick={() => handleToggleView('rejected')}
                    className={`toggle-button ${activeView === 'rejected' ? 'active' : ''}`}
                    disabled={isLoading}
                >
                    Rejected Bids
                </button>
            </div>
            <div className="bid-list">
                {visibleGroups.length > 0 ? (
                    visibleGroups.map((group) => (
                        <div key={group.collection.id} className="collection-group">
                            <div
                                className="collection-header"
                                onClick={() => toggleCollection(group.collection.id)}
                            >
                                <h3>
                                    {group.collection.name} ({group.bids.length} Bid{group.bids.length !== 1 ? 's' : ''})
                                </h3>
                                <span>{expandedCollections.includes(group.collection.id) ? '−' : '+'}</span>
                            </div>
                            {expandedCollections.includes(group.collection.id) && (
                                <div className="bid-content">
                                    <table className="bid-table">
                                        <thead>
                                            <tr>
                                                <th>Under</th>
                                                <th>Listing Price</th>
                                                <th>Over</th>
                                                <th>Number of Bids</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const collectionPrice = typeof group.collection.price === 'string'
                                                    ? parseFloat(group.collection.price)
                                                    : group.collection.price || 0;

                                                // Split bids into under and over
                                                const underBids = group.bids.filter(
                                                    (bid) => (bid.price || 0) <= collectionPrice
                                                );
                                                const overBids = group.bids.filter(
                                                    (bid) => (bid.price || 0) > collectionPrice
                                                );

                                                // Combine bids into a single array, under first, then over
                                                const allBids = [...underBids, ...overBids];

                                                // Create rows, one bid per row
                                                return allBids.map((bid) => (
                                                    <tr key={bid.id}>
                                                        <td>
                                                            {(bid.price || 0) <= collectionPrice ? (
                                                                <span className="bid-price highlight-red">
                                                                    ${formatPrice(bid.price)}
                                                                </span>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td className="collection-price">
                                                            <span>${formatPrice(group.collection.price)}</span>
                                                        </td>
                                                        <td>
                                                            {(bid.price || 0) > collectionPrice ? (
                                                                <span className="bid-price highlight-green">
                                                                    ${formatPrice(bid.price)}
                                                                </span>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td>
                                                            {bid.number_bids !== undefined
                                                                ? bid.number_bids
                                                                : '-'}
                                                        </td>
                                                        <td className="actions">
                                                            {activeView === 'pending' && (
                                                                <div className="bid-actions">
                                                                    <button
                                                                        onClick={() => handleAcceptBid(bid)}
                                                                        className="action-button accept-button"
                                                                        disabled={isLoading}
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectBid(bid)}
                                                                        className="action-button reject-button"
                                                                        disabled={isLoading}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No {activeView} bids available for {selectedMarket}.</p>
                )}
            </div>
        </div>
    );
};

export default ManageBid;