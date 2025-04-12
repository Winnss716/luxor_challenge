import React, { useState, useEffect } from 'react';
import { getBids, getCollections, deleteBid } from '../Services/api';
import { useUser } from '../Services/UserContext';
import './Bid.css';
import { Bid, Collection } from '../Interfaces/interface';

const OpenBid: React.FC = () => {
    const { userId } = useUser();
    const [bids, setBids] = useState<Bid[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState<string>('All');
    const [expandedCollections, setExpandedCollections] = useState<number[]>([]);

    console.log('OpenBid: userId from useUser:', userId);

    // Fetch pending bids and collections on mount
    useEffect(() => {
        const fetchData = async () => {
            console.log('OpenBid: Fetching bids and collections');
            setIsLoading(true);
            setError(null);
            try {
                const [bidsData, collectionsData] = await Promise.all([getBids(), getCollections()]);
                console.log('OpenBid: Received bids:', bidsData);
                console.log('OpenBid: Received collections:', collectionsData);
                const pendingBids = bidsData.filter(
                    (bid) => bid.status === 'pending' && (!userId || bid.user_id === userId)
                );
                setBids(pendingBids);
                setCollections(collectionsData);
            } catch (err) {
                const errorMessage = (err as Error).message || 'Failed to fetch data.';
                console.log('OpenBid: Error fetching data:', errorMessage);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    // Handle cancelling a bid
    const handleCancelBid = async (bid: Bid) => {
        console.log('OpenBid: Cancelling bid:', bid.id);
        try {
            await deleteBid(bid.id);
            setBids((prevBids) => prevBids.filter((b) => b.id !== bid.id));
            setError(null);
            console.log('OpenBid: Bid cancelled successfully:', bid.id);
        } catch (err: any) {
            let errorMessage = 'Failed to cancel bid.';
            if (err.response?.status === 404) {
                errorMessage = 'Bid not found or already cancelled.';
                // Remove bid from state as it doesn't exist
                setBids((prevBids) => prevBids.filter((b) => b.id !== bid.id));
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            }
            console.log('OpenBid: Error cancelling bid:', errorMessage, 'Details:', err);
            setError(errorMessage);
        }
    };

    // Function to determine market based on collection name
    const getMarket = (collectionName: string): string => {
        const name = collectionName.toLowerCase();
        if (name.includes('eu')) return 'Europe';
        if (name.includes('asia')) return 'Asia Market';
        if (name.includes('us')) return 'US';
        if (name.includes('global')) return 'Global';
        return 'Other';
    };

    // Group collections by market
    const groupedByMarket = collections.reduce((acc, collection) => {
        const market = getMarket(collection.name);
        if (!acc[market]) {
            acc[market] = [];
        }
        const collectionBids = bids.filter((bid) => bid.collection_id === collection.id);
        if (collectionBids.length > 0) {
            acc[market].push({
                collection,
                bids: collectionBids,
            });
        }
        return acc;
    }, {} as Record<string, { collection: Collection; bids: Bid[] }[]>);

    // Filter by selected market
    const filteredGroups = selectedMarket === 'All'
        ? Object.values(groupedByMarket).flat()
        : groupedByMarket[selectedMarket] || [];

    // Remove empty groups
    const visibleGroups = filteredGroups.filter((group) => group.bids.length > 0);

    const toggleCollection = (collectionId: number) => {
        console.log('OpenBid: Toggling collection:', collectionId);
        setExpandedCollections((prev) =>
            prev.includes(collectionId)
                ? prev.filter((id) => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    const handleMarketChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log('OpenBid: Changing market to:', event.target.value);
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
        console.log('OpenBid: Rendering no-login message');
        return (
            <div className="bid-page">
                <h2>Current Bids</h2>
                <p>Please log in to view your current bids.</p>
            </div>
        );
    }

    if (isLoading) {
        console.log('OpenBid: Rendering loading message');
        return (
            <div className="bid-page">
                <h2>Current Bids</h2>
                <p>Loading bids...</p>
            </div>
        );
    }

    if (error) {
        console.log('OpenBid: Rendering error message:', error);
        return (
            <div className="bid-page">
                <h2>Current Bids</h2>
                <p className="error">{error}</p>
            </div>
        );
    }

    console.log('OpenBid: Rendering bid list, visibleGroups:', visibleGroups);

    return (
        <div className="bid-page">
            <h2>Current Bids</h2>
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
            {visibleGroups.length > 0 ? (
                <div className="bid-list">
                    {visibleGroups.map((group) => (
                        <div key={group.collection.id} className="collection-group">
                            <div
                                className="collection-header"
                                onClick={() => toggleCollection(group.collection.id)}
                            >
                                <h3>
                                    {group.collection.name} ({group.bids.length} Pending Bid{group.bids.length !== 1 ? 's' : ''})
                                </h3>
                                <span>{expandedCollections.includes(group.collection.id) ? '−' : '+'}</span>
                            </div>
                            {expandedCollections.includes(group.collection.id) && (
                                <div className="bid-content">
                                    <table className="bid-table">
                                        <thead>
                                            <tr>
                                                <th>Under</th>
                                                <th>Collection Price</th>
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
                                                            {bid.user_id === userId && (
                                                                <div className="bid-actions">
                                                                    <button
                                                                        onClick={() => handleCancelBid(bid)}
                                                                        className="action-button cancel-button"
                                                                        disabled={isLoading}
                                                                    >
                                                                        Cancel Bid
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
                    ))}
                </div>
            ) : (
                <p>No current bids available{userId ? ' for your account' : ''} in {selectedMarket}.</p>
            )}
        </div>
    );
};

export default OpenBid;