import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
    userId: string | null;
    role: 'user' | 'owner' | null;
    setUserId: (userId: string | null) => void;
    setRole: (role: 'user' | 'owner' | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [role, setRole] = useState<'user' | 'owner' | null>(null);

    return (
        <UserContext.Provider value={{ userId, role, setUserId, setRole }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};