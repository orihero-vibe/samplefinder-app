import React, { useRef } from 'react';
import { ScrollView, View, ActivityIndicator, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Monicon } from '@monicon/native';
import ReferFriendBottomSheet from '@/components/shared/ReferFriendBottomSheet';
import ReferFriendSuccessBottomSheet from '@/components/shared/ReferFriendSuccessBottomSheet';
import BackShareHeader from '@/components/wrappers/BackShareHeader';
import { Colors } from '@/constants/Colors';
import {
  AchievementModal,
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
  const scrollViewRef = useRef<ScrollView>(null);
  const historyRef = useRef<View>(null);
  
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
    achievementModalVisible,
    referFriendBottomSheetRef,
    referFriendSuccessBottomSheetRef,
    isLoading,
    isRefreshing,
    totalPoints,
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
  } = usePromotionsScreen();

  const handleViewHistory = () => {
    // Scroll to the history section
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
  };

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
            <PromotionsHeader totalPoints={totalPoints} />
            <PromotionsTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'inProgress' && (
              <View style={styles.inProgressContainer}>
                <BadgesSection
                  eventCheckIns={eventCheckIns}
                  reviews={reviews}
                  eventBadges={eventBadges}
                  reviewBadges={reviewBadges}
                  isAmbassador={isAmbassador}
                  isInfluencer={isInfluencer}
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
                  totalPoints={totalPoints}
                  onTierPress={handleTierPress}
                  onPointsPress={handlePointsPress}
                  isAmbassador={isAmbassador}
                  isInfluencer={isInfluencer}
                />
                
                {/* View History Button */}
                <TouchableOpacity style={styles.viewHistoryButton} onPress={handleViewHistory}>
                  <Monicon name="mdi:refresh" size={20} color={Colors.white} />
                  <Text style={styles.viewHistoryText}>View History</Text>
                </TouchableOpacity>
                
                <View ref={historyRef} collapsable={false}>
                  <HistorySection historyItems={historyItems} />
                </View>
              </>
            )}
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

export default PromotionsScreen;
