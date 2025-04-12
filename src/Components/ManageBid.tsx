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
import { getBids, getCollections, acceptBid, rejectBid } from '../Services/api';
import { useUser } from '../Services/UserContext';

const { width } = Dimensions.get('window');
const MAX_WIDTH = Math.min(width * 0.9, 400);
const FORM_WIDTH = MAX_WIDTH * 0.9;

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
    price: number;
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

    // Animation for shiny effect
    const shineAnim = useRef(new Animated.Value(-1)).current;

    console.log('ManageBid: userId from useUser:', userId, 'role:', role);

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

        // Fetch data
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
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data.';
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
                prevBids.map((b) => (b.id === bid.id ? { ...b, status: 'accepted' } : b))
            );
            setError(null);
            console.log('ManageBid: Bid accepted:', bid.id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to accept bid.';
            console.log('ManageBid: Error accepting bid:', errorMessage);
            setError(errorMessage);
        }
    };

    const handleRejectBid = async (bid: Bid) => {
        console.log('ManageBid: Rejecting bid:', bid.id);
        try {
            await rejectBid(bid.collection_id, bid.id);
            setBids((prevBids) =>
                prevBids.map((b) => (b.id === bid.id ? { ...b, status: 'rejected' } : b))
            );
            setError(null);
            console.log('ManageBid: Bid rejected:', bid.id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reject bid.';
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

    const formatPrice = (price: number | string | null | undefined): string => {
        if (price === null || price === undefined) {
            console.warn('Price is null or undefined, using 0');
            return '0.00';
        }
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
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

    if (!userId) {
        console.log('ManageBid: Rendering no-login message');
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Manage Bids</Text>
                    <Text style={styles.infoText}>Please log in to manage bids.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (role !== 'owner') {
        console.log('ManageBid: Rendering no-owner message');
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Manage Bids</Text>
                    <Text style={styles.infoText}>Only owners can manage bids.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        console.log('ManageBid: Rendering loading message');
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Manage Bids</Text>
                    <Text style={styles.infoText}>Loading bids...</Text>
                </View>
            </SafeAreaView>
        );
    }

    console.log('ManageBid: Rendering bid list, visibleGroups:', visibleGroups);

    return (
        <SafeAreaView style={styles.bidPage}>
            <View style={styles.container}>
                <Text style={styles.title}>Manage Bids</Text>
                {error && <Text style={styles.error}>{error}</Text>}
                <View style={styles.formContainer}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Select Market:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedMarket}
                                onValueChange={(value) => {
                                    console.log('ManageBid: Changing market to:', value);
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
                    <View style={styles.toggleButtons}>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => handleToggleView('pending')}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={activeView === 'pending' ? ['#FFC107', '#FFCA28', '#FFC107'] : ['#2E2E2E', '#3A3A3A', '#2E2E2E']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            {activeView === 'pending' && (
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
                            )}
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    activeView === 'pending' ? styles.toggleButtonTextActive : null,
                                ]}
                            >
                                Pending Bids
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => handleToggleView('accepted')}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={activeView === 'accepted' ? ['#FFC107', '#FFCA28', '#FFC107'] : ['#2E2E2E', '#3A3A3A', '#2E2E2E']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            {activeView === 'accepted' && (
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
                            )}
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    activeView === 'accepted' ? styles.toggleButtonTextActive : null,
                                ]}
                            >
                                Accepted Bids
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => handleToggleView('rejected')}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={activeView === 'rejected' ? ['#FFC107', '#FFCA28', '#FFC107'] : ['#2E2E2E', '#3A3A3A', '#2E2E2E']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            {activeView === 'rejected' && (
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
                            )}
                            <Text
                                style={[
                                    styles.toggleButtonText,
                                    activeView === 'rejected' ? styles.toggleButtonTextActive : null,
                                ]}
                            >
                                Rejected Bids
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bidList}>
                        {visibleGroups.length > 0 ? (
                            visibleGroups.map((group) => (
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
                                            {group.collection.name} ({group.bids.length} Bid{group.bids.length !== 1 ? 's' : ''})
                                        </Text>
                                        <Text style={styles.collectionHeaderIcon}>
                                            {expandedCollections.includes(group.collection.id) ? '−' : '+'}
                                        </Text>
                                    </TouchableOpacity>
                                    {expandedCollections.includes(group.collection.id) && (
                                        <View style={styles.bidContent}>
                                            {group.bids.map((bid) => (
                                                <View key={bid.id} style={styles.bidItem}>
                                                    <Text style={styles.bidItemText}>Bid Offer: ${formatPrice(bid.price)}</Text>
                                                    <Text style={styles.bidItemText}>Listing Price: ${formatPrice(group.collection.price)}</Text>
                                                    {bid.number_bids && (
                                                        <Text style={styles.bidItemText}>Number of Bids: {bid.number_bids}</Text>
                                                    )}
                                                    <Text style={styles.bidItemText}>Status: {bid.status || 'Pending'}</Text>
                                                    {activeView === 'pending' && (
                                                        <View style={styles.bidActions}>
                                                            <TouchableOpacity
                                                                style={[styles.actionButton, styles.acceptButton]}
                                                                onPress={() => handleAcceptBid(bid)}
                                                                disabled={isLoading}
                                                            >
                                                                <LinearGradient
                                                                    colors={['#28A745', '#34C759', '#28A745']}
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
                                                                <Text style={styles.actionButtonText}>Accept</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={[styles.actionButton, styles.rejectButton]}
                                                                onPress={() => handleRejectBid(bid)}
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
                                                                <Text style={styles.actionButtonText}>Reject</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text style={styles.infoText}>
                                No {activeView} bids available for {selectedMarket}.
                            </Text>
                        )}
                    </View>
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
    toggleButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        flexWrap: 'wrap',
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 5,
        borderRadius: 8,
        minHeight: 50,
        alignItems: 'center',
        justifyContent: 'center',
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
    toggleButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    toggleButtonTextActive: {
        color: '#1A1A1A',
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
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    acceptButton: {},
    rejectButton: {},
});

export default ManageBid;