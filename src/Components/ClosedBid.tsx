import { useState } from 'react';
import { getBids, getCollections } from '../Services/api';
import { useUser } from '../Services/UserContext';
import './Bid.css';
import { Bid, Collection } from '../Interfaces/interface';

const ClosedBid: React.FC = () => {
    const { userId } = useUser();
    const [bids, setBids] = useState<Bid[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'accepted' | 'rejected' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedCollections, setExpandedCollections] = useState<number[]>([]);

    console.log('ClosedBid: userId from useUser:', userId);

    const fetchBids = (selectedView: 'accepted' | 'rejected') => {
        console.log('ClosedBid: fetchBids called for view:', selectedView);
        if (userId) {
            console.log('ClosedBid: userId is valid, fetching bids');
            setIsLoading(true);
            setError(null);
            Promise.all([getBids(), getCollections()])
                .then(([bidsData, collectionsData]) => {
                    console.log('ClosedBid: Received bids:', bidsData);
                    console.log('ClosedBid: Received collections:', collectionsData);
                    // Filter for accepted or rejected bids for the current user
                    const userClosedBids = bidsData.filter(
                        (bid) => bid.user_id.toString() === userId && (bid.status === 'accepted' || bid.status === 'rejected')
                    );
                    setBids(userClosedBids);
                    setCollections(collectionsData);
                    setView(selectedView);
                    setExpandedCollections([]); // Reset expanded collections on view change
                })
                .catch((err) => {
                    const errorMessage = (err as Error).message || 'Failed to fetch closed bids.';
                    console.log('ClosedBid: Error fetching bids:', errorMessage);
                    setError(errorMessage);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            console.log('ClosedBid: userId is null, setting error');
            setError('Please log in to view your closed bids.');
        }
    };

    const toggleCollection = (collectionId: number) => {
        console.log('ClosedBid: Toggling collection:', collectionId);
        setExpandedCollections((prev) =>
            prev.includes(collectionId)
                ? prev.filter((id) => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    // Group bids by collection
    const groupedBids = collections.reduce((acc, collection) => {
        const collectionBids = bids.filter(
            (bid) => bid.collection_id === collection.id && bid.status === view
        );
        if (collectionBids.length > 0) {
            acc.push({
                collection,
                bids: collectionBids,
            });
        }
        return acc;
    }, [] as { collection: Collection; bids: Bid[] }[]);

    const formatPrice = (price: number | string | null | undefined): string => {
        if (price === null || price === undefined) {
            console.warn('Price is null or undefined, using 0');
            return '0.00';
        }
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    if (!userId) {
        console.log('ClosedBid: Rendering no-login message');
        return (
            <div className="bid-page">
                <h2>Closed Bids</h2>
                <p>Please log in to view your closed bids.</p>
            </div>
        );
    }

    if (error) {
        console.log('ClosedBid: Rendering error message:', error);
        return (
            <div className="bid-page">
                <h2>Closed Bids</h2>
                <p className="error">{error}</p>
            </div>
        );
    }

    if (isLoading) {
        console.log('ClosedBid: Rendering loading message');
        return (
            <div className="bid-page">
                <h2>Closed Bids</h2>
                <p>Loading bids...</p>
            </div>
        );
    }

    console.log('ClosedBid: Rendering, view:', view, 'groupedBids:', groupedBids);

    return (
        <div className="bid-page">
            <h2>Closed Bids</h2>
            <div className="toggle-buttons">
                <button
                    onClick={() => fetchBids('accepted')}
                    className={`toggle-button ${view === 'accepted' ? 'active' : ''}`}
                >
                    Accepted Bids
                </button>
                <button
                    onClick={() => fetchBids('rejected')}
                    className={`toggle-button ${view === 'rejected' ? 'active' : ''}`}
                >
                    Rejected Bids
                </button>
            </div>
            {view ? (
                groupedBids.length > 0 ? (
                    <div className="bid-list">
                        {groupedBids.map((group) => (
                            <div key={group.collection.id} className="collection-group">
                                <div
                                    className="collection-header"
                                    onClick={() => toggleCollection(group.collection.id)}
                                >
                                    <h3>
                                        {group.collection.name} ({group.bids.length} {view} Bid{group.bids.length !== 1 ? 's' : ''})
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
                    <p>No {view} bids available for your account.</p>
                )
            ) : (
                <p>Select a view to see your bids.</p>
            )}
        </div>
    );
};

export default ClosedBid;