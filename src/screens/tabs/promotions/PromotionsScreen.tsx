import ReferFriendBottomSheet from '@/components/shared/ReferFriendBottomSheet';
import ReferFriendSuccessBottomSheet from '@/components/shared/ReferFriendSuccessBottomSheet';
import BackShareHeader from '@/components/wrappers/BackShareHeader';
import { Colors } from '@/constants/Colors';
import BottomSheet from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    AchievementModal,
    Badge,
    BadgesSection,
    EarnedSection,
    HistoryItemData,
    HistorySection,
    PromotionsHeader,
    PromotionsTabs,
    Tier,
    TiersSection
} from './components';

type TabType = 'inProgress' | 'earned';

const PromotionsScreen = () => {
    const [activeTab, setActiveTab] = useState<TabType>('inProgress');
    const referFriendBottomSheetRef = useRef<BottomSheet>(null);
    const referFriendSuccessBottomSheetRef = useRef<BottomSheet>(null);
    const [achievementModalVisible, setAchievementModalVisible] = useState(false);
    const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
    const [selectedPoints, setSelectedPoints] = useState<number>(100);

    const handleBackPress = () => {
        // Handle back navigation
        console.log('Back pressed');
    };

    const handleSharePress = () => {
        // Handle share action
        console.log('Share pressed');
    };

    const handleCloseReferFriend = () => {
        referFriendBottomSheetRef.current?.close();
    };

    const handleReferSuccess = () => {
        referFriendSuccessBottomSheetRef.current?.expand();
    };

    const handleCloseReferSuccess = () => {
        referFriendSuccessBottomSheetRef.current?.close();
    };

    const handleViewRewards = () => {
        // Already on Promotions screen, just close the modal
        handleCloseReferSuccess();
    };

    const handleTierPress = (tier: Tier, points: number) => {
        setSelectedTier(tier);
        setSelectedPoints(points);
        setAchievementModalVisible(true);
    };

    const handlePointsPress = (points: number, tier?: Tier) => {
        setSelectedTier(tier || null);
        setSelectedPoints(points);
        setAchievementModalVisible(true);
    };

    const handleCloseAchievementModal = () => {
        setAchievementModalVisible(false);
        setSelectedTier(null);
    };

    const handleShareAchievement = () => {
        // Handle share action
        console.log('Share achievement:', selectedTier?.name, selectedPoints);
        // You can implement sharing logic here
    };

    // Badge data
    const eventBadges: Badge[] = [
        { id: '1', label: 'EVENTS', achieved: true, count: 10 },
        { id: '2', label: 'EVENTS', achieved: false, count: 25 },
        { id: '3', label: 'EVENTS', achieved: false, count: 50 },
        { id: '4', label: 'EVENTS', achieved: false, count: 100 },
        { id: '5', label: 'EVENTS', achieved: false, count: 250 },
    ];

    const reviewBadges: Badge[] = [
        { id: '1', label: "REVIEWS", achieved: true, count: 10 },
        { id: '2', label: 'REVIEWS', achieved: false, count: 25 },
        { id: '3', label: 'REVIEWS', achieved: false, count: 50 },
        { id: '4', label: 'REVIEWS', achieved: false, count: 100 },
        { id: '5', label: 'REVIEWS', achieved: false, count: 250 },
    ];

    const tiers: Tier[] = [
        { id: '1', name: 'NewbieSampler', currentPoints: 1000, requiredPoints: 1000, badgeEarned: true },
        { id: '2', name: 'SampleFan', currentPoints: 250, requiredPoints: 1000, badgeEarned: false },
        { id: '3', name: 'SuperSampler', currentPoints: 250, requiredPoints: 5000, badgeEarned: false },
        { id: '4', name: 'VIS (Very Important Sampler)', currentPoints: 7500, requiredPoints: 25000, badgeEarned: false },
        { id: '5', name: 'SampleMaster', currentPoints: 250, requiredPoints: 100000, badgeEarned: false },
    ];

    const eventCheckIns = 20;
    const reviews = 15;

    // History data
    const historyItems: HistoryItemData[] = [
        {
            id: '1',
            brandProduct: 'Brand Product',
            storeName: 'XYZ Supermarket',
            date: 'Aug 1, 2025',
            points: 60,
            review: 'Vitae posuere dolor sodales quis. Praesent vitae odio lorem. Pellentesque nec lacus vehicula, aliquam mi nec, ornare turpis. Posuere dolor sodales quis.',
        },
        {
            id: '2',
            brandProduct: 'Brand Product',
            storeName: 'XYZ Supermarket',
            date: 'Aug 1, 2025',
            points: 60,
            review: 'Great product! Really enjoyed trying it out.',
        },
        {
            id: '3',
            brandProduct: 'Brand Product',
            storeName: 'XYZ Supermarket',
            date: 'Aug 1, 2025',
            points: 10,
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <BackShareHeader onBack={handleBackPress} onShare={handleSharePress} />

            <LinearGradient
                colors={[Colors.brandPurpleDeep, Colors.brandPurpleBright, Colors.brandPurpleWine]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <PromotionsHeader />
                    <PromotionsTabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {activeTab === 'inProgress' && (
                        <View style={styles.contentContainer}>
                            <BadgesSection
                                eventCheckIns={eventCheckIns}
                                reviews={reviews}
                                eventBadges={eventBadges}
                                reviewBadges={reviewBadges}
                            />
                            <TiersSection tiers={tiers} />
                        </View>
                    )}

                    {activeTab === 'earned' && (
                        <>
                            <EarnedSection
                                eventBadges={eventBadges}
                                reviewBadges={reviewBadges}
                                tiers={tiers}
                                onTierPress={handleTierPress}
                                onPointsPress={handlePointsPress}
                            />
                            <HistorySection historyItems={historyItems} />
                        </>
                    )}
                </ScrollView>
            </LinearGradient>

            <ReferFriendBottomSheet
                bottomSheetRef={referFriendBottomSheetRef}
                onClose={handleCloseReferFriend}
                onReferSuccess={handleReferSuccess}
            />

            <ReferFriendSuccessBottomSheet
                bottomSheetRef={referFriendSuccessBottomSheetRef}
                onClose={handleCloseReferSuccess}
                onViewRewards={handleViewRewards}
            />

            <AchievementModal
                visible={achievementModalVisible}
                tierName={selectedTier?.name || 'NewbieSampler'}
                points={selectedPoints}
                onClose={handleCloseAchievementModal}
                onShare={handleShareAchievement}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.brandPurpleDeep,
    },
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    contentContainer: {
    },
});

export default PromotionsScreen;

