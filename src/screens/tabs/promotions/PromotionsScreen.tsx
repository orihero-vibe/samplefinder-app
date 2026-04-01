import React, { useRef, useState } from 'react';
import { ScrollView, View, ActivityIndicator, Text, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Monicon } from '@monicon/native';
import ReferFriendBottomSheet from '@/components/shared/ReferFriendBottomSheet';
import ReferFriendSuccessBottomSheet from '@/components/shared/ReferFriendSuccessBottomSheet';
import BackShareHeader from '@/components/wrappers/BackShareHeader';
import { Colors } from '@/constants/Colors';
import { HistoryRefetchIcon } from '@/icons';
import {
  TierProgressModal,
  BadgesSection,
  EarnedSection,
  HistorySection,
  PromotionsHeader,
  PromotionsTabs,
  TiersSection,
} from './components';
import { usePromotionsScreen } from './usePromotionsScreen';
import styles from './styles';

const PromotionsScreen = () => {
  const contentRef = useRef<View>(null);
  const shareContentRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const historyRef = useRef<View>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isShareMode, setIsShareMode] = useState(false);

  const {
    activeTab,
    eventBadges,
    reviewBadges,
    tiers,
    eventCheckIns,
    reviews,
    historyItems,
    selectedTier,
    selectedPoints,
    nextTierRequiredPoints,
    achievementModalVisible,
    referFriendBottomSheetRef,
    referFriendSuccessBottomSheetRef,
    isLoading,
    isRefreshing,
    totalPoints,
    pointsForProgress,
    isAmbassador,
    isInfluencer,
    handleRefresh,
    setActiveTab,
    handleBackPress,
    handleSharePress,
    handleCloseReferFriend,
    handleReferSuccess,
    handleCloseReferSuccess,
    handleViewRewards,
    handleTierPress,
    handlePointsPress,
    handleCloseAchievementModal,
    handleShareAchievement,
    handleViewMoreEvents,
    handleHistoryEventPress,
  } = usePromotionsScreen({ contentRef, shareContentRef });

  const handleViewHistory = () => {
    if (isShareMode) return;
    if (showHistory) {
      setShowHistory(false);
      return;
    }

    setShowHistory(true);
    // Scroll to the history section after it has mounted and laid out
    setTimeout(() => {
      historyRef.current?.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: y - 20, // Add some offset for better UX
            animated: true,
          });
        },
        () => {
          // Fallback: scroll to end if measurement fails
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      );
    }, 100);
  };

  const handleSharePressWithShareMode = async () => {
    setIsShareMode(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    try {
      await handleSharePress();
    } finally {
      setIsShareMode(false);
    }
  };

  return (
    <View ref={contentRef} style={styles.container} collapsable={false}>
      <StatusBar style="light" />
      <BackShareHeader onBack={handleBackPress} onShare={handleSharePressWithShareMode} />

      <LinearGradient
        colors={[Colors.brandPurpleDeep, Colors.brandPurpleBright, Colors.brandPurpleWine]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.loadingText}>Loading your achievements...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.white}
                colors={[Colors.white]}
              />
            }
          >
            <View
              ref={shareContentRef}
              collapsable={false}
              style={{ overflow: 'hidden' }}
            >
              {/* Screenshot-only background: apply gradient only during capture */}
              {isShareMode && (
                <LinearGradient
                  pointerEvents="none"
                  colors={[Colors.brandPurpleDeep, Colors.brandPurpleBright, Colors.brandPurpleWine]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
              <PromotionsHeader totalPoints={totalPoints} />
              <PromotionsTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {/* In Progress Tab Content - always mounted, visibility controlled */}
              <View style={activeTab !== 'inProgress' && styles.hiddenTab}>
                <View style={styles.inProgressContainer}>
                  <BadgesSection
                    eventCheckIns={eventCheckIns}
                    reviews={reviews}
                    eventBadges={eventBadges}
                    reviewBadges={reviewBadges}
                    isAmbassador={isAmbassador}
                    isInfluencer={isInfluencer}
                  />
                  <TiersSection
                    tiers={tiers}
                    onTierPress={(tier) => handleTierPress(tier, pointsForProgress)}
                  />
                </View>
              </View>

              {/* Earned Tab Content - always mounted, visibility controlled */}
              <View style={activeTab !== 'earned' && styles.hiddenTab}>
                <EarnedSection
                  eventBadges={eventBadges}
                  reviewBadges={reviewBadges}
                  tiers={tiers}
                  totalPoints={totalPoints}
                  onTierPress={handleTierPress}
                  onPointsPress={handlePointsPress}
                  isAmbassador={isAmbassador}
                  isInfluencer={isInfluencer}
                />

                {/* View History Button */}
                {!isShareMode && (
                  <TouchableOpacity style={styles.viewHistoryButton} onPress={handleViewHistory}>
                    <HistoryRefetchIcon size={20} color={Colors.white} />
                    <Text style={styles.viewHistoryText}>{showHistory ? 'Hide History' : 'View History'}</Text>
                  </TouchableOpacity>
                )}

                {!isShareMode && showHistory && (
                  <View ref={historyRef} collapsable={false}>
                    <HistorySection historyItems={historyItems} onEventPress={handleHistoryEventPress} />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        )}
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

      <TierProgressModal
          visible={achievementModalVisible}
          tier={selectedTier}
          totalPoints={pointsForProgress}
          nextTierRequiredPoints={nextTierRequiredPoints}
          onClose={handleCloseAchievementModal}
          onViewMoreEvents={handleViewMoreEvents}
      />
    </View>
  );
};

export default PromotionsScreen;
