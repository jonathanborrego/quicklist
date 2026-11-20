
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import * as Updates from "expo-updates";

const UpdateContext = createContext(null);

export const useAppUpdates = () => useContext(UpdateContext);

const UpdatePrompt = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [checking, setChecking] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [status, setStatus] = useState("Not checked yet");

    const busyRef = useRef(false);

    // Check on launch or when Settings requests a check
    const checkForUpdates = useCallback(async () => {
        if (busyRef.current) return;

        if (__DEV__ || !Updates.isEnabled) {
            setStatus("Update checking requires an installed release build.");
            return;
        }

        busyRef.current = true;
        setChecking(true);
        setStatus("Checking for updates...");

        try {
            const result = await Updates.checkForUpdateAsync();

            if (result.isAvailable) {
                setStatus("Update available");
                setVisible(true);
            } else {
                setStatus("You're up to date");
            }
        } catch (error) {
            console.warn("Update check failed:", error);
            setStatus("Unable to check for updates");
        } finally {
            busyRef.current = false;
            setChecking(false);
        }
    }, []);

    // Check automatically when QuickList opens
    useEffect(() => {
        checkForUpdates();
    }, [checkForUpdates]);

    // Download and install only with permission
    const installUpdate = async () => {
        if (installing) return;

        setInstalling(true);
        setStatus("Downloading update...");

        try {
            const result = await Updates.fetchUpdateAsync();

            if (!result.isNew && !result.isRollBackToEmbedded) {
                throw new Error("No update was downloaded.");
            }

            setStatus("Restarting QuickList...");

            await Updates.reloadAsync();
        } catch (error) {
            console.warn("Update installation failed:", error);
            setStatus("Unable to install update. Try again later.");
            setVisible(false);
        } finally {
            setInstalling(false);
        }
    };

    return (
        <UpdateContext.Provider
            value={{ checkForUpdates, checking, installing, status }}
        >
            {children}

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => {
                    if (!installing) setVisible(false);
                }}
            >
                <View style={styles.overlay}>
                    <View style={styles.card}>
                        <Text style={styles.icon}>↓</Text>

                        <Text style={styles.title}>Update Available</Text>

                        <Text style={styles.description}>
                            A new QuickList update is available.
                            Would you like to install it now?
                        </Text>

                        {installing && (
                            <View style={styles.loading}>
                                <ActivityIndicator color="#38BDF8" />
                                <Text style={styles.status}>{status}</Text>
                            </View>
                        )}

                        <Pressable
                            style={styles.updateButton}
                            onPress={installUpdate}
                            disabled={installing}
                        >
                            <Text style={styles.updateText}>
                                {installing ? "Installing..." : "Update Now"}
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.laterButton}
                            disabled={installing}
                            onPress={() => setVisible(false)}
                        >
                            <Text style={styles.laterText}>Later</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </UpdateContext.Provider>
    );
};

export default UpdatePrompt;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.78)",
        justifyContent: "center",
        paddingHorizontal: 25,
    },
    card: {
        backgroundColor: "#131D31",
        borderWidth: 1,
        borderColor: "#26344F",
        borderRadius: 24,
        padding: 26,
        alignItems: "center",
    },
    icon: {
        color: "#38BDF8",
        fontSize: 45,
        fontWeight: "700",
        marginBottom: 14,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 12,
    },
    description: {
        color: "#94A3B8",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    loading: {
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    status: {
        color: "#94A3B8",
        fontSize: 13,
    },
    updateButton: {
        backgroundColor: "#38BDF8",
        padding: 15,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
        marginBottom: 10,
    },
    updateText: {
        color: "#080D1B",
        fontWeight: "800",
        fontSize: 15,
    },
    laterButton: {
        padding: 14,
        alignItems: "center",
    },
    laterText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});
