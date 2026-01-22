import React from 'react';
import { View, Platform, ActivityIndicator } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import MainHeader from '@/components/wrappers/MainHeader';
import ZipCodeModal from '@/components/shared/ZipCodeModal';
import { Colors } from '@/constants/Colors';
import {
  MapMarker,
  ClusterMarker,
  FilterButtons,
  UpcomingEvents,
  RadiusFilter,
  DatesFilter,
  CategoriesFilter,
  StoreModal,
} from './components';
import { useHomeScreen } from './useHomeScreen';
import styles from './styles';

const HomeScreen = () => {
  const {
    selectedFilter,
    radiusValues,
    datesValues,
    categoriesValues,
    categories,
    selectedStore,
    isModalVisible,
    isLoadingEvents,
    markers,
    isLoadingClients,
    hasLocationPermission,
    showZipCodeModal,
    isGeocodingZip,
    zipCodeError,
    bottomSheetIndex,
    bottomSheetRef,
    mapRef,
    snapPoints,
    initialRegion,
    events,
    hasAnyFilters,
    activeView,
    setBottomSheetIndex,
    handleFilterPress,
    handleCloseFilter,
    handleRadiusToggle,
    handleDatesToggle,
    handleCategoriesToggle,
    handleMarkerPress,
    handleClusterPress,
    renderCluster,
    handleCloseModal,
    handleListPress,
    handleMapPress,
    handleZipCodeSubmit,
    handleZipCodeChange,
  } = useHomeScreen();

  const renderFilterModal = () => {
    const isVisible = selectedFilter !== null && selectedFilter !== 'reset';

    switch (selectedFilter) {
      case 'radius':
        return (
          <RadiusFilter
            visible={isVisible}
            selectedValues={radiusValues}
            onToggle={handleRadiusToggle}
            onClose={handleCloseFilter}
          />
        );
      case 'dates':
        return (
          <DatesFilter
            visible={isVisible}
            selectedValues={datesValues}
            onToggle={handleDatesToggle}
            onClose={handleCloseFilter}
          />
        );
      case 'categories':
        return (
          <CategoriesFilter
            visible={isVisible}
            selectedValues={categoriesValues}
            onToggle={handleCategoriesToggle}
            onClose={handleCloseFilter}
            categories={categories}
          />
        );
      default:
        return null;
    }
  };

  const renderClusterComponent = (cluster: any) => {
    const clusterData = renderCluster(cluster);
    return (
      <ClusterMarker
        key={clusterData.id}
        coordinate={clusterData.coordinate}
        pointCount={clusterData.pointCount}
        onPress={() => handleClusterPress(cluster)}
      />
    );
  };

  return (
    <View style={[styles.container]}>
      <MainHeader onMapPress={handleMapPress} onListPress={handleListPress} activeView={activeView} />

      <View style={styles.mapContainer}>
        <ClusteredMapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={false}
          userLocationPriority="high"
          userLocationUpdateInterval={5000}
          toolbarEnabled={false}
          clusterColor={Colors.brandPurpleDeep}
          clusterTextColor={Colors.white}
          radius={100}
          minZoom={10}
          maxZoom={30}
          extent={512}
          nodeSize={64}
          renderCluster={renderClusterComponent}
        >
          {markers.map((marker) => (
            <MapMarker key={marker.id} marker={marker} onPress={handleMarkerPress} />
          ))}
        </ClusteredMapView>
        {isLoadingClients && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.brandPurpleDeep} />
          </View>
        )}
      </View>

      <StoreModal visible={isModalVisible} store={selectedStore} isLoadingEvents={isLoadingEvents} onClose={handleCloseModal} />

      <ZipCodeModal
        visible={showZipCodeModal}
        onZipCodeSubmit={handleZipCodeSubmit}
        onZipCodeChange={handleZipCodeChange}
        isLoading={isGeocodingZip}
        error={zipCodeError || undefined}
      />

      {renderFilterModal()}

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        animateOnMount={true}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onChange={(index) => setBottomSheetIndex(index)}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.filtersContainer}>
            <FilterButtons
              selectedFilter={selectedFilter}
              onFilterPress={handleFilterPress}
              radiusCount={radiusValues.length}
              datesCount={datesValues.length}
              categoriesCount={categoriesValues.length}
              hasAnyFilters={hasAnyFilters}
            />
          </View>
          <BottomSheetScrollView
            contentContainerStyle={styles.bottomSheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <UpcomingEvents events={events} />
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
};

export default HomeScreen;
