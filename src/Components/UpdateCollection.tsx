import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    Animated,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { getCollections, getCollectionById, updateCollection, deleteCollection } from '../Services/api';
import { useUser } from '../Services/UserContext';

// Define navigation param list
type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Collections?: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const MAX_WIDTH = Math.min(width * 0.9, 400);
const FORM_WIDTH = MAX_WIDTH * 0.9;

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
    const { userId, role } = useUser();
    const navigation = useNavigation<NavigationProp>();

    // Animation for shiny effect
    const shineAnim = useRef(new Animated.Value(-1)).current;

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

    useEffect(() => {
        // Start shine animation
        const startShine = () => {
            shineAnim.setValue(-1);
            Animated.timing(shineAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            }).start(() => startShine());
        };
        startShine();

        // Fetch collections
        const fetchCollections = async () => {
            setIsLoading(true);
            try {
                const data = await getCollections();
                console.log('UpdateCollection: Received collections:', data);
                setCollections(data);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to fetch collections.';
                console.log('UpdateCollection: Error fetching collections:', errorMessage);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollections();
    }, []);

    // Watch for collection_id changes
    const selectedCollectionId = watch('collection_id');

    useEffect(() => {
        if (selectedCollectionId && selectedCollectionId !== 0) {
            const fetchSelectedCollection = async () => {
                setIsLoading(true);
                try {
                    const collection = await getCollectionById(selectedCollectionId);
                    console.log('UpdateCollection: Received collection:', collection);
                    setValue('name', collection.name, { shouldValidate: true });
                    setValue('description', collection.description || '', { shouldValidate: true });
                    setValue('stocks', collection.stocks, { shouldValidate: true });
                    setValue('price', collection.price, { shouldValidate: true });
                } catch (err) {
                    const errorMessage =
                        err instanceof Error ? err.message : 'Failed to fetch collection details.';
                    console.log('UpdateCollection: Error fetching collection:', errorMessage);
                    setError(errorMessage);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSelectedCollection();
        } else {
            // Clear form when no collection is selected
            setValue('name', '', { shouldValidate: true });
            setValue('description', '', { shouldValidate: true });
            setValue('stocks', 0, { shouldValidate: true });
            setValue('price', 0, { shouldValidate: true });
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
            console.log('UpdateCollection: Updating collection:', data.collection_id);
            await updateCollection(data.collection_id, {
                name: data.name,
                description: data.description || undefined,
                stocks: data.stocks,
                price: data.price,
            });
            console.log('UpdateCollection: Collection updated successfully');
            reset();
            navigation.navigate('Home');
            alert('Collection updated successfully!');
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to update collection.';
            console.log('UpdateCollection: Error updating collection:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCollection = async () => {
        if (!selectedCollectionId || selectedCollectionId === 0) {
            setError('Please select a collection to delete.');
            return;
        }
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this collection? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        setError(null);
                        try {
                            console.log('UpdateCollection: Deleting collection:', selectedCollectionId);
                            await deleteCollection(selectedCollectionId);
                            const updatedCollections = await getCollections();
                            console.log('UpdateCollection: Refetched collections:', updatedCollections);
                            setCollections(updatedCollections);
                            reset();
                            alert('Collection deleted successfully!');
                        } catch (err) {
                            const errorMessage =
                                err instanceof Error ? err.message : 'Failed to delete collection.';
                            console.log('UpdateCollection: Error deleting collection:', errorMessage);
                            setError(errorMessage);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    if (!userId) {
        console.log('UpdateCollection: Rendering no-login message');
        return (
            <SafeAreaView style={styles.collectionPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Update Collection</Text>
                    <Text style={styles.infoText}>Please log in to update a collection.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (role !== 'owner') {
        console.log('UpdateCollection: Rendering no-owner message');
        return (
            <SafeAreaView style={styles.collectionPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Update Collection</Text>
                    <Text style={styles.infoText}>Only owners can update collections.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoading && !collections.length) {
        console.log('UpdateCollection: Rendering loading message');
        return (
            <SafeAreaView style={styles.collectionPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Update Collection</Text>
                    <Text style={styles.infoText}>Loading collections...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.collectionPage}>
            <View style={styles.container}>
                <Text style={styles.title}>Update Collection</Text>
                {error && <Text style={styles.error}>{error}</Text>}
                {collections.length === 0 ? (
                    <Text style={styles.infoText}>No collections available to update.</Text>
                ) : (
                    <View style={styles.formContainer}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Select Collection</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={watch('collection_id')}
                                    onValueChange={(value) => {
                                        setValue('collection_id', value, { shouldValidate: true });
                                    }}
                                    style={styles.picker}
                                    enabled={!isLoading}
                                >
                                    <Picker.Item label="-- Select a Collection --" value={0} />
                                    {collections.map((collection) => (
                                        <Picker.Item
                                            key={collection.id}
                                            label={collection.name}
                                            value={collection.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                            {errors.collection_id && (
                                <Text style={styles.formError}>
                                    {errors.collection_id.message || 'Please select a valid collection'}
                                </Text>
                            )}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Collection Name</Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                editable={!isLoading}
                                onChangeText={(text) => setValue('name', text, { shouldValidate: true })}
                                placeholder="Enter collection name"
                                placeholderTextColor="#B0B0B0"
                                value={watch('name')}
                                {...register('name', {
                                    required: 'Name is required',
                                })}
                            />
                            {errors.name && <Text style={styles.formError}>{errors.name.message}</Text>}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                editable={!isLoading}
                                multiline
                                numberOfLines={4}
                                onChangeText={(text) => setValue('description', text, { shouldValidate: true })}
                                placeholder="Enter description"
                                placeholderTextColor="#B0B0B0"
                                value={watch('description')}
                                {...register('description')}
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Stocks</Text>
                            <TextInput
                                style={[styles.input, errors.stocks && styles.inputError]}
                                keyboardType="numeric"
                                editable={!isLoading}
                                onChangeText={(text) => {
                                    const value = parseInt(text, 10) || 0;
                                    setValue('stocks', value, { shouldValidate: true });
                                }}
                                placeholder="Enter number of stocks"
                                placeholderTextColor="#B0B0B0"
                                value={watch('stocks').toString()}
                                {...register('stocks', {
                                    required: 'Stocks is required',
                                    min: { value: 0, message: 'Stocks cannot be negative' },
                                })}
                            />
                            {errors.stocks && <Text style={styles.formError}>{errors.stocks.message}</Text>}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Price</Text>
                            <TextInput
                                style={[styles.input, errors.price && styles.inputError]}
                                keyboardType="numeric"
                                editable={!isLoading}
                                onChangeText={(text) => {
                                    const value = parseFloat(text) || 0;
                                    setValue('price', value, { shouldValidate: true });
                                }}
                                placeholder="Enter price"
                                placeholderTextColor="#B0B0B0"
                                value={watch('price').toString()}
                                {...register('price', {
                                    required: 'Price is required',
                                    min: { value: 0.01, message: 'Price must be greater than 0' },
                                })}
                            />
                            {errors.price && <Text style={styles.formError}>{errors.price.message}</Text>}
                        </View>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading || selectedCollectionId === 0}
                        >
                            {isLoading || selectedCollectionId === 0 ? (
                                <View style={StyleSheet.absoluteFill}>
                                    <View style={styles.submitButtonDisabled}>
                                        <Text style={styles.submitButtonTextDisabled}>
                                            {isLoading ? 'Updating...' : 'Update Collection'}
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <LinearGradient
                                        colors={['#FFC107', '#FFCA28', '#FFC107']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <Animated.View
                                        style={[
                                            styles.shineOverlay,
                                            {
                                                transform: [
                                                    {
                                                        translateX: shineAnim.interpolate({
                                                            inputRange: [-1, 1],
                                                            outputRange: [-width, width],
                                                        }),
                                                    },
                                                ],
                                            },
                                        ]}
                                    />
                                    <Text style={styles.submitButtonText}>Update Collection</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeleteCollection}
                            disabled={isLoading || selectedCollectionId === 0}
                        >
                            {isLoading || selectedCollectionId === 0 ? (
                                <View style={StyleSheet.absoluteFill}>
                                    <View style={styles.deleteButtonDisabled}>
                                        <Text style={styles.deleteButtonTextDisabled}>
                                            {isLoading ? 'Deleting...' : 'Delete Collection'}
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <LinearGradient
                                        colors={['#DC3545', '#FF4D4F', '#DC3545']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                    <Animated.View
                                        style={[
                                            styles.shineOverlay,
                                            {
                                                transform: [
                                                    {
                                                        translateX: shineAnim.interpolate({
                                                            inputRange: [-1, 1],
                                                            outputRange: [-width, width],
                                                        }),
                                                    },
                                                ],
                                            },
                                        ]}
                                    />
                                    <Text style={styles.deleteButtonText}>Delete Collection</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    collectionPage: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    container: {
        flex: 1,
        width: '100%',
        maxWidth: MAX_WIDTH,
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
    },
    infoText: {
        color: '#B0B0B0',
        fontSize: 16,
        textAlign: 'center',
        width: '100%',
    },
    error: {
        color: '#FF4D4F',
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
        width: '100%',
    },
    formContainer: {
        width: FORM_WIDTH,
        alignItems: 'center',
    },
    formGroup: {
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    label: {
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#B0B0B0',
        fontSize: 16,
        textAlign: 'center',
        width: '100%',
    },
    pickerContainer: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#4A4A4A',
        borderRadius: 8,
        backgroundColor: '#2E2E2E',
        minHeight: 50,
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    picker: {
        width: '100%',
        color: '#FFFFFF',
        fontSize: 16,
        height: Platform.OS === 'ios' ? 120 : 50,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#4A4A4A',
        borderRadius: 8,
        backgroundColor: '#2E2E2E',
        color: '#FFFFFF',
        fontSize: 16,
        minHeight: 50,
        textAlign: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    textarea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#FF4D4F',
    },
    formError: {
        color: '#FF4D4F',
        fontSize: 14,
        marginTop: 8,
        paddingHorizontal: 4,
        textAlign: 'center',
        width: '100%',
    },
    submitButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        marginBottom: 10,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    submitButtonText: {
        color: '#1A1A1A',
        fontWeight: 'bold',
        fontSize: 16,
    },
    submitButtonDisabled: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: '#4A4A4A',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        marginBottom: 10,
    },
    submitButtonTextDisabled: {
        color: '#B0B0B0',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deleteButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        marginTop: 10,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deleteButtonDisabled: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: '#4A4A4A',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
        marginTop: 10,
    },
    deleteButtonTextDisabled: {
        color: '#B0B0B0',
        fontWeight: 'bold',
        fontSize: 16,
    },
    shineOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        opacity: 0.5,
        transform: [{ rotate: '45deg' }],
        width: '50%',
    },
});

export default UpdateCollection;