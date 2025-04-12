import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createCollection } from '../Services/api';
import { useUser } from '../Services/UserContext';
import './Bid.css'; // Reuse Bid.css, or create Collection.css

interface CollectionForm {
    name: string;
    description?: string;
    stocks: number;
    price: number;
}

const CreateCollection: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { userId } = useUser();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CollectionForm>({
        defaultValues: {
            name: '',
            description: '',
            stocks: 0,
            price: 0,
        },
    });

    const onSubmit: SubmitHandler<CollectionForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!userId) {
                throw new Error('You must be logged in to create a collection.');
            }
            await createCollection({
                name: data.name,
                description: data.description || undefined,
                stocks: data.stocks,
                price: data.price,
            });
            reset();
            navigate('/home');
            alert('Collection created successfully!');
        } catch (err) {
            setError((err as Error).message || 'Failed to create collection.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!userId) {
        return (
            <div className="bid-page">
                <h2>Create a New Collection</h2>
                <p>Please log in to create a collection.</p>
            </div>
        );
    }

    return (
        <div className="collection-page">
            <h2>Create a New Collection</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit(onSubmit)}>
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
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Collection'}
                </button>
            </form>
        </div>
    );
};

export default CreateCollection;