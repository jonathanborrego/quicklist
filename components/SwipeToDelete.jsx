
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    View,
    Platform,
    StatusBar,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import SmoothTouchable from "../components/SmoothTouchable";


let activeSwipe = null;
let activeBounds = null;

// Close the open swipe when touching outside its Delete button
export const dismissOpenSwipeOnOutsideTouch = ({ nativeEvent }) => {
    if (!activeSwipe || !activeBounds) return false;

    const { x, y, width, height } = activeBounds;
    const { pageX, pageY } = nativeEvent;

    // Allow the visible Delete button to be pressed

    const touchingDeleteX =
        pageX >= x + width - 90 &&
        pageX <= x + width;

    // Account for Android status bar coordinates
    const adjustedY =
        Platform.OS === "android"
            ? pageY - (StatusBar.currentHeight || 0)
            : pageY;

    const touchingDeleteY =
        (pageY >= y && pageY <= y + height) ||
        (adjustedY >= y && adjustedY <= y + height);

    const touchingDelete = touchingDeleteX && touchingDeleteY;


    if (touchingDelete) return false;

    activeSwipe.close();
    activeSwipe = null;
    activeBounds = null;

    // Consume the touch so nothing underneath gets pressed
    return true;
};


const SwipeToDelete = ({
    children,
    itemName,
    itemType = "task",
    onDelete,
}) => {
    const swipeRef = useRef(null);
    const rowRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const isList = itemType === "list";

    // Open custom confirmation
    const confirmDelete = () => {
        // Release swipe touch handling before showing modal
        activeSwipe = null;
        activeBounds = null;
        swipeRef.current?.close();

        setError("");
        setVisible(true);
    };

    // Cancel and close swipe
    const cancelDelete = () => {
        if (deleting) return;

        setVisible(false);
        swipeRef.current?.close();
    };

    // Delete only after confirmation
    const handleDelete = async () => {
        if (deleting) return;

        setDeleting(true);
        setError("");

        try {
            await onDelete();
            setVisible(false);
            swipeRef.current?.close();
        } catch (err) {
            console.warn("Delete failed:", err);
            setError("Unable to delete. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    // Swipe action
    const renderRightActions = () => (
        <SmoothTouchable
            style={styles.deleteButton}
            onPress={confirmDelete}
            pressedColor="#ac0000"
        >
            <Text style={styles.deleteIcon}>✕</Text>
            <Text style={styles.deleteText}>Delete</Text>
        </SmoothTouchable>
    );

    return (
        <>
            <View ref={rowRef} collapsable={false}>
                <Swipeable
                    ref={swipeRef}
                    friction={2}
                    rightThreshold={40}
                    overshootRight={false}
                    renderRightActions={renderRightActions}
                    containerStyle={styles.container}


                    onSwipeableWillOpen={() => {
                        if (activeSwipe && activeSwipe !== swipeRef.current) {
                            activeSwipe.close();
                        }

                        activeSwipe = swipeRef.current;
                        activeBounds = null;

                        rowRef.current?.measureInWindow((x, y, width, height) => {
                            if (activeSwipe === swipeRef.current) {
                                activeBounds = { x, y, width, height };
                            }
                        });
                    }}


                    onSwipeableClose={() => {
                        if (activeSwipe === swipeRef.current) {
                            activeSwipe = null;
                            activeBounds = null;
                        }
                    }}

                >
                    {children}
                </Swipeable>

            </View>

            {/* Custom Delete Confirmation */}
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={cancelDelete}
            >
                <View style={styles.overlay}>
                    <SmoothTouchable
                        style={StyleSheet.absoluteFill}
                        onPress={cancelDelete}
                    />

                    <View style={styles.modalCard}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.modalIcon}>✕</Text>
                        </View>

                        <Text style={styles.modalTitle}>
                            Delete {isList ? "List" : "Task"}?
                        </Text>

                        <Text style={styles.modalDescription}>
                            Are you sure you want to delete
                            {"\n"}"{itemName}"?
                        </Text>

                        {isList && (
                            <Text style={styles.warning}>
                                All tasks inside this list will also be deleted.
                            </Text>
                        )}

                        <Text style={styles.warning}>
                            This action cannot be undone.
                        </Text>

                        {error ? (
                            <Text style={styles.error}>{error}</Text>
                        ) : null}

                        <View style={styles.buttonRow}>
                            <SmoothTouchable
                                style={styles.cancelButton}
                                onPress={cancelDelete}
                                disabled={deleting}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </SmoothTouchable>

                            <SmoothTouchable
                                style={styles.confirmButton}
                                onPress={handleDelete}
                                disabled={deleting}
                                pressedColor="#ac0000"
                            >
                                {deleting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.confirmText}>Delete</Text>
                                )}
                            </SmoothTouchable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default SwipeToDelete;

const styles = StyleSheet.create({
    // Swipe container
    container: {
        backgroundColor: "#DC2626",
        borderRadius: 15,
        overflow: "hidden",
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: "#DC2626",
        width: 90,
        height: "100%",
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteIcon: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 3,
    },
    deleteText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },

    // Modal
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.78)",
        justifyContent: "center",
        paddingHorizontal: 25,
    },
    modalCard: {
        backgroundColor: "#131D31",
        borderWidth: 1,
        borderColor: "#26344F",
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: "#451C29",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
    },
    modalIcon: {
        color: "#F87171",
        fontSize: 30,
        fontWeight: "700",
    },
    modalTitle: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 12,
    },
    modalDescription: {
        color: "#CBD5E1",
        fontSize: 15,
        lineHeight: 23,
        textAlign: "center",
        marginBottom: 12,
    },
    warning: {
        color: "#94A3B8",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 10,
    },
    error: {
        color: "#F87171",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 10,
    },

    // Buttons
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
        width: "100%",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#202B42",
        borderWidth: 1,
        borderColor: "#34445D",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    },
    confirmButton: {
        flex: 1,
        backgroundColor: "#DC2626",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
    },
    cancelText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    confirmText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
