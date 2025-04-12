import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getCollections, getCollectionById, updateCollection, deleteCollection } from '../Services/api';
import { useUser } from '../Services/UserContext';
import './Collections.css';

interface CollectionForm {
    collection_id: number;
    name: string;
    description?: string;
    stocks: number;
    price: number;
}

interface Collection {
    id: number;
    name: string;
    description?: string;
    stocks: number;
    price: number;
}

const UpdateCollection: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { userId, role } = useUser();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<CollectionForm>({
        defaultValues: {
            collection_id: 0,
            name: '',
            description: '',
            stocks: 0,
            price: 0,
        },
    });

    // Fetch collections for dropdown on mount
    useEffect(() => {
        const fetchCollections = async () => {
            setIsLoading(true);
            try {
                const data = await getCollections();
                setCollections(data);
            } catch (err) {
                setError((err as Error).message || 'Failed to fetch collections.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollections();
    }, []);

    // Watch for collection_id changes to fetch and update form
    const selectedCollectionId = watch('collection_id');

    useEffect(() => {
        if (selectedCollectionId && selectedCollectionId !== 0) {
            const fetchSelectedCollection = async () => {
                setIsLoading(true);
                try {
                    const collection = await getCollectionById(selectedCollectionId);
                    setValue('name', collection.name);
                    setValue('description', collection.description || '');
                    setValue('stocks', collection.stocks);
                    setValue('price', collection.price);
                } catch (err) {
                    setError((err as Error).message || 'Failed to fetch collection details.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSelectedCollection();
        } else {
            setValue('name', '');
            setValue('description', '');
            setValue('stocks', 0);
            setValue('price', 0);
        }
    }, [selectedCollectionId, setValue]);

    const onSubmit: SubmitHandler<CollectionForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!userId) {
                throw new Error('You must be logged in to update a collection.');
            }
            if (role !== 'owner') {
                throw new Error('Only owners can update collections.');
            }
            if (data.collection_id === 0) {
                throw new Error('Please select a collection to update.');
            }
            await updateCollection(data.collection_id, {
                name: data.name,
                description: data.description || undefined,
                stocks: data.stocks,
                price: data.price,
            });
            reset();
            navigate('/home');
            alert('Collection updated successfully!');
        } catch (err) {
            setError((err as Error).message || 'Failed to update collection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCollection = async () => {
        if (!selectedCollectionId || selectedCollectionId === 0) {
            setError('Please select a collection to delete.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await deleteCollection(selectedCollectionId);
            // Refetch collections instead of filtering
            const updatedCollections = await getCollections();
            setCollections(updatedCollections);
            reset();
            alert('Collection deleted successfully!');
        } catch (err) {
            setError((err as Error).message || 'Failed to delete collection.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!userId) {
        return (
            <div className="collection-page">
                <h2>Update Collection</h2>
                <p>Please log in to update a collection.</p>
            </div>
        );
    }

    if (role !== 'owner') {
        return (
            <div className="collection-page">
                <h2>Update Collection</h2>
                <p>Only owners can update collections.</p>
            </div>
        );
    }

    if (isLoading && !collections.length) {
        return (
            <div className="collection-page">
                <h2>Update Collection</h2>
                <p>Loading collections...</p>
            </div>
        );
    }

    return (
        <div className="collection-page">
            <h2>Update Collection</h2>
            {error && <p className="error">{error}</p>}
            {collections.length === 0 ? (
                <p>No collections available to update.</p>
            ) : (
                <>
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
                            {errors.collection_id && (
                                <span className="error">{errors.collection_id.message}</span>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Collection Name</label>
                            <input
                                id="name"
                                type="text"
                                disabled={isLoading}
                                {...register('name', {
                                    required: 'Name is required',
                                })}
                            />
                            {errors.name && <span className="error">{errors.name.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description (Optional)</label>
                            <textarea
                                id="description"
                                disabled={isLoading}
                                {...register('description')}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="stocks">Stocks</label>
                            <input
                                id="stocks"
                                type="number"
                                disabled={isLoading}
                                {...register('stocks', {
                                    required: 'Stocks is required',
                                    min: { value: 0, message: 'Stocks cannot be negative' },
                                })}
                            />
                            {errors.stocks && <span className="error">{errors.stocks.message}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="price">Price</label>
                            <input
                                id="price"
                                type="number"
                                step="0.01"
                                disabled={isLoading}
                                {...register('price', {
                                    required: 'Price is required',
                                    min: { value: 0.01, message: 'Price must be greater than 0' },
                                })}
                            />
                            {errors.price && <span className="error">{errors.price.message}</span>}
                        </div>
                        <button type="submit" disabled={isLoading || selectedCollectionId === 0}>
                            {isLoading ? 'Updating...' : 'Update Collection'}
                        </button>
                    </form>
                    <button
                        className="delete-button"
                        onClick={handleDeleteCollection}
                        disabled={isLoading || selectedCollectionId === 0}
                    >
                        {isLoading ? 'Deleting...' : 'Delete Collection'}
                    </button>
                </>
            )}
        </div>
    );
};

export default UpdateCollection;