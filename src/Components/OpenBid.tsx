import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { getBids, getCollections, deleteBid } from '../Services/api';
import { useUser } from '../Services/UserContext';
import { Bid, Collection } from '../Interfaces/interface';

const { width } = Dimensions.get('window');
const MAX_WIDTH = Math.min(width * 0.9, 400);
const FORM_WIDTH = MAX_WIDTH * 0.9;

const OpenBid: React.FC = () => {
    const { userId } = useUser();
    const [bids, setBids] = useState<Bid[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState<string>('All');
    const [expandedCollections, setExpandedCollections] = useState<number[]>([]);

    // Animation for shiny effect
    const shineAnim = useRef(new Animated.Value(-1)).current;

    console.log('OpenBid: userId from useUser:', userId);

    useEffect(() => {
        const startShine = () => {
            shineAnim.setValue(-1);
            Animated.timing(shineAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            }).start(() => startShine());
        };
        startShine();

        const fetchData = async () => {
            console.log('OpenBid: Fetching bids and collections');
            setIsLoading(true);
            setError(null);
            try {
                const [bidsData, collectionsData] = await Promise.all([
                    getBids(),
                    getCollections(),
                ]);
                console.log('OpenBid: Received bids:', bidsData);
                console.log('OpenBid: Received collections:', collectionsData);
                const pendingBids = bidsData.filter(
                    (bid) => bid.status === 'pending' && (!userId || bid.user_id === userId)
                );
                setBids(pendingBids);
                setCollections(collectionsData);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to fetch data.';
                console.log('OpenBid: Error fetching data:', errorMessage);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleCancelBid = async (bid: Bid) => {
        console.log('OpenBid: Cancelling bid:', bid.id);
        try {
            await deleteBid(bid.id);
            setBids((prevBids) => prevBids.filter((b) => b.id !== bid.id));
            setError(null);
            console.log('OpenBid: Bid cancelled successfully:', bid.id);
        } catch (err) {
            let errorMessage = 'Failed to cancel bid.';
            if (err instanceof Error) {
                errorMessage = err.message;
                if (errorMessage.includes('404')) {
                    errorMessage = 'Bid not found or already cancelled.';
                    setBids((prevBids) => prevBids.filter((b) => b.id !== bid.id));
                }
            }
            console.log('OpenBid: Error cancelling bid:', errorMessage);
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
        const collectionBids = bids.filter((bid) => bid.collection_id === collection.id);
        if (collectionBids.length > 0) {
            acc[market].push({
                collection,
                bids: collectionBids,
            });
        }
        return acc;
    }, {} as Record<string, { collection: Collection; bids: Bid[] }[]>);

    const filteredGroups =
        selectedMarket === 'All'
            ? Object.values(groupedByMarket).flat()
            : groupedByMarket[selectedMarket] || [];

    const visibleGroups = filteredGroups.filter((group) => group.bids.length > 0);

    const toggleCollection = (collectionId: number) => {
        console.log('OpenBid: Toggling collection:', collectionId);
        setExpandedCollections((prev) =>
            prev.includes(collectionId)
                ? prev.filter((id) => id !== collectionId)
                : [...prev, collectionId]
        );
    };

    if (!userId) {
        console.log('OpenBid: Rendering no-login message');
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Current Bids</Text>
                    <Text style={styles.infoText}>Please log in to view your current bids.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        console.log('OpenBid: Rendering loading message');
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Current Bids</Text>
                    <Text style={styles.infoText}>Loading bids...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        console.log('OpenBid: Rendering error message:', error);
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Current Bids</Text>
                    <Text style={styles.error}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    console.log('OpenBid: Rendering bid list, visibleGroups:', visibleGroups);

    return (
        <SafeAreaView style={styles.bidPage}>
            <View style={styles.container}>
                <Text style={styles.title}>Current Bids</Text>
                <View style={styles.formContainer}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Select Market:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedMarket}
                                onValueChange={(value) => {
                                    console.log('OpenBid: Changing market to:', value);
                                    setSelectedMarket(value);
                                    setExpandedCollections([]);
                                }}
                                style={styles.picker}
                                enabled={!isLoading}
                            >
                                <Picker.Item label="All Markets" value="All" />
                                <Picker.Item label="Europe" value="Europe" />
                                <Picker.Item label="Asia Market" value="Asia Market" />
                                <Picker.Item label="US" value="US" />
                                <Picker.Item label="Global" value="Global" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </View>
                    </View>
                    {visibleGroups.length > 0 ? (
                        <View style={styles.bidList}>
                            {visibleGroups.map((group) => (
                                <View key={group.collection.id} style={styles.collectionGroup}>
                                    <TouchableOpacity
                                        style={styles.collectionHeader}
                                        onPress={() => toggleCollection(group.collection.id)}
                                    >
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
                                        <Text style={styles.collectionHeaderText}>
                                            {group.collection.name} ({group.bids.length} Pending Bid
                                            {group.bids.length !== 1 ? 's' : ''})
                                        </Text>
                                        <Text style={styles.collectionHeaderIcon}>
                                            {expandedCollections.includes(group.collection.id) ? '−' : '+'}
                                        </Text>
                                    </TouchableOpacity>
                                    {expandedCollections.includes(group.collection.id) && (
                                        <View style={styles.bidContent}>
                                            {group.bids.map((bid) => (
                                                <View key={bid.id} style={styles.bidItem}>
                                                    <Text style={styles.bidItemText}>Bid Price: ${bid.price}</Text>
                                                    <Text style={styles.bidItemText}>
                                                        Listing Price: ${group.collection.price}
                                                    </Text>
                                                    <Text style={styles.bidItemText}>
                                                        Number of Bids: {bid.number_bids || 0}
                                                    </Text>
                                                    <Text style={styles.bidItemText}>
                                                        Status: {bid.status || 'Pending'}
                                                    </Text>
                                                    {bid.user_id === userId && (
                                                        <View style={styles.bidActions}>
                                                            <TouchableOpacity
                                                                style={[styles.actionButton, styles.cancelButton]}
                                                                onPress={() => handleCancelBid(bid)}
                                                                disabled={isLoading}
                                                            >
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
                                                                <Text style={styles.actionButtonText}>Cancel Bid</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.infoText}>
                            No current bids available{userId ? ' for your account' : ''} in{' '}
                            {selectedMarket}.
                        </Text>
                    )}
                </View>
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
    bidList: {
        width: '100%',
    },
    collectionGroup: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#4A4A4A',
        borderRadius: 8,
        backgroundColor: '#1E1E1E',
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
    collectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#4A4A4A',
        overflow: 'hidden',
    },
    collectionHeaderText: {
        fontSize: 18,
        color: '#1A1A1A',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    collectionHeaderIcon: {
        fontSize: 18,
        color: '#1A1A1A',
        fontWeight: 'bold',
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
    bidContent: {
        backgroundColor: '#1E1E1E',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    bidItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#4A4A4A',
    },
    bidItemText: {
        color: '#B0B0B0',
        fontSize: 14,
        marginVertical: 6,
        textAlign: 'left',
    },
    bidActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
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
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    cancelButton: {
        overflow: 'hidden',
    },
});

export default OpenBid;