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
import { LinearGradient } from 'expo-linear-gradient';
import { getBids, getCollections } from '../Services/api';
import { useUser } from '../Services/UserContext';
import { Bid, Collection } from '../Interfaces/interface';

const { width } = Dimensions.get('window');
const MAX_WIDTH = Math.min(width * 0.9, 400);
const FORM_WIDTH = MAX_WIDTH * 0.9;

const ClosedBid: React.FC = () => {
    const { userId } = useUser();
    const [bids, setBids] = useState<Bid[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'accepted' | 'rejected' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedCollections, setExpandedCollections] = useState<number[]>([]);

    // Animation for shiny effect
    const shineAnim = useRef(new Animated.Value(-1)).current;

    console.log('ClosedBid: userId from useUser:', userId);

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
                    const userClosedBids = bidsData.filter(
                        (bid) =>
                            bid.user_id.toString() === userId &&
                            (bid.status === 'accepted' || bid.status === 'rejected')
                    );
                    setBids(userClosedBids);
                    setCollections(collectionsData);
                    setView(selectedView);
                    setExpandedCollections([]); // Reset expanded collections
                })
                .catch((err) => {
                    const errorMessage =
                        err instanceof Error ? err.message : 'Failed to fetch closed bids.';
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

    const formatPrice = (price: number | string | null | undefined): string => {
        if (price === null || price === undefined) {
            console.warn('Price is null or undefined, using 0');
            return '0.00';
        }
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

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

    if (!userId) {
        console.log('ClosedBid: Rendering no-login message');
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Closed Bids</Text>
                    <Text style={styles.infoText}>Please log in to view your closed bids.</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        console.log('ClosedBid: Rendering error message:', error);
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Closed Bids</Text>
                    <Text style={styles.error}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (isLoading) {
        console.log('ClosedBid: Rendering loading message');
        return (
            <SafeAreaView style={styles.bidPage}>
                <View style={styles.container}>
                    <Text style={styles.title}>Closed Bids</Text>
                    <Text style={styles.infoText}>Loading bids...</Text>
                </View>
            </SafeAreaView>
        );
    }

    console.log('ClosedBid: Rendering, view:', view, 'groupedBids:', groupedBids);

    return (
        <SafeAreaView style={styles.bidPage}>
            <View style={styles.container}>
                <Text style={styles.title}>Closed Bids</Text>
                <View style={styles.formContainer}>
                    <View style={styles.toggleButtons}>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => fetchBids('accepted')}
                        >
                            <LinearGradient
                                colors={view === 'accepted' ? ['#FFC107', '#FFCA28', '#FFC107'] : ['#2E2E2E', '#3A3A3A', '#2E2E2E']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            {view === 'accepted' && (
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
                                    view === 'accepted' ? styles.toggleButtonTextActive : null,
                                ]}
                            >
                                Accepted Bids
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => fetchBids('rejected')}
                        >
                            <LinearGradient
                                colors={view === 'rejected' ? ['#FFC107', '#FFCA28', '#FFC107'] : ['#2E2E2E', '#3A3A3A', '#2E2E2E']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            {view === 'rejected' && (
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
                                    view === 'rejected' ? styles.toggleButtonTextActive : null,
                                ]}
                            >
                                Rejected Bids
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {view ? (
                        groupedBids.length > 0 ? (
                            <View style={styles.bidList}>
                                {groupedBids.map((group) => (
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
                                                {group.collection.name} ({group.bids.length} {view} Bid
                                                {group.bids.length !== 1 ? 's' : ''})
                                            </Text>
                                            <Text style={styles.collectionHeaderIcon}>
                                                {expandedCollections.includes(group.collection.id) ? '−' : '+'}
                                            </Text>
                                        </TouchableOpacity>
                                        {expandedCollections.includes(group.collection.id) && (
                                            <View style={styles.bidContent}>
                                                <View style={styles.tableHeader}>
                                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Under</Text>
                                                    <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Collection Price</Text>
                                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Over</Text>
                                                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Number of Bids</Text>
                                                </View>
                                                {(() => {
                                                    const collectionPrice =
                                                        typeof group.collection.price === 'string'
                                                            ? parseFloat(group.collection.price)
                                                            : group.collection.price || 0;
                                                    const underBids = group.bids.filter(
                                                        (bid) => (bid.price || 0) <= collectionPrice
                                                    );
                                                    const overBids = group.bids.filter(
                                                        (bid) => (bid.price || 0) > collectionPrice
                                                    );
                                                    const allBids = [...underBids, ...overBids];

                                                    return allBids.map((bid) => (
                                                        <View key={bid.id} style={styles.tableRow}>
                                                            <Text
                                                                style={[
                                                                    styles.tableCell,
                                                                    { flex: 1 },
                                                                    (bid.price || 0) <= collectionPrice && styles.highlightRed,
                                                                ]}
                                                            >
                                                                {(bid.price || 0) <= collectionPrice
                                                                    ? `$${formatPrice(bid.price)}`
                                                                    : '-'}
                                                            </Text>
                                                            <Text
                                                                style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold' }]}
                                                            >
                                                                ${formatPrice(group.collection.price)}
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.tableCell,
                                                                    { flex: 1 },
                                                                    (bid.price || 0) > collectionPrice && styles.highlightGreen,
                                                                ]}
                                                            >
                                                                {(bid.price || 0) > collectionPrice
                                                                    ? `$${formatPrice(bid.price)}`
                                                                    : '-'}
                                                            </Text>
                                                            <Text style={[styles.tableCell, { flex: 1 }]}>
                                                                {bid.number_bids !== undefined ? bid.number_bids : '-'}
                                                            </Text>
                                                        </View>
                                                    ));
                                                })()}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.infoText}>
                                No {view} bids available for your account.
                            </Text>
                        )
                    ) : (
                        <Text style={styles.infoText}>Select a view to see your bids.</Text>
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
    toggleButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
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
        paddingBottom: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2E2E2E',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#4A4A4A',
    },
    tableHeaderText: {
        color: '#B0B0B0',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#4A4A4A',
    },
    tableCell: {
        color: '#B0B0B0',
        fontSize: 14,
        textAlign: 'center',
    },
    highlightRed: {
        color: '#DC3545',
        fontWeight: 'bold',
    },
    highlightGreen: {
        color: '#28A745',
        fontWeight: 'bold',
    },
});

export default ClosedBid;