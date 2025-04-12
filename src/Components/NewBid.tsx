import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getCollections, createBid } from '../Services/api';
import { useUser } from '../Services/UserContext';
import './Bid.css';

interface Collection {
    id: number;
    name: string;
    description?: string;
    stocks: number;
    price: number | string;
}

interface BidForm {
    collection_id: number;
    price: number;
    number_bids: number;
}

const NewBid: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { userId } = useUser();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<BidForm>({
        defaultValues: {
            collection_id: 0,
            price: 0,
            number_bids: 1,
        },
    });

    const selectedCollectionId = watch('collection_id');

    useEffect(() => {
        const fetchCollections = async () => {
            setIsLoading(true);
            try {
                const data = await getCollections();
                console.log('NewBid: Received collections:', data);
                setCollections(data);
            } catch (err) {
                const errorMessage = (err as Error).message || 'Failed to fetch collections.';
                console.log('NewBid: Error fetching collections:', errorMessage);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollections();
    }, []);

    useEffect(() => {
        console.log('NewBid: selectedCollectionId:', selectedCollectionId);
        const id = Number(selectedCollectionId);
        if (id && id !== 0) {
            const selectedCollection = collections.find(
                (collection) => collection.id === id
            );
            console.log('NewBid: selectedCollection:', selectedCollection);
            if (selectedCollection) {
                const price = typeof selectedCollection.price === 'string'
                    ? parseFloat(selectedCollection.price)
                    : selectedCollection.price;
                console.log('NewBid: parsed price:', price);
                if (!isNaN(price)) {
                    setValue('price', price);
                } else {
                    setValue('price', 0);
                    console.warn('NewBid: Invalid price for collection:', selectedCollection);
                }
            } else {
                setValue('price', 0);
                console.warn('NewBid: No collection found for id:', id);
            }
        } else {
            setValue('price', 0);
        }
    }, [selectedCollectionId, collections, setValue]);

    const onSubmit: SubmitHandler<BidForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!userId) {
                throw new Error('User not logged in.');
            }
            console.log('NewBid: Submitting bid with userId:', userId);
            await createBid({
                collection_id: data.collection_id,
                price: data.price,
                user_id: userId,
                status: 'pending',
                number_bids: data.number_bids,
            });
            console.log('NewBid: Bid created successfully');
            reset();
            navigate('/home');
        } catch (err) {
            const errorMessage = (err as Error).message || 'Failed to create bid.';
            console.log('NewBid: Error creating bid:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userId) {
        console.log('NewBid: Rendering no-login message');
        return (
            <div className="bid-page">
                <h2>Create a New Bid</h2>
                <p>Please log in to create a bid.</p>
            </div>
        );
    }

    const selectedCollection = collections.find(
        (collection) => collection.id === Number(selectedCollectionId)
    );
    const currentPrice = selectedCollection
        ? typeof selectedCollection.price === 'string'
            ? parseFloat(selectedCollection.price)
            : selectedCollection.price
        : null;

    return (
        <div className="bid-page">
            <h2>Create a New Bid</h2>
            {error && <p className="error">{error}</p>}
            {isLoading ? (
                <p>Loading collections...</p>
            ) : collections.length === 0 ? (
                <p>No collections available to bid on.</p>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="collection_id">Select Collection</label>
                        <select
                            id="collection_id"
                            disabled={isLoading}
                            {...register('collection_id', {
                                required: 'Please select a collection',
                                validate: (value) => value !== 0 || 'Please select a valid collection',
                            })}
                        >
                            <option value={0}>-- Select a Collection --</option>
                            {collections.map((collection) => (
                                <option key={collection.id} value={collection.id}>
                                    {collection.name}
                                </option>
                            ))}
                        </select>
                        {errors.collection_id && <span className="error">{errors.collection_id.message}</span>}
                        {currentPrice != null && !isNaN(currentPrice) && (
                            <p className="current-price">Current Price: ${currentPrice.toFixed(2)}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Offer Bid</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            disabled={isLoading}
                            {...register('price', {
                                required: 'Offer bid is required',
                                min: { value: 0.01, message: 'Offer bid must be greater than 0' },
                            })}
                        />
                        {errors.price && <span className="error">{errors.price.message}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="number_bids">Number of Bids</label>
                        <input
                            id="number_bids"
                            type="number"
                            disabled={isLoading}
                            {...register('number_bids', {
                                required: 'Number of bids is required',
                                min: { value: 1, message: 'Number of bids must be at least 1' },
                            })}
                        />
                        {errors.number_bids && <span className="error">{errors.number_bids.message}</span>}
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Create Bid'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default NewBid;