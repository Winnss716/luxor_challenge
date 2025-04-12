import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OpenBid from '../Components/OpenBid';
import ClosedBid from '../Components/ClosedBid';
import NewBid from '../Components/NewBid';
import CreateCollection from '../Components/CreateCollection';
import UpdateCollection from '../Components/UpdateCollection';
import ManageBid from '../Components/ManageBid';
import { useUser } from '../Services/UserContext';

// Define navigation param list
type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Collections?: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    login_pin?: string;
    role?: 'user' | 'owner';
}

const { width } = Dimensions.get('window');
const CONTENT_MAX_WIDTH = Math.min(width * 0.9, 400);

const HomePage: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentView, setCurrentView] = useState<
        'home' | 'new' | 'open' | 'closed' | 'create_collection' | 'update_collection' | 'manage_bids'
    >('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigation = useNavigation<NavigationProp>();
    const { userId, role, setUserId, setRole } = useUser();

    useEffect(() => {
        const checkLogin = async () => {
            console.log('HomePage: User ID from useUser:', userId);
            try {
                const token = await AsyncStorage.getItem('token');
                const userData = await AsyncStorage.getItem('user');
                console.log('HomePage: AsyncStorage check - token:', token, 'userData:', userData);
                if (token && userData) {
                    setIsLoggedIn(true);
                    setUser(JSON.parse(userData));
                } else {
                    navigation.navigate('Login');
                }
            } catch (err) {
                console.log('HomePage: Error reading AsyncStorage:', err);
                navigation.navigate('Login');
            }
        };
        checkLogin();
    }, [navigation, userId]);

    const handleLogout = async () => {
        try {
            console.log('HomePage: Clearing AsyncStorage');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('user_id');
            await AsyncStorage.removeItem('role');
            setUserId(null);
            setRole(null);
            setIsLoggedIn(false);
            setUser(null);
            setIsMenuOpen(false);
            navigation.navigate('Login');
        } catch (err) {
            console.log('HomePage: Error clearing AsyncStorage:', err);
        }
    };

    const handleSetView = (
        view: 'home' | 'new' | 'open' | 'closed' | 'create_collection' | 'update_collection' | 'manage_bids'
    ) => {
        console.log('HomePage: Setting currentView to:', view);
        setCurrentView(view);
        setIsMenuOpen(false); // Close menu after selection
    };

    const toggleMenu = () => {
        console.log('HomePage: Toggling menu, current state:', isMenuOpen);
        setIsMenuOpen(!isMenuOpen);
    };

    const renderView = () => {
        console.log('HomePage: Rendering view:', currentView);
        switch (currentView) {
            case 'new':
                return <NewBid />;
            case 'open':
                return <OpenBid />;
            case 'closed':
                return <ClosedBid />;
            case 'create_collection':
                return <CreateCollection />;
            case 'update_collection':
                return <UpdateCollection />;
            case 'manage_bids':
                return <ManageBid />;
            case 'home':
            default:
                return (
                    <View style={styles.homeContent}>
                        <Text style={styles.title}>Welcome to the Marketplace</Text>
                        {isLoggedIn && user ? (
                            <View>
                                <View style={styles.loggedInMessage}>
                                    <Text style={styles.loggedInText}>
                                        Hello, {user.name}! You are logged in as {user.username}.
                                    </Text>
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={styles.subtitle}>Your Information</Text>
                                    <Text style={styles.infoText}>Email: {user.email}</Text>
                                    <Text style={styles.infoText}>Username: {user.username}</Text>
                                    {user.login_pin && <Text style={styles.infoText}>Login PIN: {user.login_pin}</Text>}
                                    {user.role && <Text style={styles.infoText}>Role: {user.role}</Text>}
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.infoText}>Please log in to view your information.</Text>
                        )}
                    </View>
                );
        }
    };

    const menuOptions = [
        { label: 'Home', value: 'home' },
        ...(isLoggedIn && role === 'user'
            ? [
                { label: 'Create New Bid', value: 'new' },
                { label: 'View Current Bids', value: 'open' },
                { label: 'View Closed Bids', value: 'closed' },
            ]
            : []),
        ...(isLoggedIn && role === 'owner'
            ? [
                { label: 'Create Collection', value: 'create_collection' },
                { label: 'Update Collection', value: 'update_collection' },
                { label: 'Manage Bids', value: 'manage_bids' },
            ]
            : []),
        ...(isLoggedIn ? [{ label: 'Logout', value: 'logout' }] : []),
    ];

    return (
        <SafeAreaView style={styles.homePage}>
            <View style={styles.container}>
                <View style={styles.header}>
                    {isLoggedIn && (
                        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
                            <Text style={styles.menuIcon}>☰</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {isMenuOpen && isLoggedIn && (
                    <View style={styles.menuOverlay}>
                        {menuOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.menuItem}
                                onPress={() => {
                                    if (option.value === 'logout') {
                                        handleLogout();
                                    } else {
                                        handleSetView(option.value as any);
                                    }
                                }}
                            >
                                <Text style={styles.menuItemText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <ScrollView contentContainerStyle={styles.mainContent}>
                    {renderView()}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    homePage: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center', // Center children horizontally
    },
    header: {
        backgroundColor: '#1F1F1F',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#4A4A4A',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
    },
    menuButton: {
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIcon: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    menuOverlay: {
        backgroundColor: '#1F1F1F',
        position: 'absolute',
        top: 60,
        left: 16,
        width: 200,
        borderWidth: 1,
        borderColor: '#4A4A4A',
        borderRadius: 4,
        zIndex: 1000,
        paddingVertical: 8,
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#FFC107',
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 4,
        alignItems: 'center',
    },
    menuItemText: {
        color: '#1A1A1A',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Arial',
    },
    mainContent: {
        flexGrow: 1,
        alignItems: 'center',
        width: '100%',
        maxWidth: CONTENT_MAX_WIDTH,
        alignSelf: 'center', // Center the mainContent within the ScrollView
    },
    homeContent: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Arial',
    },
    loggedInMessage: {
        marginBottom: 20,
        alignItems: 'center',
    },
    loggedInText: {
        color: '#B0B0B0',
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'Arial',
    },
    userInfo: {
        marginTop: 20,
        marginBottom: 24,
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: 'Arial',
    },
    infoText: {
        color: '#B0B0B0',
        fontSize: 16,
        marginVertical: 10,
        textAlign: 'center',
        fontFamily: 'Arial',
    },
    homeLink: {
        color: '#007BFF',
        fontSize: 14,
        marginTop: 15,
        textAlign: 'center',
        minHeight: 44,
        paddingVertical: 10,
        fontFamily: 'Arial',
    },
});

export default HomePage;