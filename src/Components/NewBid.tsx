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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { getCollections, createBid } from '../Services/api';
import { useUser } from '../Services/UserContext';
import { Collection } from '../Interfaces/interface';

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

interface BidForm {
    collection_id: number;
    price: number;
    number_bids: number;
}

const NewBid: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { userId } = useUser();
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
    } = useForm<BidForm>({
        defaultValues: {
            collection_id: 0,
            price: 0,
            number_bids: 1,
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

        const fetchCollections = async () => {
            setIsLoading(true);
            try {
                const data = await getCollections();
                console.log('NewBid: Received collections:', data);
                setCollections(data);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to fetch collections.';
                console.log('NewBid: Error fetching collections:', errorMessage);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollections();
    }, []);

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
            navigation.navigate('Home');
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to create bid.';
            console.log('NewBid: Error creating bid:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userId) {
        console.log('NewBid: Rendering no-login message');
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Create a New Bid</Text>
                    <Text style={styles.infoText}>Please log in to create a bid.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.bidPage}>
            <View style={styles.container}>
                <Text style={styles.title}>Create a New Bid</Text>
                {error && <Text style={styles.error}>{error}</Text>}
                {isLoading ? (
                    <Text style={styles.infoText}>Loading collections...</Text>
                ) : collections.length === 0 ? (
                    <Text style={styles.infoText}>No collections available to bid on.</Text>
                ) : (
                    <View style={styles.formContainer}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Select Collection</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={watch('collection_id')}
                                    onValueChange={(value) => {
                                        setValue('collection_id', value);
                                    }}
                                    style={styles.picker}
                                    enabled={!isLoading}
                                >
                                    <Picker.Item label="-- Select a Collection --" value={0} />
                                    {collections.map((collection) => (
                                        <Picker.Item
                                            key={collection.id}
                                            label={`${collection.name} (ID: ${collection.id}, Price: $${collection.price})`}
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
                            <Text style={styles.label}>Bid Price</Text>
                            <TextInput
                                style={[styles.input, errors.price && styles.inputError]}
                                keyboardType="numeric"
                                editable={!isLoading}
                                onChangeText={(text) => {
                                    const value = parseFloat(text) || 0;
                                    setValue('price', value);
                                }}
                                placeholder="Enter bid price"
                                placeholderTextColor="#B0B0B0"
                                {...register('price', {
                                    required: 'Price is required',
                                    min: { value: 0.01, message: 'Price must be greater than 0' },
                                })}
                            />
                            {errors.price && <Text style={styles.formError}>{errors.price.message}</Text>}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Number of Bids</Text>
                            <TextInput
                                style={[styles.input, errors.number_bids && styles.inputError]}
                                keyboardType="numeric"
                                editable={!isLoading}
                                onChangeText={(text) => {
                                    const value = parseInt(text, 10) || 1;
                                    setValue('number_bids', value);
                                }}
                                placeholder="Enter number of bids"
                                placeholderTextColor="#B0B0B0"
                                {...register('number_bids', {
                                    required: 'Number of bids is required',
                                    min: { value: 1, message: 'Number of bids must be at least 1' },
                                })}
                            />
                            {errors.number_bids && (
                                <Text style={styles.formError}>{errors.number_bids.message}</Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <View style={StyleSheet.absoluteFill}>
                                    <View style={styles.submitButtonDisabled}>
                                        <Text style={styles.submitButtonTextDisabled}>Submitting...</Text>
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
                                    <Text style={styles.submitButtonText}>Create Bid</Text>
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
    bidPage: {
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
        marginTop: 10,
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

export default NewBid;