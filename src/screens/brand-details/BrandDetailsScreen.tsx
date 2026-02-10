import React from 'react';
import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ActionButtons,
  BrandInfo,
  BrandLocationPin,
  DiscountMessage,
  EventInfoSection,
  ProductsSection,
  CheckInCodeInput,
  CheckInSuccess,
} from './components';
import BackShareHeader from '@/components/wrappers/BackShareHeader';
import ReviewModal from '@/components/shared/ReviewModal';
import PointsEarnedModal from '@/components/shared/PointsEarnedModal';
import CalendarAlertModal from '@/components/shared/CalendarAlertModal';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { useBrandDetailsScreen, BrandDetailsData } from './useBrandDetailsScreen';
import styles from './styles';

export type { BrandDetailsData };

interface BrandDetailsScreenProps {
  route: {
    params: { eventId?: string; brand?: BrandDetailsData };
  };
}

const BrandDetailsScreen: React.FC<BrandDetailsScreenProps> = ({ route }) => {
  const {
    brand,
    isLoading,
    error,
    checkInStatus,
    brandLogoUrl,
    isFavorite,
    isAddedToCalendar,
    reviewBottomSheetRef,
    isSubmittingCheckIn,
    isSubmittingReview,
    pointsModalVisible,
    pointsModalTitle,
    pointsModalAmount,
    hasReviewed,
    checkInPoints,
    totalEarnedPoints,
    calendarAlertVisible,
    calendarAlertType,
    removeConfirmVisible,
    handleBack,
    handleShare,
    handleAddToCalendar,
    handleAddFavorite,
    handleCodeSubmit,
    handleLeaveReview,
    handleCloseReviewModal,
    handleSubmitReview,
    handleClosePointsModal,
    handleViewRewards,
    handleCloseCalendarAlert,
    handleConfirmRemoveFromCalendar,
    handleCancelRemoveFromCalendar,
  } = useBrandDetailsScreen({ route });

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <BackShareHeader onBack={handleBack} onShare={handleShare} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D1B69" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error || !brand) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <BackShareHeader onBack={handleBack} onShare={handleShare} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Event details not available'}
          </Text>
          <Text style={styles.errorSubtext}>
            Please try again later or go back to browse other events.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BackShareHeader onBack={handleBack} onShare={handleShare}  />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BrandLocationPin logoUrl={brandLogoUrl} />
        <BrandInfo brand={brand} />
        <ProductsSection products={brand.products} />
        <EventInfoSection eventInfo={brand.eventInfo} />
        <DiscountMessage />
        
        {(checkInStatus === 'input' || checkInStatus === 'incorrect') && (
          <CheckInCodeInput
            onCodeSubmit={handleCodeSubmit}
            showError={checkInStatus === 'incorrect'}
            isSubmitting={isSubmittingCheckIn}
          />
        )}

        {checkInStatus === 'success' && (
          <CheckInSuccess
            onLeaveReview={handleLeaveReview}
            pointsEarned={totalEarnedPoints}
            showReviewButton={!hasReviewed}
            discount={brand?.discount}
            discountImageURL={brand?.discountImageURL}
          />
        )}

        <ActionButtons
          onAddToCalendar={handleAddToCalendar}
          onAddFavorite={handleAddFavorite}
          isFavorite={isFavorite}
          isAddedToCalendar={isAddedToCalendar}
        />
      </ScrollView>

      <ReviewModal
        bottomSheetRef={reviewBottomSheetRef}
        eventName={brand?.storeName}
        brandName={brand?.brandName}
        isSubmitting={isSubmittingReview}
        onClose={handleCloseReviewModal}
        onSubmit={handleSubmitReview}
      />

      <PointsEarnedModal
        visible={pointsModalVisible}
        points={pointsModalAmount}
        title={pointsModalTitle}
        onClose={handleClosePointsModal}
        onViewRewards={handleViewRewards}
      />

      <CalendarAlertModal
        visible={calendarAlertVisible}
        type={calendarAlertType}
        onClose={handleCloseCalendarAlert}
      />

      <ConfirmationModal
        visible={removeConfirmVisible}
        title="Remove Event"
        description="Are you sure you want to remove this event from your calendar? You will no longer receive reminders."
        confirmText="Yes, Remove"
        cancelText="Cancel"
        onConfirm={handleConfirmRemoveFromCalendar}
        onCancel={handleCancelRemoveFromCalendar}
      />
    </View>
  );
};

export default BrandDetailsScreen;

