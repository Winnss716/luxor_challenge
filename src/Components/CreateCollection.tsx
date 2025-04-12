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
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { createCollection } from '../Services/api';
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
    name: string;
    description?: string;
    stocks: number;
    price: number;
}

const CreateCollection: React.FC = () => {
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
    } = useForm<CollectionForm>({
        defaultValues: {
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
    }, []);

    const onSubmit: SubmitHandler<CollectionForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!userId) {
                throw new Error('You must be logged in to create a collection.');
            }
            console.log('CreateCollection: Submitting collection with userId:', userId);
            await createCollection({
                name: data.name,
                description: data.description || undefined,
                stocks: data.stocks,
                price: data.price,
            });
            console.log('CreateCollection: Collection created successfully');
            reset();
            navigation.navigate('Home');
            alert('Collection created successfully!');
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to create collection.';
            console.log('CreateCollection: Error creating collection:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userId) {
        console.log('CreateCollection: Rendering no-login message');
        return (
            <SafeAreaView style={styles.collectionPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Create a New Collection</Text>
                    <Text style={styles.infoText}>Please log in to create a collection.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.collectionPage}>
            <View style={styles.container}>
                <Text style={styles.title}>Create a New Collection</Text>
                {error && <Text style={styles.error}>{error}</Text>}
                <View style={styles.formContainer}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Collection Name</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            editable={!isLoading}
                            onChangeText={(text) => setValue('name', text)}
                            placeholder="Enter collection name"
                            placeholderTextColor="#B0B0B0"
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
                            onChangeText={(text) => setValue('description', text)}
                            placeholder="Enter description"
                            placeholderTextColor="#B0B0B0"
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
                                setValue('stocks', value);
                            }}
                            placeholder="Enter number of stocks"
                            placeholderTextColor="#B0B0B0"
                            {...register('stocks', {
                                required: 'Stocks is required',
                                min: { value: 0, message: 'Stocks cannot be negative' },
                            })}
                        />
                        {errors.stocks && (
                            <Text style={styles.formError}>{errors.stocks.message}</Text>
                        )}
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Price</Text>
                        <TextInput
                            style={[styles.input, errors.price && styles.inputError]}
                            keyboardType="numeric"
                            editable={!isLoading}
                            onChangeText={(text) => {
                                const value = parseFloat(text) || 0;
                                setValue('price', value);
                            }}
                            placeholder="Enter price"
                            placeholderTextColor="#B0B0B0"
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
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <View style={StyleSheet.absoluteFill}>
                                <View style={styles.submitButtonDisabled}>
                                    <Text style={styles.submitButtonTextDisabled}>Creating...</Text>
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
                                <Text style={styles.submitButtonText}>Create Collection</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
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

export default CreateCollection;