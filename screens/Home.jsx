
import React, { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import SwipeToDelete from "../components/SwipeToDelete";

import SmoothTouchable from "../components/SmoothTouchable";

import { Ionicons } from "@expo/vector-icons";





const Home = ({ navigation }) => {
    const [lists, setLists] = useState([]);
    const [listName, setListName] = useState("");
    const [loaded, setLoaded] = useState(false);

    // Load saved lists
    useEffect(() => {
        const loadLists = async () => {
            try {
                const saved = await AsyncStorage.getItem("@quicklist_lists");

                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) setLists(parsed);
                }
            } catch (error) {
                console.warn("Could not load lists:", error);
            } finally {
                setLoaded(true);
            }
        };

        loadLists();
    }, []);

    // Save lists automatically
    useEffect(() => {
        if (!loaded) return;

        AsyncStorage.setItem(
            "@quicklist_lists",
            JSON.stringify(lists)
        ).catch((error) => console.warn("Could not save lists:", error));
    }, [lists, loaded]);

    // Create a new list
    const addList = () => {
        const name = listName.trim();
        if (!name) return;

        const newList = {
            id: `${Date.now()}-${Math.random()}`,
            name,
        };

        setLists((current) => [newList, ...current]);
        setListName("");
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={lists}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.brand}>✦ QUICKLIST</Text>


                        <SmoothTouchable
                            style={styles.settingsButton}
                            onPress={() => navigation.navigate("Settings")}
                        >
                            <Ionicons
                                name="settings-outline"
                                size={24}
                                color="#38BDF8"
                            />

                        </SmoothTouchable>


                        <Text style={styles.heading}>My Lists</Text>

                        <Text style={styles.subtitle}>
                            Your projects, all in one place.
                        </Text>

                        <Text style={[styles.sectionLabel, { marginTop: 35 }]}>
                            CREATE NEW LIST
                        </Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Kitchen Remodel"
                                placeholderTextColor="#64748B"
                                value={listName}
                                onChangeText={setListName}
                                onSubmitEditing={addList}
                                returnKeyType="done"
                            />

                            <SmoothTouchable
                                style={styles.addButton}
                                onPress={addList}
                                pressedColor="#1E304A"

                            >
                                <Text style={styles.addButtonText}>+</Text>
                            </SmoothTouchable>
                        </View>

                        <Text style={styles.sectionLabel}>YOUR LISTS</Text>



                    </View>
                }


                renderItem={({ item }) => (
                    <SwipeToDelete
                        itemName={item.name}
                        itemType="list"
                        onDelete={async () => {
                            // Delete tasks belonging to this list
                            await AsyncStorage.removeItem(
                                `@quicklist_tasks_${item.id}`
                            );

                            // Remove the list
                            setLists((current) =>
                                current.filter((list) => list.id !== item.id)
                            );
                        }}
                    >
                        <SmoothTouchable
                            style={[styles.taskCard, { marginBottom: 0 }]}
                            backgroundColor="#131D31"
                            pressedColor="#1E304A"
                            onPress={() =>
                                navigation.navigate("Tasks", {
                                    listId: item.id,
                                    listName: item.name,
                                })
                            }
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={[styles.taskText, { flex: 1 }]}>
                                    {item.name}
                                </Text>

                                <Text style={styles.arrow}>›</Text>
                            </View>
                        </SmoothTouchable>

                    </SwipeToDelete>
                )}


            />
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080D1B",
        paddingHorizontal: 22,
    },
    header: {
        paddingTop: 34,
    },
    settingsButton: {
        position: "absolute",
        top: 28,
        right: 0,
        width: 44,
        height: 44,
        backgroundColor: "#131D31",
        borderWidth: 1,
        borderColor: "#26344F",
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    settingsIcon: {
        color: "#38BDF8",
        fontSize: 25,
    },

    brand: {
        color: "#38BDF8",
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 3,
        marginBottom: 22,
    },
    heading: {
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
        color: "#94A3B8",
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 2,
        marginBottom: 14,
    },
    inputContainer: {
        flexDirection: "row",
        backgroundColor: "#131D31",
        borderWidth: 1,
        borderColor: "#26344F",
        borderRadius: 16,
        padding: 6,
        marginBottom: 30,
        alignItems: "center",
    },
    input: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 15,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    button: {
        backgroundColor: "#131D31",
        borderRadius: 15,
        padding: 16,
    },

    buttonPressed: {
        backgroundColor: "#1E304A",
    },
    addButton: {
        width: 46,
        height: 46,
        backgroundColor: "#38BDF8",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    addButtonText: {
        color: "#080D1B",
        fontSize: 28,
        fontWeight: "600",
    },
    taskCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#131D31",
        borderWidth: 1,
        borderColor: "#26344F",
        borderRadius: 15,
        padding: 16,
        marginBottom: 10,
    },
    taskText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "500",
    },
    arrow: {
        color: "#38BDF8",
        fontSize: 22,
    },
});
