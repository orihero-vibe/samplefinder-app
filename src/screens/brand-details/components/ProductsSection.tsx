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
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginBottom: 12,
  },
  productsList: {
    gap: 8,
  },
  productText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.blueColorMode,
  },
});

export default ProductsSection;

