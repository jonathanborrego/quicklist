
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

const STORAGE_KEY = "@quicklist_tasks";


const TaskListScreen = ({ route }) => {
    const listId = route.params?.listId;

    const storageKey = listId
        ? `@quicklist_tasks_${listId}`
        : STORAGE_KEY;

    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState("");
    const [loaded, setLoaded] = useState(false);

    // Load saved tasks
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const saved = await AsyncStorage.getItem(storageKey);

                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) setTasks(parsed);
                }
            } catch (error) {
                console.warn("Could not load tasks:", error);
            } finally {
                setLoaded(true);
            }
        };

        loadTasks();
    }, []);

    // Automatically save changes
    useEffect(() => {
        if (!loaded) return;

        const saveTasks = async () => {
            try {
                await AsyncStorage.setItem(storageKey, JSON.stringify(tasks));
            } catch (error) {
                console.warn("Could not save tasks:", error);
            }
        };

        saveTasks();
    }, [tasks, loaded]);

    // Add task
    const addTask = () => {
        const title = input.trim();
        if (!title) return;

        const newTask = {
            id: `${Date.now()}-${Math.random()}`,
            title,
            completed: false,
        };

        setTasks((current) => [newTask, ...current]);
        setInput("");
    };

    // Complete or uncomplete task
    const toggleTask = (id) => {
        setTasks((current) =>
            current.map((task) =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    // Delete task
    const deleteTask = (id) => {
        setTasks((current) => current.filter((task) => task.id !== id));
    };

    const completed = tasks.filter((task) => task.completed).length;
    const remaining = tasks.length - completed;
    const progress = tasks.length ? (completed / tasks.length) * 100 : 0;

    return (
        <SafeAreaView
            style={styles.container}
            edges={["left", "right", "bottom"]}
        >
            <View style={styles.header}>
                <Text style={styles.brand}>✦ QUICKLIST</Text>
                <Text style={styles.heading}>Make today count.</Text>
                <Text style={styles.subtitle}>
                    Organize your day. One task at a time.
                </Text>
            </View>

            {/* Progress Card */}
            <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                    <View>
                        <Text style={styles.cardLabel}>DAILY PROGRESS</Text>
                        <Text style={styles.progressTitle}>
                            {completed} of {tasks.length} completed
                        </Text>
                    </View>
                    <Text style={styles.percentage}>
                        {Math.round(progress)}%
                    </Text>
                </View>

                <View style={styles.progressTrack}>
                    <View
                        style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                </View>
            </View>

            {/* Add Task */}
            <Text style={styles.sectionLabel}>CREATE A TASK</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="What needs to get done?"
                    placeholderTextColor="#64748B"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={addTask}
                    returnKeyType="done"
                />

                <SmoothTouchable style={styles.addButton} onPress={addTask}>
                    <Text style={styles.addButtonText}>+</Text>
                </SmoothTouchable>
            </View>

            {/* Task List */}
            <View style={styles.listHeader}>
                <Text style={styles.sectionLabel}>YOUR TASKS</Text>
                <Text style={styles.taskCount}>{remaining} remaining</Text>
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>✦</Text>
                        <Text style={styles.emptyTitle}>All clear!</Text>
                        <Text style={styles.emptyText}>
                            Add your first task to get started.
                        </Text>
                    </View>
                }


                renderItem={({ item }) => (
                    <SwipeToDelete
                        itemName={item.title}
                        itemType="task"
                        onDelete={() => deleteTask(item.id)}
                    >
                        <SmoothTouchable
                            style={[styles.taskCard, { marginBottom: 0 }]}
                            pressedColor="#1E304A"
                            onPress={() => toggleTask(item.id)}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: item.completed }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    flex: 1,
                                }}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        item.completed && styles.checkboxDone,
                                    ]}
                                >
                                    {item.completed && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>

                                <View style={styles.taskContent}>
                                    <Text
                                        style={[
                                            styles.taskText,
                                            item.completed && styles.taskCompleted,
                                        ]}
                                    >
                                        {item.title}
                                    </Text>
                                </View>
                            </View>
                        </SmoothTouchable>
                    </SwipeToDelete>
                )}



            />
        </SafeAreaView>
    );
};


export default TaskListScreen;



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#080D1B",
        // backgroundColor: "#630606",
        paddingHorizontal: 22,
    },

    // Header
    header: {
        // backgroundColor: "#630606",
        marginTop: 20,
        marginBottom: 30,
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

    // Progress Card
    progressCard: {
        backgroundColor: "#131D31",
        borderWidth: 1,
        borderColor: "#26344F",
        borderRadius: 20,
        padding: 22,
        marginBottom: 32,
    },
    progressHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    cardLabel: {
        color: "#38BDF8",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2,
        marginBottom: 10,
    },
    progressTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
    },
    percentage: {
        color: "#38BDF8",
        fontSize: 26,
        fontWeight: "800",
    },
    progressTrack: {
        height: 8,
        backgroundColor: "#29344B",
        borderRadius: 10,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#38BDF8",
        borderRadius: 10,
    },

    // Task Input
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

    // Task List
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    taskCount: {
        color: "#38BDF8",
        fontSize: 12,
    },
    listContent: {
        paddingBottom: 25,
        flexGrow: 1,
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
    taskContent: {
        flex: 1,
        marginLeft: 14,
    },
    taskText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "500",
    },
    taskCompleted: {
        color: "#64748B",
        textDecorationLine: "line-through",
    },

    // Checkbox
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: "#64748B",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxDone: {
        backgroundColor: "#38BDF8",
        borderColor: "#38BDF8",
    },
    checkmark: {
        color: "#080D1B",
        fontWeight: "900",
    },

    // Delete Button
    deleteButton: {
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    deleteText: {
        color: "#F87171",
        fontSize: 26,
    },

    // Empty State
    emptyState: {
        alignItems: "center",
        paddingTop: 65,
    },
    emptyIcon: {
        color: "#38BDF8",
        fontSize: 40,
        marginBottom: 16,
    },
    emptyTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 8,
    },
    emptyText: {
        color: "#64748B",
        fontSize: 14,
        textAlign: "center",
    },
});
