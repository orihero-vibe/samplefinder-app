import React from 'react';
import { ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
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

export default PromotionsScreen;
