import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUser, loginUser, forgotPassword } from '../Services/api';
import { useUser } from '../Services/UserContext';

// Define the navigation param list
type RootStackParamList = {
    Login: undefined;
    Home: undefined;
};

// Type the navigation prop
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoginForm {
    username: string;
    password: string;
}

interface CreateAccountForm {
    name: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    login_pin?: string;
    confirmLoginPin?: string;
}

interface ForgotPasswordForm {
    email: string;
}

const { width } = Dimensions.get('window');
const MAX_WIDTH = Math.min(width * 0.9, 400); // 90% of screen width, capped at 400px

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'create' | 'forgot'>('login');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigation = useNavigation<NavigationProp>();
    const { setUserId, setRole } = useUser();

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const userId = await AsyncStorage.getItem('user_id');
                const role = await AsyncStorage.getItem('role');
                const userData = await AsyncStorage.getItem('user');
                console.log('LoginPage: AsyncStorage check - token:', token, 'userId:', userId, 'role:', role);
                if (token && userId && role && userData) {
                    setIsLoggedIn(true);
                    setUserId(userId);
                    setRole(role as 'user' | 'owner');
                    navigation.navigate('Home');
                }
            } catch (err) {
                console.log('LoginPage: Error reading AsyncStorage:', err);
                setError('Failed to load login state.');
            }
        };
        checkLogin();
    }, [navigation, setUserId, setRole]);

    const {
        register: registerLogin,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
        setValue: setLoginValue,
    } = useForm<LoginForm>();

    const {
        register: registerCreate,
        handleSubmit: handleCreateSubmit,
        watch: watchCreate,
        formState: { errors: createErrors },
        reset: resetCreate,
        setValue: setCreateValue,
    } = useForm<CreateAccountForm>({
        defaultValues: {
            name: '',
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            login_pin: '',
            confirmLoginPin: '',
        },
    });

    const {
        register: registerForgot,
        handleSubmit: handleForgotSubmit,
        formState: { errors: forgotErrors },
        reset: resetForgot,
        setValue: setForgotValue,
    } = useForm<ForgotPasswordForm>();

    const onLogin: SubmitHandler<LoginForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const { token, user } = await loginUser(data);
            if (!user.id || !user.role) {
                throw new Error('User ID or role not provided by server');
            }
            console.log('LoginPage: Saving to AsyncStorage - token:', token, 'user_id:', user.id, 'role:', user.role);
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('user_id', user.id);
            await AsyncStorage.setItem('role', user.role);
            setUserId(user.id);
            setRole(user.role);
            setIsLoggedIn(true);
            navigation.navigate('Home');
        } catch (err) {
            const errorMessage = (err as Error).message || 'Login failed. Please check your credentials.';
            console.log('LoginPage: Login error:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onCreate: SubmitHandler<CreateAccountForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const userData = {
                name: data.name,
                email: data.email,
                username: data.username,
                password: data.password,
                login_pin: data.login_pin,
            };
            await createUser(userData);
            resetCreate();
            setMode('login');
            alert('Account created successfully! Please log in.');
        } catch (err) {
            const errorMessage = (err as Error).message || 'Failed to create account.';
            console.log('LoginPage: Create account error:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onForgot: SubmitHandler<ForgotPasswordForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await forgotPassword(data);
            resetForgot();
            alert('Password reset link sent to your email.');
            setMode('login');
        } catch (err) {
            const errorMessage = (err as Error).message || 'Failed to send reset link.';
            console.log('LoginPage: Forgot password error:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            console.log('LoginPage: Clearing AsyncStorage');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('user_id');
            await AsyncStorage.removeItem('role');
            setUserId(null);
            setRole(null);
            setIsLoggedIn(false);
            setError(null);
            navigation.navigate('Login');
        } catch (err) {
            console.log('LoginPage: Error clearing AsyncStorage:', err);
            setError('Failed to log out.');
        } finally {
            setIsLoading(false);
        }
    };

    const password = watchCreate('password');
    const loginPin = watchCreate('login_pin');

    return (
        <SafeAreaView style={styles.loginPage}>
            <View style={styles.container}>
                <Text style={styles.title}>
                    {mode === 'login' ? 'Login' : mode === 'create' ? 'Create Account' : 'Forgot Password'}
                </Text>
                {error && <Text style={styles.error}>{error}</Text>}
                {isLoggedIn && (
                    <View style={styles.loggedInMessage}>
                        <Text style={styles.loggedInText}>You are logged in.</Text>
                        <TouchableOpacity
                            style={isLoading ? styles.submitButtonDisabled : styles.submitButton}
                            onPress={handleLogout}
                            disabled={isLoading}
                        >
                            <Text
                                style={isLoading ? styles.submitButtonDisabledText : styles.submitButtonText}
                            >
                                Logout
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                            <Text style={styles.homeLink}>Go to Homepage</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Login Form */}
                {mode === 'login' && !isLoggedIn && (
                    <View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={[styles.input, loginErrors.username && styles.inputError]}
                                editable={!isLoading}
                                onChangeText={(text) => setLoginValue('username', text)}
                                placeholder="Username"
                                placeholderTextColor="#B0B0B0"
                                {...registerLogin('username', { required: 'Username is required' })}
                            />
                            {loginErrors.username && <Text style={styles.error}>{loginErrors.username.message}</Text>}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={[styles.input, loginErrors.password && styles.inputError]}
                                editable={!isLoading}
                                secureTextEntry
                                onChangeText={(text) => setLoginValue('password', text)}
                                placeholder="Password"
                                placeholderTextColor="#B0B0B0"
                                {...registerLogin('password', { required: 'Password is required' })}
                            />
                            {loginErrors.password && <Text style={styles.error}>{loginErrors.password.message}</Text>}
                        </View>
                        <TouchableOpacity
                            style={isLoading ? styles.submitButtonDisabled : styles.submitButton}
                            onPress={handleLoginSubmit(onLogin)}
                            disabled={isLoading}
                        >
                            <Text
                                style={isLoading ? styles.submitButtonDisabledText : styles.submitButtonText}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.formLinks}>
                            <TouchableOpacity
                                onPress={() => setMode('create')}
                                disabled={isLoading}
                            >
                                <Text style={isLoading ? styles.formLinkButtonDisabled : styles.formLinkButton}>
                                    Create Account
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMode('forgot')}
                                disabled={isLoading}
                            >
                                <Text style={isLoading ? styles.formLinkButtonDisabled : styles.formLinkButton}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Create Account Form */}
                {mode === 'create' && !isLoggedIn && (
                    <View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={[styles.input, createErrors.name && styles.inputError]}
                                editable={!isLoading}
                                onChangeText={(text) => setCreateValue('name', text)}
                                placeholder="Name"
                                placeholderTextColor="#B0B0B0"
                                {...registerCreate('name', { required: 'Name is required' })}
                            />
                            {createErrors.name && <Text style={styles.error}>{createErrors.name.message}</Text>}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[styles.input, createErrors.email && styles.inputError]}
                                editable={!isLoading}
                                keyboardType="email-address"
                                onChangeText={(text) => setCreateValue('email', text)}
                                placeholder="Email"
                                placeholderTextColor="#B0B0B0"
                                {...registerCreate('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                                })}
                            />
                            {createErrors.email && <Text style={styles.error}>{createErrors.email.message}</Text>}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={[styles.input, createErrors.username && styles.inputError]}
                                editable={!isLoading}
                                onChangeText={(text) => setCreateValue('username', text)}
                                placeholder="Username"
                                placeholderTextColor="#B0B0B0"
                                {...registerCreate('username', { required: 'Username is required' })}
                            />
                            {createErrors.username && <Text style={styles.error}>{createErrors.username.message}</Text>}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={[styles.input, createErrors.password && styles.inputError]}
                                editable={!isLoading}
                                secureTextEntry
                                onChangeText={(text) => setCreateValue('password', text)}
                                placeholder="Password"
                                placeholderTextColor="#B0B0B0"
                                {...registerCreate('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                })}
                            />
                            {createErrors.password && <Text style={styles.error}>{createErrors.password.message}</Text>}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={[styles.input, createErrors.confirmPassword && styles.inputError]}
                                editable={!isLoading}
                                secureTextEntry
                                onChangeText={(text) => setCreateValue('confirmPassword', text)}
                                placeholder="Confirm Password"
                                placeholderTextColor="#B0B0B0"
                                {...registerCreate('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) => value === password || 'Passwords do not match',
                                })}
                            />
                            {createErrors.confirmPassword && (
                                <Text style={styles.error}>{createErrors.confirmPassword.message}</Text>
                            )}
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Login PIN (Optional)</Text>
                            <TextInput
                                style={[styles.input, createErrors.login_pin && styles.inputError]}
                                editable={!isLoading}
                                onChangeText={(text) => setCreateValue('login_pin', text)}
                                placeholder="Login PIN"
                                placeholderTextColor="#B0B0B0"
                                {...registerCreate('login_pin')}
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirm Login PIN (Required if PIN is set)</Text>
                            <TextInput
                                style={[styles.input, createErrors.confirmLoginPin && styles.inputError]}
                                editable={!isLoading}
                                onChangeText={(text) => setCreateValue('confirmLoginPin', text)}
                                placeholder="Confirm Login PIN"
                                placeholderTextColor="#B0B0B0"
                                {...registerCreate('confirmLoginPin', {
                                    validate: (value) =>
                                        !loginPin || value === loginPin || 'Login PINs do not match',
                                })}
                            />
                            {createErrors.confirmLoginPin && (
                                <Text style={styles.error}>{createErrors.confirmLoginPin.message}</Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={isLoading ? styles.submitButtonDisabled : styles.submitButton}
                            onPress={handleCreateSubmit(onCreate)}
                            disabled={isLoading}
                        >
                            <Text
                                style={isLoading ? styles.submitButtonDisabledText : styles.submitButtonText}
                            >
                                {isLoading ? 'Creating...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.formLinks}>
                            <TouchableOpacity
                                onPress={() => setMode('login')}
                                disabled={isLoading}
                            >
                                <Text style={isLoading ? styles.formLinkButtonDisabled : styles.formLinkButton}>
                                    Back to Login
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.homeLink}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Forgot Password Form */}
                {mode === 'forgot' && !isLoggedIn && (
                    <View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[styles.input, forgotErrors.email && styles.inputError]}
                                editable={!isLoading}
                                keyboardType="email-address"
                                onChangeText={(text) => setForgotValue('email', text)}
                                placeholder="Email"
                                placeholderTextColor="#B0B0B0"
                                {...registerForgot('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                                })}
                            />
                            {forgotErrors.email && <Text style={styles.error}>{forgotErrors.email.message}</Text>}
                        </View>
                        <TouchableOpacity
                            style={isLoading ? styles.submitButtonDisabled : styles.submitButton}
                            onPress={handleForgotSubmit(onForgot)}
                            disabled={isLoading}
                        >
                            <Text
                                style={isLoading ? styles.submitButtonDisabledText : styles.submitButtonText}
                            >
                                {isLoading ? 'Sending...' : 'Reset Password'}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.formLinks}>
                            <TouchableOpacity
                                onPress={() => setMode('login')}
                                disabled={isLoading}
                            >
                                <Text style={isLoading ? styles.formLinkButtonDisabled : styles.formLinkButton}>
                                    Back to Login
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.homeLink}>Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loginPage: {
        flex: 1,
        backgroundColor: '#1A1A1A', // Fallback for linear-gradient
        alignItems: 'center',
    },
    container: {
        flex: 1,
        width: '90%', // Responsive width
        maxWidth: MAX_WIDTH,
        paddingHorizontal: 20,
        paddingVertical: 40, // Extra padding for safe area
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loggedInMessage: {
        marginBottom: 24,
        alignItems: 'center',
    },
    loggedInText: {
        color: '#B0B0B0',
        fontSize: 16,
        marginBottom: 12,
    },
    homeLink: {
        marginTop: 16,
        color: '#007BFF',
        fontSize: 14,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    formGroup: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        marginBottom: 6,
        fontWeight: '600',
        color: '#B0B0B0',
        fontSize: 16,
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
        minHeight: 48, // Standard touch target
    },
    inputError: {
        borderColor: '#FF4D4F',
    },
    error: {
        color: '#FF4D4F',
        fontSize: 14,
        marginTop: 6,
        marginBottom: 12,
        textAlign: 'left',
    },
    submitButton: {
        width: '100%',
        paddingVertical: 14, // Larger for touch
        backgroundColor: '#FFC107',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48, // Standard touch target
    },
    submitButtonText: {
        color: '#1A1A1A',
        fontWeight: '600',
        fontSize: 18, // Larger for readability
    },
    submitButtonDisabled: {
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#4A4A4A',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    submitButtonDisabledText: {
        color: '#B0B0B0',
        fontWeight: '600',
        fontSize: 18,
    },
    formLinks: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 16,
    },
    formLinkButton: {
        color: '#007BFF',
        fontSize: 14,
        textDecorationLine: 'underline',
        minHeight: 44, // Touch target
        paddingVertical: 10,
    },
    formLinkButtonDisabled: {
        color: '#4A4A4A',
        fontSize: 14,
        minHeight: 44,
        paddingVertical: 10,
    },
});

export default LoginPage;