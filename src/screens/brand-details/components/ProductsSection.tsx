import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ProductsSectionProps {
  products: string[];
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ products }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>PRODUCTS:</Text>
      <View style={styles.productsList}>
        {products.map((product, index) => (
          <Text key={index} style={styles.productText}>
            {product}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 28,
    alignItems: 'flex-start',
    width: '100%',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginRight: 16,
    minWidth: 90,
    textAlign: 'left',
    paddingTop: 4,
  },
  productsList: {
    flex: 1,
  },
  productText: {
    fontSize: 17,
    fontFamily: 'Quicksand_500Medium',
    color: '#050A24',
    lineHeight: 24,

  },
});

export default ProductsSection;

