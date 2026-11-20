
import React from "react";

import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";

import SmoothTouchable from "../components/SmoothTouchable";

import { SafeAreaView } from "react-native-safe-area-context";
import * as Application from "expo-application";
import Constants from "expo-constants";

import { useAppUpdates } from "../components/UpdatePrompt";

const Settings = () => {
    const { checkForUpdates, checking, installing, status } =
        useAppUpdates();

    const isExpoGo = Constants.appOwnership === "expo";

    const appVersion = isExpoGo
        ? Constants.expoConfig?.version ?? "—"
        : Application.nativeApplicationVersion ?? "—";

    const buildNumber = isExpoGo
        ? String(
            Platform.OS === "ios"
                ? Constants.expoConfig?.ios?.buildNumber ?? "—"
                : Constants.expoConfig?.android?.versionCode ?? "—"
        )
        : Application.nativeBuildVersion ?? "—";

    return (
        <SafeAreaView
            style={styles.container}
            edges={["left", "right", "bottom"]}
        >
            <View style={styles.header}>
                <Text style={styles.brand}>✦ QUICKLIST</Text>

                <Text style={styles.title}>Settings</Text>
                <Text style={styles.subtitle}>
                    Manage your application.
                </Text>
            </View>

            {/* App Information */}
            <Text style={styles.sectionLabel}>APP INFORMATION</Text>

            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>App Version</Text>
                    <Text style={styles.value}>{appVersion}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.label}>Build Number</Text>
                    <Text style={styles.value}>{buildNumber}</Text>
                </View>
            </View>

            {/* Software Updates */}
            <Text style={styles.sectionLabel}>SOFTWARE UPDATES</Text>

            <View style={styles.card}>
                <Text style={styles.updateTitle}>Update Status</Text>

                <Text style={styles.updateStatus}>{status}</Text>

                <SmoothTouchable
                    style={[
                        styles.updateButton,
                        (checking || installing) && styles.disabledButton,
                    ]}
                    onPress={checkForUpdates}
                    disabled={checking || installing}
                >
                    {checking ? (
                        <ActivityIndicator color="#080D1B" />
                    ) : (
                        <Text style={styles.buttonText}>
                            Check for Updates
                        </Text>
                    )}
                </SmoothTouchable>
            </View>
        </SafeAreaView>
    );
};

export default Settings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080D1B",
        paddingHorizontal: 22,
    },
    header: {
        marginBottom: 35,
    },
    brand: {
        color: "#38BDF8",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 3,
        marginBottom: 22,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 32,
        fontWeight: "800",
        marginBottom: 8,
    },
    subtitle: {
        color: "#94A3B8",
        fontSize: 14,
    },
    sectionLabel: {
        color: "#38BDF8",
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 2,
        marginBottom: 14,
    },
    card: {
        backgroundColor: "#131D31",
        borderWidth: 1,
        borderColor: "#26344F",
        borderRadius: 18,
        padding: 20,
        marginBottom: 30,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        color: "#94A3B8",
        fontSize: 14,
    },
    value: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "#26344F",
        marginVertical: 18,
    },
    updateTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },
    updateStatus: {
        color: "#94A3B8",
        fontSize: 14,
        marginBottom: 22,
    },
    updateButton: {
        backgroundColor: "#38BDF8",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#080D1B",
        fontSize: 15,
        fontWeight: "800",
    },
});
